

/* Calculator script */
function runCalcBMI() {
  var f=parseFloat(document.getElementById('calc-ft').value)||0;
  var i=parseFloat(document.getElementById('calc-inch').value)||0;
  var w=parseFloat(document.getElementById('calc-wt').value)||0;
  if(!f||!w) return;
  var ti=f*12+i, bmi=Math.round((w/(ti*ti))*703*10)/10;
  var loss=Math.round(w*0.28), tgt=Math.round(w-loss);
  var cat,cc,bg;
  if(bmi<18.5){cat='Underweight';cc='#2563eb';bg='rgba(37,99,235,.08)';}
  else if(bmi<25){cat='Normal weight';cc='#16a34a';bg='rgba(22,163,74,.08)';}
  else if(bmi<30){cat='Overweight';cc='#d97706';bg='rgba(217,119,6,.08)';}
  else if(bmi<35){cat='Obese Class I';cc='#ea580c';bg='rgba(234,88,12,.08)';}
  else if(bmi<40){cat='Obese Class II';cc='#dc2626';bg='rgba(220,38,38,.08)';}
  else{cat='Obese Class III';cc='#991b1b';bg='rgba(153,27,27,.08)';}
  var pct=Math.min(Math.max((bmi-14)/30,0),1)*100;
  var bn=document.getElementById('calc-bmi-num'); bn.textContent=bmi; bn.style.color=cc;
  var bc=document.getElementById('calc-bmi-cat'); bc.textContent=cat; bc.style.color=cc; bc.style.background=bg;
  document.getElementById('calc-bmi-cat-wrap').style.display='block';
  document.getElementById('calc-bar-wrap').style.display='block';
  document.getElementById('calc-bmi-pip').style.left=pct+'%';
  document.getElementById('calc-r-sw').textContent=w+' lbs';
  document.getElementById('calc-r-tw').textContent=tgt+' lbs';
  document.getElementById('calc-r-loss').textContent=loss+' lbs';
  document.getElementById('calc-res-rows').style.display='block';
  document.getElementById('calc-sw').value=w; calcUpdProj();
}
function calcLiveW() {
  var w=parseFloat(document.getElementById('calc-wt').value)||0;
  if(w>80){
    var tot=Math.round(w*0.28),wks=Math.round(tot/0.75);
    document.getElementById('calc-lose-num').textContent=tot;
    document.getElementById('calc-lose-note').textContent='in ~'+wks+' weeks with Retatrutide';
    document.getElementById('calc-sw').value=w; calcUpdProj();
  }
}
function calcUpdProj() {
  var sw=parseInt(document.getElementById('calc-sw').value);
  var tot=Math.round(sw*0.28),wks=Math.round(tot/0.75);
  document.getElementById('calc-sw-badge').textContent=sw+' lbs';
  document.getElementById('calc-lose-num').textContent=tot;
  document.getElementById('calc-lose-note').textContent='in ~'+wks+' weeks with Retatrutide';
  calcRenderBars(parseInt(document.getElementById('calc-wk').value)); calcUpdWk();
}
function calcUpdWk() {
  var sw=parseInt(document.getElementById('calc-sw').value);
  var wk=parseInt(document.getElementById('calc-wk').value);
  var tot=Math.round(sw*0.28);
  document.getElementById('calc-wk-badge').textContent='Wk '+wk;
  var lost=Math.round(tot*(wk/52)),cur=sw-lost,pct=Math.round((lost/tot)*100);
  document.getElementById('calc-wk-cur').textContent=cur+' lbs';
  document.getElementById('calc-wk-lost').textContent=lost+' lbs';
  document.getElementById('calc-wk-pct').textContent=pct+'%';
  document.getElementById('calc-prog-fill').style.width=pct+'%';
  calcRenderBars(wk);
}
function calcRenderBars(awk) {
  var n=32,h='';
  for(var i=1;i<=n;i++){
    var wk=Math.round(i*(52/n)),ht=Math.round(10+(i/n)*90);
    var on=awk>=(wk-Math.ceil(52/n/1.5));
    h+='<div class="calc-wbar '+(on?'on':'dim')+'" style="height:'+ht+'%"></div>';
  }
  document.getElementById('calc-wbars').innerHTML=h;
}
calcRenderBars(1); calcUpdProj();
(function(){
  var drag=false;
  var baw=document.getElementById('calc-baw');
  var imgb=document.getElementById('calc-imgb');
  var bal=document.getElementById('calc-ba-line');
  var bak=document.getElementById('calc-ba-knob');
  function setBA(x){
    var r=baw.getBoundingClientRect();
    var p=Math.min(Math.max((x-r.left)/r.width,0),1)*100;
    imgb.style.clipPath='inset(0 '+(100-p)+'% 0 0)';
    bal.style.left=p+'%'; bak.style.left=p+'%';
  }
  baw.addEventListener('mousedown',function(e){drag=true;e.preventDefault();});
  baw.addEventListener('touchstart',function(){drag=true;},{passive:true});
  document.addEventListener('mousemove',function(e){if(drag)setBA(e.clientX);});
  document.addEventListener('touchmove',function(e){if(drag)setBA(e.touches[0].clientX);},{passive:true});
  document.addEventListener('mouseup',function(){drag=false;});
  document.addEventListener('touchend',function(){drag=false;});
  setTimeout(function(){var r=baw.getBoundingClientRect();if(r.width>0)setBA(r.left+r.width*0.5);},150);
})();

function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}


/* Handlers moved off inline attributes so the site's strict CSP
   (script-src 'self') applies to this landing page unchanged.
   IDs verified against the original markup: #calc-wt is the weight
   field, #calc-sw the projection range, #calc-wk the week scrubber. */
document.addEventListener('DOMContentLoaded', function () {
  var on = function (sel, evt, fn) {
    var el = document.querySelector(sel);
    if (el) el.addEventListener(evt, fn);
  };

  on('.calc-btn', 'click', runCalcBMI);
  on('#calc-wt', 'input', calcLiveW);
  on('#calc-sw', 'input', calcUpdProj);
  on('#calc-wk', 'input', calcUpdWk);

  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () { toggleFaq(btn); });
  });

  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.display = 'none';
      if (img.nextElementSibling) img.nextElementSibling.style.display = 'flex';
    });
  });
});
