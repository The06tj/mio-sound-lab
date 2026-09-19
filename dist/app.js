import {copy,experiments} from './content.js';
import {SoundEngine} from './audio.js';
import {Scope} from './graphs.js';
import {firstNotch,phaseAmplitude} from './science.js';
const $=id=>document.getElementById(id);
const defaults=index=>({value:experiments[index].initial,mode:experiments[index].modes[0],guess:null,interacted:false,revealed:false});
let language='zh';try{language=localStorage.getItem('mio-sound-lab-language')==='en'?'en':'zh';}catch{}
let playRequest=0;
let current=0,playing=false,pending=false,states=experiments.map((_,i)=>defaults(i));
const audio=new SoundEngine(),scope=new Scope($('scope'));const text=()=>copy[language];
const announce=message=>{$('announcer').textContent=message;};
function stop(){playRequest++;audio.stop();playing=false;pending=false;renderTransport();scope.update(current,states[current],language,false);}
function renderTransport(){const t=text();$('play').disabled=states[current].guess===null||pending;$('play').setAttribute('aria-pressed',String(playing));$('play-label').textContent=playing?t.stop:t.play;$('play').firstElementChild.textContent=playing?'Ⅱ':'▶';$('audio-status').textContent=playing?t.playing:t.pause;$('audio-status').classList.toggle('playing',playing);}
function renderTabs(){const count=states.filter(s=>s.revealed).length;$('progress').textContent=`0${count} / 03`;$('experiments').innerHTML=experiments.map((e,i)=>`<button class="experiment-tab ${i===current?'active':''}" data-experiment="${i}" aria-current="${i===current?'step':'false'}"><span class="tab-number">0${i+1}</span><span><b>${e[language].title}</b><small>${e[language].topic}</small></span><span class="tab-mark" aria-label="${states[i].revealed?(language==='zh'?'已完成':'Completed'):''}">${states[i].revealed?'✓':'↗'}</span></button>`).join('');}
function renderFlow(){const t=text(),e=experiments[current],s=states[current],c=e[language];
  const step=(n,title)=>`<div class="step-heading"><span class="step-number">${n}</span>${title}</div>`;
  let html=`<div class="step-block">${step(1,t.predict)}<h3 class="question">${c.question}</h3>`;
  if(!s.revealed){html+=`<div class="choices">${c.options.map((option,i)=>`<button class="choice ${s.guess===i?'selected':''}" data-choice="${i}" aria-pressed="${s.guess===i}"><span class="choice-letter">${'ABC'[i]}</span>${option}</button>`).join('')}</div><p class="note-caption">${s.guess===null?t.guessHint:t.saved}</p>`;}else{html+=`<p class="note-caption">${t.picked}：${c.options[s.guess]}<br>${s.guess===e.correct?t.correct:t.incorrect}</p>`;}
  html+='</div>';
  html+=`<div class="step-block ${s.guess===null?'locked':''}">${step(2,t.explore)}<p class="step-title">${s.guess===null?t.locked:c.instruction}</p></div>`;
  if(s.revealed){html+=`<div class="step-block">${step(3,t.reveal)}<h3 class="answer-title">${c.answer}</h3><p class="explanation">${c.explanation}</p><div class="formula">${c.formula.replaceAll('\n','<br>')}</div><p class="note-caption">${c.caveat}</p>${current<2?`<button class="next-button" data-next>${t.next}</button>`:states.every(s=>s.revealed)?`<p class="answer-title completion">${t.done}</p><p class="note-caption">${t.doneNote}</p>`:''}</div>`;
  }else{html+=`<button id="reveal" class="reveal-button" ${!s.interacted?'disabled':''}>${t.reveal} ↗</button>${!s.interacted?`<p class="note-caption">${t.revealLocked}</p>`:''}`;}
  $('learning-flow').innerHTML=html;
}
function renderControls(){const e=experiments[current],s=states[current],c=e[language];const disabled=s.guess===null?'disabled':'';
  $('control-area').innerHTML=`<label class="control-heading" for="parameter"><span>${c.parameter}</span><output id="parameter-value" class="control-value"></output></label><input id="parameter" type="range" min="${e.min}" max="${e.max}" step="${e.step}" value="${s.value}" aria-label="${c.parameter}" ${disabled}><div class="range-ticks">${e.ticks.map(v=>`<span>${v}</span>`).join('')}</div><div class="presets">${e.presets.map(v=>`<button data-preset="${v}" ${disabled} aria-label="${v} ${e.unit}">${v}${e.unit}</button>`).join('')}<span class="preset-divider" aria-hidden="true"></span>${e.modes.map((mode,i)=>`<button class="mode-button" data-mode="${mode}" ${disabled} aria-pressed="${s.mode===mode}">${c.modes[i]}</button>`).join('')}</div><p class="control-hint" id="control-hint">${s.guess===null?text().locked:current===0?(language==='zh'?'220 Hz 纯音 · 混合时两路各减半，保留音量余量。':'220 Hz sine · Each mixed path uses half gain for headroom.'):c.hint}</p>`;
  updateReadouts();
}
function updateReadouts(){const e=experiments[current],s=states[current],c=e[language];const val=current===1?s.value.toFixed(1):s.value;$('main-value').innerHTML=`${val}<span>${e.unit}</span>`;$('value-label').textContent=c.parameter;
  let detail=`${val}${e.unit}`;
  if(s.guess!==null&&current===0)detail+=` · ${language==='zh'?'叠加振幅':'Sum amplitude'} ${Math.round(phaseAmplitude(s.value)*100)}%`;
  if(s.guess!==null&&current===1){const n=firstNotch(s.value);detail+=` · ${n?`${language==='zh'?'首凹口':'First notch'} ${Math.round(n)} Hz`:(language==='zh'?'无凹口':'No notches')}`;}
  $('parameter-value').textContent=detail;
  if(s.guess!==null&&current===0&&s.mode==='solo')$('control-hint').textContent=language==='zh'?'现在只听 A；图中仍保留 A、B 与叠加的理论对比。':'Listening to A only; the graph still compares A, B and their predicted sum.';
  else if(s.guess!==null&&current===0)$('control-hint').textContent=language==='zh'?'220 Hz 纯音 · 混合时两路各减半，保留音量余量。':'220 Hz sine · Each mixed path uses half gain for headroom.';
  if(s.guess!==null&&current===1)$('control-hint').textContent=s.mode==='dry'?(language==='zh'?'现在只听原声；绿色曲线仍显示混合后的理论响应。':'Listening to the original; the green curve still predicts the mixed response.'):c.hint;
  $('parameter').setAttribute('aria-valuetext',`${val} ${e.unit}`);
  document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.preset)===s.value)));
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===s.mode)));
  scope.update(current,s,language,playing);
}
function render(){const t=text(),e=experiments[current],c=e[language];document.documentElement.lang=language==='zh'?'zh-CN':'en';document.title=language==='zh'?'Mio Sound Lab · 声音小实验室':'Mio Sound Lab · Three listening experiments';
  $('headline').innerHTML=`${t.headline}<span>${language==='zh'?'。':'.'}</span>`;
  for(const [id,key] of Object.entries({'subtitle':'subtitle','notebook-label':'notebook','volume-label':'volume','headphone-note':'headphones','local-note':'local','reset':'reset','footer-note':'footer','about-toggle':'sources'}))$(id).textContent=t[key];
  $('intro-note').innerHTML=t.intro;$('about').innerHTML=t.about;$('volume').setAttribute('aria-label',t.volume);
  $('lang-zh').setAttribute('aria-pressed',String(language==='zh'));$('lang-en').setAttribute('aria-pressed',String(language==='en'));
  $('instrument-label').textContent=`0${current+1} / ${e.label}`;$('chart-title').textContent=c.chartTitle;$('chart-subtitle').textContent=c.chartSubtitle;
  $('chart-legend').innerHTML=c.legend.map((v,i)=>`<span class="${current===1?(i===0?'legend-sum':'legend-b'):['legend-a','legend-b','legend-sum'][i]}">${v}</span>`).join('');
  if(!$('audio-error').hidden)$('audio-error').textContent=t.noAudio;
  renderTabs();renderFlow();renderControls();renderTransport();
}
function selectExperiment(index){stop();current=index;$('audio-error').hidden=true;render();announce(experiments[index][language].title);}
function modify(value,mode){const s=states[current];if(s.guess===null)return;const was=s.interacted;
  if(value!==undefined)s.value=value;if(mode!==undefined)s.mode=mode;s.interacted=true;audio.update(s);updateReadouts();if(!was)renderFlow();
}
$('experiments').addEventListener('click',event=>{const b=event.target.closest('[data-experiment]');if(b)selectExperiment(Number(b.dataset.experiment));});
$('learning-flow').addEventListener('click',event=>{const choice=event.target.closest('[data-choice]');if(choice){states[current].guess=Number(choice.dataset.choice);renderFlow();renderControls();renderTransport();announce(text().saved);$('parameter').focus();return;}
  if(event.target.closest('#reveal')){states[current].revealed=true;renderFlow();renderTabs();announce(experiments[current][language].answer);const title=$('learning-flow').querySelector('.answer-title');title.tabIndex=-1;title.focus();}
  if(event.target.closest('[data-next]')){selectExperiment(current+1);$('lab').focus();}
});
$('control-area').addEventListener('input',event=>{if(event.target.id==='parameter')modify(Number(event.target.value));});
$('control-area').addEventListener('click',event=>{const preset=event.target.closest('[data-preset]'),mode=event.target.closest('[data-mode]');if(preset){$('parameter').value=preset.dataset.preset;modify(Number(preset.dataset.preset));}if(mode)modify(undefined,mode.dataset.mode);});
$('play').addEventListener('click',async()=>{if(playing){stop();return;}const request=++playRequest;pending=true;renderTransport();$('audio-error').hidden=true;try{const started=await audio.play(current,states[current]);if(request!==playRequest)return;playing=started;}catch{if(request!==playRequest)return;playing=false;$('audio-error').textContent=text().noAudio;$('audio-error').hidden=false;}finally{if(request===playRequest){pending=false;renderTransport();scope.update(current,states[current],language,playing);}}});
$('volume').addEventListener('input',event=>{audio.setVolume(Number(event.target.value)/100);$('volume-value').textContent=`${event.target.value}%`;});
for(const lang of ['zh','en'])$(`lang-${lang}`).addEventListener('click',()=>{language=lang;try{localStorage.setItem('mio-sound-lab-language',lang);}catch{}render();});
$('reset').addEventListener('click',()=>{stop();states[current]=defaults(current);render();announce(language==='zh'?'本关已重置':'Experiment reset');});
$('about-toggle').addEventListener('click',()=>{const expanded=$('about').hidden;$('about').hidden=!expanded;$('about-toggle').setAttribute('aria-expanded',String(expanded));});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);
render();
// Optional WebMCP: only non-audio state changes. Sound always needs a direct user click.
if(navigator.modelContext?.registerTool){try{navigator.modelContext.registerTool({name:'inspect_sound_lab',description:'Read the active sound experiment and learning progress. Does not play audio.',inputSchema:{type:'object',properties:{},additionalProperties:false},execute:async()=>({content:[{type:'text',text:JSON.stringify({experiment:current+1,language,...states[current],playing,completed:states.filter(s=>s.revealed).length})}]})});}catch{}}
