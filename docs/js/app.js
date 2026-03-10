/**
 * CYBER SHIELD - Frontend App Engine v2
 * Fixes: C-4 Selection Sort button bug
 * New:   Ripple effect on ALL buttons, Dark/Light theme toggle
 */
"use strict";

/* ════════════════════════════════════════════════════════════════
   GLOBAL STATE
════════════════════════════════════════════════════════════════ */
let DATA       = null;
let SEL_ARR    = [];
let BUB_ARR    = [];
let selBusy    = false;
let bubBusy    = false;
let searchBusy = false;

const scoreColor = s =>
  s >= 90 ? '#ff2952' : s >= 70 ? '#ff8c00' : s >= 50 ? '#ffc845' : '#00ff9d';

const levelInfo = s =>
  s >= 90 ? { cls:'lv-c', label:'KRITIS' }
  : s >= 70 ? { cls:'lv-h', label:'TINGGI' }
  : s >= 50 ? { cls:'lv-m', label:'SEDANG' }
  :           { cls:'lv-l', label:'RENDAH' };

const priority = i => [
  'Monitor pasif','Catat & awasi','Patch segera','Isolasi subnet',
  'Incident response','Tim CSIRT aktif','Shutdown layanan','LOCKDOWN ABSOLUT',
][i] ?? '-';


/* ════════════════════════════════════════════════════════════════
   THEME TOGGLE
════════════════════════════════════════════════════════════════ */
window.toggleTheme = function() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('cs-theme', next); } catch(e) {}
  // Redraw charts with new theme colors
  requestAnimationFrame(() => requestAnimationFrame(drawCharts));
};

// Restore saved theme on load
(function initTheme() {
  try {
    const saved = localStorage.getItem('cs-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch(e) {}
})();


/* ════════════════════════════════════════════════════════════════
   GLOBAL RIPPLE EFFECT — fires on every .btn click
════════════════════════════════════════════════════════════════ */
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.btn');
  if (!btn || btn.classList.contains('busy')) return;

  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.8;
  const x    = e.clientX - rect.left - size / 2;
  const y    = e.clientY - rect.top  - size / 2;

  const ripple = document.createElement('span');
  ripple.className = 'btn-ripple';
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}, true);


/* ════════════════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════════════════ */
async function boot() {
  try {
    const r = await fetch('./assets/data.json');
    if (!r.ok) throw new Error('fetch failed');
    DATA = await r.json();
  } catch {
    DATA = buildFallback();
  }

  SEL_ARR = DATA.threats.map(t => t.score);
  BUB_ARR = DATA.threats.map(t => t.score);

  renderRawTable();
  renderSelResult(SEL_ARR);
  buildViz('sel-stage','sel-vrow', SEL_ARR);
  buildViz('bub-stage','bub-vrow', BUB_ARR);
  clockTick();
  setInterval(clockTick, 1000);

  requestAnimationFrame(() => requestAnimationFrame(drawCharts));
  window.addEventListener('resize', drawCharts);
}

document.addEventListener('DOMContentLoaded', boot);


/* ════════════════════════════════════════════════════════════════
   FALLBACK DATA
════════════════════════════════════════════════════════════════ */
function buildFallback() {
  const threats = [
    {id:0,name:"SQL Injection",   score:72,type:"Web Attack",    origin:"External", impact:"Data breach"},
    {id:1,name:"DDoS Attack",     score:95,type:"Network Attack",origin:"Botnet",   impact:"Service down"},
    {id:2,name:"Phishing",        score:48,type:"Social Eng.",   origin:"Email",    impact:"Credential theft"},
    {id:3,name:"Ransomware",      score:88,type:"Malware",       origin:"Download", impact:"Data encrypted"},
    {id:4,name:"Zero-Day Exploit",score:99,type:"Exploit",       origin:"Unknown",  impact:"Full compromise"},
    {id:5,name:"Man-in-Middle",   score:61,type:"Network Attack",origin:"LAN",      impact:"Data intercept"},
    {id:6,name:"Brute Force",     score:35,type:"Auth Attack",   origin:"External", impact:"Unauthorized access"},
    {id:7,name:"Malware",         score:83,type:"Malware",       origin:"USB/Web",  impact:"System damage"},
  ];
  const sc = threats.map(t => t.score), n = sc.length, nf = n*(n-1)/2;

  const steps = []; let i=0,found=false;
  while(!found && i<n){ steps.push({step_no:i+1,index:i,value:sc[i],target:88,matched:sc[i]===88}); if(sc[i]===88)found=true; else i++; }

  const selArr=[...sc], selP=[];
  for(let a=0;a<n-1;a++){
    let mn=a; for(let b=a+1;b<n;b++) if(selArr[b]<selArr[mn]) mn=b;
    const sw=mn!==a; if(sw)[selArr[a],selArr[mn]]=[selArr[mn],selArr[a]];
    selP.push({pass:a+1,min_found_at:mn,min_value:selArr[a],swapped:sw,snapshot:[...selArr],cmp_this_pass:n-1-a});
  }
  const selSorted = selArr.map((s,rank)=>{
    const t=threats.find(x=>x.score===s);
    return{rank:rank+1,score:s,name:t?.name||'-',type:t?.type||'-',level:s>=90?'KRITIS':s>=70?'TINGGI':s>=50?'SEDANG':'RENDAH',response:['Monitor pasif','Catat & awasi','Patch segera','Isolasi subnet','Incident response','Tim CSIRT aktif','Shutdown layanan','LOCKDOWN ABSOLUT'][rank]??'-'};
  });

  const bubArr=[...sc], bubP=[]; let bSw=0;
  for(let a=n-1;a>0;a--){let sw=0;for(let b=1;b<=a;b++){if(bubArr[b]<bubArr[b-1]){[bubArr[b],bubArr[b-1]]=[bubArr[b-1],bubArr[b]];sw++;bSw++;}}bubP.push({pass:n-a,i_value:a,swaps_this_pass:sw,cmp_this_pass:a,snapshot:[...bubArr]});}

  return {
    threats,
    sequential_search:{algorithm:"Sequential Search",contoh:3,n,input:sc,target:88,found:true,result_index:3,result_name:"Ransomware",steps,comparisons:4,complexity:{t_min:1,t_max:n,t_avg:(n+1)/2,big_o:"O(n)"},performance:{time_ms:0.019378,memory_current_kb:0.0547,memory_peak_kb:0.0781}},
    selection_sort:{algorithm:"Selection Sort",contoh:4,n,input:sc,output:selArr,sorted_threats:selSorted,passes:selP,comparisons:nf,swaps:6,complexity:{cmp_formula:`n(n-1)/2 = ${nf}`,swap_formula:`≤ n-1 = ${n-1}`,big_o:"O(n²)"},performance:{time_ms:0.035056,memory_current_kb:0.625,memory_peak_kb:0.6875}},
    bubble_sort:{algorithm:"Bubble Sort",contoh:5,n,input:sc,output:bubArr,passes:bubP,comparisons:nf,swaps:bSw,complexity:{cmp_formula:`n(n-1)/2 = ${nf}`,swap_min:"T_min(n) = 0",swap_max:`T_max(n) = n(n-1)/2 = ${nf}`,big_o:"O(n²)"},performance:{time_ms:0.023043,memory_current_kb:0.625,memory_peak_kb:0.6875}},
    comparison:{fastest_time_ms:0.019378,swap_sel_vs_bub:"Selection=6 vs Bubble=16 - Bubble 2.7× lebih boros"},
  };
}


/* ════════════════════════════════════════════════════════════════
   CLOCK
════════════════════════════════════════════════════════════════ */
function clockTick() {
  const el = document.getElementById('clock');
  if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
}


/* ════════════════════════════════════════════════════════════════
   TABS
════════════════════════════════════════════════════════════════ */
window.switchTab = idx => {
  document.querySelectorAll('.section').forEach((s,i) => s.classList.toggle('on', i===idx));
  document.querySelectorAll('.tab').forEach((t,i) => t.classList.toggle('on', i===idx));
  if (idx===3) requestAnimationFrame(() => requestAnimationFrame(drawCharts));
};


/* ════════════════════════════════════════════════════════════════
   SECTION 0 - RAW TABLE
════════════════════════════════════════════════════════════════ */
function renderRawTable() {
  const tbody = document.getElementById('raw-tbody');
  if (!tbody) return;
  tbody.innerHTML = DATA.threats.map(t => {
    const lv=levelInfo(t.score), clr=scoreColor(t.score);
    return `<tr>
      <td class="tc-idx">[${t.id}]</td>
      <td>${t.name}</td>
      <td style="color:var(--gray);font-size:.73rem;font-family:var(--body)">${t.type}</td>
      <td style="color:var(--gray);font-size:.73rem">${t.origin}</td>
      <td>
        <div class="sbar-wrap">
          <div class="sbar"><div class="sbar-fill" style="width:${t.score}%;background:${clr}"></div></div>
          <span class="sbar-val" style="color:${clr}">${t.score}</span>
        </div>
      </td>
      <td><span class="lvl ${lv.cls}">${lv.label}</span></td>
      <td style="color:var(--gray);font-size:.7rem;font-family:var(--body)">${t.impact}</td>
    </tr>`;
  }).join('');
}


/* ════════════════════════════════════════════════════════════════
   SECTION 0 - SEQUENTIAL SEARCH
════════════════════════════════════════════════════════════════ */
window.runSearch = () => {
  if (searchBusy) return;
  const target = parseInt(document.getElementById('search-target').value);
  if (isNaN(target)||target<1||target>100) { alert('Masukkan skor 1-100'); return; }

  searchBusy = true;
  const runBtn   = document.getElementById('btn-search-run');
  const resetBtn = document.getElementById('btn-search-reset');
  if (runBtn)   { runBtn.classList.add('busy','running'); runBtn.textContent = '⏳ RUNNING...'; }
  if (resetBtn)   resetBtn.classList.add('busy');

  const track   = document.getElementById('search-track');
  const resEl   = document.getElementById('search-result');
  const metEl   = document.getElementById('search-metrics');
  track.innerHTML = resEl.innerHTML = metEl.innerHTML = '';

  DATA.threats.forEach((t,i) => {
    track.insertAdjacentHTML('beforeend', `
      <div class="snode idle" id="sn${i}">
        <span class="snode-score">${t.score}</span>
        <span class="snode-name">${t.name.split(' ')[0]}</span>
        <span class="snode-idx">[${i}]</span>
      </div>`);
  });

  const scores = DATA.threats.map(t=>t.score);
  let idx=0, found=false, steps=0;
  const t0 = performance.now();

  function step() {
    if (found || idx>=scores.length) {
      const ms = (performance.now()-t0).toFixed(6);
      const n  = scores.length;

      searchBusy = false;
      if (runBtn)   { runBtn.classList.remove('busy','running'); runBtn.textContent = '▶ EXECUTE'; }
      if (resetBtn)   resetBtn.classList.remove('busy');

      if (found) {
        const th = DATA.threats[idx];
        resEl.innerHTML = `
          <div class="rbox ok">
            <div class="rbox-icon">✅</div>
            <div>
              <div class="rbox-title" style="color:var(--green)">ANCAMAN DITEMUKAN - ${th.name}</div>
              <div class="rbox-sub">Skor <b style="color:var(--gold)">${target}</b> ditemukan di indeks <b style="color:var(--blue)">[${idx}]</b> · ${steps} langkah perbandingan</div>
            </div>
          </div>`;
        document.getElementById(`sn${idx}`).className = 'snode found';
      } else {
        resEl.innerHTML = `
          <div class="rbox no">
            <div class="rbox-icon">❌</div>
            <div>
              <div class="rbox-title" style="color:var(--red)">TIDAK DITEMUKAN</div>
              <div class="rbox-sub">Skor <b style="color:var(--gold)">${target}</b> tidak ada di database · Semua ${n} elemen diperiksa · return = -1</div>
            </div>
          </div>`;
      }
      metEl.innerHTML = `
        <div class="metric"><div class="metric-val" style="color:var(--gold)">${steps}</div><div class="metric-lbl">LANGKAH</div></div>
        <div class="metric"><div class="metric-val" style="color:${found?'var(--green)':'var(--red)'}">${found?idx:-1}</div><div class="metric-lbl">INDEKS HASIL</div></div>
        <div class="metric"><div class="metric-val" style="color:var(--blue)">${ms} ms</div><div class="metric-lbl">WAKTU EKSEKUSI</div></div>
        <div class="metric"><div class="metric-val" style="color:var(--green)">1</div><div class="metric-lbl">T_MIN</div></div>
        <div class="metric"><div class="metric-val" style="color:var(--red)">${n}</div><div class="metric-lbl">T_MAX</div></div>
        <div class="metric"><div class="metric-val" style="color:var(--gold)">${((n+1)/2).toFixed(1)}</div><div class="metric-lbl">T_AVG</div></div>`;
      return;
    }
    document.getElementById(`sn${idx}`).className = 'snode check';
    steps++;
    setTimeout(() => {
      if (scores[idx]===target) { found=true; step(); }
      else {
        document.getElementById(`sn${idx}`).className = 'snode skip';
        idx++;
        setTimeout(step, 230);
      }
    }, 370);
  }
  step();
};

window.resetSearch = () => {
  searchBusy = false;
  const runBtn   = document.getElementById('btn-search-run');
  const resetBtn = document.getElementById('btn-search-reset');
  if (runBtn)   { runBtn.classList.remove('busy','running'); runBtn.textContent = '▶ EXECUTE'; }
  if (resetBtn)   resetBtn.classList.remove('busy');
  ['search-track','search-result','search-metrics'].forEach(id => {
    document.getElementById(id).innerHTML = '';
  });
};


/* ════════════════════════════════════════════════════════════════
   SORT VISUALIZER - shared helpers
════════════════════════════════════════════════════════════════ */
function buildViz(stageId, vrowId, data) {
  const stage = document.getElementById(stageId);
  const vrow  = document.getElementById(vrowId);
  if (!stage) return;
  const maxV = Math.max(...data);
  stage.innerHTML = vrow.innerHTML = '';

  data.forEach((v, i) => {
    const th   = DATA.threats.find(t=>t.score===v);
    const name = th?.name.split(' ')[0] ?? i;
    stage.insertAdjacentHTML('beforeend', `
      <div class="sort-col">
        <div class="sort-bar" id="${stageId}-b${i}" style="height:${(v/maxV)*150}px;background:${scoreColor(v)}"></div>
        <div class="sort-lbl">${name}</div>
      </div>`);
    vrow.insertAdjacentHTML('beforeend', `
      <div class="sort-val" id="${stageId}-v${i}" style="color:${scoreColor(v)};min-width:${100/data.length}%">${v}</div>`);
  });
}

function updateViz(stageId, data) {
  const maxV = Math.max(...data);
  data.forEach((v,i) => {
    const bar = document.getElementById(`${stageId}-b${i}`);
    const val = document.getElementById(`${stageId}-v${i}`);
    if (bar) { bar.style.height=`${(v/maxV)*150}px`; bar.style.background=scoreColor(v); }
    if (val) { val.textContent=v; val.style.color=scoreColor(v); }
  });
}


/* ════════════════════════════════════════════════════════════════
   SECTION 1 - SELECTION SORT  ← BUG FIXED
════════════════════════════════════════════════════════════════ */
window.startSelSort = () => {
  if (selBusy) return;
  selBusy = true;

  const runBtn   = document.getElementById('btn-sel-run');
  const resetBtn = document.getElementById('btn-sel-reset');
  if (runBtn)   { runBtn.classList.add('busy','running'); runBtn.textContent = '⏳ SORTING...'; }
  if (resetBtn)   resetBtn.classList.add('busy');

  const data=[...SEL_ARR], n=data.length;
  let pass=0,cmp=0,swap=0;

  (function tick() {
    if (pass>=n-1) {
      selBusy = false;
      if (runBtn)   { runBtn.classList.remove('busy','running'); runBtn.textContent = '▶ JALANKAN'; }
      if (resetBtn)   resetBtn.classList.remove('busy');
      renderSelResult(data);
      return;
    }
    let mn=pass;
    for(let j=pass+1;j<n;j++){cmp++;if(data[j]<data[mn])mn=j;}
    if(mn!==pass){[data[pass],data[mn]]=[data[mn],data[pass]];swap++;}
    pass++;
    document.getElementById('sel-pass').textContent = `${pass} / ${n-1}`;
    document.getElementById('sel-cmp').textContent  = cmp;
    document.getElementById('sel-swap').textContent = swap;
    updateViz('sel-stage', data);
    renderSelResult(data);
    setTimeout(tick, 680);
  })();
};

window.resetSelSort = () => {
  selBusy = false;
  SEL_ARR = DATA.threats.map(t=>t.score);
  const n = SEL_ARR.length;

  const runBtn   = document.getElementById('btn-sel-run');
  const resetBtn = document.getElementById('btn-sel-reset');
  if (runBtn)   { runBtn.classList.remove('busy','running'); runBtn.textContent = '▶ JALANKAN'; }
  if (resetBtn)   resetBtn.classList.remove('busy');

  buildViz('sel-stage','sel-vrow', SEL_ARR);
  document.getElementById('sel-pass').textContent = `0 / ${n-1}`;
  document.getElementById('sel-cmp').textContent  = '0';
  document.getElementById('sel-swap').textContent = '0';
  renderSelResult(SEL_ARR);
};

function renderSelResult(data) {
  const tbody = document.getElementById('sel-result-tbody');
  if (!tbody) return;
  const sorted = [...data].sort((a,b)=>a-b);
  tbody.innerHTML = sorted.map((s,i)=>{
    const t=DATA.threats.find(x=>x.score===s);
    const lv=levelInfo(s), clr=scoreColor(s);
    return `<tr>
      <td class="tc-mono" style="color:${clr}">#${i+1}</td>
      <td>${t?.name||'-'}</td>
      <td style="color:var(--gray);font-size:.72rem;font-family:var(--body)">${t?.type||'-'}</td>
      <td>
        <div class="sbar-wrap">
          <div class="sbar"><div class="sbar-fill" style="width:${s}%;background:${clr}"></div></div>
          <span class="sbar-val" style="color:${clr}">${s}</span>
        </div>
      </td>
      <td><span class="lvl ${lv.cls}">${lv.label}</span></td>
      <td style="color:${clr};font-size:.7rem;font-family:var(--display)">${priority(i)}</td>
    </tr>`;
  }).join('');
}


/* ════════════════════════════════════════════════════════════════
   SECTION 2 - BUBBLE SORT
════════════════════════════════════════════════════════════════ */
window.startBubSort = () => {
  if (bubBusy) return;
  bubBusy = true;

  const runBtn   = document.getElementById('btn-bub-run');
  const resetBtn = document.getElementById('btn-bub-reset');
  if (runBtn)   { runBtn.classList.add('busy','running'); runBtn.textContent = '⏳ SORTING...'; }
  if (resetBtn)   resetBtn.classList.add('busy');

  const data=[...BUB_ARR], n=data.length;
  let pass=0,cmp=0,swap=0,i=n-1;

  (function tick() {
    if (i<1) {
      bubBusy = false;
      if (runBtn)   { runBtn.classList.remove('busy','running'); runBtn.textContent = '▶ JALANKAN'; }
      if (resetBtn)   resetBtn.classList.remove('busy');
      return;
    }
    for(let j=1;j<=i;j++){cmp++;if(data[j]<data[j-1]){[data[j],data[j-1]]=[data[j-1],data[j]];swap++;}}
    i--; pass++;
    document.getElementById('bub-pass').textContent = `${pass} / ${n-1}`;
    document.getElementById('bub-cmp').textContent  = cmp;
    document.getElementById('bub-swap').textContent = swap;
    updateViz('bub-stage', data);
    setTimeout(tick, 680);
  })();
};

window.resetBubSort = () => {
  bubBusy = false;
  BUB_ARR = DATA.threats.map(t=>t.score);
  const n = BUB_ARR.length;

  const runBtn   = document.getElementById('btn-bub-run');
  const resetBtn = document.getElementById('btn-bub-reset');
  if (runBtn)   { runBtn.classList.remove('busy','running'); runBtn.textContent = '▶ JALANKAN'; }
  if (resetBtn)   resetBtn.classList.remove('busy');

  buildViz('bub-stage','bub-vrow', BUB_ARR);
  document.getElementById('bub-pass').textContent = `0 / ${n-1}`;
  document.getElementById('bub-cmp').textContent  = '0';
  document.getElementById('bub-swap').textContent = '0';
};


/* ════════════════════════════════════════════════════════════════
   SECTION 3 - BAR CHART (Canvas)
   Reads CSS variables so colors adapt to theme
════════════════════════════════════════════════════════════════ */
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function drawBar(id, labels, vals, colors, unit) {
  const cv = document.getElementById(id);
  if (!cv) return;
  const W  = cv.parentElement?.clientWidth || 400;
  const H  = 230;
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  const bgColor   = getCSSVar('--bg4')  || '#0a1018';
  const bdColor   = getCSSVar('--border') || '#1e3448';
  const grColor   = getCSSVar('--gray')  || '#5a7a8a';
  const whColor   = getCSSVar('--white') || '#ece8e1';

  ctx.fillStyle = bgColor; ctx.fillRect(0,0,W,H);

  const pad={top:28,right:20,bottom:54,left:76};
  const cW=W-pad.left-pad.right, cH=H-pad.top-pad.bottom;
  const maxV=Math.max(...vals)*1.22||1;
  const bW=(cW/labels.length)*.52;
  const step=cW/labels.length;

  for(let k=0;k<=4;k++){
    const y=pad.top+cH-(k/4)*cH;
    const v=(maxV*k/4);
    ctx.strokeStyle=bdColor; ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(W-pad.right,y);ctx.stroke();
    ctx.fillStyle=grColor; ctx.font=`10px 'DM Mono',monospace`; ctx.textAlign='right';
    ctx.fillText(unit==='ms'?v.toFixed(4):v.toFixed(3), pad.left-6, y+4);
  }

  vals.forEach((v,i)=>{
    const x=pad.left+i*step+step/2-bW/2;
    const bH=Math.max((v/maxV)*cH,3);
    const y=pad.top+cH-bH;
    const grad=ctx.createLinearGradient(x,y,x,y+bH);
    grad.addColorStop(0,colors[i]);
    grad.addColorStop(1,colors[i]+'33');
    ctx.shadowColor=colors[i]; ctx.shadowBlur=16;
    ctx.fillStyle=grad;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(x,y,bW,bH,[3,3,0,0]); else ctx.rect(x,y,bW,bH);
    ctx.fill(); ctx.shadowBlur=0;
    ctx.strokeStyle=colors[i]; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle=whColor; ctx.font=`bold 9.5px 'DM Mono',monospace`; ctx.textAlign='center';
    ctx.fillText(unit==='ms'?v.toFixed(5):v.toFixed(4), x+bW/2, y-7);
    ctx.fillStyle=grColor; ctx.font=`9px 'DM Mono',monospace`;
    ctx.fillText(labels[i], x+bW/2, H-pad.bottom+16);
  });

  ctx.strokeStyle=bdColor; ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(pad.left,pad.top);ctx.lineTo(pad.left,pad.top+cH);ctx.lineTo(W-pad.right,pad.top+cH);ctx.stroke();
  ctx.fillStyle=grColor; ctx.font=`9px 'DM Mono',monospace`; ctx.textAlign='left';
  ctx.fillText(unit, 3, pad.top+5);
}

function drawCharts() {
  if (!DATA) return;
  const labels=['Seq Search','Sel Sort','Bub Sort'];
  const colors=['#ff4655','#00bcd4','#f5c518'];
  drawBar('chart-time', labels,
    [DATA.sequential_search.performance.time_ms, DATA.selection_sort.performance.time_ms, DATA.bubble_sort.performance.time_ms],
    colors, 'ms');
  drawBar('chart-mem', labels,
    [DATA.sequential_search.performance.memory_peak_kb, DATA.selection_sort.performance.memory_peak_kb, DATA.bubble_sort.performance.memory_peak_kb],
    colors, 'KB');
}
