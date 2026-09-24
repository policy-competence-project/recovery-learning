'use strict';
const connection=navigator.connection;
const saveBandwidth=Boolean(connection?.saveData||/^(slow-2g|2g|3g)$/.test(connection?.effectiveType||''));
const posterObserver=new IntersectionObserver(entries=>{
  for(const e of entries)if(e.isIntersecting){
    const v=e.target;if(v.dataset.poster){v.poster=v.dataset.poster;delete v.dataset.poster;}
    posterObserver.unobserve(v);
  }
},{rootMargin:'250px'});
document.querySelectorAll('video[data-poster]').forEach(v=>posterObserver.observe(v));
// Loading feedback reports buffered playback duration, never a simulated page percentage.
document.querySelectorAll('#overview video,.demo-clip').forEach(v=>{
  const wrapper=v.closest('.clip-frame')||v.parentElement;
  wrapper.classList.add('video-container');
  const box=document.createElement('div');box.className='video-status';box.hidden=true;box.setAttribute('role','status');
  const label=document.createElement('span');label.textContent='Loading video…';
  const progress=document.createElement('progress');progress.max=100;progress.setAttribute('aria-label','Buffered video duration');
  const retry=document.createElement('button');retry.type='button';retry.textContent='Retry';retry.hidden=true;
  const download=document.createElement('a');download.href=v.querySelector('source').getAttribute('src');download.textContent='Open video';download.hidden=true;
  box.append(label,progress,retry,download);wrapper.append(box);
  let waiting=false,failed=false,timer;
  const refresh=()=>{
    if(!waiting&&!failed)return;
    if(failed){label.textContent='Video could not load.';progress.hidden=true;retry.hidden=false;download.hidden=false;return;}
    const duration=v.duration;
    let buffered=0;
    for(let i=0;i<v.buffered.length;i++)buffered+=v.buffered.end(i)-v.buffered.start(i);
    if(Number.isFinite(duration)&&duration>0){const pct=Math.min(100,Math.round(buffered/duration*100));progress.value=pct;label.textContent=pct?'Buffering · '+pct+'% buffered':'Loading video…';}
    else{progress.removeAttribute('value');label.textContent='Loading video…';}
  };
  const start=()=>{waiting=true;failed=false;retry.hidden=true;download.hidden=true;progress.hidden=false;clearTimeout(timer);timer=setTimeout(()=>{if(waiting){box.hidden=false;refresh();}},350);};
  const stop=()=>{waiting=false;clearTimeout(timer);if(!failed)box.hidden=true;};
  v.addEventListener('waiting',start);
  v.addEventListener('loadstart',()=>{if(!v.paused)start();});
  v.addEventListener('playing',stop);v.addEventListener('canplay',stop);v.addEventListener('pause',stop);
  v.addEventListener('progress',refresh);
  const fail=()=>{failed=true;waiting=false;clearTimeout(timer);box.hidden=false;refresh();};
  v.addEventListener('error',fail);
  v.querySelectorAll('source').forEach(source=>source.addEventListener('error',fail));
  retry.addEventListener('click',()=>{failed=false;v.load();start();v.play().catch(()=>{});});
});
const sim={
  macro:[12.6,22.4,25.8,27.4,15.2],
  stack_bowls:[62,76,84,88,64],fill_pen_holder:[6,16,20,22,6],insert_tubes:[8,20,28,34,10],
  pack_objects_into_box:[4,14,16,16,6],store_laptop_and_headphones:[20,30,32,32,24],
  fasten_screws:[8,14,18,20,10],stack_blocks:[10,20,22,22,12],
  arrange_largest_number:[8,16,20,20,10],plug_in_charger:[0,8,8,10,4],build_tower:[0,10,10,10,6]
};
const real={macro:[100/3,155/3,190/3,205/3,95/3],'Wash Clothes':[25,40,52.5,55,22.5],'Fridge Organizing':[35,55,65,72.5,35],'Hang Up Headphones':[40,60,72.5,77.5,37.5]};
const ns='http://www.w3.org/2000/svg';
function el(name,attrs={},text){const n=document.createElementNS(ns,name);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;}
function drawChart(target,values,color,name){
 const svg=el('svg',{viewBox:'0 0 490 295',role:'img','aria-label':`${name}: Base ${values[0].toFixed(1)}%, R1 ${values[1].toFixed(1)}%, R2 ${values[2].toFixed(1)}%, R3 ${values[3].toFixed(1)}%. LoRA-BC ${values[4].toFixed(1)}%.`});
 const xs=[54,182,310,438], y=v=>240-v*1.92;
 for(const v of [0,20,40,60,80,100]){svg.append(el('line',{x1:46,x2:458,y1:y(v),y2:y(v),stroke:'#dce3e7','stroke-width':1}));svg.append(el('text',{x:35,y:y(v)+4,'text-anchor':'end',fill:'#7c8993','font-size':10},String(v)));}
 svg.append(el('text',{x:46,y:19,fill:'#66727b','font-size':10},'From-start success (%)'));
 svg.append(el('line',{x1:46,x2:458,y1:y(values[4]),y2:y(values[4]),stroke:'#8c98a5','stroke-width':1.5,'stroke-dasharray':'5 5'}));
 svg.append(el('path',{d:'M'+values.slice(0,4).map((v,i)=>`${xs[i]},${y(v)}`).join(' L'),fill:'none',stroke:color,'stroke-width':3.5,'stroke-linejoin':'round'}));
 values.slice(0,4).forEach((v,i)=>{svg.append(el('circle',{cx:xs[i],cy:y(v),r:5.5,fill:i?color:'#8c98a5',stroke:'#fff','stroke-width':2}));svg.append(el('text',{x:xs[i],y:y(v)-13,'text-anchor':'middle',fill:i?color:'#6c7985','font-size':13,'font-weight':600},v.toFixed(1)));svg.append(el('text',{x:xs[i],y:262,'text-anchor':'middle',fill:'#526271','font-size':11},['Base','R1','R2','R3'][i]));});
 svg.append(el('line',{x1:54,x2:76,y1:285,y2:285,stroke:color,'stroke-width':3}));svg.append(el('text',{x:83,y:289,fill:'#526271','font-size':10},'Iterative student'));
 svg.append(el('line',{x1:218,x2:240,y1:285,y2:285,stroke:'#8c98a5','stroke-width':1.5,'stroke-dasharray':'5 4'}));svg.append(el('text',{x:247,y:289,fill:'#526271','font-size':10},'LoRA-BC (R1 reference)'));
 target.replaceChildren(svg);
}
for(const[selectId,chartId,data,color,label]of[['sim-task','sim-chart',sim,'#558a66','RoboDojo'],['real-task','real-chart',real,'#cf864d','Real world']]){
 const select=document.getElementById(selectId);if(!select)continue;
 for(const name of Object.keys(data).filter(x=>x!=='macro')){const o=document.createElement('option');o.value=name;o.textContent=name.replaceAll('_',' ');select.append(o);}
 const update=()=>drawChart(document.getElementById(chartId),data[select.value],color,label+' '+select.options[select.selectedIndex].text);
 select.addEventListener('change',update);update();
}
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused=reduced.matches;
function setMotion(paused){motionPaused=paused;document.body.classList.toggle('motion-paused',paused);const b=document.getElementById('motion-toggle');if(b){b.textContent=paused?'Play animation':'Pause animation';b.setAttribute('aria-pressed',String(paused));}document.querySelectorAll('.environment-video').forEach(v=>{if(paused)v.pause();else if(v.dataset.visible==='true'&&!document.hidden)v.play().catch(()=>{});});}
document.getElementById('motion-toggle')?.addEventListener('click',()=>setMotion(!motionPaused));setMotion(motionPaused);
const obs=new IntersectionObserver(entries=>entries.forEach(e=>{const v=e.target;v.dataset.visible=String(e.isIntersecting);if(e.isIntersecting&&!motionPaused)v.play().catch(()=>{});else v.pause();}),{threshold:.2});document.querySelectorAll('.environment-video').forEach(v=>obs.observe(v));

const previewClips=[...document.querySelectorAll('.demo-clip')];
previewClips.forEach(v=>{
  const frame=v.closest('.clip-frame');
  const controls=document.createElement('div');controls.className='clip-actions';
  const play=document.createElement('button');play.className='clip-action';play.type='button';
  const full=document.createElement('button');full.className='clip-action';full.type='button';
  full.textContent='⛶';full.title='Full screen';full.setAttribute('aria-label','Full screen');
  const sync=()=>{play.textContent=v.paused?'▶':'Ⅱ';play.title=v.paused?'Play clip':'Pause clip';play.setAttribute('aria-label',play.title);};
  play.addEventListener('click',()=>{if(v.paused){v.dataset.manualPlay='true';v.dataset.manualPause='false';v.play().catch(()=>{});}else{v.dataset.manualPlay='false';v.dataset.manualPause='true';v.pause();}});
  full.addEventListener('click',()=>{v.controls=true;if(v.requestFullscreen)v.requestFullscreen().catch(()=>{v.controls=false;});else if(v.webkitEnterFullscreen)v.webkitEnterFullscreen();});
  document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement!==v)v.controls=false;});
  v.addEventListener('webkitendfullscreen',()=>{v.controls=false;});
  v.addEventListener('play',sync);v.addEventListener('pause',sync);sync();
  controls.append(play,full);frame.append(controls);v.controls=false;
});
let previewsPaused=reduced.matches||saveBandwidth;
const overview=document.querySelector('#overview video');
let overviewPlaying=false;
function updatePreviews(){
  const button=document.getElementById('gallery-toggle');
  if(button){button.textContent=previewsPaused?'Play previews':'Pause previews';button.setAttribute('aria-pressed',String(previewsPaused));}
  previewClips.forEach(v=>{
    if((!previewsPaused||v.dataset.manualPlay==='true')&&v.dataset.manualPause!=='true'&&!overviewPlaying&&!document.hidden&&v.dataset.visible==='true')v.play().catch(()=>{});
    else v.pause();
  });
}
const clipObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{e.target.dataset.visible=String(e.isIntersecting);});
  updatePreviews();
},{threshold:.35});
previewClips.forEach(v=>clipObserver.observe(v));
document.getElementById('gallery-toggle')?.addEventListener('click',()=>{previewsPaused=!previewsPaused;previewClips.forEach(v=>{v.dataset.manualPlay='false';v.dataset.manualPause='false';});updatePreviews();});
overview?.addEventListener('play',()=>{overviewPlaying=true;updatePreviews();});
for(const event of ['pause','ended'])overview?.addEventListener(event,()=>{overviewPlaying=false;updatePreviews();});
document.addEventListener('visibilitychange',updatePreviews);
reduced.addEventListener('change',e=>{previewsPaused=e.matches||saveBandwidth;setMotion(e.matches);updatePreviews();});
updatePreviews();
