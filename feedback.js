// Original synthesized sports audio. No external music files.
export function createFeedback(role){
let ctx,mg,eg,nodes=new Set(),timer,beat=0,current=null,remaining=0,enabled=false,previous=null,leader=0,lastLead=0,lastCount=null,flash;
const student=role==='student';
const track=student?null:new Audio(new URL('./can-can.mp3',import.meta.url));
let playingRequest=false, trackError=false, generation=0;
if(track){track.loop=true;track.preload='none';track.volume=.25}

const panel=document.createElement('section');panel.className='panel';panel.innerHTML=`<strong>聲音與回饋</strong> <button id="soundEnable">啟用聲音</button><span id="soundStatus" role="status">尚未啟用</span><div><label ${student?'hidden':''}><input id="soundMusic" type="checkbox" checked>背景音樂 <input aria-label="音樂音量" id="soundMV" type="range" min="0" max="60" value="25"></label><label><input id="soundEffects" type="checkbox" checked>音效 <input aria-label="音效音量" id="soundEV" type="range" min="0" max="100" value="45"></label><label ${student?'':'hidden'}><input id="soundVibrate" type="checkbox">震動</label></div><p class="muted">${student?'手機不播放背景音樂。震動依裝置支援情況運作。':'教師與投影視窗請只選一個啟用聲音，避免重複播放。'}</p>${student?'':`<p class="muted">配樂：Jacques Offenbach〈康康舞曲〉，鋼琴錄音：Gnissah。<a href="https://commons.wikimedia.org/wiki/File:Jacques_Offenbach_-_Galop_Infernal_from_Orpheus_in_the_Underworld_%28Can_Can%29_%281858%29.ogg" target="_blank" rel="noopener">原始錄音</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a> · 轉為 MP3，未剪輯。</p>`}`;
document.querySelector('main').prepend(panel);const $=id=>document.getElementById(id);
if(!navigator.vibrate)$('soundVibrate').disabled=true;
function tone(f,d=.15,type='sine',volume=.2,delay=0,bus=eg,end=f){if(!ctx)return;const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(bus);o.start(t);o.stop(t+d+.02);nodes.add(o);o.onended=()=>{nodes.delete(o);o.disconnect();g.disconnect()}}
function noise(d,volume,bus){const b=ctx.createBuffer(1,ctx.sampleRate*d,ctx.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);const s=ctx.createBufferSource(),g=ctx.createGain(),f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=900;s.buffer=b;g.gain.value=volume;s.connect(f).connect(g).connect(bus);nodes.add(s);s.onended=()=>{nodes.delete(s);s.disconnect();g.disconnect();f.disconnect()};s.start()}

function levels(){if(!ctx)return;mg.gain.setTargetAtTime(!student&&$('soundMusic').checked?+$('soundMV').value/100:0,ctx.currentTime,.03);eg.gain.setTargetAtTime($('soundEffects').checked?+$('soundEV').value/100:0,ctx.currentTime,.03)}
function hush(){generation++;playingRequest=false;track?.pause();clearTimeout(timer);timer=null;for(const n of nodes){try{n.stop()}catch{}}nodes.clear();navigator.vibrate?.(0)}
function fx(name){if(!enabled||document.hidden)return;const seq=(notes,d=.12)=>notes.forEach((f,i)=>tone(f,d,'triangle',.24,i*d));if(name==='correct')seq([660,880]);if(name==='wrong')seq([240,150],.18);if(name==='whistle'){tone(1850,.22,'sine',.18,0,eg,2200);tone(2200,.36,'sine',.14,.27,eg,2000)}if(name==='lead')seq([392,523,784]);if(name==='count')tone(660,.12,'sine',.28);if(name==='win')seq([523,659,784,1047],.19);if(name==='lose')seq([392,330,262],.25);if(name==='draw')seq([440,554,440],.2)}
function musicLoop(){timer=null;if(!enabled||student||document.hidden||!['lobby','running'].includes(current?.status)||current.status==='running'&&remaining<=0)return;const bpm=current.status==='lobby'?96:remaining<=30000?132:112;if($('soundMusic').checked){if(beat%2===0)tone(110,.17,'sine',.5,0,mg,45);if(beat%4===2)noise(.09,.16,mg);noise(.025,.035,mg);if(beat%4===0){const root=[130.81,174.61,196,174.61][Math.floor(beat/8)%4];[root,root*1.5,root*2].forEach(f=>tone(f,.32,'triangle',.055,0,mg))}}beat++;timer=setTimeout(musicLoop,60000/bpm/2)}
function syncMusic(){
 if(track&&!trackError&&current?.status==='running'){
  track.volume=+$('soundMV').value/100;
  if(!enabled||document.hidden||remaining<=0||!$('soundMusic').checked){generation++;playingRequest=false;track.pause();return}
  if(track.paused&&!playingRequest){
   const id=++generation;playingRequest=true;
   track.play().catch(()=>{if(id!==generation)return;trackError=true;$('soundStatus').textContent='無法播放康康舞曲，已切回原背景節奏';syncMusic()}).finally(()=>{if(id===generation)playingRequest=false});
  }
  return;
 }
 if(!timer)musicLoop()
}
$('soundEnable').onclick=async()=>{try{if(enabled){enabled=false;hush();$('soundEnable').textContent='啟用聲音';$('soundStatus').textContent='已關閉';return}const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('此瀏覽器不支援音訊');if(!ctx){ctx=new AC();mg=ctx.createGain();eg=ctx.createGain();const master=ctx.createDynamicsCompressor();mg.connect(master);eg.connect(master);master.connect(ctx.destination)}const resumed=ctx.resume();if(track&&current?.status!=='running'&&!trackError){track.muted=true;const id=++generation;track.play().then(()=>{if(id===generation&&current?.status!=='running')track.pause()}).catch(()=>{}).finally(()=>{track.muted=false})}await resumed;enabled=true;levels();fx('correct');syncMusic();$('soundEnable').textContent='關閉聲音';$('soundStatus').textContent='已啟用'}catch(e){$('soundStatus').textContent=e.message}};
for(const id of ['soundMusic','soundEffects','soundMV','soundEV'])$(id).oninput=()=>{levels();syncMusic()};
document.addEventListener('visibilitychange',()=>{if(document.hidden)hush();else syncMusic()});window.addEventListener('pagehide',hush);
return {
update(s,team){current=s;if(!s){hush();previous=null;return}const lead=Math.sign(s.position||0);if(s.status!==previous){hush();if(previous==='lobby'&&s.status==='running')fx('whistle');if(previous&&previous!=='ended'&&s.status==='ended')fx(s.winner==='draw'?'draw':student&&team!==s.winner?'lose':'win');if(track&&s.status==='ended')track.currentTime=0;previous=s.status;lastCount=null}if(s.status==='running'&&lead&&leader&&lead!==leader&&Date.now()-lastLead>=8000){if(!student)fx('lead');lastLead=Date.now()}if(lead)leader=lead;if(!['paused','ended'].includes(s.status))syncMusic()},
time(ms){remaining=ms;if(current?.status==='running'){if(ms<=0){hush();return}const sec=Math.ceil(ms/1000);if(sec<=5&&sec!==lastCount){if(!student)fx('count');lastCount=sec}syncMusic()}},
answer(ok){if(current?.status!=='running')return;fx(ok?'correct':'wrong');const el=$('questionPanel');el.style.outline=ok?'3px solid #a9df83':'3px solid #ed967f';clearTimeout(flash);flash=setTimeout(()=>el.style.outline='',650);if($('soundVibrate').checked&&!document.hidden&&navigator.vibrate)navigator.vibrate(ok?40:[60,70,60])}
};
}
