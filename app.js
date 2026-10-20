"use strict";
const $=id=>document.getElementById(id);
const cv=$("office"),ctx=cv.getContext("2d"),W=cv.width,H=cv.height;
const palette=["#90d6c4","#e3bd7a","#a9bdf0","#80c5d0","#b4cda0","#dba8b2","#a9a4db","#96c9b6","#c7b18d","#b5b9d9","#dfa77e","#83b8d4"];
const names=["経営企画室","仕入部","審査業務部","販売部","業務部","広報販促部","新規事業部","情報システム部","総務部","関連事業","建築部","財務部"];
const roomWork=["事業計画","物件情報の整理","資料の確認","販売提案","契約書類の整理","広告の制作","事業の検討","システムの開発","社内の調整","事業の企画","設計・積算","収支の確認"];
const rooms=()=>names.map((name,i)=>({name,id:String(i).padStart(2,"0"),index:i,x:32+(i%4)*470,y:152+Math.floor(i/4)*240,w:446,h:222,color:palette[i]}));
let selectedDept="all",paused=false,speed=1,elapsed=0,previous=performance.now(),recorder,recordTimer;
function text(value,x,y,size=20,color="#edf4f7",weight=400,align="left") {
  ctx.fillStyle=color;ctx.font=`${weight} ${size}px "Yu Gothic UI","Meiryo",sans-serif`;ctx.textAlign=align;ctx.textBaseline="middle";ctx.fillText(value,x,y);ctx.textAlign="left";
}
function fit(value,maxWidth,size=17){
  ctx.font=`${size}px "Yu Gothic UI","Meiryo",sans-serif`;
  let s=String(value||"");while(s && ctx.measureText(s).width>maxWidth)s=s.slice(0,-1);
  return s===String(value||"")?s:s.slice(0,-1)+"…";
}
function rect(x,y,w,h,color,r=0,stroke=null){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=color;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
}
function line(x1,y1,x2,y2,color,width=1){
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
}
function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function plant(x,y,scale=1){
  rect(x-8*scale,y,16*scale,16*scale,"#b28b6c",3);
  for(let i=0;i<5;i++){let a=i*1.8;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*9*scale,y-7*scale+Math.sin(a)*7*scale,7*scale,13*scale,a,0,Math.PI*2);ctx.fillStyle=i%2?"#678d76":"#82ad87";ctx.fill();}
}
function plant(x,y,scale=1){
  rect(x-8*scale,y,16*scale,16*scale,"#b28b6c",3);
  for(let i=0;i<5;i++){let a=i*1.8;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*9*scale,y-7*scale+Math.sin(a)*7*scale,7*scale,13*scale,a,0,Math.PI*2);ctx.fillStyle=i%2?"#678d76":"#82ad87";ctx.fill();}
}
function desk(x,y,accent,on=false){
  rect(x-2,y+3,78,47,"#17313b20",5);rect(x,y,74,42,"#bb9776",4);
  rect(x+3,y+3,68,35,"#dfc3a0",3);rect(x+20,y+6,34,21,"#354e5a",3);
  rect(x+23,y+8,28,15,on?accent:"#6b8791",1);rect(x+32,y+27,10,3,"#425761");
  rect(x+23,y+32,28,4,"#f0e8d6",1);rect(x+59,y+8,8,12,"#eee9df",1);
  rect(x+24,y+49,28,16,"#76939c",6);rect(x+21,y+43,34,12,"#8aa6ad",5);
}
function person(x,y,color,walking,t,active=false){
  const bob=walking?Math.sin(t*13)*2:active?Math.sin(t*4)*.7:0;
  ctx.save();ctx.translate(Math.round(x),Math.round(y+bob));
  ctx.fillStyle="#122a3340";ctx.beginPath();ctx.ellipse(0,17,16,6,0,0,Math.PI*2);ctx.fill();
  const leg=walking?Math.sin(t*13)*4:0;
  rect(-9,5+leg,7,12,"#334c60",2);rect(2,5-leg,7,12,"#334c60",2);
  const hand=active&&!walking?Math.sin(t*8)*4:0;
  rect(-12,-12,24,22,color,5);rect(-16,-8+hand,5,15,"#e8be9c",3);rect(11,-8-hand,5,15,"#e8be9c",3);
  circle(0,-23,13,"#e9bf9b");rect(-13,-34,26,10,"#33434e",5);rect(-14,-28,5,10,"#33434e",2);
  rect(-7,-24,3,3,"#33434e");rect(5,-24,3,3,"#33434e");rect(-3,-15,6,2,"#b37665");
  rect(-3,-9,6,9,"#ecf1e4",1);
  ctx.restore();
}
function drawRoom(r,t,visible){
  const list=[], active=[];
  const focus=selectedDept===r.id;
  ctx.globalAlpha=1;
  rect(r.x,r.y+5,r.w,r.h,"#08141b55",10);
  rect(r.x,r.y,r.w,r.h,focus?"#b2e7cc":"#d3dbd6",10);
  rect(r.x+7,r.y+46,r.w-14,r.h-53,"#e7e9de",5);
  ctx.save();ctx.beginPath();ctx.rect(r.x+8,r.y+48,r.w-16,r.h-57);ctx.clip();
  for(let yy=r.y+52;yy<r.y+r.h;yy+=24)line(r.x+8,yy,r.x+r.w-8,yy,"#c8d2c330",1);
  ctx.restore();
  rect(r.x,r.y,r.w,40,"#223845",8);rect(r.x,r.y+25,r.w,15,"#223845");
  rect(r.x+13,r.y+10,29,22,r.color,4);text(r.id,r.x+27,r.y+21,13,"#17333b",700,"center");
  text(r.name,r.x+52,r.y+21,20,"#eaf2f2",600);
  rect(r.x+292,r.y+9,142,24,active.length?"#306958":"#304854",5);
  circle(r.x+305,r.y+21,4,active.length?"#8cf1c1":"#7e99a4");
  text("オフィスの演出",r.x+317,r.y+21,13,active.length?"#d6ffeb":"#adc4ce",600);
  // Staff are a company illustration; only the green log badge is observed activity.
  for(let k=0;k<3;k++){
    const dx=r.x+25+k*120, phase=t+r.index*.73+k*1.9;
    rect(dx,r.y+49,75,10,"#b5d4da",2);line(dx+38,r.y+49,dx+38,r.y+59,"#eff8f6",2);
    desk(dx,r.y+70,r.color,true);
    for(let q=0;q<3;q++)rect(dx+25,r.y+81+q*4,10+(Math.sin(phase*2+q)+1)*5,2,"#effff0",1);
    person(dx+37,r.y+130,[r.color,"#91a9c4","#cd9d84"][k],false,phase,true);
    if((phase%9)<2.4){
      rect(dx+48,r.y+111,25,17,"#f7fbef",4);
      for(let b=0;b<3;b++)circle(dx+54+b*6,r.y+119,1.6,"#659391");
    }
  }
  plant(r.x+407,r.y+90,.85);
  rect(r.x+385,r.y+132,44,39,"#c9baa0",3);
  for(let k=0;k<4;k++)rect(r.x+390+k*8,r.y+138,6,25,["#8ba8b7","#d4af86","#98bda9","#c28c83"][k],1);
  const phase=(t*.085+r.index*.17)%1;
  const walkX=r.x+60+Math.sin(phase*Math.PI)*302;
  person(walkX,r.y+177,r.color,true,t+r.index);
  rect(walkX+9,r.y+163,15,20,"#faf4df",2);
  line(walkX+12,r.y+168,walkX+21,r.y+168,"#97ada5",1);
  rect(r.x+8,r.y+r.h-25,r.w-16,20,"#f0f3e9",3);
  text(roomWork[r.index]+"〈演出〉",r.x+16,r.y+r.h-14,13,"#536f74",500);
  text("AI ASSET",r.x+r.w-15,r.y+r.h-14,13,"#536f74",400,"right");
  ctx.globalAlpha=1;
}
function drawCompanyLounge(t){
  rect(32,884,1050,144,"#d2ddd5",10);
  text("MEETING & COLLABORATION",50,905,14,"#4c716d",600);
  text("共用スペース〈演出〉",1060,905,14,"#6b8783",400,"right");
  rect(58,930,130,57,"#f2f5e9",4,"#93aaa3");
  for(let k=0;k<4;k++)rect(70+k*26,971-(k+1)*7,16,(k+1)*7, palette[k],2);
  person(216,978,"#90d6c4",false,t,true);
  person(323,963,"#e3bd7a",false,t+2,true);
  person(421,963,"#a9bdf0",false,t+4,true);
  rect(283,975,186,30,"#b49576",10);rect(289,975,174,23,"#e0c7a3",8);
  for(let k=0;k<3;k++){rect(310+k*52,978,25,16,"#eff4e8",2);line(315+k*52,983,329+k*52,983,"#91aaa2");}
  const x=530+(Math.sin(t*.45)+1)*105;
  person(x,977,"#b4cda0",true,t);
  rect(x+9,961,15,20,"#f3e7cd",2);
  person(887,969,"#dba8b2",false,t+1,true);
  rect(804,977,184,30,"#b99b7a",5);rect(810,977,172,22,"#e0c7a3",4);
  text("AI ASSET",895,988,14,"#536d68",700,"center");plant(1038,982,1.1);
}
function draw(t){
  rect(0,0,W,H,"#10202c");
  rect(0,0,W,100,"#132633");
  text("AI ASSET / COMPANY OFFICE",32,30,18,"#9bcdbd",600);
  text("AIアセット｜会社全体が、ひとつのチームに。",32,70,30,"#f0f4ef",600);
  rect(1620,24,268,52,"#2b4944",10);
  text("公開デモ · オフィスの演出",1754,50,18,"#c9e9dd",600,"center");
  text("12の部屋で広がる、それぞれの仕事。",32,125,20,"#c5e6db",600);
  text(paused?"一時停止中":"パソコン作業 / 資料運び / 打合せ",1888,125,17,"#a8c2ca",400,"right");
  rect(20,144,1880,724,"#819796",12);
  for(let y=152;y<868;y+=16)line(20,y,1900,y,"#b8c6bf11");
  rooms().forEach(r=>drawRoom(r,t,[]));
  drawCompanyLounge(t);
  rect(1102,884,786,144,"#142d39",10,"#355160");
  const i=selectedDept==="all"?Math.floor(t/8)%12:Number(selectedDept);
  text("DEPARTMENT SPOTLIGHT",1125,908,15,"#8eb9ac",600);
  text(names[i],1125,945,25,"#eff6f0",600);
  text(roomWork[i]+"をイメージしたアニメーション",1125,984,18,"#aac5ce");
  if(recorder?.state==="recording"){circle(1840,908,6,"#f49e8d");}
  line(32,1043,1888,1043,"#2a404d");
  text("株式会社Ｍｙアセット　営業戦略担当",32,1063,14,"#819aa5");
  text("すべて演出です。実際の業務・社員・AIの稼働状況を示すものではありません。",1888,1063,15,"#a2bcc4",400,"right");
}
function animate(now){
  const dt=Math.min((now-previous)/1000,.05);previous=now;
  if(!paused)elapsed+=dt*speed;
  draw(elapsed);requestAnimationFrame(animate);
}
$("pause").onclick=()=>{
  paused=!paused;$("pause").textContent=paused?"再生する":"一時停止";
  $("pause").setAttribute("aria-pressed",String(paused));
};
$("speed").onchange=e=>{speed=Number(e.target.value);};
$("department").onchange=e=>{selectedDept=e.target.value;};
names.forEach((name,i)=>{
  const option=document.createElement("option");option.value=String(i).padStart(2,"0");option.textContent=name;$("department").append(option);
});
cv.addEventListener("click",e=>{
  const b=cv.getBoundingClientRect(),x=(e.clientX-b.left)/b.width*W,y=(e.clientY-b.top)/b.height*H;
  const r=rooms().find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);
  if(r){selectedDept=selectedDept===r.id?"all":r.id;$("department").value=selectedDept;}
});
$("fullscreen").onclick=async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else await $("stage").requestFullscreen();}
  catch{$("notice").textContent="ブラウザーの全画面表示をご利用ください。";}
};
$("record").onclick=()=>{
  if(recorder?.state==="recording"){recorder.stop();return;}
  if(!window.MediaRecorder||!cv.captureStream){$("notice").textContent="このブラウザーでは録画を利用できません。";return;}
  const mime=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(x=>MediaRecorder.isTypeSupported(x));
  if(!mime){$("notice").textContent="このブラウザーではWebM録画を利用できません。";return;}
  const chunks=[];let bytes=0;
  try{
    recorder=new MediaRecorder(cv.captureStream(25),{mimeType:mime,videoBitsPerSecond:4000000});
    recorder.ondataavailable=e=>{if(e.data.size){chunks.push(e.data);bytes+=e.data.size;if(bytes>100000000&&recorder.state==="recording")recorder.stop();}};
    recorder.onstop=()=>{
      clearTimeout(recordTimer);recorder.stream.getTracks().forEach(t=>t.stop());
      const blob=new Blob(chunks,{type:"video/webm"}),url=URL.createObjectURL(blob),a=document.createElement("a");
      a.href=url;a.download="AI-Asset-Office-"+new Date().toISOString().replace(/[:.]/g,"-")+".webm";a.textContent="録画をダウンロード";
      $("notice").replaceChildren("録画できました（音声なし）。 ",a);
      a.addEventListener("click",()=>setTimeout(()=>URL.revokeObjectURL(url),60000),{once:true});
      $("record").textContent="動画を録画";$("record").classList.remove("running");
    };
    recorder.start(1000);recordTimer=setTimeout(()=>{if(recorder.state==="recording")recorder.stop();},120000);
    $("record").textContent="録画を停止";$("record").classList.add("running");
    $("notice").textContent="この画面を録画しています。停止後に動画を端末へ保存できます（最長2分）。";
  }catch{$("notice").textContent="録画を開始できませんでした。";}
};
window.addEventListener("beforeunload",e=>{if(recorder?.state==="recording"){e.preventDefault();e.returnValue="";}});
requestAnimationFrame(animate);
