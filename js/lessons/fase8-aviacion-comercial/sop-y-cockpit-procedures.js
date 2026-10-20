// Fase 8 — Aviación comercial  ·  Lección: SOP y cockpit procedures
// Conceptos y criterios del A320neo V2 de Microsoft Flight Simulator 2024. La ejecución paso a paso está en Simulador.
// IMÁGENES: images/fase8-aviacion-comercial/sop-y-cockpit-procedures/
(function(){
const IMG={energia_externa:'conectar_energia_externa.png',oxigeno:'Conectar_oxigeno.png',inerciales:'Inerciales.png',abrir_puertas:'abrir_puertas.png',cargar:'como_cargar.png',boton_clr:'boton_CLR.png',flight_number:'fly_number.png',boton_block:'botom_block.png',apu_bleed:'apu_bleed.png',solicitud_ifr:'solicitud_IFR.png',altitud_ap:'altitud_autopilot.png',boton_sync:'boton_SYNC.png',boton_calculate:'boton_calculate.png',velocidades:'velocidades.png',ths:'THS.png',confirm_to:'confirm.png',aeropuerto_salida:'aeropuerto_salida.png',departure:'departure.png',return_btn:'return.png',llegada:'llegada.png',appr:'APPR.png',via_star:'NINO6C.png',trayecto:'trayecto.png',pantalla_trayecto:'pantalla_trayecto.png',bombas:'bombas.png',start:'start.png',meteorologia:'meteorologia.png',verificar:'verificar.png',frenos_auto:'frenos_automaticos.png',fly_director:'fly_director.png',ta_meteorologia:'mete.png',presion_estandar:'presion_estandar.png'};
const P=(k,alt)=>fig(IMG[k]||'',alt);

LESSONS['SOP y cockpit procedures']={lvl:'Avanzado',min:30,svg:false,body:`
<div class="key"><b>Airbus A320neo V2 de Microsoft Flight Simulator 2024.</b> Esta lección explica el porqué de cada fase; el paso a paso se practica en la sección Simulador. Referencias: manual y Quick Reference Card (QRC) del A320neo V2 publicados en flightsimulator.com/aircraft-manuals. No es el SOP de una aerolínea: para operar un avión real se usan el FCOM y el manual de la compañía.</div>

<h3>1. Cold &amp; Dark y energía</h3>
<p>En <b>Cold &amp; Dark</b> el avión está sin energía y sin sistemas activos. Antes de energizarlo conviene confirmar que los mandos están en una posición conocida: spoilers retraídos y desarmados, flaps en 0, palancas de potencia en IDLE y limpiaparabrisas apagados.</p>
<ul>
<li><b>Baterías (BAT 1 y BAT 2)</b> — dan la energía inicial. Con baterías cargadas el APU puede arrancar sin energía externa.</li>
<li><b>Energía externa (EXT PWR)</b> — la GPU aporta electricidad, no aire para arrancar motores. Solo se conecta cuando aparece disponible (AVAIL).</li>
<li><b>APU</b> — se enciende con APU MASTER SW y APU START; el ECAM confirma cuándo está disponible (AVAIL). Suministra electricidad y aire.</li>
<li><b>ADIRS</b> — los tres selectores van a NAV para iniciar la alineación de las referencias inerciales; el avance se ve en el ECAM. Mantén el avión inmóvil mientras alinea.</li>
<li><b>Oxígeno de la tripulación (CREW SUPPLY)</b> y las señales del panel superior forman parte de la preparación de cabina.</li>
</ul>
${P('energia_externa','Energía externa (EXT PWR)')}
${P('oxigeno','Oxígeno de la tripulación')}
${P('inerciales','Selectores ADIRS en NAV')}

<h3>2. Preparación de cabina: EFB y MCDU</h3>
<p>La tablet (EFB) controla los servicios en tierra, la carga y los cálculos de despegue. El MCDU recibe esos datos y debe coincidir con ellos.</p>
${P('abrir_puertas','Control de puertas en la tablet (Ground)')}
${P('cargar','Carga de combustible, pasajeros y equipaje')}
<ul>
<li><b>INIT A</b> — datos del vuelo: aeropuertos, número de vuelo y alineación.</li>
<li><b>INIT B</b> — pesos (ZFW/ZFWCG) y combustible (BLOCK). Un peso mal introducido altera todos los cálculos de rendimiento posteriores.</li>
<li><b>Datos de despegue</b> — la tablet calcula V1, VR, V2, temperatura FLEX, flaps y THS para las condiciones del vuelo. Los valores de las capturas son ejemplos: cada vuelo tiene los suyos. Si el cálculo da error, revisa peso, pista y condiciones.</li>
<li><b>PERF</b> — se introducen los datos calculados y se confirma con CONFIRM TO DATA.</li>
</ul>
${P('boton_block','Botones ZFW/ZFWCG y BLOCK en INIT B')}
${P('solicitud_ifr','Solicitud de autorización IFR')}
${P('boton_calculate','Datos de despegue calculados y enviados al FMGS')}
${P('velocidades','Página PERF con V1, VR y V2 (valores de ejemplo)')}
${P('ths','Datos de rendimiento con FLEX y THS (valores de ejemplo)')}
${P('confirm_to','Página PERF confirmada')}

<h3>3. Plan de vuelo (F-PLN)</h3>
<p>La ruta se programa con salida (pista y SID), llegada (STAR y aproximación) y los puntos intermedios. Compara siempre lo programado con la autorización ATC y con las publicaciones aeronáuticas vigentes del aeropuerto.</p>
${P('aeropuerto_salida','Plan de vuelo con la pista de salida')}
${P('departure','Página DEPARTURE')}
${P('llegada','Aeropuerto de llegada en el plan de vuelo')}
${P('appr','Selección de la aproximación (APPR)')}
${P('via_star','Selección de VIA y STAR')}
<ul>
<li>Revisa waypoint a waypoint el trayecto y sus restricciones de altitud y velocidad.</li>
<li>El STAR solo se selecciona si el aeropuerto de llegada tiene procedimiento de llegada para tu ruta.</li>
</ul>
${P('trayecto','Controles de la pantalla de navegación para revisar el trayecto')}
${P('pantalla_trayecto','Trayecto visto en la pantalla de navegación')}

<h3>4. Before Start y arranque de motores</h3>
<p>El QRC oficial agrupa estas comprobaciones en la lista <b>Before Start</b>: cabina preparada, ACARS INIT, señales (ON/AUTO), ADIRS en NAV, cantidad de combustible, datos de despegue, referencia barométrica, puertas y ventanas cerradas, beacon ON, palancas de potencia en IDLE, freno de estacionamiento y transpondedor según se requiera.</p>
<ul>
<li><b>APU BLEED</b> — aporta el aire que necesitan los motores para arrancar.</li>
<li><b>Bombas de combustible</b> — deben estar encendidas antes del arranque.</li>
<li><b>Selector de modo de motor</b> — se pasa a IGN/START y cada motor se arranca con su conmutador ENG MASTER, observando los parámetros en el ECAM hasta que estabilice.</li>
</ul>
${P('apu_bleed','APU BLEED')}
${P('bombas','Panel de combustible')}
${P('start','Selector de modo de motor en IGN/START')}
${P('verificar','Transpondedor: comprueba que el código coincide con el asignado por ATC')}

<h3>5. After Start y Before Takeoff</h3>
<p>Tras el arranque, el QRC pide revisar antihielo según se requiera, el estado en el ECAM, el trim de cabeceo, el trim de timón a cero y confirmar que no hay equipo de tierra cerca.</p>
<p>Antes del despegue, la lista Before Takeoff incluye: mandos de vuelo e instrumentos comprobados, briefing, flaps confirmados, V1/VR/V2 y FLEX anunciados, transpondedor y TCAS, memo del ECAM sin elementos azules para el despegue, <b>Auto Brake en MAX</b>, configuración de despegue en NORM, pista confirmada y tripulación de cabina avisada.</p>
${P('frenos_auto','Panel AUTO BRK')}
${P('fly_director','Botón del fly director')}
${P('ta_meteorologia','Transpondedor y TCAS')}
${P('meteorologia','Controles del radar meteorológico')}

<h3>6. Despegue y ascenso</h3>
<ul>
<li><b>V1</b> — velocidad de decisión: hasta V1 se puede rechazar el despegue; a partir de V1 se continúa. No es una orden para subir el tren ni para conectar el piloto automático.</li>
<li><b>VR</b> — velocidad de rotación. <b>V2</b> — velocidad de seguridad en el despegue.</li>
<li><b>Tren</b> — se retrae al confirmar el ascenso positivo. La lista After Takeoff/Climb del QRC exige tren arriba, flaps retraídos, packs ON y referencia barométrica ajustada.</li>
<li><b>Flaps</b> — se retraen por pasos al alcanzar las velocidades de referencia que muestra el PFD; la secuencia depende de la configuración de despegue usada.</li>
<li><b>Piloto automático</b> — se conecta cuando se cumplen las condiciones del avión y del modo de vuelo.</li>
<li><b>Altitud en el FCU</b> — seleccionar una altitud no basta: el avión la captura según el modo activo.</li>
<li><b>Referencia barométrica</b> — se cambia a STD y a QNH en la altitud/nivel de transición publicado para el aeropuerto o indicado por el ATC; no existe un valor universal.</li>
</ul>
${P('altitud_ap','Panel FCU donde se selecciona la altitud')}
${P('presion_estandar','Selector de presión barométrica en STD')}

<h3>7. Descenso, aproximación y aterrizaje</h3>
<p>La <b>lista de aproximación</b> del QRC confirma briefing, ECAM, cinturones ON, referencia barométrica y MDA/DH ajustados. La <b>lista de aterrizaje</b> confirma tripulación avisada, auto thrust en SPEED u OFF, memo LDG sin elementos azules, <b>tren abajo</b>, señales, spoilers armados (ARM) y flaps ajustados.</p>
<ul>
<li>El tren se extiende como parte de la preparación de la aproximación, no solo al recibir la confirmación de aterrizaje.</li>
<li>Los <b>speed brakes</b> se usan según la trayectoria, la velocidad y sus limitaciones; no hay una posición fija que sirva para cualquier exceso de velocidad.</li>
<li>El <b>autobrake</b> se elige según la pista, las condiciones y el procedimiento aplicable.</li>
<li>El momento de pulsar <b>APPR</b> y de desconectar el piloto automático depende del tipo de aproximación, de los mínimos y de las capacidades del avión.</li>
<li>Una <b>aproximación estabilizada</b> mantiene configuración, velocidad y trayectoria estables antes de los criterios que fije el procedimiento aplicable.</li>
</ul>

<h3>8. Después de aterrizar y estacionamiento</h3>
<ul>
<li><b>After Landing</b> — flaps retraídos, spoilers desarmados, APU en marcha, radar y PWS apagados y luces exteriores según se requiera.</li>
<li><b>Parking</b> — APU BLEED ON, motores OFF, cinturones OFF, bombas de combustible OFF, freno y calzos según se requiera.</li>
<li><b>Securing</b> — ADIRS, oxígeno, APU BLEED y luces de emergencia en OFF, y por último APU y baterías.</li>
</ul>
`,
q:[
{p:'¿Qué significa V1?',o:['La velocidad a la que se retrae el tren','La velocidad de decisión: hasta ella se puede rechazar el despegue','La velocidad a la que se conecta el piloto automático','La velocidad de aproximación final'],a:1,e:'V1 es la velocidad de decisión de despegue. No es una orden para subir el tren ni para conectar el piloto automático.'},
{p:'Según el QRC oficial del A320neo, ¿cómo quedan los selectores ADIRS en la lista Before Start?',o:['OFF','ATT','NAV','Solo el 1 en NAV'],a:2,e:'La lista Before Start exige ADIRS en NAV: los tres selectores inician la alineación y el ECAM muestra su progreso.'},
{p:'¿Cuándo se retrae el tren tras el despegue?',o:['Al pasar V1','Antes de la rotación','Al confirmar el ascenso positivo','Cuando se pulsa APPR'],a:2,e:'La retracción del tren se vincula a la confirmación del ascenso positivo; la lista After Takeoff/Climb del QRC exige tren arriba.'},
{p:'En la lista Before Takeoff del QRC oficial, ¿en qué posición queda AUTO BRAKE?',o:['OFF','LO','MED','MAX'],a:3,e:'El QRC indica Auto Brake en MAX antes del despegue. Para el aterrizaje, la selección depende de la pista, las condiciones y el procedimiento aplicable.'},
{p:'Al revisar el plan de vuelo de salida, ¿qué se compara con lo que dio el ATC?',o:['Solo el combustible','La pista (RWY) y la SID mostradas en DEPARTURE','Solo el número de vuelo','El peso ZFW'],a:1,e:'En F-PLN → DEPARTURE aparecen RWY y SID: ambos deben coincidir con la autorización del ATC.'}
]};
})();