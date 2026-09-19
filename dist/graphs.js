import {TAU,radians,combMagnitude,stereoSample} from './science.js';
export class Scope {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.experiment=0;this.state={value:0,mode:'sum'};this.language='zh';this.playing=false;this.frame=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)');new ResizeObserver(()=>this.draw()).observe(canvas);}
  update(experiment,state,language,playing){this.experiment=experiment;this.state=state;this.language=language;this.playing=playing;cancelAnimationFrame(this.frame);this.draw();}
  draw(){
    cancelAnimationFrame(this.frame);this.frame=0;
    const c=this.canvas,ctx=this.ctx,dpr=window.devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;
    if(!w||!h)return;c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
    const left=35,right=w-12,top=14,bottom=h-28,cw=right-left,ch=bottom-top;
    ctx.lineWidth=1;ctx.strokeStyle='#25313a';
    for(let i=0;i<=12;i++){const x=left+cw*i/12;ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bottom);ctx.stroke();}
    for(let i=0;i<=6;i++){const y=top+ch*i/6;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(right,y);ctx.stroke();}
    ctx.font='11px ui-monospace,monospace';ctx.fillStyle='#a7afb9';
    const path=(fn,color,width=2)=>{ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;for(let x=0;x<=cw;x++){const y=fn(x/cw);x?ctx.lineTo(left+x,y):ctx.moveTo(left+x,y);}ctx.stroke();};
    const motion=this.playing&&!this.reduced.matches?performance.now()/4500:0;
    if(this.experiment===1){
      const y=db=>top+(-db/36)*ch;ctx.setLineDash([3,5]);path(()=>top,'#65788a',1);ctx.setLineDash([]);
      path(x=>y(Math.max(-36,20*Math.log10(Math.max(1e-6,combMagnitude(x*4000,this.state.value))))),'#d7fc70');
      ['0','−18','−36'].forEach((s,i)=>ctx.fillText(s,1,top+i*ch/2+4));
      [0,1000,2000,3000,4000].forEach((v,i)=>ctx.fillText(i===0?'0':`${i}k`,left+cw*i/4-7,h-9));ctx.fillText('Hz',right-15,h-9);ctx.fillText('dB',1,h-9);
      c.setAttribute('aria-label',this.language==='zh'?`理论频率响应，延迟 ${this.state.value} 毫秒。`:`Predicted frequency response at ${this.state.value} milliseconds delay.`);
    }else{
      const phase=radians(this.state.value);const labels=this.experiment===0?['A','B','Σ']:['L','R','M'];
      const functions=this.experiment===0?[
        x=>Math.sin(TAU*(x*3+motion)),x=>Math.sin(TAU*(x*3+motion)+phase),x=>(Math.sin(TAU*(x*3+motion))+Math.sin(TAU*(x*3+motion)+phase))/2
      ]:[0,1,2].map(index=>x=>{const m=.7*Math.sin(TAU*(x*3+motion)),s=.65*Math.sin(TAU*(x*11+motion));const [l,r]=stereoSample(m,s,this.state.mode==='mono'?0:this.state.value/100);return index===0?l:index===1?r:(l+r)/2;});
      functions.forEach((fn,i)=>{const baseline=top+ch*(i+.5)/3;ctx.fillStyle='#a7afb9';ctx.fillText(labels[i],12,baseline+4);path(x=>baseline-fn(x)*ch*.13,['#f28d78','#83b8ff','#d7fc70'][i]);});
      ctx.fillStyle='#a7afb9';ctx.fillText(this.language==='zh'?'时间 → · 波形示意':'Time → · waveform illustration',left,h-9);
      c.setAttribute('aria-label',this.language==='zh'?(this.experiment===0?`A、B 与叠加波形，相位差 ${this.state.value} 度。`:`左右声道与单声道示意，Side ${this.state.value}%，${this.state.mode==='mono'?'单声道':'立体声'}。`):(this.experiment===0?`A, B and their sum at ${this.state.value} degrees phase difference.`:`Left, right and mono illustration, Side ${this.state.value} percent, ${this.state.mode}.`));
    }
    if(this.playing&&!this.reduced.matches&&this.experiment!==1)this.frame=requestAnimationFrame(()=>this.draw());
  }
}
