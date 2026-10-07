// Fase 8 — Aviación comercial  ·  Lección: SOP y cockpit procedures
// Guía personal de configuración del A320neo en Microsoft Flight Simulator.
// IMÁGENES: guarda cada archivo en images/fase8-aviacion-comercial/sop-y-cockpit-procedures/
// y escribe su nombre en la lista IMG de abajo (ej.: energia_externa:'energia_externa.png').
// Mientras un nombre quede vacío (''), la página muestra "Imagen pendiente".
(function(){
const IMG={energia_externa:'conectar_energia_externa.png',oxigeno:'Conectar_oxigeno.png',inerciales:'Inerciales.png',abrir_puertas:'abrir_puertas.png',cargar:'como_cargar.png',boton_clr:'boton_CLR.png',flight_number:'fly_number.png',boton_block:'botom_block.png',apu_bleed:'apu_bleed.png',solicitud_ifr:'solicitud_IFR.png',altitud_ap:'altitud_autopilot.png',boton_sync:'boton_SYNC.png',boton_calculate:'boton_calculate.png',velocidades:'velocidades.png',ths:'THS.png',confirm_to:'confirm.png',aeropuerto_salida:'aeropuerto_salida.png',departure:'departure.png',return_btn:'return.png',llegada:'llegada.png',appr:'APPR.png',via_star:'NINO6C.png',trayecto:'trayecto.png',pantalla_trayecto:'pantalla_trayecto.png',bombas:'bombas.png',start:'start.png',meteorologia:'meteorologia.png',verificar:'verificar.png',frenos_auto:'frenos_automaticos.png',fly_director:'fly_director.png',ta_meteorologia:'mete.png',presion_estandar:'presion_estandar.png'};
const P=(k,alt)=>fig(IMG[k]||'',alt);

LESSONS['SOP y cockpit procedures']={lvl:'Avanzado',min:30,svg:false,body:`
<div class="key"><b>Guía personal para Microsoft Flight Simulator.</b> Describe el A320neo con la tablet (EFB) del simulador. No es el SOP real de una aerolínea: para operar un avión real se usa el FCOM y el manual de la compañía.</div>

<h3>1. Revisión preliminar de cabina (Cold &amp; Dark)</h3>
<p>Antes de energizar la aeronave, verifica que los mandos estén en posición segura:</p>
<ul>
<li><b>Spoilers / aerofrenos</b> — desarmados y retraídos (palanca arriba).</li>
<li><b>Flaps</b> — en posición 0.</li>
<li><b>Palancas de potencia (throttles)</b> — en IDLE.</li>
<li><b>Palanca del tren de aterrizaje</b> — abajo (DOWN).</li>
<li><b>Limpiaparabrisas (wipers)</b> — en OFF.</li>
</ul>

<h3>2. Energización y Overhead Panel</h3>
<ul>
<li>Enciende las dos baterías (BAT 1 y BAT 2).</li>
<li>Conecta la energía externa (EXT PWR) si la GPU aparece disponible en verde en la tablet.</li>
</ul>
${P('energia_externa','Energía externa (EXT PWR)')}
<ul>
<li>Enciende las luces NAV/LOGO y las luces STROBE.</li>
<li>Arma las luces de emergencia (EMER EXIT LT) en ARM y deja NO SMOKING en AUTO.</li>
<li>Enciende el oxígeno de la tripulación (CREW SUPPLY).</li>
</ul>
${P('oxigeno','Conectar el oxígeno de la tripulación')}
<p><b>Encendido del APU</b></p>
<ul>
<li>Presiona APU MASTER SW, espera 3 segundos y luego presiona APU START.</li>
<li>Revisa en el ECAM el arranque hasta que aparezca AVAIL.</li>
</ul>
<p><b>Alineamiento de inerciales (ADIRS)</b></p>
<ul>
<li>Gira a la posición NAV los selectores 1, 2 y 3. Espera a que la luz de cada uno se apague antes de pasar al siguiente.</li>
<li>Orden en el panel: el de la izquierda es el 1, el del medio es el 3 y el de la derecha es el 2.</li>
</ul>
${P('inerciales','Selectores ADIRS 1, 3 y 2 en NAV')}

<h3>3. Carga, MCDU y datos de despegue</h3>
<p><b>EFB (tablet) — Ground</b></p>
<ul>
<li>Abre las puertas desde la pestaña de servicios en tierra (Ground), conecta la pasarela y carga el combustible, los pasajeros y la carga útil deseados.</li>
</ul>
${P('abrir_puertas','Abrir puertas desde Ground')}
${P('cargar','Cargar combustible, pasajeros y carga')}
<p><b>MCDU — página INIT A</b></p>
<ul>
<li>Primero limpia los mensajes del arranque con el botón CLR. Cuando la pantalla quede en blanco, pulsa INIT.</li>
</ul>
${P('boton_clr','Botón CLR del MCDU')}
<ul>
<li>Escribe el número de vuelo (cualquier número de tres dígitos) y insértalo con el botón al lado de FLT NBR.</li>
</ul>
${P('flight_number','Número de vuelo en INIT A')}
<p><b>MCDU — página INIT B (pesos)</b></p>
<ul>
<li>Pulsa el botón al lado de ZFW/ZFWCG: cambian los números iniciales por los de la carga. Después pulsa el botón al lado de BLOCK.</li>
</ul>
${P('boton_block','Botones ZFW/ZFWCG y BLOCK')}
<p><b>Antes de pasar al despegue</b></p>
<ul>
<li>Conecta el APU BLEED.</li>
</ul>
${P('apu_bleed','Botón APU BLEED')}
<ul>
<li>Conecta SEAT BELTS (cinturones de pasajeros).</li>
<li>Desconecta la potencia de tierra (EXT PWR) y desactiva el toggle GPU en la pestaña Ground de la tablet.</li>
</ul>

<h3>4. Performance / Takeoff (EFB y MCDU)</h3>
<ul>
<li>En la tablet ve a la pestaña Takeoff. Antes debes pedir al ATC la autorización IFR.</li>
</ul>
${P('solicitud_ifr','Solicitud de autorización IFR')}
<ul>
<li>Inserta la altitud inicial en el piloto automático (en este ejemplo, 10000 ft).</li>
</ul>
${P('altitud_ap','Altitud inicial en el piloto automático')}
<ul>
<li>En Takeoff pulsa SYNC para que se llenen los datos del clima y de la pista.</li>
</ul>
${P('boton_sync','Botón SYNC')}
<ul>
<li>Pulsa CALCULATE. Si sale un error, lo más probable es que el avión pese demasiado para una pista corta: hay que reducir peso.</li>
<li>Cuando genere los datos restantes, pulsa SEND TO FMGS.</li>
</ul>
${P('boton_calculate','Botón CALCULATE')}
<p><b>MCDU — página PERF</b></p>
<ul>
<li>Limpia los mensajes y pulsa PERF.</li>
<li><b>V1, VR y V2</b> — escribe los valores que da la tablet.</li>
</ul>
${P('velocidades','Velocidades V1, VR y V2')}
<ul>
<li><b>FLEX to temp</b> (ej. 38 °C) — escribe la temperatura FLEX que indica la tablet.</li>
<li><b>Flaps / THS trim</b> (ej. 1 / 0.7 DN) — los flaps serán 1 y el THS lo da la tablet en la misma sección del FLEX.</li>
</ul>
${P('ths','Flaps y THS trim en PERF')}
<ul>
<li>Pulsa CONFIRM TO DATA. Debe quedar como en la imagen.</li>
</ul>
${P('confirm_to','Página PERF confirmada')}

<h3>5. Plan de vuelo (F-PLN)</h3>
<p><b>Salida</b></p>
<ul>
<li>Revisa la SID asignada por el ATC y la ruta en el MCDU. Pulsa F-PLN.</li>
<li>Pulsa el primer botón, donde sale la pista de salida, y luego DEPARTURE. Debe aparecer RWY con la pista y SID con sus datos: compáralos con lo que dio el ATC.</li>
</ul>
${P('aeropuerto_salida','Aeropuerto de salida en F-PLN')}
${P('departure','Página DEPARTURE')}
${P('return_btn','Botón RETURN')}
<p><b>Llegada</b></p>
<ul>
<li>Regresa hasta la pantalla con la información de la pista de salida y entra a la última opción (aeropuerto de llegada). Luego pulsa ARRIVAL y compara con el plan de vuelo.</li>
<li>En el MCDU deben estar los tres datos <b>APPR – VIA – STAR</b>. El STAR solo se usa si tienes procedimiento de llegada; si no, déjalo quieto.</li>
<li>Para buscar el VIA, pulsa el primer botón (en este ejemplo ILS30) y usa la flecha hacia arriba hasta encontrar el que aparece en tu plan de vuelo (en este ejemplo, NINO6C).</li>
<li>Pulsa &lt;VIAS, elige el que aparece en tu plan de vuelo y pulsa INSERT.</li>
</ul>
${P('llegada','Aeropuerto de llegada')}
${P('appr','Selección de APPR')}
${P('via_star','VIA/STAR en el plan de vuelo')}
<p><b>Revisar el trayecto</b></p>
<ul>
<li>Configura la pantalla como en la imagen. Con la flecha hacia arriba del MCDU, estando en el plan de vuelo, ve subiendo para ver cada waypoint hasta llegar al aeropuerto de llegada.</li>
<li>Al terminar la revisión, deja los controles como estaban al principio.</li>
</ul>
${P('trayecto','Configuración para revisar el trayecto')}
${P('pantalla_trayecto','Cómo debe verse el trayecto')}
<div class="key"><b>Error con waypoint:</b> la solución se agregará en una versión futura de la página.</div>

<h3>6. Arranque de motores y pushback</h3>
<ul>
<li>Conecta el APU BLEED en el panel superior y enciende la luz BEACON.</li>
<li>Enciende todas las bombas de combustible (fuel pumps).</li>
</ul>
${P('bombas','Bombas de combustible')}
<ul>
<li>Cambia el selector de motor a IGN/START.</li>
</ul>
${P('start','Selector de motor en IGN/START')}
<ul>
<li>Pide autorización de rodaje (pushback y arranque).</li>
<li>Cierra todas las puertas con CLOSE ALL en Ground, en la tablet.</li>
<li>Quita el freno de estacionamiento y solicita el pushback.</li>
</ul>
<p><b>Arranque</b></p>
<ul>
<li>Mueve el conmutador del motor 2 a ON mientras se realiza el pushback.</li>
<li>Pon el freno de estacionamiento.</li>
<li>Mueve el conmutador del motor 1 a ON y espera a que estabilice.</li>
<li>Mientras arranca el motor 1, ajusta la vista meteorológica.</li>
</ul>
${P('meteorologia','Vista meteorológica')}
${P('verificar','Verificar el código del ATC')}
<ul>
<li>Verifica que el código sea el mismo que envió el ATC y pasa al lado izquierdo las dos ruedas a ON (la A y la C).</li>
</ul>
<p><b>Después del arranque</b></p>
<ul>
<li>Arma los spoilers (palanca hacia arriba) y pon AUTO BRAKE en MAX.</li>
</ul>
${P('frenos_auto','Autobrake en MAX')}
<ul>
<li>Enciende RWY TURN OFF y pon NOSE en TAXI.</li>
<li>Realiza la prueba de mandos de vuelo en la página FLT CTL del ECAM.</li>
<li>Ajusta los flaps en posición 1.</li>
<li>Apaga el APU BLEED y el APU MASTER SW.</li>
<li>Regresa el selector de encendido a NORM.</li>
</ul>

<h3>7. Rodaje y preparación para el despegue</h3>
<ul>
<li>Solicita autorización de despegue.</li>
<li>Conecta el fly director.</li>
</ul>
${P('fly_director','Fly director')}
<ul>
<li>Activa el botón CSTR que está arriba del fly director y deja el control como en la imagen.</li>
</ul>
${P('ta_meteorologia','Configuración del radar y TA')}
<ul>
<li>Ajusta el THS al trim: el THS está en la página de Takeoff y el trim es la rueda que está al lado del acelerador.</li>
<li>Luces LAND en ON y NOSE en TO.</li>
<li>Ve al inicio de la pista.</li>
</ul>

<h3>8. Despegue y ascenso</h3>
<ul>
<li>Despega.</li>
<li>Al pasar V1 se activa el piloto automático y se sube el tren de aterrizaje.</li>
<li>Cuando en el velocímetro se pase la <b>S</b>, se suben los flaps.</li>
<li>Cuando debajo del altímetro empiece a parpadear un dato, cambia la presión barométrica a estándar (igual que el copiloto).</li>
</ul>
${P('presion_estandar','Presión barométrica estándar (STD)')}
<ul>
<li>Cuando el ATC indique mantenerse a un FL, pon esa altitud en el piloto automático.</li>
<li>Al pasar 10000 ft apaga las luces RWY TURN OFF, LAND y NOSE.</li>
<li>En la segunda rueda debajo de los botones de la fila CSTR, ponla en 40. Más arriba apaga las luces de cinturones.</li>
<li>Súbela a 160 y, en crucero, al máximo en la velocidad de crucero.</li>
</ul>

<h3>9. Descenso, aproximación y aterrizaje</h3>
<p><b>Preparar la llegada en el MCDU</b></p>
<ul>
<li>Limpia los mensajes.</li>
<li>Verifica la aproximación: en el plan de vuelo entra a la última opción (el aeropuerto) y comprueba que APPR, VIA y STAR coincidan con lo que pasó el ATC.</li>
<li>Si el STAR o el VIA están mal, entra a la opción donde sale la pista de aterrizaje y selecciona el STAR y el VIA correctos.</li>
<li>Cambia la altitud de descenso en el piloto automático.</li>
</ul>
<p><b>Descenso</b></p>
<ul>
<li>A 10000 ft enciende las luces de cinturones y de aterrizaje y pon la velocidad manual en 250 (rueda al lado del botón SPD MACH).</li>
<li>Si va muy rápido, baja los spoilers a la mitad para ayudar a reducir velocidad. Cuando el punto verde del altímetro se nivele, quita los spoilers.</li>
<li>Enciende las luces RWY TURN OFF y LAND.</li>
<li>Frenos automáticos en MED (medio).</li>
<li>Baja la velocidad manual a 245 y sigue reduciendo hasta la raya del velocímetro que permite poner los flaps.</li>
<li>Al pasar 6000 ft pon la presión barométrica en manual con el último valor que dio el ATC.</li>
<li>Según la velocidad se ponen los flaps: el avión tiene una tablita con velocidad y flaps.</li>
</ul>
<p><b>Aproximación y aterrizaje</b></p>
<ul>
<li>Cuando vayas a interceptar la senda ILS, pulsa el botón APPR.</li>
<li>Baja la altitud de forma constante al acercarte.</li>
<li>Cuando confirmen el aterrizaje, baja el tren y confirma que las tres luces estén en verde.</li>
<li>A unos 500 ft desactiva el piloto automático.</li>
<li>Al tocar tierra: frenos, reversa y spoilers.</li>
</ul>

<h3>10. Después de aterrizar</h3>
<ul>
<li>Apaga las luces LAND.</li>
<li>Pon el freno de estacionamiento.</li>
<li>Pasillo de pasajeros.</li>
<li>Conecta la GPU.</li>
<li>Apaga los motores y las luces.</li>
<li>Espera a que se desocupe el avión y entonces apaga el avión.</li>
</ul>

<div class="key"><b>Para verificar con tu manual del add-on.</b> Tres puntos de esta guía conviene contrastarlos: (1) el momento de activar el piloto automático y subir el tren (normalmente el tren sube con ascenso positivo y el AP se conecta más arriba, no al pasar V1); (2) la altitud donde se cambia a QNH en el descenso depende de la altitud/nivel de transición del aeropuerto, no de un valor fijo de 6000 ft (en SKBG, por ejemplo, la altitud de transición publicada es 18000 ft); (3) los valores de velocidad y luces por debajo de 10000 ft son los de tu ejemplo.</div>
`,
q:[
{p:'¿Qué motor se arranca primero en la guía?',o:['El motor 1','El motor 2','Los dos a la vez','Ninguno: se arrancan con la GPU'],a:1,e:'Se mueve el conmutador del motor 2 a ON durante el pushback y después el del motor 1.'},
{p:'Antes del despegue, ¿en qué posición se pone AUTO BRAKE?',o:['OFF','LO','MAX','MED'],a:2,e:'Con los spoilers armados, el autobrake va en MAX para el despegue. En el aterrizaje se usa MED (medio).'},
{p:'¿Cómo se alinean los inerciales (ADIRS)?',o:['Se dejan en OFF','Se giran a NAV, esperando que se apague la luz de cada uno antes de pasar al siguiente','Se giran a ATT','Se alinean solo con el APU apagado'],a:1,e:'Los selectores 1, 2 y 3 se pasan a NAV uno por uno, esperando a que se apague la luz de cada uno.'},
{p:'Al revisar el plan de vuelo de salida, ¿qué se compara con lo que dio el ATC?',o:['Solo el combustible','La pista (RWY) y la SID mostradas en DEPARTURE','Solo el número de vuelo','El peso ZFW'],a:1,e:'En F-PLN → DEPARTURE aparecen RWY y SID: ambos deben coincidir con la autorización del ATC.'},
{p:'En la página INIT A, ¿qué se hace antes de escribir el número de vuelo?',o:['Pulsar PERF','Limpiar los mensajes con CLR y pulsar INIT','Armar los spoilers','Conectar la GPU'],a:1,e:'Se limpian los mensajes del arranque con CLR y, con la pantalla en blanco, se pulsa INIT.'}
]};
})();