// My Flight Academy - Diario de vuelo
// Vista y lógica de la bitácora. Los datos viven en S.logs (ver "Bitácora: datos compartidos" en app.js)
// y se guardan con el mismo almacenamiento de la app (localStorage, clave 'fa_state'). Sin servicios externos.
(function(){
'use strict';

Object.assign(ICONS,{
 plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
 pen:'<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
 trash:'<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
 dl:'<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
 ul:'<path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
 x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
});

// ---------- Catálogos ----------
const SIMS=['Microsoft Flight Simulator 2024','Microsoft Flight Simulator 2020','X-Plane 12','Prepar3D','Otro'];
const FTYPES=['Libre','Carrera','Práctica de procedimiento','Otro'];
const WX=['Despejado','Nuboso','Lluvia','Tormenta','Otras'];
const RULES=['VFR','IFR'];
const APPR=['Visual','ILS','RNP','VOR','Otra'];
const LAND=['Satisfactorio','Con dificultades','Frustrado','No realizado'];
const AC_SUGG=['Cessna 172','Airbus A320neo'];
const REAL='Vuelo real';
const NOSIM='Simulador (sin especificar)';
const NOTYPE='Sin especificar';

// ---------- Utilidades ----------
const E=v=>esc(v==null?'':v);
const simOf=l=>l.sim||(l.kind==='VUELO REAL'?REAL:NOSIM);
const typeOf=l=>l.ftype||NOTYPE;
const norm=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const acKey=l=>norm(l.ac);
const isICAO=v=>/^[A-Z0-9]{4}$/.test(v);
const isISO=v=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v);if(!m)return false;const d=new Date(+m[1],+m[2]-1,+m[3]);return d.getFullYear()===+m[1]&&d.getMonth()===+m[2]-1&&d.getDate()===+m[3]};
const isTime=v=>/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const toMin=t=>+t.slice(0,2)*60+ +t.slice(3);
const newId=()=>'v'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const dur=m=>durFmt(m)||'0 min';
const pad=n=>String(n).padStart(2,'0');
const aptName=c=>{const a=(typeof allApt==='function'?allApt():[]).find(x=>x.icao===c);return a?a.name:''};
const ctl=n=>document.getElementById(n);

// ---------- Estado de la vista ----------
let F={q:'',from:'',to:'',ft:'',sim:''};   // filtros del historial
let note=null;                             // mensaje de estado {t,k}
let draftId=null,editing=null;             // formulario abierto

// ---------- Persistencia con manejo de errores ----------
// Guarda S en localStorage y devuelve true/false. Si falla (almacenamiento lleno o bloqueado), el llamador revierte el cambio.
function persist(){try{localStorage.setItem('fa_state',JSON.stringify(S));return true}catch(e){return false}}
const SAVE_ERR='No se pudo guardar en este navegador (almacenamiento lleno o bloqueado). Exporta una copia de seguridad y revisa los permisos del sitio.';
function commit(mutate){const snap=JSON.stringify(S.logs);mutate();if(persist())return true;S.logs=JSON.parse(snap);return false}

// ---------- Estadísticas (siempre derivadas de S.logs) ----------
function stats(){
 const L=S.logs,tot=L.reduce((a,l)=>a+lgMin(l),0);
 const by={};L.forEach(l=>{const k=acKey(l);if(!k||k==='n/d')return;const o=by[k]||(by[k]={n:l.ac,c:0,m:0});o.c++;o.m+=lgMin(l)});
 const acs=Object.values(by).sort((a,b)=>b.c-a.c||b.m-a.m||a.n.localeCompare(b.n));
 const apts=new Set();L.forEach(l=>{if(l.dep)apts.add(l.dep);if(l.arr)apts.add(l.arr)});
 const mo={};L.forEach(l=>{const k=String(l.d).slice(0,7);if(/^\d{4}-\d{2}$/.test(k))mo[k]=(mo[k]||0)+1});
 const rt={};L.forEach(l=>{if(!l.dep||!l.arr)return;const k=l.dep+' → '+l.arr;rt[k]=(rt[k]||0)+1});
 return{n:L.length,tot,acs,top:acs[0],apts:apts.size,
  months:Object.entries(mo).sort((a,b)=>a[0]<b[0]?-1:1),
  routes:Object.entries(rt).filter(x=>x[1]>=2).sort((a,b)=>b[1]-a[1]||(a[0]<b[0]?-1:1))}
}

// ---------- Filtros ----------
function filtered(){
 const q=norm(F.q);
 return lgSorted().filter(l=>{
  if(q&&!norm([l.ac,l.reg,l.dep,l.arr,l.alt,l.route].join(' ')).includes(q))return false;
  if(F.from&&l.d<F.from)return false;
  if(F.to&&l.d>F.to)return false;
  if(F.ft&&typeOf(l)!==F.ft)return false;
  if(F.sim&&simOf(l)!==F.sim)return false;
  return true})
}
const filtersOn=()=>!!(F.q||F.from||F.to||F.ft||F.sim);

// ---------- Vista ----------
function itemHTML(l){
 const t=typeOf(l),route=`${E(l.dep)} → ${E(l.arr)}`,lab=`${lgDate(l.d)}, ${l.ac}, ${l.dep} a ${l.arr}`;
 return `<article class="card lg-item">
  <button type="button" class="lg-main" onclick="lgView('${l.id}')" aria-label="Ver detalles del vuelo: ${E(lab)}">
   <span class="lg-date mono">${E(lgDate(l.d))}</span>
   <span class="lg-ac"><b>${E(l.ac)}</b>${l.reg?`<small class="mono">${E(l.reg)}</small>`:''}</span>
   <span class="lg-rt mono">${route}</span>
   <span class="lg-f"><small>Duración</small><span class="mono">${E(dur(lgMin(l)))}</span></span>
   <span class="lg-f"><small>Tipo</small><span>${E(t)}</span></span>
  </button>
  <div class="lg-act">
   <button type="button" class="btn g lg-ib" onclick="lgOpen('${l.id}')" aria-label="Editar vuelo: ${E(lab)}" title="Editar">${ic('pen')}<span class="lg-lb">Editar</span></button>
   <button type="button" class="btn g lg-ib lg-del" onclick="lgAskDel('${l.id}')" aria-label="Eliminar vuelo: ${E(lab)}" title="Eliminar">${ic('trash')}<span class="lg-lb">Eliminar</span></button>
  </div></article>`
}

function listHTML(){
 const r=filtered(),total=S.logs.length;
 const bad=F.from&&F.to&&F.from>F.to;
 let h=`<div class="lg-count" role="status">${bad?'<span class="lg-warn">La fecha inicial es posterior a la final: no habrá resultados. Corrige el intervalo.</span> ':''}Mostrando <b class="mono">${r.length}</b> de <b class="mono">${total}</b> ${total===1?'vuelo':'vuelos'}.</div>`;
 if(!r.length)return h+`<div class="card lg-none"><b>Ningún vuelo coincide con los filtros.</b><p>Prueba con otro intervalo de fechas o con menos criterios.</p><button type="button" class="btn g" onclick="lgClear()">Limpiar filtros</button></div>`;
 return h+`<div class="lg-list">${r.map(itemHTML).join('')}</div>`
}

function opts(arr,sel,first){return `<option value="">${first}</option>`+arr.map(v=>`<option value="${E(v)}"${v===sel?' selected':''}>${E(v)}</option>`).join('')}

function filtersHTML(){
 const sims=[...new Set(S.logs.map(simOf))].sort(),types=[...new Set(S.logs.map(typeOf))].sort();
 return `<div class="card lg-filters" role="search" aria-label="Buscar y filtrar vuelos">
  <div><label for="lg_q">Aeronave o código ICAO</label><input id="lg_q" type="search" value="${E(F.q)}" placeholder="Ej. Cessna o SKBG" autocomplete="off" oninput="lgFilter()"></div>
  <div><label for="lg_from">Desde</label><input id="lg_from" type="date" value="${E(F.from)}" onchange="lgFilter()"></div>
  <div><label for="lg_to">Hasta</label><input id="lg_to" type="date" value="${E(F.to)}" onchange="lgFilter()"></div>
  <div><label for="lg_ft">Tipo de vuelo</label><select id="lg_ft" onchange="lgFilter()">${opts(types,F.ft,'Todos')}</select></div>
  <div><label for="lg_sim">Simulador</label><select id="lg_sim" onchange="lgFilter()">${opts(sims,F.sim,'Todos')}</select></div>
  <div class="lg-fc"><button type="button" class="btn g" onclick="lgClear()">Limpiar filtros</button></div></div>`
}

function barList(rows,max,fmt){return `<ul class="lg-bars">${rows.map(r=>`<li><div class="lg-bl"><span>${E(r[0])}</span><span class="mono">${E(fmt(r))}</span></div><div class="bar" aria-hidden="true"><i style="width:${Math.max(3,Math.round(100*r[1]/max))}%"></i></div></li>`).join('')}</ul>`}

function analysisHTML(st){
 if(st.n<3)return `<div class="card lg-an"><div class="cap">ANÁLISIS</div><p class="lg-muted">El análisis por aeronave, por mes y por ruta estará disponible cuando registres al menos 3 vuelos. Llevas ${st.n}.</p></div>`;
 const ac=st.acs.slice().sort((a,b)=>b.m-a.m).slice(0,6);
 const mo=st.months.slice(-6);
 const rt=st.routes.slice(0,5);
 return `<div class="lg-an3">
  <div class="card"><div class="cap">TIEMPO DE VUELO POR AERONAVE</div>${ac.length?barList(ac.map(a=>[a.n,a.m]),Math.max(...ac.map(a=>a.m))||1,r=>dur(r[1])):'<p class="lg-muted">Sin aeronaves identificadas.</p>'}</div>
  <div class="card"><div class="cap">VUELOS POR MES</div>${st.months.length>=2?barList(mo.map(m=>[lgDate(m[0]+'-01').slice(3),m[1]]),Math.max(...mo.map(m=>m[1])),r=>r[1]+(r[1]===1?' vuelo':' vuelos')):'<p class="lg-muted">Se mostrará cuando tengas vuelos en al menos dos meses distintos.</p>'}</div>
  <div class="card"><div class="cap">RUTAS MÁS FRECUENTES</div>${rt.length?barList(rt,rt[0][1],r=>r[1]+' vuelos'):'<p class="lg-muted">Aún no repites ninguna ruta. Aparecerán las que vueles dos veces o más.</p>'}</div></div>`
}

function summaryHTML(st){
 const top=st.top;
 const cards=[
  ['VUELOS REGISTRADOS',`<div class="big">${st.n}</div>`,st.n?'En tu bitácora.':'Aún no hay vuelos.'],
  ['TIEMPO TOTAL DE VUELO',`<div class="big">${Math.floor(st.tot/60)}<span class="dh-u"> h </span>${pad(st.tot%60)}<span class="dh-u"> min</span></div>`,st.n?'Suma de todos los vuelos.':'Sin tiempo acumulado.'],
  ['AERONAVE MÁS UTILIZADA',`<div class="big dh-flt" title="${E(top?top.n:'')}">${top?E(top.n):'—'}</div>`,top?`${top.c} ${top.c===1?'vuelo':'vuelos'} · ${E(dur(top.m))}`:'Sin datos todavía.'],
  ['AEROPUERTOS VISITADOS',`<div class="big">${st.apts}</div>`,st.n?'Códigos distintos de salida y destino.':'Sin datos todavía.']];
 return `<div class="stats4 lg-sum">${cards.map(c=>`<div class="card"><div class="cap">${c[0]}</div><div class="lg-v">${c[1]}</div><div class="stat-sub">${c[2]}</div></div>`).join('')}</div>`
}

function emptyHTML(){
 return `<div class="card lg-empty"><div class="lg-emi">${ic('log')}</div><h2>Tu bitácora está lista</h2><p>Registra tu primer vuelo para comenzar a construir tu historial de entrenamiento.</p><button type="button" class="btn" onclick="lgOpen()">Registrar primer vuelo</button></div>`
}

function noteHTML(){return note?`<div class="lg-note lg-${note.k}" role="${note.k==='err'?'alert':'status'}">${E(note.t)}</div>`:''}

V.log=function(){
 const st=stats();
 return `<div class="lg">
  <div class="lg-head"><div><h1>DIARIO DE VUELO</h1><p class="sub">Registra tus vuelos, documenta tus prácticas y consulta tu evolución como piloto en formación.</p></div>
   <button type="button" class="btn lg-new" onclick="lgOpen()">${ic('plus')}<span>Registrar vuelo</span></button></div>
  <div id="lg_msg">${noteHTML()}</div>
  ${summaryHTML(st)}
  ${st.n?`<h2>Historial</h2>${filtersHTML()}<div id="lg_list">${listHTML()}</div><h2>Estadísticas de la bitácora</h2>${analysisHTML(st)}`:emptyHTML()}
  <h2>Copia de seguridad</h2>
  <div class="card lg-bk"><div><b>Exporta e importa tus vuelos en JSON.</b><p class="lg-muted">Al importar, los vuelos se añaden a los que ya tienes; los que ya existen se omiten, así que no se duplican.</p></div>
   <div class="row"><button type="button" class="btn g" onclick="lgExport()"${st.n?'':' disabled'}>${ic('dl')}<span>Exportar</span></button>
   <button type="button" class="btn g" onclick="ctl('lg_imp').click()">${ic('ul')}<span>Importar</span></button>
   <input id="lg_imp" type="file" accept="application/json,.json" hidden onchange="lgImport(this)"></div></div>
  <div class="note">Tus vuelos se guardan solo en este navegador y en este dispositivo. No se sincronizan automáticamente con otros equipos: usa la copia de seguridad para conservarlos o trasladarlos. Los registros son manuales; la plataforma no detecta vuelos del simulador.</div></div>`
};
window.ctl=ctl;

// ---------- Filtros: actualizan solo la lista (no pierden el foco al escribir) ----------
window.lgFilter=function(){
 F={q:ctl('lg_q').value,from:ctl('lg_from').value,to:ctl('lg_to').value,ft:ctl('lg_ft').value,sim:ctl('lg_sim').value};
 ctl('lg_list').innerHTML=listHTML()
};
window.lgClear=function(){F={q:'',from:'',to:'',ft:'',sim:''};render();const q=ctl('lg_q');if(q)q.focus()};

// ---------- Diálogo (formulario, detalle y confirmación) ----------
function dlg(){
 let d=ctl('lgd');
 if(!d){d=document.createElement('dialog');d.id='lgd';d.className='lg-dlg';d.setAttribute('aria-labelledby','lgd_t');
  d.addEventListener('click',e=>{if(e.target===d)d.close()});
  d.addEventListener('close',()=>{d.innerHTML='';draftId=null;editing=null});
  document.body.appendChild(d)}
 return d
}
function showDlg(html){const d=dlg();d.innerHTML=html;if(!d.open)d.showModal();return d}
window.lgClose=()=>{const d=ctl('lgd');if(d&&d.open)d.close()};
const head=t=>`<div class="lg-dh"><h2 id="lgd_t">${t}</h2><button type="button" class="btn g lg-x" aria-label="Cerrar" onclick="lgClose()">${ic('x')}</button></div>`;

// ---------- Formulario ----------
function field(id,label,inner,hint,extra){return `<div class="lg-fd"${extra||''}><label for="${id}">${label}</label>${inner}${hint?`<div class="lg-hint" id="${id}_h">${hint}</div>`:''}<div class="lg-err" id="${id}_e" role="alert"></div></div>`}
function selHTML(id,arr,val,first,onch){return `<select id="${id}"${onch?` onchange="${onch}"`:''}>${first!=null?`<option value="">${first}</option>`:''}${arr.map(v=>`<option${v===val?' selected':''}>${E(v)}</option>`).join('')}</select>`}

window.lgOpen=function(id){
 const l=id?S.logs.find(x=>x.id===id):null;
 if(id&&!l)return;
 editing=l||null;draftId=l?l.id:newId();
 const v=l||{d:today(),sim:SIMS[0],ftype:FTYPES[0],dur:0};
 const legacyNoSim=l&&!l.sim&&l.kind!=='VUELO REAL',realLg=l&&l.kind==='VUELO REAL';
 let simSel=v.sim||'',simOther='';
 if(realLg)simSel=REAL;else if(legacyNoSim)simSel='';else if(!SIMS.includes(simSel)){simOther=simSel;simSel='Otro'}
 const simOpts=(realLg?[REAL]:[]).concat(SIMS);
 const known=[...new Set([...AC_SUGG,...S.logs.map(x=>x.ac).filter(a=>a&&a!=='N/D')])];
 const apts=new Map();(typeof allApt==='function'?allApt():[]).forEach(a=>apts.set(a.icao,a.name));
 S.logs.forEach(x=>[x.dep,x.arr,x.alt].forEach(c=>{if(c&&!apts.has(c))apts.set(c,'')}));
 const h=Math.floor((+v.dur||0)/60),m=(+v.dur||0)%60;
 const icao=(id,lab,val,req,ph)=>field(id,lab+(req?'':' <span class="lg-opt">(opcional)</span>'),`<input id="${id}" class="mono" value="${E(val)}" maxlength="4" placeholder="${ph}" list="lg_apts" autocomplete="off" autocapitalize="characters" spellcheck="false" oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9]/g,'')"${req?' aria-required="true"':''}>`,req?'Código ICAO de 4 caracteres.':'');
 const html=`${head(l?'Editar vuelo':'Registrar vuelo')}
 <form class="lg-form" novalidate onsubmit="return lgSubmit(event)">
  <div class="lg-body">
   <div id="lg_errs" class="lg-errs" role="alert" tabindex="-1" hidden></div>
   <fieldset><legend>Información general</legend><div class="lg-g">
    ${field('lg_d','Fecha del vuelo',`<input id="lg_d" type="date" value="${E(v.d)}" max="${today()}" aria-required="true">`)}
    ${field('lg_sim_s','Simulador o entorno',selHTML('lg_sim_s',simOpts,simSel,legacyNoSim?'Sin especificar':null,'lgSimSel()'))}
    ${field('lg_sim_o','Nombre del simulador',`<input id="lg_sim_o" value="${E(simOther)}" maxlength="60" placeholder="Ej. FlightGear" aria-required="true">`,'',` id="lg_sim_w"${simSel==='Otro'?'':' hidden'}`)}
    ${field('lg_ac','Aeronave',`<input id="lg_ac" value="${E(l&&l.ac!=='N/D'?l.ac:'')}" maxlength="60" placeholder="Ej. Cessna 172" list="lg_acs" autocomplete="off" aria-required="true">`)}
    ${field('lg_reg','Matrícula <span class="lg-opt">(opcional)</span>',`<input id="lg_reg" class="mono" value="${E(v.reg)}" maxlength="12" placeholder="Ej. HK-1234" autocapitalize="characters" spellcheck="false" oninput="this.value=this.value.toUpperCase()">`)}
    ${field('lg_ftype','Tipo de vuelo',selHTML('lg_ftype',FTYPES,v.ftype||'',l&&!l.ftype?NOTYPE:null))}
   </div></fieldset>
   <fieldset><legend>Ruta</legend><div class="lg-g">
    ${icao('lg_dep','Aeropuerto de salida',v.dep,1,'SKBG')}
    ${icao('lg_arr','Aeropuerto de destino',v.arr,1,'SKBO')}
    ${icao('lg_alt','Aeropuerto alternativo',v.alt,0,'SKMD')}
    ${field('lg_route','Ruta o puntos de navegación <span class="lg-opt">(opcional)</span>',`<input id="lg_route" class="mono" value="${E(v.route)}" maxlength="200" placeholder="Ej. SKBG DCT TONUS UL305 SKBO">`)}
   </div></fieldset>
   <fieldset><legend>Tiempo de vuelo</legend><div class="lg-g">
    ${field('lg_t0','Hora de salida <span class="lg-opt">(opcional)</span>',`<input id="lg_t0" type="time" value="${E(v.t0)}" onchange="lgCalc()">`)}
    ${field('lg_t1','Hora de llegada <span class="lg-opt">(opcional)</span>',`<input id="lg_t1" type="time" value="${E(v.t1)}" onchange="lgCalc()">`)}
    <div class="lg-fd lg-dur"><label for="lg_h">Duración del vuelo</label><div class="lg-hm"><div><input id="lg_h" type="number" min="0" max="24" inputmode="numeric" value="${v.dur?h:''}" placeholder="0" aria-describedby="lg_dur_h"><span>h</span></div><div><input id="lg_m" type="number" min="0" max="59" inputmode="numeric" value="${v.dur?m:''}" placeholder="0" aria-label="Minutos"><span>min</span></div></div>
     <div class="lg-hint" id="lg_dur_h">Escríbela directamente o déjala calcular con las horas de salida y llegada (si cruzas la medianoche se tiene en cuenta). Usa la misma referencia horaria en ambas.</div><div class="lg-err" id="lg_h_e" role="alert"></div></div>
   </div></fieldset>
   <fieldset><legend>Condiciones y operación <span class="lg-opt">(opcional)</span></legend><div class="lg-g">
    ${field('lg_wx','Condiciones meteorológicas',selHTML('lg_wx',WX,v.wx||'','No especificadas'))}
    ${field('lg_rules','Tipo de operación',selHTML('lg_rules',RULES,v.rules||'','No especificado'))}
    ${field('lg_appr','Tipo de aproximación',selHTML('lg_appr',APPR,v.appr||'','No aplica / no especificada'))}
    ${field('lg_land','Resultado del aterrizaje',selHTML('lg_land',LAND,v.land||'','No especificado'))}
   </div></fieldset>
   <fieldset><legend>Observaciones personales</legend>
    ${field('lg_n','Observaciones',`<textarea id="lg_n" rows="7" maxlength="4000" placeholder="Qué practiqué.&#10;Qué hice correctamente.&#10;Qué dificultades tuve.&#10;Qué procedimientos necesito repasar.&#10;Qué quiero mejorar en el siguiente vuelo.">${E(v.n)}</textarea>`,'Son notas tuyas: no se convierten en puntuaciones.')}
   </fieldset>
  </div>
  <div class="lg-foot"><button type="button" class="btn g" onclick="lgClose()">Cancelar</button><button type="submit" class="btn" id="lg_save">${l?'Guardar cambios':'Guardar vuelo'}</button></div>
 </form>
 <datalist id="lg_apts">${[...apts].map(a=>`<option value="${E(a[0])}">${E(a[1])}</option>`).join('')}</datalist>
 <datalist id="lg_acs">${known.map(a=>`<option value="${E(a)}"></option>`).join('')}</datalist>`;
 showDlg(html);
 if(innerWidth>760){const f=ctl('lg_ac');if(f)f.focus()}
};

window.lgSimSel=function(){const o=ctl('lg_sim_s').value==='Otro';ctl('lg_sim_w').hidden=!o;if(o)ctl('lg_sim_o').focus()};

// Calcula la duración a partir de las horas (maneja medianoche). No toca el registro: solo rellena los campos.
window.lgCalc=function(){
 const a=ctl('lg_t0').value,b=ctl('lg_t1').value;
 if(!isTime(a)||!isTime(b))return;
 const d=(toMin(b)-toMin(a)+1440)%1440;
 if(d===0){ctl('lg_h_e').textContent='La salida y la llegada son la misma hora. Revisa las horas o escribe la duración a mano.';return}
 ctl('lg_h_e').textContent='';ctl('lg_h').value=Math.floor(d/60);ctl('lg_m').value=d%60
};

// ---------- Lectura y validación del formulario ----------
function readForm(){
 const g=i=>ctl(i).value.trim(),er={};
 const r={id:draftId};
 r.d=g('lg_d');
 if(!r.d)er.lg_d='Indica la fecha del vuelo.';
 else if(!isISO(r.d))er.lg_d='La fecha no es válida. Usa el selector de fecha.';
 else if(r.d>today())er.lg_d='La fecha no puede ser futura. Registra el vuelo cuando lo hayas realizado.';
 const s=g('lg_sim_s');
 if(s==='Otro'){r.sim=g('lg_sim_o');if(!r.sim)er.lg_sim_o='Escribe el nombre del simulador.'}
 else if(s===REAL){r.sim=REAL}
 else r.sim=s;
 r.kind=r.sim===REAL?'VUELO REAL':'SIMULADOR';
 if(!s)delete r.sim;
 r.ac=g('lg_ac');if(!r.ac)er.lg_ac='Indica la aeronave (por ejemplo, Cessna 172).';
 r.reg=g('lg_reg').toUpperCase();
 if(r.reg&&!/^[A-Z0-9-]{2,12}$/.test(r.reg))er.lg_reg='La matrícula solo admite letras, números y guiones (por ejemplo, HK-1234).';
 r.ftype=g('lg_ftype');
 r.dep=g('lg_dep').toUpperCase();r.arr=g('lg_arr').toUpperCase();r.alt=g('lg_alt').toUpperCase();
 if(!isICAO(r.dep))er.lg_dep='Escribe el código ICAO de salida con 4 caracteres (por ejemplo, SKBG).';
 if(!isICAO(r.arr))er.lg_arr='Escribe el código ICAO de destino con 4 caracteres (por ejemplo, SKBO).';
 if(r.alt&&!isICAO(r.alt))er.lg_alt='El alternativo debe tener 4 caracteres (por ejemplo, SKMD) o quedar vacío.';
 r.route=g('lg_route');
 r.t0=g('lg_t0');r.t1=g('lg_t1');
 if(!!r.t0!==!!r.t1)er[r.t0?'lg_t1':'lg_t0']='Indica ambas horas (salida y llegada) o deja las dos vacías.';
 const h=g('lg_h'),m=g('lg_m');
 const hh=h===''?0:+h,mm=m===''?0:+m;
 if(!Number.isInteger(hh)||!Number.isInteger(mm)||hh<0||mm<0||mm>59||hh>24)er.lg_h='Las horas deben ser un número entre 0 y 24 y los minutos entre 0 y 59.';
 else{r.dur=hh*60+mm;if(r.dur<1)er.lg_h='Indica la duración del vuelo (al menos 1 minuto). Si conoces las horas de salida y llegada, se calcula sola.';else if(r.dur>1440)er.lg_h='La duración no puede superar las 24 h.'}
 ['wx','rules','appr','land'].forEach(k=>r[k]=g('lg_'+k));
 r.n=g('lg_n');
 return{r,er}
}
const FIRST_ORDER=['lg_d','lg_sim_o','lg_ac','lg_reg','lg_dep','lg_arr','lg_alt','lg_t0','lg_t1','lg_h'];
function showErrors(er){
 document.querySelectorAll('#lgd .lg-err').forEach(e=>e.textContent='');
 document.querySelectorAll('#lgd [aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));
 const keys=FIRST_ORDER.filter(k=>er[k]);
 keys.forEach(k=>{const e=ctl(k+'_e')||ctl('lg_h_e');e.textContent=er[k];const i=ctl(k);if(i){i.setAttribute('aria-invalid','true');i.setAttribute('aria-describedby',(k==='lg_h'?'lg_dur_h ':'')+k+'_e')}});
 const box=ctl('lg_errs');
 if(keys.length){box.hidden=false;box.innerHTML=`<b>Revisa ${keys.length===1?'este campo':'estos '+keys.length+' campos'} antes de guardar:</b><ul>${keys.map(k=>`<li>${E(er[k])}</li>`).join('')}</ul>`;box.focus();const f=ctl(keys[0]);if(f)setTimeout(()=>f.focus(),0)}
 else{box.hidden=true;box.innerHTML=''}
}

let busy=false;
window.lgSubmit=function(ev){
 ev.preventDefault();if(busy)return false;
 const {r,er}=readForm();
 if(Object.keys(er).length){showErrors(er);return false}
 busy=true;const btn=ctl('lg_save');if(btn)btn.disabled=true;
 const i=S.logs.findIndex(x=>x.id===r.id),old=i>=0?S.logs[i]:null;
 // Editar reemplaza el registro con el mismo id (no suma nada); un doble envío de un vuelo nuevo tampoco lo duplica.
 if(old){r.ts=old.ts||Date.now();r.upd=Date.now()}else r.ts=Date.now();
 const ok=commit(()=>{if(i>=0)S.logs[i]=r;else S.logs.push(r)});
 busy=false;
 if(!ok){if(btn)btn.disabled=false;showErrors({});const box=ctl('lg_errs');box.hidden=false;box.innerHTML=E(SAVE_ERR);box.focus();return false}
 note={t:old?'Cambios guardados.':'Vuelo registrado.',k:'ok'};
 lgClose();render();
 return false
};

// ---------- Detalle ----------
function row(k,v,cls){return v?`<div class="lg-kv"><dt>${k}</dt><dd class="${cls||''}">${E(v)}</dd></div>`:''}
window.lgView=function(id){
 const l=S.logs.find(x=>x.id===id);if(!l)return;
 const an=aptName(l.dep),bn=aptName(l.arr);
 const times=l.t0&&l.t1?`${l.t0} → ${l.t1}`:'';
 const html=`${head('Detalle del vuelo')}
 <div class="lg-body lg-det">
  <div class="lg-dtop"><div class="lg-date mono">${E(lgDate(l.d))}</div><div class="lg-drt mono">${E(l.dep)} → ${E(l.arr)}</div><div class="lg-muted">${E(l.ac)}${l.reg?' · '+E(l.reg):''}</div></div>
  <h3>Información general</h3><dl class="lg-dl">${row('Simulador o entorno',simOf(l))}${row('Aeronave',l.ac)}${row('Matrícula',l.reg,'mono')}${row('Tipo de vuelo',typeOf(l))}</dl>
  <h3>Ruta</h3><dl class="lg-dl">${row('Salida',l.dep+(an?' · '+an:''))}${row('Destino',l.arr+(bn?' · '+bn:''))}${row('Alternativo',l.alt?l.alt+(aptName(l.alt)?' · '+aptName(l.alt):''):'')}${row('Ruta / puntos',l.route,'mono')}</dl>
  <h3>Tiempo de vuelo</h3><dl class="lg-dl">${row('Duración',dur(lgMin(l)),'mono')}${row('Salida → llegada',times,'mono')}</dl>
  ${(l.wx||l.rules||l.appr||l.land)?`<h3>Condiciones y operación</h3><dl class="lg-dl">${row('Meteorología',l.wx)}${row('Operación',l.rules)}${row('Aproximación',l.appr)}${row('Aterrizaje',l.land)}</dl>`:''}
  <h3>Observaciones personales</h3>${l.n?`<div class="lg-obs">${E(l.n)}</div>`:'<p class="lg-muted">Sin observaciones en este vuelo.</p>'}
 </div>
 <div class="lg-foot"><button type="button" class="btn g" onclick="lgClose()">Cerrar</button><button type="button" class="btn g" onclick="lgOpen('${l.id}')">${ic('pen')}<span>Editar</span></button><button type="button" class="btn g lg-del" onclick="lgAskDel('${l.id}')">${ic('trash')}<span>Eliminar</span></button></div>`;
 showDlg(html)
};

// ---------- Eliminar (siempre con confirmación) ----------
window.lgAskDel=function(id){
 const l=S.logs.find(x=>x.id===id);if(!l)return;
 const d=showDlg(`${head('¿Eliminar este vuelo?')}
 <div class="lg-body"><p>Vas a eliminar el registro del <b>${E(lgDate(l.d))}</b>: <span class="mono">${E(l.dep)} → ${E(l.arr)}</span> · ${E(l.ac)} · ${E(dur(lgMin(l)))}.</p><p class="lg-muted">Esta acción no se puede deshacer y las estadísticas se recalcularán. Si quieres conservarlo, exporta antes una copia de seguridad.</p></div>
 <div class="lg-foot"><button type="button" class="btn g" id="lg_nodel" onclick="lgClose()">Cancelar</button><button type="button" class="btn lg-danger" onclick="lgDel('${l.id}')">${ic('trash')}<span>Eliminar vuelo</span></button></div>`);
 const c=d.querySelector('#lg_nodel');if(c)c.focus()
};
window.lgDel=function(id){
 const ok=commit(()=>{S.logs=S.logs.filter(x=>x.id!==id)});
 note=ok?{t:'Vuelo eliminado.',k:'ok'}:{t:SAVE_ERR,k:'err'};
 lgClose();render()
};

// ---------- Copia de seguridad ----------
window.lgExport=function(){
 try{
  const data={app:'my-flight-academy',type:'diario-de-vuelo',version:1,exportedAt:new Date().toISOString(),flights:lgSorted().slice().reverse()};
  const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');
  a.href=u;a.download='diario-de-vuelo-'+today()+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
  note={t:'Copia de seguridad exportada ('+S.logs.length+(S.logs.length===1?' vuelo).':' vuelos).'),k:'ok'}
 }catch(e){note={t:'No se pudo crear la copia de seguridad.',k:'err'}}
 render()
};
// Valida un registro importado; devuelve el registro limpio o null. Es tolerante con registros antiguos de la app.
function cleanImport(x){
 if(!x||typeof x!=='object'||Array.isArray(x))return null;
 const s=(v,n)=>String(v==null?'':v).trim().slice(0,n);
 const d=s(x.d,10);if(!isISO(d))return null;
 const dp=Math.round(+x.dur);if(!isFinite(dp)||dp<0||dp>1440)return null;
 const dep=s(x.dep,12).toUpperCase(),arr=s(x.arr,12).toUpperCase();if(!dep||!arr)return null;
 const pick=(v,a)=>a.includes(v)?v:'';
 const id=s(x.id,40),r={id:/^[A-Za-z0-9_-]{1,40}$/.test(id)?id:newId(),d,kind:x.kind==='VUELO REAL'?'VUELO REAL':'SIMULADOR',ac:s(x.ac,60)||'N/D',dep,arr,dur:dp,n:s(x.n,4000),ts:isFinite(+x.ts)&&+x.ts>0?+x.ts:Date.now()};
 const sim=s(x.sim,60);if(sim)r.sim=sim;
 const reg=s(x.reg,12).toUpperCase();if(/^[A-Z0-9-]{2,12}$/.test(reg))r.reg=reg;
 const ft=s(x.ftype,40);if(ft)r.ftype=ft;
 const alt=s(x.alt,12).toUpperCase();if(alt)r.alt=alt;
 const route=s(x.route,200);if(route)r.route=route;
 if(isTime(s(x.t0,5))&&isTime(s(x.t1,5))){r.t0=s(x.t0,5);r.t1=s(x.t1,5)}
 [['wx',WX],['rules',RULES],['appr',APPR],['land',LAND]].forEach(([k,a])=>{const v=pick(s(x[k],30),a);if(v)r[k]=v});
 return r
}
const sig=l=>[l.d,norm(l.ac),l.dep,l.arr,lgMin(l),l.t0||'',norm(l.n)].join('|');
window.lgImport=function(inp){
 const f=inp.files&&inp.files[0];inp.value='';
 if(!f)return;
 if(f.size>10*1024*1024){note={t:'El archivo es demasiado grande para ser una copia del diario.',k:'err'};render();return}
 const rd=new FileReader();
 rd.onerror=()=>{note={t:'No se pudo leer el archivo.',k:'err'};render()};
 rd.onload=()=>{
  let j;try{j=JSON.parse(rd.result)}catch(e){note={t:'El archivo no es un JSON válido. Usa una copia exportada desde el Diario de vuelo.',k:'err'};render();return}
  const arr=Array.isArray(j)?j:(j&&j.type==='diario-de-vuelo'&&Array.isArray(j.flights)?j.flights:null);
  if(!arr){note={t:'El archivo no tiene el formato de una copia del Diario de vuelo.',k:'err'};render();return}
  const ids=new Set(S.logs.map(l=>l.id)),sigs=new Set(S.logs.map(sig));
  let add=[],dup=0,bad=0;
  arr.forEach(x=>{const r=cleanImport(x);if(!r){bad++;return}
   if(ids.has(r.id)||sigs.has(sig(r))){dup++;return}
   ids.add(r.id);sigs.add(sig(r));add.push(r)});
  if(add.length&&!commit(()=>{S.logs.push(...add)})){note={t:SAVE_ERR,k:'err'};render();return}
  note={t:`Importación terminada: ${add.length} ${add.length===1?'vuelo añadido':'vuelos añadidos'}, ${dup} ${dup===1?'ya existía':'ya existían'}${bad?`, ${bad} ${bad===1?'no válido omitido':'no válidos omitidos'}`:''}.`,k:add.length||!bad?'ok':'err'};
  render()
 };
 rd.readAsText(f)
};

// El mensaje de estado se muestra una vez y se limpia al siguiente cambio de vista.
const _render=window.render;
window.render=function(){const had=note;_render();if(had&&note===had&&view!=='log')note=null;if(had&&view==='log')setTimeout(()=>{if(note===had)note=null},0)};
})();
