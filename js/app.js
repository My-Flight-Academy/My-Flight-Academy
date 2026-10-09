// My Flight Academy - lógica de la aplicación
// ---------- Datos (en una app real: /data y /types) ----------
const ICONS={
 dash:'<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
 acad:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
 exam:'<path d="M9 11l2 2 4-4"/><rect x="4" y="3" width="16" height="18" rx="2"/>',
 prog:'<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
 log:'<path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4z"/><path d="M8 8h8M8 12h8"/>',
 sim:'<path d="M12 3l9 18-9-5-9 5z"/>',
 dict:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>',
 route:'<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h6a4 4 0 000-8h-4a4 4 0 010-8h6"/>',
 plane:'<path d="M2 16l20-6-3-2-8 1-4-5-2 1 3 5-6 2z"/>',
 car:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
 lib:'<path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2z"/><path d="M8 7h6"/>',
 apt:'<path d="M12 21s-7-6.3-7-11a7 7 0 0114 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
 comm:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
 navi:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
 met:'<path d="M7 18a4 4 0 01-.5-8 5.5 5.5 0 0110.7 1A3.5 3.5 0 0117 18z"/>'
};
const ic=k=>`<svg class="ic" viewBox="0 0 24 24">${ICONS[k]}</svg>`;
const NAV=[['dash','Dashboard','dash'],['acad','Academia','acad'],['exam','Exámenes','exam'],['prog','Mi progreso','prog'],['navi','Navegación','navi'],['met','Meteorología','met'],['comm','Comunicaciones','comm'],['apt','Aeropuertos','apt'],['car','Cartas','car'],['lib','Biblioteca','lib'],['log','Diario de vuelo','log'],['sim','Simulador','sim'],['dict','Diccionario','dict'],['route','Mi ruta','route']];

const PHASES=[
 {id:1,n:'Fundamentos de aviación',t:['Partes del avión','Controles de vuelo','Pitch, Roll y Yaw','Flaps y Trim','Cuatro fuerzas del vuelo']},
 {id:2,n:'Operaciones básicas',t:['Preflight inspection','Checklists','Taxi y Takeoff','Climb, Cruise, Descent','Approach y Landing']},
 {id:3,n:'Navegación',t:['Heading, Track, Bearing','VOR, NDB, GPS','Waypoints y Fixes','Flight planning']},
 {id:4,n:'Meteorología',t:['Presión, QNH, QFE','Viento y visibilidad','METAR y TAF']},
 {id:5,n:'Comunicaciones',t:['Phraseology','ATIS, Ground, Tower','Readback y emergencias']},
 {id:6,n:'Instrumentos',t:['Instrumentos "six pack"','PFD y MFD/ND']},
 {id:7,n:'IFR',t:['Fundamentos IFR','ILS y aproximaciones','Holding y missed approach']},
 {id:8,n:'Aviación comercial',t:['FMC/MCDU y Autopilot','SOP y cockpit procedures']}
];
const LESSONS={}; // Las lecciones viven en js/lessons/ (una carpeta por fase, un archivo por lección)
const EXAM=[
 {p:'El Rudder controla principalmente el...',o:['Pitch','Roll','Yaw','Trim'],a:2,e:'El rudder actúa sobre el eje vertical (Yaw).',t:'Controles de vuelo'},
 {p:'Verdadero o falso: el Elevator controla el Roll.',o:['Verdadero','Falso'],a:1,e:'El elevator controla el Pitch.',t:'Controles de vuelo'},
 {p:'¿Qué indica el instrumento Altimeter?',o:['Velocidad','Altitud','Rumbo','Razón de ascenso'],a:1,e:'Muestra altitud según el ajuste de presión (QNH).',t:'Instrumentos'},
 {p:'Un QNH ajustado en el altímetro hace que este indique...',o:['Altura sobre el aeródromo siempre 0','Altitud sobre el nivel medio del mar','Nivel de vuelo','Densidad'],a:1,e:'QNH: el altímetro indica altitud sobre el nivel del mar (en condiciones estándar de la atmósfera).',t:'Meteorología'},
 {p:'En una comunicación ATC, el readback sirve para...',o:['Confirmar que se entendió la instrucción','Pedir combustible','Cambiar de pista','Cerrar el plan de vuelo'],a:0,e:'El piloto repite lo esencial de la autorización para verificar que se entendió correctamente.',t:'Comunicaciones'}
];
const DICT=[['Takeoff','Despegue','Fase en que el avión acelera y se separa del suelo.','"Cleared for takeoff."'],['Landing','Aterrizaje','Fase final en que el avión toca la pista.','"Landing gear down."'],['Runway','Pista','Superficie preparada para despegue y aterrizaje.','"Runway 35 in use."'],['Taxiway','Calle de rodaje','Vía que conecta pistas y plataformas.','"Taxi via Alpha."'],['Heading','Rumbo','Dirección hacia la que apunta el morro, respecto al norte.','"Fly heading 270."'],['Altitude','Altitud','Altura sobre el nivel medio del mar.','"Maintain 5000 feet."'],['Climb','Ascenso','Ganar altitud.','"Climb and maintain FL080."'],['Descent','Descenso','Perder altitud.','"Descend to 3000."'],['Approach','Aproximación','Fase de acercamiento a la pista.','"Cleared ILS approach."'],['Clearance','Autorización','Permiso del ATC para realizar una acción.','"Clearance received."'],['Wind','Viento','Movimiento del aire.','"Wind 270 at 10 knots."'],['Crosswind','Viento cruzado','Viento que sopla de lado respecto a la pista.','"Crosswind from the right."']];
const CHK={'Cessna 172':{'Before start':['Freno de estacionamiento','Master (batería)','Combustible','Controles libres','Puertas y cinturones'],'Before takeoff':['Flaps','Trim','Mezcla y hélice','Instrumentos','Frecuencia de torre']},
 'A320neo':{'Cold & Dark':['Baterías','Alimentación externa','ADIRS','Luces de cabina'],'Before start':['Freno de estacionamiento','Puertas cerradas','Beacon ON','MCDU programado','Checklist']}};
const SIMNOTE='Estas listas son simplificadas para práctica en simulador. Los procedimientos reales dependen del avión, del manual (AFM/FCOM) y de la autoridad aeronáutica.';

// ---------- Estado + almacenamiento seguro ----------
const def={done:{},exams:[],logs:[],chk:{},mins:0,apt:{},custom:[]};
let S=JSON.parse(JSON.stringify(def));
try{const r=localStorage.getItem('fa_state');if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
const save=()=>{try{localStorage.setItem('fa_state',JSON.stringify(S))}catch(e){}};
const $=s=>document.querySelector(s);
const pct=(a,b)=>b?Math.round(100*a/b):0;
const key=(p,t)=>p+'|'+t;
const phasePct=p=>pct(p.t.filter(t=>S.done[key(p.id,t)]).length,p.t.length);
const total=()=>{let a=0,b=0;PHASES.forEach(p=>p.t.forEach(t=>{b++;if(S.done[key(p.id,t)])a++}));return pct(a,b)};
const allDone=()=>Object.keys(S.done).filter(k=>S.done[k]).length;

// ---------- Vistas ----------
let view='dash',lesson=null,examState=null;
const V={
dash(){seedApt();const t=total(),L=topicList(),cur=L.find(x=>!x.done),nxt=L.filter(x=>!x.done)[1],n=allDone(),
  ex=S.exams[S.exams.length-1],lg=S.logs[S.logs.length-1],sim=S.logs.filter(l=>l.kind==='SIMULADOR').reduce((a,l)=>a+(+l.dur||0),0);
  const st=[['prog','LECCIONES COMPLETADAS',`<div class="big">${n}</div>`,n?`De ${L.length} temas del plan.`:'Tu formación está comenzando.'],
   ['exam','ÚLTIMO EXAMEN',`<div class="big">${ex?ex.s+'/'+ex.n:'—'}</div>`,ex?'Última evaluación realizada.':'Aún no has presentado exámenes.'],
   ['log','ÚLTIMO VUELO',`<div class="big dh-flt">${lg?esc(lg.dep)+' → '+esc(lg.arr):'—'}</div>`,lg?`${lg.kind==='SIMULADOR'?'Simulador':'Vuelo real'} · ${esc(lg.ac)}`:'Aún no hay vuelos registrados.'],
   ['log','HORAS EN SIMULADOR',`<div class="big">${(sim/60).toFixed(1)}<span class="dh-u"> h</span></div>`,'Tiempo registrado.']];
  return `<div class="dash"><h1>${hello()}, ${esc(S.name||'piloto')}.</h1><p class="sub">Tu objetivo: convertirte en piloto. <button class="btn g" style="padding:3px 10px;font-size:12px;margin-left:6px" onclick="welcome(true)">Cambiar nombre</button></p>
  ${dashHero(t,cur)}
  <h2>Estado</h2><div class="stats4">${st.map(x=>`<button class="card stat" onclick="go('${x[0]}')"><div class="cap">${x[1]}</div>${x[2]}<div class="stat-sub">${x[3]}</div></button>`).join('')}</div>
  <div class="dcols"><div><h2>Próximo entrenamiento</h2>${dashNext(nxt,cur)}</div><div><h2>Actividad reciente</h2>${dashAct()}</div></div>
  <h2>Referencia</h2>${dashRef()}</div>`},
 acad(){if(lesson)return V.lesson();return `<h1>Academia</h1><p class="sub">Ocho fases, de los fundamentos a la aviación comercial.</p>`+PHASES.map(p=>`<div class="card" style="margin-bottom:14px"><div class="row" style="justify-content:space-between"><h3>Fase ${p.id} — ${p.n}</h3><span class="mono" style="color:var(--am)">${phasePct(p)}%</span></div><div class="bar"><i style="width:${phasePct(p)}%"></i></div>`+p.t.map(t=>`<button class="opt" onclick="openL(${p.id},'${t.replace(/'/g,"\\'")}')"><span class="row" style="justify-content:space-between"><span>${t}</span><span class="tag ${S.done[key(p.id,t)]?'real':''}">${S.done[key(p.id,t)]?'COMPLETADA':LESSONS[t]?'DISPONIBLE':'PRÓXIMAMENTE'}</span></span></button>`).join('')+`</div>`).join('')},
lesson(){lessonQ={n:0,ok:0};const L=LESSONS[lesson.t],k=key(lesson.p,lesson.t);
 if(!L)return `<button class="btn g" onclick="lesson=null;render()">Volver</button><h1 style="margin-top:14px">${lesson.t}</h1><div class="card">Esta lección se incluirá en una próxima versión. Puedes marcarla como completada si ya dominas el tema.</div><p><button class="btn" onclick="toggle('${k}')">${S.done[k]?'Desmarcar':'Marcar como completada'}</button></p>`;
 return `<button class="btn g" onclick="lesson=null;render()">Volver</button><h1 style="margin-top:14px">${lesson.t}</h1><div class="row"><span class="tag">${L.lvl}</span><span class="tag">${L.min} MIN</span></div>
 <div class="card" style="margin-top:14px"><div class="lesson-body">${L.body}</div>${L.svg===false?'':planeSVG()}</div><h2>Preguntas rápidas</h2><div id="qz">`+L.q.map((q,i)=>qHTML(q,'L'+i)).join('')+`</div>
 <div class="card" style="margin-top:14px"><div id="qs" class="cap">Respondidas 0/${L.q.length} · Correctas 0</div><div id="qm" class="fb" hidden></div>
 <div class="row" style="margin-top:10px"><button id="bc" class="btn" ${S.done[k]?'':'disabled'} onclick="toggle('${k}')">${S.done[k]?'Desmarcar':'Marcar como completada'}</button><button id="br" class="btn g" hidden onclick="retryQ()">Volver a intentar</button></div>
 ${S.done[k]?'':'<div style="color:var(--mu);font-size:13px;margin-top:8px">Para completar la lección, todas las preguntas deben estar correctas.</div>'}</div>`},
exam(){if(!examState)return `<h1>Exámenes</h1><p class="sub">Evalúa lo aprendido. Los temas con errores aparecerán para repaso.</p><div class="card"><h3>Examen general</h3><p style="color:var(--mu)">${EXAM.length} preguntas de selección múltiple y verdadero/falso.</p><button class="btn" onclick="startExam()">Iniciar examen</button></div>`+(S.exams.length?`<h2>Historial</h2><div class="card tl">`+S.exams.slice().reverse().map(e=>`<div><span class="mono">${e.d}</span><span>${e.s}/${e.n} — ${pct(e.s,e.n)}%</span></div>`).join('')+`</div>`:'');
 const e=examState;if(e.i>=EXAM.length)return `<h1>Resultado</h1><div class="card"><div class="big">${e.s}/${EXAM.length} — ${pct(e.s,EXAM.length)}%</div><p>Correctas: ${e.s} · Incorrectas: ${EXAM.length-e.s}</p>${e.miss.length?`<h3>Temas que necesitan repaso</h3><p>${[...new Set(e.miss)].join(', ')}</p>`:'<p>Sin temas pendientes de repaso.</p>'}<button class="btn" onclick="examState=null;render()">Cerrar</button></div>`;
 return `<h1>Pregunta ${e.i+1} de ${EXAM.length}</h1><div class="bar"><i style="width:${pct(e.i,EXAM.length)}%"></i></div>`+qHTML(EXAM[e.i],'E',true)},
prog(){const mean=S.exams.length?Math.round(S.exams.reduce((a,e)=>a+pct(e.s,e.n),0)/S.exams.length):0;
 return `<h1>Mi progreso</h1><p class="sub">Tu avance real, sin adornos.</p><div class="grid"><div class="card"><div class="cap">PROGRESO GENERAL</div><div class="big">${total()}%</div></div><div class="card"><div class="cap">EXÁMENES REALIZADOS</div><div class="big">${S.exams.length}</div></div><div class="card"><div class="cap">PROMEDIO</div><div class="big">${mean}%</div></div></div><h2>Por fase</h2><div class="card">`+PHASES.map(p=>`<div class="row" style="justify-content:space-between"><span>Fase ${p.id} — ${p.n}</span><span class="mono">${phasePct(p)}%</span></div><div class="bar"><i style="width:${phasePct(p)}%"></i></div>`).join('')+`</div>`},
navi(){const T=[['Heading','Rumbo','Dirección del morro respecto al norte.'],['Track','Derrota','Trayectoria real del avión sobre el terreno.'],['Course','Rumbo deseado','Línea que se pretende volar entre dos puntos.'],['Bearing','Marcación','Dirección de un punto respecto a otro.'],['Ground speed (GS)','Velocidad respecto al suelo','TAS modificada por el viento.'],['Wind correction angle (WCA)','Ángulo de corrección por viento','Diferencia entre el course y el heading necesarios para mantenerlo.']];
 const f=(i,l,v,m)=>`<div><label>${l}</label><input id="w_${i}" type="number" value="${v}" min="${m}" oninput="calcW()"></div>`;
 return `<h1>Navegación</h1><p class="sub">Conceptos y herramientas de navegación estimada.</p><div class="grid">`+T.map(t=>`<div class="card"><div class="mono" style="color:var(--am)">${t[0]}</div><h3>${t[1]}</h3><div style="color:var(--mu)">${t[2]}</div></div>`).join('')+`</div>
 <h2>Calculadora de corrección por viento</h2><div class="card"><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">${f('c','Course (°)',90,0)}${f('t','TAS (kt)',100,1)}${f('d','Viento desde (°)',150,0)}${f('s','Viento (kt)',20,0)}${f('x','Distancia (NM)',60,0)}</div><div id="w_o" style="margin-top:14px"></div></div>
 <div class="note">Herramienta de estudio con la fórmula estándar de navegación estimada (viento constante, sin variación magnética ni desviación). No sustituye el planeamiento con datos oficiales.</div>`},
met(){return `<h1>Meteorología</h1><p class="sub">Decodificador educativo de METAR.</p><div class="card"><label>Pega un METAR</label><textarea id="m_i" rows="2" class="mono" oninput="decM()">METAR SKBG 051500Z 03008KT 9999 FEW030 SCT100 28/18 Q1015 NOSIG</textarea>
 <div class="row" style="margin-top:10px"><button class="btn g" onclick="$('#m_i').value='METAR SKBG 051500Z 03008KT 9999 FEW030 SCT100 28/18 Q1015 NOSIG';decM()">Ejemplo 1</button><button class="btn g" onclick="$('#m_i').value='METAR XXXX 121830Z 27015G25KT 4000 -RA BR BKN008 OVC015 12/11 A2992';decM()">Ejemplo 2: ráfagas y lluvia</button></div></div>
 <h2>Interpretación</h2><div class="card wrap" id="m_o"></div>
 <div class="note">Los ejemplos son ficticios, creados para estudiar el formato. Esta versión no consulta datos en vivo; para planear un vuelo real usa la fuente meteorológica oficial de tu autoridad aeronáutica.</div>`},
comm(){const C=Object.keys(PH),e=EX[exI%EX.length];
 return `<h1>Comunicaciones</h1><p class="sub">Fraseología aeronáutica en inglés (Aviation English). Lee, escucha y practica el readback.</p>
 <div class="row" style="margin-bottom:14px">`+C.map(c=>`<button class="btn ${c===cm?'':'g'}" onclick="cm='${c}';render()">${c}</button>`).join('')+`</div>`+
 PH[cm].map((p,i)=>`<div class="card" style="margin-bottom:12px"><div class="row" style="justify-content:space-between"><span class="tag">${p.t}</span><button class="btn g" onclick="sayP('${cm}',${i})">Escuchar</button></div><div class="cap" style="margin-top:10px">ATC</div><div class="mono">${p.a}</div><div class="cap" style="margin-top:8px">PILOTO</div><div class="mono" style="color:var(--am)">${p.p}</div><div style="color:var(--mu);margin-top:8px">${p.es}</div></div>`).join('')+
 `<h2>Ejercicio de readback</h2><div class="card"><label class="chk" style="color:var(--tx)"><input type="checkbox" ${exH?'checked':''} onchange="exH=this.checked;render()"> Modo escucha (ocultar el texto)</label><div class="row" style="margin:8px 0"><button class="btn" onclick="sayE()">Escuchar instrucción</button></div>${exH?'':`<div class="mono" style="margin:8px 0">${e.a}</div>`}<b>¿Cuál es el readback correcto?</b>`+e.o.map((o,i)=>`<button class="opt mono" onclick="exAns(this,${i})">${o}</button>`).join('')+`<div class="fb" hidden></div></div>
 <div class="note">Fraseología de estilo ICAO con fines de estudio. Las frases exactas varían según el país, el espacio aéreo y la publicación vigente (por ejemplo ICAO Doc 4444 y Doc 9432, y la normativa de tu autoridad). Matrículas, frecuencias y números de los ejemplos son ficticios. La voz usa la síntesis de tu navegador y no reemplaza escuchar comunicaciones reales.</div>`},
apt(){seedApt();if(aptSel)return V.aptD();
 const f=(i,l,ph,w)=>`<div><label>${l}</label><input id="n_${i}" placeholder="${ph}" ${w?'maxlength="'+w+'"':''}></div>`;
 return `<h1>Aeropuertos</h1><p class="sub">Fichas de estudio por aeropuerto. Tú completas los datos operativos desde la publicación oficial.</p>
 <input id="aq" placeholder="Buscar por ICAO, IATA, nombre o ciudad" value="${esc(aptQ)}" oninput="aptF()" style="max-width:380px"><div id="al" class="grid" style="margin-top:14px">${aptCards(aptQ)}</div>
 <h2>Añadir aeropuerto</h2><div class="card"><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">${f('i','ICAO','SKXX',4)}${f('a','IATA','XXX',3)}${f('m','Nombre','Aeropuerto...')}${f('c','Ciudad','')}${f('p','País','Colombia')}</div><p><button class="btn" onclick="addApt()">Añadir</button></p></div>
 <div class="note">Los datos de pistas, elevación, frecuencias y procedimientos no vienen precargados: pueden cambiar y deben tomarse de la publicación vigente (AIP de Colombia, publicado por la Aerocivil, o la de tu país). Registra siempre la fuente y la fecha.</div>`},
aptD(){const a=allApt().find(x=>x.icao===aptSel),d=S.apt[a.icao]||{},sk=a.icao==='SKBG';
 const H=t=>`<div class="cap" style="margin:3px 0 6px;font-weight:400">Dónde buscar: AIP → AD 2 ${a.icao} → ${t}</div>`;
 const ta=(k,l,ph,r,h)=>`<div style="margin-top:12px"><label>${l}</label>${h?H(h):''}<textarea id="a_${k}" rows="${r}" class="mono" placeholder="${ph}">${esc(d[k]||'')}</textarea></div>`;
 return `<button class="btn g" onclick="aptSel=null;render()">Volver</button>
 <div class="card hero" style="margin-top:14px"><div class="mono big">${a.icao}</div><h3 style="font-size:20px">${a.name}</h3><div class="row"><span>${a.city}, ${a.country}</span>${a.iata?`<span class="tag">IATA ${a.iata}</span>`:''}${a.icao==='SKBG'?'<span class="tag real">REFERENCIA</span>':''}</div></div>
 <div class="card" style="margin-top:14px"><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))"><div><label>Elevación (ft)</label>${H('AD 2.2, numeral 3 (Elevación / Temperatura de referencia)')}<input id="a_elev" class="mono" value="${esc(d.elev||'')}"></div><div><label>Fuente y fecha de la información</label><div class="cap" style="margin:3px 0 6px;font-weight:400">Dónde buscar: encabezado de las páginas del AIP (AIRAC AMDT y fecha)</div><textarea id="a_src" rows="6" class="mono" placeholder="Ej.: AIP Colombia, AD 2 ${a.icao}, AIRAC AMDT y fecha">${esc(d.src||'')}</textarea></div></div>
 ${ta('rwy','Pistas (designación, longitud, superficie)','Una por línea',sk?8:3,'AD 2.12 (características físicas) y AD 2.13 (distancias declaradas)')}${ta('freq','Frecuencias (Tower, Ground, ATIS...)','Una por línea',sk?7:3,'AD 2.18 (comunicaciones ATS) y AD 2.19 (radioayudas)')}${ta('proc','SID, STAR, aproximaciones y fixes','Según la publicación vigente',sk?11:4,'AD 2.24 (cartas: SID, STAR, IAC) y carta de coordenadas de WPT de procedimientos PBN')}${ta('notes','Notas de estudio','Observaciones propias',sk?8:3,'AD 2.17, 2.20 y 2.23 (espacio aéreo, reglamentación local e información suplementaria)')}
 <div class="row" style="margin-top:14px"><button class="btn" onclick="saveApt()">Guardar ficha</button>${sk?'<button class="btn g" onclick="resetSkbg()">Restaurar datos del AIP</button>':''}${a.custom?'<button class="btn g" onclick="delApt()">Eliminar aeropuerto</button>':''}</div></div>
 <div class="note">Material de estudio. Los datos aeronáuticos reales cambian; no los uses para navegar. ${sk?'Los datos de SKBG se precargaron del AIP de Colombia, consultado en una copia de terceros y no en el sitio de Aerocivil, y con enmiendas de distintas fechas. Compruébalos en el AIP vigente de Aerocivil antes de darlos por actuales. Los datos de Microsoft Flight Simulator pueden diferir de la publicación real, así que anota de cuál provienen.':''}</div>`},
car(){return `<h1>Cartas aeronáuticas</h1><p class="sub">Biblioteca de cartas para estudio, con visor de zoom, desplazamiento y pantalla completa.</p>
 <div class="card"><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))"><div><label>Tipo</label><select id="c_t">${CT.map(c=>`<option>${c}</option>`).join('')}</select></div><div><label>ICAO (opcional)</label><input id="c_i" class="mono" maxlength="4" placeholder="SKBG"></div><div><label>Vigencia o ciclo (obligatorio)</label><input id="c_v" placeholder="Ej.: AIRAC 2610"></div><div><label>Carta (imagen o PDF)</label><input type="file" multiple accept=".pdf,image/*" onchange="upFiles(this,'car')"></div></div></div>
 <div class="row" style="margin-top:14px"><input id="c_q" placeholder="Buscar" oninput="libDraw()" style="max-width:300px"><select id="c_f" onchange="libDraw()" style="max-width:200px"><option value="">Todos los tipos</option>${CT.map(c=>`<option>${c}</option>`).join('')}</select></div>
 <div id="car_l" class="grid" style="margin-top:14px"></div>
 <div class="note">No incluyo cartas ni procedimientos: sube las que obtengas de la publicación oficial. Son material de estudio; los datos reales cambian con cada ciclo, por eso se pide la vigencia. Nunca las uses para navegar. Las imágenes tienen visor completo; un PDF puede no mostrarse dentro de esta página según tu navegador.</div>`},
lib(){return `<h1>Biblioteca</h1><p class="sub">Tu material de estudio, guardado solo en este navegador.</p>
 <div class="card"><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))"><div><label>Categoría</label><select id="l_c">${LC.map(c=>`<option>${c}</option>`).join('')}</select></div><div><label>Archivos (PDF, imágenes, texto)</label><input type="file" multiple accept=".pdf,.txt,image/*" onchange="upFiles(this,'lib')"></div></div>
 <h3 style="margin-top:16px">Nuevo apunte</h3><input id="l_nt" placeholder="Título"><textarea id="l_nb" rows="3" style="margin-top:8px" placeholder="Texto del apunte"></textarea><p><button class="btn" onclick="addNote()">Guardar apunte</button></p></div>
 <div class="row" style="margin-top:14px"><input id="l_q" placeholder="Buscar" oninput="libDraw()" style="max-width:300px"><select id="l_f" onchange="libDraw()" style="max-width:200px"><option value="">Todas</option>${LC.map(c=>`<option>${c}</option>`).join('')}</select></div>
 <div id="lib_l" class="grid" style="margin-top:14px"></div>
 <div class="note">Los archivos viven en este navegador y dispositivo: si borras los datos del sitio, se pierden. Máximo 15 MB por archivo. Respeta los derechos de autor de lo que guardes.</div>`},
log(){return `<h1>Diario de vuelo</h1><p class="sub">Registra vuelos de simulador o reales. Las horas de simulador no cuentan como horas oficiales.</p>
 <div class="card"><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
 <div><label>Fecha</label><input id="f_d" type="date"></div><div><label>Tipo</label><select id="f_k"><option>SIMULADOR</option><option>VUELO REAL</option></select></div>
 <div><label>Aeronave</label><input id="f_a" placeholder="Cessna 172"></div><div><label>Salida (ICAO)</label><input id="f_o" class="mono" placeholder="SKBG" maxlength="4"></div>
 <div><label>Llegada (ICAO)</label><input id="f_r" class="mono" placeholder="SKSP" maxlength="4"></div><div><label>Duración (min)</label><input id="f_t" type="number" min="0"></div>
 <div><label>Observaciones</label><input id="f_n"></div></div><p><button class="btn" onclick="addLog()">${editId!==null?'Guardar cambios':'Registrar vuelo'}</button></p></div>
 <h2>Registros</h2><div class="card wrap">${S.logs.length?`<table><tr><th>FECHA</th><th>TIPO</th><th>AERONAVE</th><th>RUTA</th><th>MIN</th><th></th></tr>`+S.logs.map((l,i)=>`<tr><td class="mono">${l.d}</td><td><span class="tag ${l.kind==='SIMULADOR'?'sim':'real'}">${l.kind}</span></td><td>${l.ac}</td><td class="mono">${l.dep} > ${l.arr}</td><td class="mono">${l.dur}</td><td><button class="btn g" onclick="editLog(${i})">Editar</button> <button class="btn g" onclick="delLog(${i})">Eliminar</button></td></tr>`).join('')+`</table>`:'Aún no hay vuelos. Registra el primero arriba.'}</div>
 <div class="grid" style="margin-top:14px"><div class="card"><div class="cap">TOTAL DE VUELOS</div><div class="big">${S.logs.length}</div></div><div class="card"><div class="cap">AEROPUERTOS</div><div class="big">${new Set(S.logs.flatMap(l=>[l.dep,l.arr])).size}</div></div></div>`},
sim(){return `<h1>Simulador</h1><p class="sub">Checklists interactivas para Microsoft Flight Simulator.</p>`+Object.entries(CHK).map(([ac,ls])=>`<h2>${ac}</h2><div class="grid">`+Object.entries(ls).map(([n,it])=>`<div class="card"><h3>${n}</h3>`+it.map(x=>{const k=ac+n+x;return `<label class="chk" style="color:var(--tx);font-size:15px"><input type="checkbox" ${S.chk[k]?'checked':''} onchange="S.chk['${k}']=this.checked;save()"> ${x}</label>`}).join('')+`</div>`).join('')+`</div>`).join('')+`<div class="note">${SIMNOTE}</div>`},
dict(){return `<h1>Diccionario aeronáutico</h1><p class="sub">English → Español</p><input id="q" placeholder="Buscar término" oninput="dictF()" style="max-width:340px"><div id="dl" class="grid" style="margin-top:14px">${dictH('')}</div>`},
route(){const st=[['Conocimientos básicos','Ruta educativa'],['Fundamentos de vuelo','Ruta educativa'],['Navegación','Ruta educativa'],['Meteorología','Ruta educativa'],['Comunicaciones','Ruta educativa'],['Instrumentos','Ruta educativa'],['Piloto privado','Licencia: consultar requisitos oficiales'],['Habilitación de instrumentos','Licencia: consultar requisitos oficiales'],['Piloto comercial','Licencia: consultar requisitos oficiales']];
 return `<h1>Mi ruta para ser piloto</h1><p class="sub">Camino de formación hacia tu objetivo.</p><div class="card" style="padding-left:24px">`+st.map(s=>`<div class="step"><h3>${s[0]}</h3><span class="tag">${s[1]}</span></div>`).join('')+`</div><div class="note"><b>Ruta educativa general</b> orienta el estudio. <b>Requisitos oficiales</b> (horas, edad, certificado médico, exámenes) varían según el país y los define la autoridad aeronáutica; en Colombia, la Aerocivil. Consulta siempre su normativa vigente.</div>`}
};
function planeSVG(){return `<svg viewBox="0 0 300 120" style="width:100%;max-width:420px;margin-top:10px" fill="none" stroke="#3d8bd9" stroke-width="2"><path d="M20 60h250M120 60l-40-45M120 60l-40 45M255 60l15-22M255 60l15 22" /><circle cx="150" cy="60" r="5" fill="#ffb020" stroke="none"/><text x="95" y="14" fill="#8a9ab3" stroke="none" font-size="9" font-family="monospace">AILERON</text><text x="232" y="22" fill="#8a9ab3" stroke="none" font-size="9" font-family="monospace">ELEVATOR</text><text x="30" y="108" fill="#8a9ab3" stroke="none" font-size="9" font-family="monospace">Roll: eje longitudinal</text></svg>`}
function qHTML(q,id,isExam){return `<div class="card" id="${id}"><b>${q.p}</b>`+q.o.map((o,i)=>`<button class="opt" onclick="ans(this,${i},'${id}',${!!isExam})">${o}</button>`).join('')+`<div class="fb" hidden></div></div>`}
function ans(b,i,id,isExam){const box=b.closest('.card'),q=isExam?EXAM[examState.i]:LESSONS[lesson.t].q[+id.slice(1)];if(box.dataset.d)return;box.dataset.d=1;
 [...box.querySelectorAll('.opt')].forEach((x,j)=>{if(j===q.a)x.classList.add('ok');else if(j===i)x.classList.add('no')});
 const f=box.querySelector('.fb');f.hidden=false;f.innerHTML=(i===q.a?'Correcto. ':'Incorrecto. ')+q.e;
 if(isExam){if(i===q.a)examState.s++;else examState.miss.push(q.t);f.insertAdjacentHTML('afterend','<p><button class="btn" onclick="examState.i++;render()">Continuar</button></p>')}
 else{lessonQ.n++;if(i===q.a)lessonQ.ok++;qUI()}}
let lessonQ={n:0,ok:0};
function qUI(){const L=LESSONS[lesson.t],t=L.q.length,k=key(lesson.p,lesson.t),wrong=lessonQ.n-lessonQ.ok,pass=lessonQ.n===t&&wrong===0,m=$('#qm');
 $('#qs').textContent=`Respondidas ${lessonQ.n}/${t} · Correctas ${lessonQ.ok}`;
 $('#bc').disabled=!S.done[k]&&!pass;$('#br').hidden=wrong===0;m.hidden=!(wrong>0||pass);
 m.innerHTML=wrong>0?'Tienes al menos una respuesta incorrecta. Puedes terminar de responder y revisar las explicaciones, pero para completar la lección todas deben estar correctas. Pulsa "Volver a intentar".':'Todas correctas. Ya puedes marcar la lección como completada.'}
function retryQ(){render();$('#qz').scrollIntoView({behavior:'smooth'})}
function dictH(q){return DICT.filter(d=>(d[0]+d[1]).toLowerCase().includes(q.toLowerCase())).map(d=>`<div class="card"><div class="mono" style="color:var(--am)">${d[0]}</div><h3>${d[1]}</h3><div style="color:var(--mu)">${d[2]}</div><div class="mono" style="font-size:12.5px;margin-top:6px">${d[3]}</div></div>`).join('')||'Sin resultados.'}
function dictF(){$('#dl').innerHTML=dictH($('#q').value)}
let editId=null;
function addLog(){const g=i=>$('#f_'+i).value.trim();if(!g('d')||!g('o')||!g('r')){alert('Completa fecha y aeropuertos de salida y llegada.');return}
 const r={d:g('d'),kind:g('k'),ac:g('a')||'N/D',dep:g('o').toUpperCase(),arr:g('r').toUpperCase(),dur:g('t')||0,n:g('n')};
 if(editId!==null){S.logs[editId]=r;editId=null}else S.logs.push(r);save();render()}
function editLog(i){editId=i;render();const l=S.logs[i];$('#f_d').value=l.d;$('#f_k').value=l.kind;$('#f_a').value=l.ac;$('#f_o').value=l.dep;$('#f_r').value=l.arr;$('#f_t').value=l.dur;$('#f_n').value=l.n}
function delLog(i){if(confirm('¿Eliminar este registro?')){S.logs.splice(i,1);save();render()}}
function calcW(){const g=i=>parseFloat($('#w_'+i).value),c=g('c'),tas=g('t'),wd=g('d'),ws=g('s'),x=g('x'),o=$('#w_o');
 if([c,tas,wd,ws].some(isNaN)||tas<=0||ws<0){o.innerHTML='<div class="fb">Ingresa valores válidos.</div>';return}
 const r=Math.PI/180,sn=ws/tas*Math.sin((wd-c)*r);
 if(Math.abs(sn)>1){o.innerHTML='<div class="fb">El viento es demasiado fuerte para mantener ese course con esa TAS.</div>';return}
 const wca=Math.asin(sn)/r,hd=(((c+wca)%360)+360)%360,gs=tas*Math.cos(wca*r)-ws*Math.cos((wd-c)*r),hw=ws*Math.cos((wd-c)*r),xw=ws*Math.sin((wd-c)*r);
 if(gs<=0){o.innerHTML='<div class="fb">La velocidad respecto al suelo resulta nula o negativa: no es posible avanzar en ese course.</div>';return}
 const ete=x>0?Math.round(x/gs*60):null,p=n=>String(Math.round(n)%360||360).padStart(3,'0'),cell=(l,v)=>`<div class="card"><div class="cap">${l}</div><div class="big" style="font-size:24px">${v}</div></div>`;
 o.innerHTML=`<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">${cell('HEADING',p(hd)+'°')}${cell('WCA',Math.abs(wca).toFixed(1)+'° '+(wca>=0?'D':'I'))}${cell('GROUND SPEED',Math.round(gs)+' kt')}${ete!==null?cell('ETE',ete+' min'):''}</div>
 <p style="color:var(--mu)">${hw>=0?'Viento de frente':'Viento de cola'}: ${Math.abs(hw).toFixed(0)} kt. Viento cruzado: ${Math.abs(xw).toFixed(0)} kt ${xw>=0?'desde la derecha':'desde la izquierda'}. D = corregir a la derecha, I = a la izquierda.</p>
 <svg viewBox="0 0 200 200" style="width:100%;max-width:240px" fill="none" stroke-width="2"><circle cx="100" cy="100" r="90" stroke="#233450"/><text x="96" y="22" fill="#8a9ab3" font-size="10" font-family="monospace" stroke="none">N</text>
 <line x1="100" y1="100" x2="100" y2="30" stroke="#ffb020" transform="rotate(${c} 100 100)"/><line x1="100" y1="100" x2="100" y2="30" stroke="#3d8bd9" stroke-dasharray="4 3" transform="rotate(${hd} 100 100)"/>
 <g transform="rotate(${wd} 100 100)" stroke="#8a9ab3"><line x1="100" y1="6" x2="100" y2="36"/><path d="M95 28l5 9 5-9"/></g></svg>
 <div class="cap">AMBAR: COURSE · AZUL: HEADING · GRIS: VIENTO (DESDE)</div>`}
function decM(){const t=$('#m_i').value.trim().toUpperCase().split(/\s+/).filter(Boolean),R=[];let cl=[],ic=0;const A=(c,m)=>R.push([c,m]);
 const W={RA:'lluvia',DZ:'llovizna',SN:'nieve',GR:'granizo',BR:'neblina',FG:'niebla',HZ:'calima',FU:'humo',TS:'tormenta',SH:'chubascos',FZ:'congelante',SQ:'turbonada',MI:'baja',BC:'en bancos',DR:'a baja altura',BL:'elevada por viento'};
 t.forEach(k=>{let m;
 if(k==='METAR')A(k,'Reporte meteorológico de rutina (routine report).');
 else if(k==='SPECI')A(k,'Reporte especial emitido por un cambio significativo.');
 else if(k==='AUTO')A(k,'Observación automática, sin intervención humana.');
 else if(k==='CAVOK')A(k,'Ceiling and Visibility OK: visibilidad de 10 km o más, sin nubes ni fenómenos significativos.');
 else if(k==='NOSIG')A(k,'Sin cambios significativos esperados en las próximas 2 horas.');
 else if(k==='TEMPO'||k==='BECMG')A(k,k==='TEMPO'?'Cambio temporal (tendencia).':'Cambio gradual (tendencia).');
 else if(m=k.match(/^(\d{2})(\d{2})(\d{2})Z$/))A(k,`Observación del día ${m[1]} a las ${m[2]}:${m[3]} UTC.`);
 else if(m=k.match(/^(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?(KT|MPS)$/))A(k,`Viento ${m[1]==='VRB'?'variable':'desde '+m[1]+'°'} a ${+m[2]} ${m[4]==='KT'?'nudos':'m/s'}${m[3]?', con ráfagas de '+(+m[3]):''}.`);
 else if(m=k.match(/^(\d{3})V(\d{3})$/))A(k,`Dirección del viento variable entre ${m[1]}° y ${m[2]}°.`);
 else if(/^\d{4}$/.test(k))A(k,k==='9999'?'Visibilidad de 10 km o más.':`Visibilidad de ${+k} metros.`);
 else if(m=k.match(/^(\d+)SM$/))A(k,`Visibilidad de ${m[1]} millas estatutas.`);
 else if(m=k.match(/^(FEW|SCT|BKN|OVC)(\d{3})(CB|TCU)?$/)){const h=+m[2]*100,n={FEW:'escasas (1-2 octas)',SCT:'dispersas (3-4 octas)',BKN:'fragmentadas (5-7 octas)',OVC:'cubierto (8 octas)'}[m[1]];if(m[1]==='BKN'||m[1]==='OVC')cl.push(h);A(k,`Nubes ${n} a ${h} ft sobre el terreno${m[3]?', tipo '+(m[3]==='CB'?'cumulonimbus':'cumulus torreante'):''}.`)}
 else if(['SKC','CLR','NSC'].includes(k))A(k,'Cielo despejado o sin nubes significativas.');
 else if(m=k.match(/^(M?\d{2})\/(M?\d{2})$/)){const v=s=>s[0]==='M'?-s.slice(1):+s;A(k,`Temperatura ${v(m[1])} °C y punto de rocío (dew point) ${v(m[2])} °C. Cuanto menor la diferencia, mayor la probabilidad de niebla o nubes bajas.`)}
 else if(m=k.match(/^Q(\d{4})$/))A(k,`QNH: ${+m[1]} hPa. Ajuste del altímetro para indicar altitud sobre el nivel del mar.`);
 else if(m=k.match(/^A(\d{4})$/))A(k,`Altimeter setting: ${(m[1]/100).toFixed(2)} inHg.`);
 else if(m=k.match(/^([-+]|VC)?((?:MI|BC|DR|BL|SH|TS|FZ)?(?:DZ|RA|SN|GR|BR|FG|FU|HZ|SQ)+|TS|SH)$/)){const parts=m[2].match(/.{2}/g).map(x=>W[x]||x).join(' ');A(k,`Fenómeno: ${m[1]==='-'?'ligero, ':m[1]==='+'?'fuerte, ':m[1]==='VC'?'en las inmediaciones, ':''}${parts}.`)}
 else if(!ic&&/^[A-Z]{4}$/.test(k)){ic=1;A(k,'Aeropuerto o estación (código ICAO).')}
 else A(k,'Grupo no reconocido por este decodificador educativo.')});
 const ceil=cl.length?`<p style="color:var(--mu)">Ceiling (techo de nubes): ${Math.min(...cl)} ft sobre el terreno.</p>`:'';
 $('#m_o').innerHTML=R.length?`<table><tr><th>CÓDIGO</th><th>SIGNIFICADO</th></tr>`+R.map(r=>`<tr><td class="mono" style="color:var(--am)">${r[0]}</td><td>${r[1]}</td></tr>`).join('')+`</table>`+ceil:'Pega un METAR para decodificarlo.'}
let cm='Ground',exI=0,exH=false;
const PH={
Ground:[{t:'Rodaje',a:'Alpha Bravo Charlie, taxi to holding point runway 35 via Alpha, hold short of runway 35.',p:'Taxi to holding point runway 35 via Alpha, hold short runway 35, Alpha Bravo Charlie.',es:'Autoriza el rodaje hasta el punto de espera por la calle Alpha y ordena detenerse antes de la pista.'},
 {t:'Solicitud',a:'Alpha Bravo Charlie, Ground, go ahead.',p:'Ground, Alpha Bravo Charlie, request taxi, information Bravo.',es:'El piloto pide autorización de rodaje indicando que tiene la información ATIS vigente.'}],
Tower:[{t:'Despegue',a:'Alpha Bravo Charlie, wind 030 at 8 knots, runway 35, cleared for takeoff.',p:'Cleared for takeoff runway 35, Alpha Bravo Charlie.',es:'Autorización de despegue con viento informado.'},
 {t:'Espera en pista',a:'Alpha Bravo Charlie, line up and wait runway 35.',p:'Line up and wait runway 35, Alpha Bravo Charlie.',es:'Entrar a la pista y esperar. No es una autorización de despegue.'}],
Departure:[{t:'Ascenso',a:'Alpha Bravo Charlie, radar contact, climb and maintain 5000 feet.',p:'Climb and maintain 5000 feet, Alpha Bravo Charlie.',es:'Contacto radar y autorización de ascenso a 5000 ft.'}],
Approach:[{t:'Descenso',a:'Alpha Bravo Charlie, descend to 3000 feet, QNH 1015.',p:'Descend to 3000 feet, QNH 1015, Alpha Bravo Charlie.',es:'Descenso a 3000 ft con el ajuste de altímetro QNH.'},
 {t:'Aproximación',a:'Alpha Bravo Charlie, cleared ILS approach runway 35.',p:'Cleared ILS approach runway 35, Alpha Bravo Charlie.',es:'Autorización para ejecutar la aproximación ILS. La pista es un ejemplo genérico.'}],
Center:[{t:'Cambio de frecuencia',a:'Alpha Bravo Charlie, contact Center on 125.5.',p:'Contact Center 125.5, Alpha Bravo Charlie.',es:'Instrucción de cambiar a la frecuencia del centro de control.'},
 {t:'Rumbo',a:'Alpha Bravo Charlie, fly heading 270.',p:'Heading 270, Alpha Bravo Charlie.',es:'Instrucción de volar el rumbo 270.'}],
ATIS:[{t:'Estructura típica',a:'Information Bravo, wind 030 at 8 knots, visibility 10 kilometers, few clouds 3000 feet, QNH 1015, runway in use 35.',p:'Information Bravo received.',es:'El ATIS es una grabación continua. Cada versión lleva una letra; el piloto la menciona en su primer contacto.'}],
Emergency:[{t:'Mayday (peligro grave e inminente)',a:'Alpha Bravo Charlie, Mayday received. Report intentions.',p:'Mayday, Mayday, Mayday, Alpha Bravo Charlie, engine failure, landing at nearest airfield.',es:'Estructura general: Mayday x3, matrícula, naturaleza del problema, intenciones, posición, altitud y personas a bordo. Pan-Pan se usa para urgencia sin peligro inmediato.'}]};
const EX=[
{a:'Alpha Bravo Charlie, descend to 3000 feet, QNH 1015.',o:['Descend to 3000 feet, QNH 1015, Alpha Bravo Charlie.','Descend to 5000 feet, QNH 1015, Alpha Bravo Charlie.','Descending, Alpha Bravo Charlie.'],a2:0,e:'El readback debe repetir altitud y QNH para que el controlador verifique que se entendieron.'},
{a:'Alpha Bravo Charlie, hold short of runway 35.',o:['Hold short runway 17, Alpha Bravo Charlie.','Roger.','Hold short runway 35, Alpha Bravo Charlie.'],a2:2,e:'Las instrucciones de hold short se repiten completas; Roger no confirma la pista.'},
{a:'Alpha Bravo Charlie, fly heading 270, climb and maintain 6000 feet.',o:['Heading 207, climb 6000 feet, Alpha Bravo Charlie.','Heading 270, climb and maintain 6000 feet, Alpha Bravo Charlie.','Heading 270, Alpha Bravo Charlie.'],a2:1,e:'Hay que repetir rumbo y altitud. Un dígito invertido (207) puede causar un incidente.'},
{a:'Alpha Bravo Charlie, contact Tower on 118.10.',o:['Contact Tower 119.10, Alpha Bravo Charlie.','Contact Tower 118.10, Alpha Bravo Charlie.','Roger, Alpha Bravo Charlie.'],a2:1,e:'La frecuencia se repite exactamente.'},
{a:'Alpha Bravo Charlie, squawk 4521.',o:['Squawk 4512, Alpha Bravo Charlie.','Squawk 4521, Alpha Bravo Charlie.','Squawking, Alpha Bravo Charlie.'],a2:1,e:'El código transponder se repite dígito por dígito.'},
{a:'Alpha Bravo Charlie, line up and wait runway 35.',o:['Cleared for takeoff runway 35, Alpha Bravo Charlie.','Line up and wait runway 35, Alpha Bravo Charlie.','Taxi to runway 35, Alpha Bravo Charlie.'],a2:1,e:'Line up and wait no autoriza el despegue. Confundirlos es un error grave.'}];
function say(...ts){try{if(!window.speechSynthesis)throw 0;speechSynthesis.cancel();ts.forEach(t=>{const u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=.85;speechSynthesis.speak(u)})}catch(e){alert('Tu navegador no permite reproducir voz. Practica con la lectura del texto.')}}
function sayP(c,i){say(PH[c][i].a,PH[c][i].p)}
function sayE(){say(EX[exI%EX.length].a)}
function exAns(b,i){const box=b.closest('.card'),e=EX[exI%EX.length];if(box.dataset.d)return;box.dataset.d=1;
 [...box.querySelectorAll('.opt')].forEach((x,j)=>{if(j===e.a2)x.classList.add('ok');else if(j===i)x.classList.add('no')});
 const f=box.querySelector('.fb');f.hidden=false;f.innerHTML=(i===e.a2?'Correcto. ':'Incorrecto. ')+e.e+' Instrucción: '+e.a;
 f.insertAdjacentHTML('afterend','<p><button class="btn" onclick="exI++;render()">Siguiente</button></p>')}
let aptSel=null,aptQ='';
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const APT0=[['SKBG','BGA','Aeropuerto Internacional Palonegro','Bucaramanga','Colombia'],['SKSP','ADZ','Aeropuerto Internacional Gustavo Rojas Pinilla','San Andrés','Colombia'],['SKBO','BOG','Aeropuerto Internacional El Dorado','Bogotá','Colombia'],['SKRG','MDE','Aeropuerto Internacional José María Córdova','Rionegro','Colombia'],['SKCL','CLO','Aeropuerto Internacional Alfonso Bonilla Aragón','Cali / Palmira','Colombia'],['SKCG','CTG','Aeropuerto Internacional Rafael Núñez','Cartagena','Colombia']].map(a=>({icao:a[0],iata:a[1],name:a[2],city:a[3],country:a[4]}));
const allApt=()=>[...APT0,...S.custom.map(c=>Object.assign({custom:1},c))];
function aptCards(q){const l=allApt().filter(a=>(a.icao+a.iata+a.name+a.city+a.country).toLowerCase().includes(q.toLowerCase().trim()));
 return l.map(a=>{const f=Object.values(S.apt[a.icao]||{}).some(v=>String(v).trim());return `<button class="card" style="text-align:left;color:inherit;font:inherit;cursor:pointer" onclick="aptSel='${a.icao}';render();scrollTo(0,0)"><div class="row" style="justify-content:space-between"><span class="mono" style="color:var(--am);font-size:20px">${a.icao}</span><span class="tag">${a.iata||'--'}</span></div><h3 style="margin-top:6px">${a.name}</h3><div style="color:var(--mu)">${a.city}, ${a.country}</div><div class="row" style="margin-top:8px"><span class="tag ${f?'real':''}">${f?'FICHA CON DATOS':'DATOS PENDIENTES'}</span>${a.icao==='SKBG'?'<span class="tag sim">REFERENCIA</span>':''}</div></button>`}).join('')||'<div class="note">Sin resultados.</div>'}
function aptF(){aptQ=$('#aq').value;$('#al').innerHTML=aptCards(aptQ)}
function addApt(){const g=i=>$('#n_'+i).value.trim(),ic=g('i').toUpperCase();
 if(!/^[A-Z]{4}$/.test(ic)||!g('m')){alert('Ingresa un código ICAO de 4 letras y el nombre.');return}
 if(allApt().some(a=>a.icao===ic)){alert('Ese aeropuerto ya existe.');return}
 S.custom.push({icao:ic,iata:g('a').toUpperCase(),name:g('m'),city:g('c')||'N/D',country:g('p')||'N/D'});save();aptQ='';render()}
const SKBG_SEED={
elev:'3901 ft (1189 m) · temperatura de referencia 28 °C',
src:`AIP Colombia, AD 2 SKBG (Aerocivil / AIS Colombia).
Consultado el 08 OCT 2026 en una copia de terceros (atccol.com), NO en el sitio de Aerocivil. Páginas de distintas enmiendas:
- AD 2.2 y AD 2.3: AIRAC AMDT 67/24, 28 NOV 2024
- AD 2.12, 2.13, 2.17, 2.18, 2.23 y lista de cartas 2.24: AIRAC AMDT 70/26, 22 JAN 2026
- AD 2.19 y AD 2.20: AIRAC AMDT 69/25, 02 OCT 2025
Puede haber enmiendas posteriores. Verificar en el AIP vigente de Aerocivil.`,
rwy:`RWY 17/35 · 2102 x 45 m · asfalto · PCN 60/F/C/W/T
RWY 17: THR 3901 ft · BRG MAG 168° (GEO 159°)
RWY 35: THR 3854 ft · BRG MAG 348° (GEO 339°)
Distancias declaradas (AD 2.13), en metros:
RWY 17: TORA 2252 · TODA 2402 · ASDA 2252 · LDA 2102
RWY 35: TORA 2226 · TODA 2376 · ASDA 2226 · LDA 2102
Obs. RWY 17: contaminación por caucho, ejercer precaución.`,
freq:`TWR Palonegro: 118.300 MHz (alterna 118.050)
APP Bucaramanga: 119.000 MHz (alterna 119.400)
ATIS Bucaramanga: 127.750 MHz
Emergencia: 121.500 MHz
Horario de los servicios ATS en el AIP: 0000-0430 y 1030-2359
Radioayudas (AD 2.19): ILS CAT I RWY 35 · LOC IBGA 110.70 MHz · GP 330.20 MHz · DME CH44X
DVOR/DME PIE: 116.80 MHz (CH115X)`,
proc:`IAC (cartas de aproximación por instrumentos):
ILS Z / LOC Z RWY 35 · ILS Y / LOC Y RWY 35 · VOR RWY 35 · VOR A RWY 17 · RNP RWY 35 · RNP RWY 17
SID convencionales:
EJA2D, UBMU1A (RWY 35) · ESNU1F, MOGO1E, VOVG1A (RWY 35) · EJA1E, UBMU1B (RWY 17) · ESNU1G, MOGO1F, VOVG1B (RWY 17)
SID RNAV:
RWY 35: EJA2F, UBMU1C · ESNU2H · MOGO1B, UMKA1A, VOVG1C
RWY 17: EJA1G, MOGO1G, UMKA1B, VOVG1D · ESNU2J, UBMU2D
STAR:
MOGO2A, OPRO1A (RWY 35 y 17) · EJA1H, IVRI1A, POXO1H, TORA1Q, VOVG1E (RWY 35 y 17)
RNAV RWY 35: MOGO2C, OPRO1B, VOVG1F · IVRI1B, POXO2F, TORA1R, UMKA2C
RNAV RWY 17: EJA2C, MOGO2D, OPRO1C, POXO1J, VOVG1G · IVRI1C, TORA1S
Salidas y llegadas visuales (VAC): AZUFRADA, CHOCOA, CHUCURI, PANTANO, BARRANCA, RIO, MALAGA
Fixes de referencia: SIGOX, KILIB, ROLOV, POXOM, ESNUT, UBMUN, MOGOS, OPROG y PIE (DVOR/DME)
Sus coordenadas están en la carta de WPT de procedimientos PBN.`,
notes:`- Elevación 3901 ft. Pistas 17/35 de asfalto, 2102 x 45 m.
- RWY 35 cuenta con ILS CAT I publicado.
- Precaución por concentración de aves en la pista 17/35 (AD 2.23).
- CTR Bucaramanga: clase D, desde el suelo hasta 6000 ft AMSL. Altitud de transición 18000 ft (AD 2.17).
- Comunicaciones (AD 2.24): saliendo, primero TWR 118.3 y luego APP 119.0. Llegando, primero APP 119.0 y luego TWR 118.3.
- Los vuelos de instrucción los autoriza la torre y no se autorizan entre 0000-1200 y 2100-2359 UTC (AD 2.20).
- Consultar siempre el AIP, el AIRAC y los NOTAM vigentes.`};
function seedApt(){S.seeded=S.seeded||{};if(S.seeded.SKBG)return;const c=S.apt.SKBG;if(!c||!Object.values(c).some(v=>String(v).trim()))S.apt.SKBG=Object.assign({},SKBG_SEED);S.seeded.SKBG=1;save()}
function resetSkbg(){if(confirm('¿Reemplazar la ficha de SKBG por los datos del AIP? Se perderán los cambios que hayas hecho en esta ficha.')){S.apt.SKBG=Object.assign({},SKBG_SEED);save();render()}}
function saveApt(){const g=k=>$('#a_'+k).value.trim();S.apt[aptSel]={elev:g('elev'),src:g('src'),rwy:g('rwy'),freq:g('freq'),proc:g('proc'),notes:g('notes')};save();render();alert('Ficha guardada.')}
function delApt(){if(confirm('¿Eliminar este aeropuerto y su ficha?')){S.custom=S.custom.filter(a=>a.icao!==aptSel);delete S.apt[aptSel];save();aptSel=null;render()}}
const CT=['Airport','SID','STAR','Approach','Ground','Navigation'],LC=['Apuntes','Manuales','Cartas','Imágenes','Otros'];
let LIB=[],LOK=0,LERR=0,DB=null,vz={s:1,x:0,y:0},vd=null;
document.head.insertAdjacentHTML('beforeend','<style>#vw{position:fixed;inset:0;z-index:50;background:#050a12;display:flex;flex-direction:column;padding-top:env(safe-area-inset-top,0px)}#vw[hidden]{display:none}.vbar{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px;border-bottom:1px solid #233450}#vb{flex:1;position:relative;overflow:hidden;touch-action:none;cursor:grab}#vb img{position:absolute;left:0;top:0;transform-origin:0 0;max-width:none;user-select:none}</style>');
document.addEventListener('keydown',e=>{if(e.key==='Escape')vX()});
function dbo(){return new Promise((res,rej)=>{if(DB)return res(DB);try{const r=indexedDB.open('fa_lib',1);r.onupgradeneeded=()=>r.result.createObjectStore('f',{keyPath:'id'});r.onsuccess=()=>{DB=r.result;res(DB)};r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
const dbp=(m,fn)=>dbo().then(d=>new Promise((res,rej)=>{const t=d.transaction('f',m),q=fn(t.objectStore('f'));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)}));
const dbPut=o=>dbp('readwrite',s=>s.put(o)),dbDel=id=>dbp('readwrite',s=>s.delete(id));
function libInit(){if(LOK)return libDraw();dbp('readonly',s=>s.getAll()).then(r=>{LIB=r||[];LOK=1;libDraw()}).catch(()=>{LERR=1;libDraw()})}
function itemH(o){return `<div class="card"><div class="row" style="justify-content:space-between"><span class="tag">${esc(o.cat)}</span><span class="mono" style="color:var(--am)">${esc(o.icao||'')}</span></div><h3 style="margin-top:8px;word-break:break-word">${esc(o.name)}</h3><div style="color:var(--mu);font-size:13px">${o.vig?'Vigencia: '+esc(o.vig)+' · ':''}Añadido ${o.added}</div><div class="row" style="margin-top:10px"><button class="btn" onclick="openF('${o.id}')">Abrir</button><button class="btn g" onclick="delF('${o.id}')">Eliminar</button></div></div>`}
function libDraw(){const car=view==='car',L=$(car?'#car_l':'#lib_l');if(!L)return;
 if(LERR){L.innerHTML='<div class="fb">Este navegador no permite guardar archivos aquí (almacenamiento bloqueado).</div>';return}
 const q=($(car?'#c_q':'#l_q').value||'').toLowerCase(),f=$(car?'#c_f':'#l_f').value,r=LIB.filter(o=>(o.kind==='car')===car&&(!f||o.cat===f)&&(o.name+o.icao+o.cat).toLowerCase().includes(q));
 L.innerHTML=r.length?r.map(itemH).join(''):'<div style="color:var(--mu)">Aún no hay archivos'+(f||q?' con ese filtro':'')+'.</div>'}
const nid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function save1(o){dbPut(o).then(()=>{LIB.push(o);libDraw()}).catch(()=>alert('No se pudo guardar en este navegador (espacio insuficiente o almacenamiento bloqueado).'))}
function upFiles(inp,mode){const car=mode==='car',cat=car?$('#c_t').value:$('#l_c').value,icao=car?$('#c_i').value.trim().toUpperCase():'',vig=car?$('#c_v').value.trim():'';
 if(car&&!vig){alert('Indica la vigencia o ciclo de la carta antes de subirla.');inp.value='';return}
 [...inp.files].forEach(f=>{if(f.size>15*1048576){alert(f.name+' supera 15 MB.');return}
  const r=new FileReader();r.onload=()=>save1({id:nid(),name:f.name,kind:mode,cat,icao,vig,type:f.type,data:r.result,added:new Date().toISOString().slice(0,10)});r.readAsDataURL(f)});inp.value=''}
function addNote(){const t=$('#l_nt').value.trim(),b=$('#l_nb').value.trim();if(!t||!b){alert('Escribe el título y el texto.');return}
 save1({id:nid(),name:t,kind:'lib',cat:'Apuntes',icao:'',vig:'',type:'text/note',data:b,added:new Date().toISOString().slice(0,10)});$('#l_nt').value='';$('#l_nb').value=''}
function delF(id){if(confirm('¿Eliminar este archivo?'))dbDel(id).then(()=>{LIB=LIB.filter(o=>o.id!==id);libDraw()})}
function vA(){const i=$('#vi');if(i)i.style.transform=`translate(${vz.x}px,${vz.y}px) scale(${vz.s})`}
function vFit(){const b=$('#vb'),i=$('#vi');if(!i||!i.naturalWidth)return;const s=Math.min(b.clientWidth/i.naturalWidth,b.clientHeight/i.naturalHeight,1);vz={s,x:(b.clientWidth-i.naturalWidth*s)/2,y:(b.clientHeight-i.naturalHeight*s)/2};vA()}
function vZat(mx,my,f){const ns=Math.min(12,Math.max(.05,vz.s*f));vz.x=mx-(mx-vz.x)*ns/vz.s;vz.y=my-(my-vz.y)*ns/vz.s;vz.s=ns;vA()}
function vZ(f){const b=$('#vb');vZat(b.clientWidth/2,b.clientHeight/2,f)}
function vFs(){try{const v=$('#vw');(document.fullscreenElement?document.exitFullscreen():v.requestFullscreen()).catch(()=>{})}catch(e){}}
function vX(){const v=$('#vw');if(v)v.hidden=true}
function openF(id){const o=LIB.find(x=>x.id===id);if(!o)return;let v=$('#vw');
 if(!v){document.body.insertAdjacentHTML('beforeend','<div id="vw" hidden></div>');v=$('#vw')}
 const img=o.type.startsWith('image/'),tools=img?`<button class="btn g" onclick="vZ(1.25)">Acercar</button><button class="btn g" onclick="vZ(.8)">Alejar</button><button class="btn g" onclick="vFit()">Ajustar</button>`:'';
 v.innerHTML=`<div class="vbar"><span class="mono" style="color:var(--am);word-break:break-all">${esc(o.name)}</span><span class="row">${tools}<button class="btn g" onclick="vFs()">Pantalla completa</button><button class="btn" onclick="vX()">Cerrar</button></span></div><div id="vb"></div>`;v.hidden=false;const b=$('#vb');
 if(img){b.innerHTML=`<img id="vi" alt="${esc(o.name)}" draggable="false" src="${o.data}">`;$('#vi').onload=vFit;
  b.onwheel=e=>{e.preventDefault();const r=b.getBoundingClientRect();vZat(e.clientX-r.left,e.clientY-r.top,e.deltaY<0?1.15:.87)};
  b.onpointerdown=e=>{vd={px:e.clientX,py:e.clientY,x:vz.x,y:vz.y};b.setPointerCapture(e.pointerId)};
  b.onpointermove=e=>{if(vd){vz.x=vd.x+e.clientX-vd.px;vz.y=vd.y+e.clientY-vd.py;vA()}};b.onpointerup=()=>{vd=null}}
 else if(o.type==='application/pdf'){b.style.cursor='default';fetch(o.data).then(r=>r.blob()).then(bl=>{b.innerHTML=`<iframe src="${URL.createObjectURL(bl)}" style="width:100%;height:100%;border:0;background:#fff"></iframe>`}).catch(()=>{b.innerHTML='<div class="fb">No se pudo mostrar el PDF en esta página.</div>'})}
 else{b.style.cursor='default';b.style.overflow='auto';const show=t=>{b.innerHTML=`<pre class="mono" style="white-space:pre-wrap;padding:20px;max-width:780px;margin:0 auto">${esc(t)}</pre>`};o.type==='text/note'?show(o.data):fetch(o.data).then(r=>r.text()).then(show)}}
document.head.insertAdjacentHTML('beforeend','<style>#wl{position:fixed;inset:0;z-index:60;background:rgba(5,10,18,.95);display:flex;padding:16px;overflow:auto}#wl .wb{background:var(--pnl);border:1px solid var(--ln);border-top:3px solid var(--am);border-radius:6px;max-width:580px;width:100%;padding:24px;margin:auto}#wl ul{margin:10px 0 0;padding-left:20px}#wl li{margin:9px 0;color:var(--mu);font-size:14px}#wl li b{color:var(--tx)}.wr{margin-top:16px;border:1px solid var(--rd);border-left:5px solid var(--rd);background:rgba(229,72,77,.12);border-radius:5px;padding:14px 16px}.wr h2{display:flex;align-items:center;gap:10px;margin:0 0 6px;font-size:16px;letter-spacing:.04em;color:var(--rd)}.wr p{margin:10px 0 0;font-size:14px;line-height:1.55}.wr b{color:#fff}</style>');
const hello=()=>{const h=new Date().getHours();return h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches'};
// Pantalla de bienvenida: pide el nombre en el primer ingreso y muestra el aviso de alcance.
function welcome(edit){welcomeClose();
 document.body.insertAdjacentHTML('beforeend',`<div id="wl" role="dialog" aria-modal="true" aria-labelledby="wt"><div class="wb">
 <div class="cap">${edit?'PERFIL':'PRIMER INGRESO'}</div><h1 id="wt" style="font-size:24px;margin:6px 0 16px">${edit?'Cambiar nombre':'Bienvenido a My Flight Academy'}</h1>
 <label for="wn">¿Cómo te llamas?</label><input id="wn" maxlength="30" autocomplete="given-name" placeholder="Tu nombre" value="${esc(S.name)}">
 <div class="wr" role="alert"><h2><svg class="ic" viewBox="0 0 24 24" style="width:22px;height:22px"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/></svg>OJO: LEE ESTO ANTES DE EMPEZAR</h2>
 <p><b>Esto no reemplaza una escuela de aviación.</b> Es solo una introducción a este mundo apasionante de la aviación. Todo lo que se enseña en una escuela certificada, con instructores y práctica real, sigue siendo indispensable.</p>
 <p><b>Con esta información no puedes tomar un avión e ir a volar. No.</b> Terminar estas lecciones no te habilita para volar: hacerlo exige formación certificada, instrucción práctica con un instructor de vuelo y la licencia que pida la autoridad aeronáutica de tu país.</p>
 <p><b>La información varía según el avión.</b> La mayor parte del contenido está ambientada en aviones conocidos, como la Cessna 172 o el Airbus A320. Los procedimientos, las velocidades y las configuraciones cambian según el modelo, el fabricante y su manual de vuelo.</p></div>
 <div class="card" style="margin-top:16px;background:var(--pnl2)"><div class="cap">ADEMÁS, TEN EN CUENTA</div><ul>
 <li><b>Qué es esta plataforma.</b> Un espacio de estudio personal para aprender los fundamentos de aviación con la meta de llegar a piloto privado y piloto comercial: fundamentos de vuelo, navegación, meteorología, comunicaciones e instrumentos.</li>
 <li><b>Licencias.</b> Los requisitos (horas, edad, certificado médico, exámenes) los define la autoridad aeronáutica de cada país. Consúltalos siempre en fuentes oficiales.</li>
 <li><b>Simulador y datos reales.</b> Las horas y los procedimientos de simulador no equivalen a vuelo real. Cartas, frecuencias y procedimientos reales deben tomarse de las publicaciones oficiales vigentes, y esta plataforma no sirve para navegar.</li></ul></div>
 ${edit?'':'<label class="chk" style="color:var(--tx);margin-top:14px"><input id="wk" type="checkbox"> He leído la advertencia y entiendo que esto es solo una introducción.</label>'}
 <div class="row" style="margin-top:18px"><button id="wg" class="btn" ${edit&&(S.name||'').length>=2?'':'disabled'} onclick="welcomeGo()">${edit?'Guardar':'Entrar a la academia'}</button>${edit?'<button class="btn g" onclick="welcomeClose()">Cancelar</button>':''}</div></div></div>`);
 const i=$('#wn'),chk=()=>{const k=$('#wk');$('#wg').disabled=!(i.value.trim().length>=2&&(!k||k.checked))};
 i.oninput=chk;if($('#wk'))$('#wk').onchange=chk;
 i.onkeydown=e=>{if(e.key==='Enter'&&!$('#wg').disabled)welcomeGo();if(e.key==='Escape'&&edit)welcomeClose()};i.focus()}
function welcomeClose(){const w=$('#wl');if(w)w.remove()}
function welcomeGo(){const v=$('#wn').value.trim().slice(0,30),k=$('#wk');if(v.length<2||(k&&!k.checked))return;S.name=v;save();welcomeClose();render()}
function startExam(){examState={i:0,s:0,miss:[]};render()}
const TOPIC_INFO={"Partes del avión": {"tags": "Fuselaje · Alas · Empenaje","d": "Conoce las principales estructuras, superficies de control y componentes de una aeronave."},"Controles de vuelo": {"tags": "Alerones · Elevador · Rudder","d": "Aprenderás cómo los controles primarios modifican el movimiento de la aeronave."},"Pitch, Roll y Yaw": {"tags": "Cabeceo · Alabeo · Guiñada","d": "Comprende los tres ejes del avión y cómo se combinan en un viraje."},"Flaps y Trim": {"tags": "Flaps · Trim · VFE","d": "Descubre cómo se modifica la sustentación y cómo se reducen las fuerzas sobre los controles."},"Cuatro fuerzas del vuelo": {"tags": "Sustentación · Peso · Empuje · Resistencia","d": "Entiende cómo se equilibran las fuerzas que mantienen a un avión en vuelo."},"Preflight inspection": {"tags": "Inspección · Documentos · Combustible","d": "Aprende por qué y cómo se revisa una aeronave antes de cada vuelo."},"Checklists": {"tags": "Listas · Disciplina · Procedimientos","d": "Descubre el papel de las listas de verificación en la operación segura."},"Taxi y Takeoff": {"tags": "Rodaje · Alineación · Despegue","d": "Recorre las fases de rodaje y despegue y las decisiones que las acompañan."},"Climb, Cruise, Descent": {"tags": "Ascenso · Crucero · Descenso","d": "Estudia las fases del vuelo entre el despegue y la aproximación."},"Approach y Landing": {"tags": "Aproximación · Final · Aterrizaje","d": "Entiende cómo se prepara y se ejecuta un aterrizaje."},"Heading, Track, Bearing": {"tags": "Rumbo · Derrota · Marcación","d": "Distingue los conceptos básicos de dirección en la navegación aérea."},"VOR, NDB, GPS": {"tags": "VOR · NDB · GPS","d": "Conoce las principales ayudas y sistemas de navegación."},"Waypoints y Fixes": {"tags": "Waypoints · Fixes · Rutas","d": "Aprende cómo se definen los puntos y las rutas de un vuelo."},"Flight planning": {"tags": "Ruta · Combustible · Tiempo","d": "Descubre cómo se planea un vuelo de principio a fin."},"Presión, QNH, QFE": {"tags": "Presión · QNH · QFE","d": "Comprende cómo el ajuste de presión afecta la lectura del altímetro."},"Viento y visibilidad": {"tags": "Viento · Visibilidad · Nubes","d": "Aprende cómo el viento y la visibilidad condicionan el vuelo."},"METAR y TAF": {"tags": "METAR · TAF · Interpretación","d": "Aprende a leer los reportes y pronósticos meteorológicos de aeródromo."},"Phraseology": {"tags": "Fraseología · Inglés aeronáutico · Claridad","d": "Aprende el lenguaje estándar de las comunicaciones aeronáuticas."},"ATIS, Ground, Tower": {"tags": "ATIS · Ground · Tower","d": "Conoce las dependencias con las que se comunica un piloto en un aeródromo."},"Readback y emergencias": {"tags": "Readback · Mayday · Pan-Pan","d": "Practica cómo se confirman las instrucciones y cómo se comunica una emergencia."},"Instrumentos \"six pack\"": {"tags": "Velocidad · Altitud · Actitud","d": "Identifica los instrumentos básicos y lo que indica cada uno."},"PFD y MFD/ND": {"tags": "PFD · MFD · ND","d": "Conoce las pantallas de la cabina de cristal."},"Fundamentos IFR": {"tags": "Reglas IFR · Instrumentos · Mínimos","d": "Introduce el vuelo por instrumentos y sus conceptos básicos."},"ILS y aproximaciones": {"tags": "ILS · Localizer · Glideslope","d": "Estudia cómo se guía una aproximación por instrumentos."},"Holding y missed approach": {"tags": "Holding · Aproximación frustrada","d": "Aprende los procedimientos de espera y de aproximación frustrada."},"FMC/MCDU y Autopilot": {"tags": "FMC · MCDU · Autopilot","d": "Conoce los sistemas de gestión de vuelo y piloto automático de los aviones comerciales."},"SOP y cockpit procedures": {"tags": "SOP · Procedimientos · Tripulación","d": "Entiende cómo se estandarizan los procedimientos en cabina."}};
const MES=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const fmtD=iso=>{const m=String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);return m?m[3]+' '+MES[+m[2]-1]:'—'};
const dmy=d=>{const m=String(d).match(/(\d+)\D+(\d+)\D+(\d{4})/);return m?m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0'):''};
const durFmt=m=>{m=+m||0;return m>=60?Math.floor(m/60)+' h '+(m%60)+' min':m>0?m+' min':''};
function topicList(){let n=0;return PHASES.flatMap(p=>p.t.map((t,i)=>({p,i,t,n:++n,done:!!S.done[key(p.id,t)]})))}
function openTopic(pid,i){const ph=PHASES.find(x=>x.id===pid);go('acad');openL(pid,ph.t[i])}
function recent(){const ev=[];
 S.exams.forEach(e=>ev.push({d:e.iso||dmy(e.d),ts:e.ts||0,t:'Examen general',x:`Resultado: <span class="mono">${e.s}/${e.n}</span>`}));
 S.logs.forEach(l=>ev.push({d:l.d,ts:0,t:'Vuelo registrado',x:`${l.kind==='SIMULADOR'?'Simulador':'Vuelo real'} · <span class="mono">${esc(l.dep)} → ${esc(l.arr)}</span> · ${esc(l.ac)}${durFmt(l.dur)?' · '+durFmt(l.dur):''}`}));
 (S.act||[]).forEach(a=>ev.push({d:a.d,ts:a.ts||0,t:a.ty==='done'?'Lección completada':'Lección iniciada',x:esc(String(a.k).split('|')[1])}));
 return ev.filter(e=>e.d).sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:b.ts-a.ts).slice(0,5)}
function refData(){const d=S.apt.SKBG||{},m=String(d.rwy||'').match(/RWY\s*(\d{2})\s*\/\s*(\d{2})/i),e=String(d.elev||'').match(/(\d[\d.,]*)\s*ft/i),a=allApt().find(x=>x.icao==='SKBG')||{};
 return{icao:a.icao||'SKBG',iata:a.iata||'',name:a.name||'',city:a.city||'',country:a.country||'',rwy:m?m[1]+' / '+m[2]:'—',elev:e?e[1]+' FT':'—'}}
function dashHero(t,cur){
 if(!cur)return `<div class="card hero dh"><div class="cap">FORMACIÓN AERONÁUTICA</div><h2 class="dh-title" style="margin-top:12px">Plan de formación completado</h2><p class="dh-desc">Has marcado todas las lecciones como completadas. Repasa la Academia o practica con exámenes.</p><div class="bar"><i style="width:100%"></i></div><button class="btn" onclick="go('acad')">Ir a la Academia</button></div>`;
 const ph=cur.p,done=ph.t.filter(q=>S.done[key(ph.id,q)]).length,i=TOPIC_INFO[cur.t]||{d:''};
 return `<div class="card hero dh"><div class="row" style="justify-content:space-between"><div class="cap">FORMACIÓN AERONÁUTICA</div><span class="tag">FASE ${ph.id}</span></div>
  <div class="dh-main"><div><div class="dh-lbl">Lección actual</div><h2 class="dh-title">${esc(cur.t)}</h2>${i.d?`<p class="dh-desc">${esc(i.d)}</p>`:''}
  <div class="dh-meta"><span class="mono">${done} de ${ph.t.length}</span> temas completados · Fase ${ph.id} — ${esc(ph.n)}</div></div>
  <div class="dh-pct"><div class="big">${t}%</div><div class="cap">PROGRESO GENERAL</div></div></div>
  <div class="bar"><i style="width:${t}%"></i></div><button class="btn" onclick="openTopic(${ph.id},${cur.i})">Continuar entrenamiento</button></div>`}
function dashNext(x,cur){
 if(!x)return `<div class="card nx"><div class="cap">PRÓXIMO ENTRENAMIENTO</div><p class="nx-desc" style="margin-bottom:0">${cur?'Esta es tu última lección pendiente del plan.':'No quedan lecciones pendientes en el plan.'}</p></div>`;
 const i=TOPIC_INFO[x.t]||{tags:'',d:''},ok=!!LESSONS[x.t];
 return `<div class="card nx"><div class="row" style="justify-content:space-between"><div class="cap">PRÓXIMO ENTRENAMIENTO</div><span class="tag">FASE ${x.p.id}</span></div>
  <div class="nx-row"><div class="nx-num mono">${String(x.n).padStart(2,'0')}</div><div><h3 class="nx-title">${esc(x.t)}</h3>${i.tags?`<div class="nx-tags mono">${esc(i.tags)}</div>`:''}</div></div>
  ${i.d?`<p class="nx-desc">${esc(i.d)}</p>`:''}
  <div class="row" style="justify-content:space-between"><span class="tag ${ok?'real':''}">${ok?'DISPONIBLE':'PRÓXIMAMENTE'}</span><button class="btn g" onclick="openTopic(${x.p.id},${x.i})">Estudiar</button></div></div>`}
function dashAct(){const ev=recent();
 if(!ev.length)return `<div class="card"><div class="act-t">Sin actividad registrada todavía.</div><div class="act-x">Cuando estudies una lección, presentes un examen o registres un vuelo, aparecerá aquí.</div></div>`;
 return `<div class="card">`+ev.map(e=>`<div class="act-i"><div class="act-d mono">${fmtD(e.d)}</div><div><div class="act-t">${e.t}</div><div class="act-x">${e.x}</div></div></div>`).join('')+(S.logs.length?'':`<div class="act-i act-none"><div class="act-d mono">—</div><div class="act-x">Sin vuelos registrados todavía.</div></div>`)+`</div>`}
function dashRef(){const r=refData(),c=(l,v,k)=>`<div><div class="cap">${l}</div><div class="mono ${k||''}">${esc(v)}</div></div>`;
 return `<div class="card ref"><div><div class="cap">REFERENCIA OPERACIONAL</div><div class="mono code">${esc(r.icao)}</div><h3 style="margin:2px 0">${esc(r.name)}</h3><div style="color:var(--mu)">${esc(r.city)}, ${esc(r.country)}</div></div>
  <div class="ref-d">${c('ICAO',r.icao,'am')}${c('IATA',r.iata)}${c('PISTA',r.rwy)}${c('ELEVACIÓN',r.elev)}</div>
  <button class="btn g" onclick="go('apt');aptSel='SKBG';render()">Abrir ficha de estudio</button></div>`}
document.head.insertAdjacentHTML('beforeend','<style>.dash h2{margin:26px 0 12px}.dh{padding:24px}.dh-main{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-top:14px}.dh-lbl{color:var(--mu);font-size:13px}.dh-title{margin:4px 0 8px;font-size:clamp(22px,3vw,28px);line-height:1.2}.dh-desc{margin:0 0 10px;max-width:62ch;opacity:.92}.dh-meta{color:var(--mu);font-size:13.5px}.dh-meta .mono{color:var(--am)}.dh-pct{text-align:right;flex-shrink:0}.dh-pct .big{font-size:44px;line-height:1}.dash .hero .bar{margin:16px 0}.stats4{display:grid;gap:14px;grid-template-columns:repeat(4,minmax(0,1fr))}.stat{display:block;width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer;transition:border-color .15s,background .15s}.stat:hover{border-color:var(--am);background:var(--pnl2)}.stat:focus-visible{outline:2px solid var(--bl);outline-offset:2px}.stat .big{margin-top:8px}.stat-sub{color:var(--mu);font-size:13px;margin-top:6px}.dh-flt{font-size:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dh-u{font-size:16px;color:var(--mu)}.dcols{display:grid;gap:18px;grid-template-columns:1fr 1fr;align-items:start}.nx-row{display:flex;gap:14px;align-items:center;margin:12px 0 8px}.nx-num{font-size:34px;line-height:1;color:var(--am)}.nx-title{margin:0;font-size:16px;letter-spacing:.06em;text-transform:uppercase}.nx-tags{font-size:12.5px;color:var(--mu);margin-top:3px}.nx-desc{color:var(--mu);margin:6px 0 14px;font-size:14px}.act-i{display:flex;gap:14px;padding:10px 0;border-bottom:1px solid var(--ln)}.act-i:first-child{padding-top:0}.act-i:last-child{border-bottom:0;padding-bottom:0}.act-d{color:var(--am);min-width:56px;font-size:13px}.act-t{font-weight:600}.act-x{color:var(--mu);font-size:13.5px}.act-x .mono{color:var(--tx)}.act-none .act-d{color:var(--mu)}.ref{display:flex;flex-wrap:wrap;gap:18px 32px;align-items:center;justify-content:space-between}.ref .code{font-size:28px;color:var(--am);line-height:1.2}.ref-d{display:grid;grid-template-columns:repeat(4,auto);gap:6px 28px}.ref-d .mono{font-size:18px}.ref-d .am{color:var(--am)}.dash .btn.g{transition:border-color .15s,color .15s}.dash .btn.g:hover{border-color:var(--am);color:var(--am)}@media(max-width:1000px){.stats4{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:900px){.dcols{grid-template-columns:1fr}}@media(max-width:760px){.stats4{grid-template-columns:1fr}.dh-main{flex-direction:column;align-items:flex-start}.dh-pct{text-align:left}.ref-d{grid-template-columns:repeat(2,auto)}.dh{padding:18px}}</style>');
function toggle(k){S.done[k]=!S.done[k];S.act=S.act||[];if(S.done[k])S.act.push({k,ty:'done',d:today(),ts:Date.now()});else S.act=S.act.filter(a=>!(a.k===k&&a.ty==='done'));save();render()}
function openL(p,t){lesson={p,t};const k=key(p,t);S.act=S.act||[];if(LESSONS[t]&&!S.act.some(a=>a.k===k&&a.ty==='start')){S.act.push({k,ty:'start',d:today(),ts:Date.now()});save()}render()}
function go(v){view=v;lesson=null;if(v!=='exam')examState=null;render();scrollTo(0,0)}
function render(){
 if(view==='exam'&&examState&&examState.i>=EXAM.length&&!examState.saved){examState.saved=1;S.exams.push({d:new Date().toLocaleDateString('es-CO'),iso:today(),ts:Date.now(),s:examState.s,n:EXAM.length});save()}
 $('#nav').innerHTML=`<div class="brand">${ic('plane')}<span class="lb">Flight Academy</span></div>`+NAV.map(n=>`<button class="${view===n[0]?'on':''}" onclick="aptSel=null;go('${n[0]}')">${ic(n[2])}<span class="lb">${n[1]}</span></button>`).join('')+`<button id="col" onclick="$('#nav').classList.toggle('c')" style="margin-top:auto"><span class="lb">Contraer menú</span></button>`;
 $('#main').innerHTML=`<section class="sec">${V[view]()}</section>`;
 if(view==='navi')calcW();if(view==='met')decM();if(view==='lib'||view==='car')libInit()}
render();
if(!S.name)welcome(false); // primer ingreso: pedir nombre y mostrar el aviso