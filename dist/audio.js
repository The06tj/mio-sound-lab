import {radians, seededNoise, musicLayers} from './science.js';
const glide=(param,value,time)=>param.setTargetAtTime(value,time,0.015);
function bufferSource(ctx,data){const buffer=ctx.createBuffer(1,data.length,ctx.sampleRate);buffer.copyToChannel(data,0);const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;return source;}
// Accepts either AudioContext or OfflineAudioContext for rendered-output verification.
export function createVoice(ctx, experiment, state, destination) {
  const nodes=[],sources=[];const gain=value=>{const n=ctx.createGain();n.gain.value=value;nodes.push(n);return n;};
  const gate=gain(0);gate.connect(destination);let update;
  if(experiment===0){
    const sine=ctx.createOscillator(),cosine=ctx.createOscillator();
    sine.frequency.value=cosine.frequency.value=220;
    cosine.setPeriodicWave(ctx.createPeriodicWave(new Float32Array([0,1]),new Float32Array([0,0]),{disableNormalization:true}));
    const a=gain(0),b=gain(0);sine.connect(a).connect(gate);cosine.connect(b).connect(gate);sources.push(sine,cosine);
    update=(s,t)=>{const p=radians(s.value);glide(a.gain,s.mode==='solo'?1:0.5*(1+Math.cos(p)),t);glide(b.gain,s.mode==='solo'?0:0.5*Math.sin(p),t);};
  }else if(experiment===1){
    const noise=bufferSource(ctx,seededNoise(ctx.sampleRate*4));
    const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=6500;filter.Q.value=0.5;
    const delay=ctx.createDelay(0.02),dry=gain(0),wet=gain(0);nodes.push(filter,delay);
    noise.connect(filter);filter.connect(dry).connect(gate);filter.connect(delay).connect(wet).connect(gate);sources.push(noise);
    update=(s,t)=>{glide(delay.delayTime,s.value/1000,t);glide(dry.gain,s.mode==='dry'?1:0.5,t);glide(wet.gain,s.mode==='dry'?0:0.5,t);};
  }else{
    const layers=musicLayers(ctx.sampleRate),mid=bufferSource(ctx,layers.mid),side=bufferSource(ctx,layers.side);
    const merger=ctx.createChannelMerger(2);nodes.push(merger);const mg=gain(0.5),left=gain(0),right=gain(0);
    mid.connect(mg);mg.connect(merger,0,0);mg.connect(merger,0,1);side.connect(left).connect(merger,0,0);side.connect(right).connect(merger,0,1);merger.connect(gate);sources.push(mid,side);
    update=(s,t)=>{const amount=s.mode==='mono'?0:s.value/200;glide(left.gain,amount,t);glide(right.gain,-amount,t);};
  }
  const start=ctx.currentTime+0.025;update(state,ctx.currentTime);gate.gain.setValueAtTime(0,start);gate.gain.linearRampToValueAtTime(1,start+0.04);sources.forEach(n=>n.start(start));
  let stopped=false;
  return {update:s=>update(s,ctx.currentTime),stop(){if(stopped)return;stopped=true;const t=ctx.currentTime;gate.gain.cancelScheduledValues(t);gate.gain.setValueAtTime(gate.gain.value,t);gate.gain.linearRampToValueAtTime(0,t+0.03);sources.forEach(n=>n.stop(t+0.04));sources[0].onended=()=>{[...sources,...nodes].forEach(n=>n.disconnect());};}};
}
export class SoundEngine {
  constructor(){this.context=null;this.voice=null;this.volume=0.25;this.generation=0;}
  async play(experiment,state){
    const generation=++this.generation;
    if(!this.context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('unsupported');this.context=new Audio();this.master=this.context.createGain();this.master.gain.value=0;this.master.connect(this.context.destination);}
    await this.context.resume();if(generation!==this.generation)return false;
    if(this.context.state!=='running')throw new Error('suspended');
    this.voice?.stop();this.voice=createVoice(this.context,experiment,state,this.master);this.setVolume(this.volume);return true;
  }
  setVolume(volume){this.volume=Math.max(0,Math.min(1,volume));if(this.master)glide(this.master.gain,this.volume*0.3,this.context.currentTime);}
  update(state){this.voice?.update(state);}
  stop(){this.generation++;this.voice?.stop();this.voice=null;}
}
