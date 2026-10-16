// My Flight Academy - Simulador: entrenador interactivo de checklists
// Sustituye a V.sim de app.js. Estado en S.sim = {ac, mode, chk:{idPaso:1}} (mismo localStorage 'fa_state').
// Las casillas son una marca manual del usuario: no verifican nada en el simulador.
// Para añadir un paso: agrega un objeto a la fase correspondiente de DATA (campos opcionales; lo que falte no se muestra o se marca "pendiente").
(function(){
'use strict';
Object.assign(ICONS,{chev:'<path d="m6 9 6 6 6-6"/>',rst:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'});
const A='fase8-aviacion-comercial/sop-y-cockpit-procedures/',C='fase1-fundamentos-de-aviacion/';
const SRC_A='Guía personal del usuario (lección «SOP y cockpit procedures»): acciones y capturas del simulador. Ubicaciones y propósitos: conocimiento general del A320, sin contrastar con el FCOM ni con el manual del add-on.';
const SRC_C='Adaptación didáctica general. Referencia real: POH de la variante (Sección 4, Procedimientos normales), que no está incluido en el proyecto. Sin validar con el POH ni con MSFS 2024.';
const W1='Verifica con el manual del add-on el momento de subir el tren y conectar el piloto automático: normalmente el tren sube con ascenso positivo y el AP se conecta más arriba, no al pasar V1.';
const W2='La altitud donde se pasa a QNH depende de la altitud/nivel de transición del aeropuerto, no de un valor fijo de 6000 ft (en SKBG la altitud de transición publicada es 18000 ft).';
const DATA=[
{id:'c172',n:'Cessna 172',src:SRC_C,note:'Procedimientos de referencia propios de cada variante (G1000 o instrumentos analógicos). Esta lista no asume una variante concreta.',ph:[
 {id:'pre',n:'Inspección pre-vuelo',pend:'Pendiente de completar: faltan la inspección exterior completa y la de cabina, que deben tomarse del POH de la variante.',s:[
  {id:'c-pre-tren',n:'Neumáticos y tren principal',cat:'Exterior',do:'Revisa cada neumático (desgaste, cortes, aspecto de la presión) y el estado del tren y de los frenos.',why:'Un neumático o un freno en mal estado afecta al rodaje, al despegue y al aterrizaje.',at:'En el recorrido de inspección exterior alrededor del avión; no es un control de cabina.',img:[[C+'partes-del-avion/tren_aterrizaje.JPG','Neumático y pata del tren de aterrizaje (foto de la lección «Partes del avión»). Imagen de referencia, no de la variante de MSFS.']]},
  {id:'c-pre-flaps',n:'Flaps (inspección exterior)',cat:'Exterior',do:'Comprueba que los flaps y sus articulaciones están en buen estado y sin daños visibles.',img:[[C+'partes-del-avion/Flaps_cessna.jpg','Flap de una Cessna 172 vista desde fuera. Referencia de la superficie, no del selector de cabina.']]}]},
 {id:'start',n:'Antes de arrancar',s:[
  {id:'c-st-freno',lg:'Cessna 172Before startFreno de estacionamiento',n:'Freno de estacionamiento',cat:'Cabina',do:'Comprueba que el freno de estacionamiento está puesto.',why:'Evita que el avión se mueva al aplicar potencia durante el arranque.',at:'Zona inferior izquierda del panel; la posición exacta depende de la variante.'},
  {id:'c-st-master',lg:'Cessna 172Before startMaster (batería)',n:'Master (batería)',cat:'Eléctrico',do:'Pon el interruptor MASTER en ON. Mantén el interruptor de aviónica en OFF hasta después del arranque del motor.',why:'Da corriente al avión; la aviónica se protege de los picos eléctricos del arranque.'},
  {id:'c-st-comb',lg:'Cessna 172Before startCombustible',n:'Combustible',cat:'Combustible',do:'Comprueba la cantidad de combustible y pon el selector en BOTH (si tu variante lo tiene).',why:'Confirma que hay combustible suficiente y que el motor se alimenta de ambos depósitos.'},
  {id:'c-st-ctrl',lg:'Cessna 172Before startControles libres',n:'Controles libres',cat:'Controles',do:'Mueve yoke y pedales y comprueba que se mueven libres y en el sentido correcto.',why:'Detecta bloqueos o restricciones antes de rodar.',at:'Yoke frente a cada asiento; pedales en el suelo de la cabina.',img:[[C+'controles-de-vuelo/cabina_cessna.jpg','Yoke, pedales y panel de instrumentos de una Cessna 172 (esquema con etiquetas). Sirve para ubicarlos; no muestra interruptores concretos.']]},
  {id:'c-st-puertas',lg:'Cessna 172Before startPuertas y cinturones',n:'Puertas y cinturones',cat:'Cabina',do:'Cierra y asegura las puertas y abróchate el cinturón.',why:'Evita que una puerta se abra en rodaje o despegue.'}]},
 {id:'to',n:'Antes del despegue',s:[
  {id:'c-to-flaps',lg:'Cessna 172Before takeoffFlaps',n:'Flaps',cat:'Controles',do:'Coloca los flaps en la posición que indique el procedimiento de despegue de tu variante y comprueba que coinciden con el selector.',warn:'La posición depende del tipo de despegue y del POH; aquí no se fija ningún valor.',img:[[C+'partes-del-avion/Flaps_cessna.jpg','Flap de una Cessna 172 (vista exterior). Referencia de la superficie, no del selector de cabina.']]},
  {id:'c-to-trim',lg:'Cessna 172Before takeoffTrim',n:'Trim',cat:'Controles',do:'Pon el compensador de profundidad (elevator trim) en la posición de despegue.',why:'Reduce la fuerza que debes hacer sobre el yoke al despegar.',at:'Rueda de trim en el pedestal central; puede variar según la variante.',img:[[C+'flaps-y-trim/trim_example.jpg','Esquema didáctico del elevator trim (lección «Flaps y Trim»). No es la cabina del simulador.']]},
  {id:'c-to-mezcla',lg:'Cessna 172Before takeoffMezcla y hélice',n:'Mezcla y régimen del motor',cat:'Motor',do:'Ajusta la mezcla según el procedimiento de tu variante y comprueba las RPM en la prueba de motor.',warn:'El nombre original del paso («Mezcla y hélice») se corrigió: el C172 de serie tiene hélice de paso fijo y no tiene palanca de hélice. En aeropuertos de gran elevación el POH indica un ajuste especial de la mezcla.'},
  {id:'c-to-instr',lg:'Cessna 172Before takeoffInstrumentos',n:'Instrumentos',cat:'Panel',do:'Comprueba que los instrumentos de motor están en sus rangos normales y que los de vuelo muestran valores coherentes.',img:[[C+'partes-del-avion/cabina_cessna.jpg','Instrumentos principales de una Cessna 172 (ilustración con etiquetas, no una captura de MSFS).']]},
  {id:'c-to-freq',lg:'Cessna 172Before takeoffFrecuencia de torre',n:'Frecuencia de torre',cat:'Radio',do:'Sintoniza la frecuencia de torre en COM y comprueba el volumen.',at:'Panel de radios/aviónica; depende de la variante.'}]},
 {id:'app',n:'Aproximación y aterrizaje',pend:'Pendiente de completar: aún no hay contenido validado para esta fase.',s:[]},
 {id:'post',n:'Después del vuelo',pend:'Pendiente de completar: aún no hay contenido validado para esta fase.',s:[]}]},
{id:'a320',n:'A320neo',src:SRC_A,note:'Basado en la guía personal para el A320neo de MSFS con la tablet (EFB). No es el SOP real de una aerolínea.',ph:[
 {id:'cd',n:'Cold & Dark',s:[
  {id:'a-cd-mandos',n:'Mandos en posición segura',cat:'Cabina',do:['Spoilers desarmados y retraídos','Flaps en 0','Palancas de potencia en IDLE','Palanca del tren en DOWN','Limpiaparabrisas en OFF'],why:'Parte de una configuración conocida antes de energizar el avión.',warn:'Tu guía usa «palanca arriba» tanto para spoilers retraídos como para armarlos: comprueba la diferencia en el simulador.'},
  {id:'a-cd-bat',lg:'A320neoCold & DarkBaterías',n:'Baterías',cat:'Overhead',do:'Enciende BAT 1 y BAT 2.',at:'Panel superior (overhead), sección eléctrica (ELEC).'},
  {id:'a-cd-ext',lg:'A320neoCold & DarkAlimentación externa',n:'Alimentación externa (EXT PWR)',cat:'Overhead',do:'Conecta EXT PWR si la GPU aparece disponible (en verde) en la tablet.',at:'Panel superior (overhead), sección eléctrica.',ms:'Primero comprueba en la tablet (pestaña Ground) que la GPU está disponible.',img:[[A+'conectar_energia_externa.png','Overhead con el cursor sobre el botón de energía externa (EXT PWR). Captura del simulador.']]},
  {id:'a-cd-luces',lg:'A320neoCold & DarkLuces de cabina',n:'Luces y señales',cat:'Overhead',do:['NAV/LOGO y STROBE encendidas','EMER EXIT LT en ARM','NO SMOKING en AUTO'],at:'Panel superior (overhead), secciones de luces exteriores y señales.'},
  {id:'a-cd-oxi',n:'Oxígeno de la tripulación',cat:'Overhead',do:'Enciende CREW SUPPLY.',at:'Panel superior (overhead), sección OXYGEN.',img:[[A+'Conectar_oxigeno.png','Panel de oxígeno con el cursor sobre CREW SUPPLY. Captura del simulador.']]},
  {id:'a-cd-apu',n:'APU',cat:'Overhead',do:'Pulsa APU MASTER SW, espera 3 segundos y pulsa APU START. Vigila el ECAM hasta que aparezca AVAIL.',at:'Panel superior (overhead), sección APU.'},
  {id:'a-cd-adirs',lg:'A320neoCold & DarkADIRS',n:'Inerciales (ADIRS)',cat:'Overhead',do:'Gira a NAV los selectores 1, 2 y 3, esperando a que se apague la luz de cada uno antes de pasar al siguiente. En el panel, de izquierda a derecha: 1, 3 y 2.',why:'Los sistemas inerciales necesitan alinearse para dar actitud y posición.',warn:'Verifica en el manual del add-on si hay que esperar entre selectores.',img:[[A+'Inerciales.png','Selectores ADIRS (IR1, IR3, IR2) en NAV. Captura del simulador.']]}]},
 {id:'cab',n:'Preparación de cabina (EFB)',s:[
  {id:'a-cb-puertas',n:'Abrir puertas',cat:'EFB',do:'Abre las puertas desde la pestaña de servicios en tierra (Ground) y conecta la pasarela.',ms:'Tablet EFB → pestaña Ground → control de puertas.',img:[[A+'abrir_puertas.png','Control de puertas en la tablet (EFB). Captura del simulador.']]},
  {id:'a-cb-carga',n:'Cargar combustible, pasajeros y carga',cat:'EFB',do:'Carga el combustible, los pasajeros y la carga útil deseados.',ms:'Tablet EFB → pestaña de carga (Payload).',img:[[A+'como_cargar.png','Pantalla de carga de la tablet (EFB). Captura del simulador.']]}]},
 {id:'mcdu',n:'Programación del MCDU',pend:'Pendiente: tu guía deja sin resolver el error por waypoint («se agregará en una versión futura»).',s:[
  {id:'a-mc-clr',n:'INIT A: limpiar mensajes (CLR) e INIT',cat:'MCDU',do:'Limpia los mensajes del arranque con CLR. Cuando la pantalla quede en blanco, pulsa INIT.',at:'MCDU, en el pedestal central.',img:[[A+'boton_CLR.png','MCDU con el botón CLR. Captura del simulador.']]},
  {id:'a-mc-fn',n:'INIT A: número de vuelo',cat:'MCDU',do:'Escribe un número de tres dígitos y pulsa el botón junto a FLT NBR.',img:[[A+'fly_number.png','Página INIT A con el número de vuelo. Captura del simulador.']]},
  {id:'a-mc-block',n:'INIT B: ZFW/ZFWCG y BLOCK',cat:'MCDU',do:'Pulsa el botón junto a ZFW/ZFWCG (cambian los números iniciales por los de la carga) y después el botón junto a BLOCK.',img:[[A+'botom_block.png','Botones ZFW/ZFWCG y BLOCK. Captura del simulador.']]},
  {id:'a-mc-ifr',n:'Autorización IFR del ATC',cat:'EFB / ATC',do:'Solicita la autorización IFR antes de entrar a la pestaña Takeoff de la tablet.',img:[[A+'solicitud_IFR.png','Ventana de comunicación con la autorización IFR. Captura del simulador.']]},
  {id:'a-mc-alt',n:'Altitud inicial en el piloto automático',cat:'FCU',do:'Inserta la altitud inicial que indicó el ATC (10000 ft en el ejemplo de tu guía).',at:'Panel FCU, bajo el parabrisas.',img:[[A+'altitud_autopilot.png','Franja panorámica del panel. El selector no se distingue bien: pendiente de sustituir por una captura más detallada.']]},
  {id:'a-mc-sync',n:'EFB Takeoff: SYNC',cat:'EFB',do:'Pulsa SYNC para llenar los datos de clima y pista.',img:[[A+'boton_SYNC.png','Pestaña Takeoff con el botón SYNC. Captura del simulador.']]},
  {id:'a-mc-calc',n:'EFB Takeoff: CALCULATE y SEND TO FMGS',cat:'EFB',do:'Pulsa CALCULATE y, cuando genere los datos, SEND TO FMGS.',warn:'Si da error, según tu guía lo más probable es exceso de peso para una pista corta: reduce el peso.',img:[[A+'boton_calculate.png','Datos enviados al FMGS. Captura del simulador.']]},
  {id:'a-mc-v',n:'PERF: V1, VR y V2',cat:'MCDU',do:'Limpia los mensajes, pulsa PERF y escribe V1, VR y V2 que da la tablet.',img:[[A+'velocidades.png','Página PERF con V1, VR y V2. Captura del simulador.']]},
  {id:'a-mc-ths',n:'PERF: FLEX y THS',cat:'MCDU',do:'Escribe la temperatura FLEX de la tablet. En Flaps/THS pon el flap 1 (ejemplo de tu guía) y el THS que da la tablet.',img:[[A+'THS.png','Datos de PERFORMANCE de la tablet (FLEX, V1, VR, V2, THS). Captura del simulador.']]},
  {id:'a-mc-conf',n:'PERF: CONFIRM TO DATA',cat:'MCDU',do:'Pulsa CONFIRM TO DATA; la página debe quedar como en la imagen.',img:[[A+'confirm.png','Página PERF confirmada. Captura del simulador.']]},
  {id:'a-mc-sid',n:'F-PLN: salida (pista y SID)',cat:'MCDU',do:'Pulsa F-PLN, el primer botón (pista de salida) y DEPARTURE. Compara RWY y SID con lo que dio el ATC.',img:[[A+'aeropuerto_salida.png','F-PLN con la pista de salida. Captura del simulador.'],[A+'departure.png','Página DEPARTURE. Captura del simulador.'],[A+'return.png','Pistas y SID disponibles, con RETURN. Captura del simulador.']]},
  {id:'a-mc-star',n:'F-PLN: llegada (APPR – VIA – STAR)',cat:'MCDU',do:'Entra al aeropuerto de llegada y pulsa ARRIVAL. Elige APPR y VIA (el STAR solo si hay procedimiento de llegada) y pulsa INSERT.',img:[[A+'llegada.png','F-PLN con el aeropuerto de llegada. Captura del simulador.'],[A+'APPR.png','Selección de APPR. Captura del simulador.'],[A+'NINO6C.png','Selección de VIA/STAR (NINO6C en el ejemplo). Captura del simulador.']]},
  {id:'a-mc-tray',n:'Revisar el trayecto',cat:'ND / MCDU',do:'Configura la pantalla como en la imagen y sube por el plan de vuelo waypoint a waypoint hasta el destino. Al terminar, deja los controles como estaban.',img:[[A+'trayecto.png','Panel de selección del ND para revisar el trayecto. Captura del simulador.'],[A+'pantalla_trayecto.png','Cómo debe verse el trayecto. Captura del simulador.']]}]},
 {id:'arr',n:'Antes del arranque',s:[
  {id:'a-ar-bleed',n:'APU BLEED y cinturones',cat:'Overhead',do:['Conecta APU BLEED','Conecta SEAT BELTS'],at:'Panel superior (overhead): aire acondicionado y señales.',img:[[A+'apu_bleed.png','Panel de aire con el cursor sobre APU BLEED. Captura del simulador.']]},
  {id:'a-ar-gpu',n:'Desconectar EXT PWR y GPU',cat:'Overhead / EFB',do:'Desconecta EXT PWR y desactiva el toggle GPU en la pestaña Ground de la tablet.'},
  {id:'a-ar-beacon',lg:'A320neoBefore startBeacon ON',n:'Beacon',cat:'Overhead',do:'Enciende la luz BEACON.',at:'Panel superior (overhead), luces exteriores.'},
  {id:'a-ar-bombas',n:'Bombas de combustible',cat:'Overhead',do:'Enciende todas las bombas de combustible.',at:'Panel superior (overhead), sección FUEL.',img:[[A+'bombas.png','Panel de combustible. Captura del simulador.']]},
  {id:'a-ar-ign',n:'Selector de motor en IGN/START',cat:'Pedestal',do:'Cambia el selector de modo de motor a IGN/START.',at:'Pedestal central, junto a los conmutadores ENG MASTER.',img:[[A+'start.png','Selector de modo de motor en IGN/START. Captura del simulador.']]},
  {id:'a-ar-puertas',lg:'A320neoBefore startPuertas cerradas',n:'Puertas cerradas',cat:'EFB',do:'Cierra todas las puertas con CLOSE ALL en la pestaña Ground de la tablet.'},
  {id:'a-ar-push',lg:'A320neoBefore startFreno de estacionamiento',n:'Freno de estacionamiento y pushback',cat:'Pedestal',do:'Pide autorización de pushback y arranque, quita el freno de estacionamiento y solicita el pushback.'}]},
 {id:'mot',n:'Arranque y después del arranque',s:[
  {id:'a-mo-m2',n:'Motor 2',cat:'Pedestal',do:'Mueve el conmutador del motor 2 a ON durante el pushback.'},
  {id:'a-mo-m1',n:'Freno y motor 1',cat:'Pedestal',do:'Pon el freno de estacionamiento, mueve el conmutador del motor 1 a ON y espera a que estabilice.'},
  {id:'a-mo-xpdr',n:'Vista meteorológica y código ATC',cat:'Pedestal',do:'Ajusta la vista meteorológica. Verifica que el código sea el mismo que envió el ATC.',warn:'Tu guía añade «pasa al lado izquierdo las dos ruedas a ON (la A y la C)»: redacción poco clara, pendiente de aclarar.',img:[[A+'meteorologia.png','Controles de la vista meteorológica. Captura del simulador.'],[A+'verificar.png','Panel del transpondedor con el código 1346 (ejemplo). Captura del simulador.']]},
  {id:'a-mo-brk',n:'Spoilers armados y AUTO BRAKE',cat:'Pedestal / panel central',do:'Arma los spoilers y pon AUTO BRAKE en MAX (valor de tu guía para el despegue).',img:[[A+'frenos_automaticos.png','Panel AUTO BRK con el cursor sobre uno de los botones. Captura del simulador.']]},
  {id:'a-mo-luces',n:'Luces de rodaje',cat:'Overhead',do:'Enciende RWY TURN OFF y pon NOSE en TAXI.'},
  {id:'a-mo-flt',n:'Prueba de mandos de vuelo',cat:'ECAM',do:'Realiza la prueba de mandos en la página FLT CTL del ECAM.'},
  {id:'a-mo-flaps',n:'Flaps en 1',cat:'Pedestal',do:'Ajusta los flaps en la posición 1 (la misma que escribiste en PERF).'},
  {id:'a-mo-apu',n:'Apagar APU y selector a NORM',cat:'Overhead / Pedestal',do:'Apaga APU BLEED y APU MASTER SW. Regresa el selector de encendido a NORM.'}]},
 {id:'bto',n:'Antes del despegue',s:[
  {id:'a-bt-fd',n:'Fly director y CSTR',cat:'Glareshield',do:'Conecta el fly director y activa el botón CSTR que está arriba de él.',at:'Panel EFIS, bajo el parabrisas.',img:[[A+'fly_director.png','Botón FD del panel EFIS. Captura del simulador.']]},
  {id:'a-bt-ta',n:'Transpondedor y TA',cat:'Pedestal',do:'Deja el control como en la imagen (ajuste de tu guía).',img:[[A+'mete.png','Panel del transpondedor/TCAS. Captura del simulador.']]},
  {id:'a-bt-ths',n:'THS al trim',cat:'Pedestal',do:'Ajusta el THS al valor de la página Takeoff; el trim es la rueda junto al acelerador.'},
  {id:'a-bt-luces',n:'Luces LAND y NOSE',cat:'Overhead',do:'Luces LAND en ON y NOSE en TO. Ve al inicio de la pista.'}]},
 {id:'asc',n:'Despegue y ascenso',pend:'Pendiente de aclarar: tu guía incluye ajustes de «ruedas» (40, 160, velocidad de crucero) y las luces de cinturones sin indicar a qué mando se refieren.',s:[
  {id:'a-as-tren',n:'Tren y piloto automático',cat:'Vuelo',do:'Según tu guía, al pasar V1 se activa el piloto automático y se sube el tren.',warn:W1},
  {id:'a-as-flaps',n:'Flaps al pasar la S',cat:'Pedestal',do:'Cuando en el velocímetro se pase la marca S, sube los flaps.'},
  {id:'a-as-std',n:'Presión estándar (STD)',cat:'EFIS',do:'Cuando empiece a parpadear el dato bajo el altímetro, cambia la presión a estándar (igual que el copiloto).',warn:W2,img:[[A+'presion_estandar.png','Selector de presión en STD. Captura del simulador.']]},
  {id:'a-as-alt',n:'Altitud del ATC en el AP',cat:'FCU',do:'Cuando el ATC indique mantener un FL, pon esa altitud en el piloto automático.'},
  {id:'a-as-luces',n:'Luces a 10000 ft',cat:'Overhead',do:'Al pasar 10000 ft apaga RWY TURN OFF, LAND y NOSE.',warn:'Valores de tu ejemplo; contrástalos con tu manual.'}]},
 {id:'lan',n:'Descenso, aproximación y aterrizaje',s:[
  {id:'a-ln-mcdu',n:'Verificar la llegada en el MCDU',cat:'MCDU',do:'Limpia mensajes y comprueba en el plan de vuelo que APPR, VIA y STAR coinciden con lo que pasó el ATC. Si no, corrígelos en la pista de aterrizaje.'},
  {id:'a-ln-alt',n:'Altitud de descenso en el AP',cat:'FCU',do:'Cambia la altitud de descenso en el piloto automático.'},
  {id:'a-ln-10k',n:'A 10000 ft: cinturones, LAND y 250',cat:'Overhead / FCU',do:'Enciende cinturones y luces de aterrizaje y pon la velocidad manual en 250 (rueda junto al botón SPD MACH).'},
  {id:'a-ln-spl',n:'Spoilers a la mitad si va rápido',cat:'Pedestal',do:'Si va muy rápido, baja los spoilers a la mitad. Cuando el punto verde del altímetro se nivele, quítalos.'},
  {id:'a-ln-brk',n:'Luces y autobrake MED',cat:'Overhead / panel central',do:'Enciende RWY TURN OFF y LAND. Frenos automáticos en MED.'},
  {id:'a-ln-qnh',n:'Presión local en el descenso',cat:'EFIS',do:'Pon la presión barométrica en manual con el último valor del ATC.',warn:W2},
  {id:'a-ln-flaps',n:'Reducir velocidad y flaps',cat:'Pedestal',do:'Baja la velocidad manual a 245 y sigue reduciendo. Pon flaps según la velocidad, con la tablita de velocidad y flaps del avión.'},
  {id:'a-ln-appr',n:'Botón APPR',cat:'FCU',do:'Al interceptar la senda ILS, pulsa APPR. Baja la altitud de forma constante al acercarte.'},
  {id:'a-ln-tren',n:'Tren abajo, tres luces verdes',cat:'Panel central',do:'Cuando confirmen el aterrizaje, baja el tren y confirma que las tres luces están en verde.'},
  {id:'a-ln-ap',n:'Piloto automático off',cat:'Vuelo',do:'A unos 500 ft desactiva el piloto automático (según tu guía).',warn:'Contrasta este valor con tu manual.'},
  {id:'a-ln-toque',n:'Toque: frenos, reversa y spoilers',cat:'Pedestal',do:'Al tocar tierra: frenos, reversa y spoilers.'}]},
 {id:'post',n:'Después de aterrizar',pend:'El orden es el de tu guía (la GPU aparece antes de apagar los motores); revísalo con tu manual.',s:[
  {id:'a-po-land',n:'Apagar luces LAND',cat:'Overhead',do:'Apaga las luces LAND.'},
  {id:'a-po-freno',n:'Freno de estacionamiento',cat:'Pedestal',do:'Pon el freno de estacionamiento.'},
  {id:'a-po-gpu',n:'Pasillo y GPU',cat:'EFB',do:'Conecta el pasillo de pasajeros y la GPU.'},
  {id:'a-po-mot',n:'Apagar motores y luces',cat:'Pedestal / Overhead',do:'Apaga los motores y las luces.'},
  {id:'a-po-off',n:'Apagar el avión',cat:'Overhead',do:'Espera a que se desocupe el avión y entonces apágalo.'}]}]}
];
const NOTE='Estas listas son simplificadas para práctica en simulador y no sustituyen el manual ni un procedimiento operacional oficial. Marcar un paso es una anotación manual tuya: no valida nada en MSFS 2024. Los procedimientos reales dependen del avión, del manual (AFM/FCOM) y de la autoridad aeronáutica.';
const BY={};DATA.forEach(a=>a.ph.forEach(p=>p.s.forEach(s=>{BY[s.id]={a,p,s}})));
// Estado: S.sim persiste en el localStorage de la app; las filas abiertas solo viven en memoria
const st=S.sim=Object.assign({ac:'c172',mode:'learn',chk:{}},S.sim);
if(!st.chk||typeof st.chk!=='object')st.chk={};
if(!DATA.some(a=>a.id===st.ac))st.ac='c172';
if(!st.mig){st.mig=1;S.chk=S.chk||{};Object.values(BY).forEach(({s})=>{if(s.lg&&S.chk[s.lg])st.chk[s.id]=1});save()} // trae las marcas de las listas anteriores
const open=new Set(),cur=()=>DATA.find(a=>a.id===st.ac);
const cnt=p=>p.s.filter(s=>st.chk[s.id]).length;
const L=(t,h)=>`<div class="sm-f"><div class="cap">${t}</div>${h}</div>`;
const pend=t=>`<p class="sm-pd">${t}</p>`;
function bodyH(a,s){
 let h=L('¿QUÉ DEBES HACER?',Array.isArray(s.do)?`<ul>${s.do.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:`<p>${esc(s.do)}</p>`);
 if(s.why)h+=L('¿PARA QUÉ SIRVE?',`<p>${esc(s.why)}</p>`);
 if(s.at)h+=L('¿DÓNDE LO ENCUENTRAS?',`<p>${esc(s.at)}</p>`);
 if(s.img)h+=L('REFERENCIA VISUAL',`<div class="sm-figs">${s.img.map(i=>`<figure class="sm-fig"><a href="images/${encodeURI(i[0])}" target="_blank" rel="noopener" title="Abrir la imagen completa"><img loading="lazy" src="images/${encodeURI(i[0])}" alt="${esc(i[1])}"></a><figcaption>${esc(i[1])}</figcaption></figure>`).join('')}</div>`);
 if(s.ms)h+=L('CÓMO LOCALIZARLO EN MSFS 2024',`<p>${esc(s.ms)}</p>`);
 if(s.tip)h+=L('CONSEJO DE APRENDIZAJE',`<p>${esc(s.tip)}</p>`);
 if(s.warn)h+=`<div class="sm-w"><b>Verificar:</b> ${esc(s.warn)}</div>`;
 return `<div class="sm-body" id="b_${s.id}">${h}<div class="sm-src"><b>Fuente:</b> ${esc(s.src||a.src)}</div></div>`}
function stepH(a,s){
 const on=!!st.chk[s.id],learn=st.mode==='learn',op=learn&&open.has(s.id),n=`<span class="sm-n">${esc(s.n)}</span>${s.cat&&learn?`<span class="tag">${esc(s.cat)}</span>`:''}`;
 return `<div class="sm-st${on?' on':''}${op?' open':''}" data-id="${s.id}"><div class="sm-row"><input type="checkbox" class="sm-cb" id="cb_${s.id}" ${on?'checked':''} aria-label="Marcar paso: ${esc(s.n)}">`+
 (learn?`<button type="button" class="sm-hd" aria-expanded="${op}" aria-controls="b_${s.id}">${n}<span class="sm-ch">${ic('chev')}</span></button>`:`<label class="sm-hd" for="cb_${s.id}">${n}</label>`)+`</div>${op?bodyH(a,s):''}</div>`}
function phH(a,p){
 const n=p.s.length,c=cnt(p);
 return `<section class="sm-ph" data-ph="${p.id}"><div class="sm-phh"><h2>${esc(p.n)}</h2>`+(n?`<div class="sm-pm"><span class="sm-pc">${c} de ${n} pasos revisados</span><div class="bar"><i style="width:${pct(c,n)}%"></i></div><button type="button" class="sm-mini" data-act="rstph" data-ph="${p.id}"${c?'':' disabled'}>${ic('rst')}Reiniciar fase</button></div>`:`<span class="tag">Pendiente</span>`)+`</div>`+p.s.map(s=>stepH(a,s)).join('')+(p.pend?`<div class="sm-pend">${esc(p.pend)}</div>`:'')+`</section>`}
function body(){
 const a=cur(),all=a.ph.flatMap(p=>p.s),c=all.filter(s=>st.chk[s.id]).length;
 return `<div class="sm-sum"><div><b>${esc(a.n)}</b> · <span class="sm-tc">${c} de ${all.length} pasos revisados</span></div><div class="bar"><i id="sm_tb" style="width:${pct(c,all.length)}%"></i></div>`+
  `<button type="button" class="sm-mini" data-act="rstall"${c?'':' disabled'}>${ic('rst')}Reiniciar checklist</button>`+(st.mode==='learn'?`<button type="button" class="sm-mini" data-act="exp">Expandir todo</button><button type="button" class="sm-mini" data-act="col">Contraer todo</button>`:'')+`</div>`+
  `<p class="sub" style="margin:0 0 4px">${esc(a.note)}</p>`+a.ph.map(p=>phH(a,p)).join('')}
const seg=(act,v,items)=>`<div class="sm-seg" role="group">${items.map(i=>`<button type="button" data-act="${act}" data-v="${i[0]}" aria-pressed="${v===i[0]}">${i[1]}</button>`).join('')}</div>`;
V.sim=function(){return `<h1>Simulador</h1><p class="sub">Checklists interactivos para aprender a operar cada aeronave en Microsoft Flight Simulator 2024.</p><div id="sim" class="${st.mode==='quick'?'sm-quick':''}"><div class="sm-top">${seg('ac',st.ac,DATA.map(a=>[a.id,a.n]))}${seg('mode',st.mode,[['learn','Modo aprendizaje'],['quick','Checklist rápido']])}</div><div id="sm_b">${body()}</div></div><div class="note">${NOTE}</div>`};
function redraw(){const r=$('#sim');if(!r)return;r.className=st.mode==='quick'?'sm-quick':'';r.innerHTML=`<div class="sm-top">${seg('ac',st.ac,DATA.map(a=>[a.id,a.n]))}${seg('mode',st.mode,[['learn','Modo aprendizaje'],['quick','Checklist rápido']])}</div><div id="sm_b">${body()}</div>`}
// Actualiza solo contadores y barras (no reconstruye la lista, así la casilla conserva el foco)
function prog(){const a=cur(),all=a.ph.flatMap(p=>p.s),c=all.filter(s=>st.chk[s.id]).length;
 a.ph.forEach(p=>{const e=$(`[data-ph="${p.id}"]`);if(!e||!p.s.length)return;const k=cnt(p);e.querySelector('.sm-pc').textContent=`${k} de ${p.s.length} pasos revisados`;e.querySelector('.bar i').style.width=pct(k,p.s.length)+'%';e.querySelector('[data-act="rstph"]').disabled=!k});
 $('.sm-tc').textContent=`${c} de ${all.length} pasos revisados`;$('#sm_tb').style.width=pct(c,all.length)+'%';$('[data-act="rstall"]').disabled=!c}
function toggleOpen(id){const e=$(`.sm-st[data-id="${id}"]`),x=BY[id];if(!e)return;open.has(id)?open.delete(id):open.add(id);e.outerHTML=stepH(x.a,x.s);const b=$(`.sm-st[data-id="${id}"] .sm-hd`);if(b)b.focus()}
function reset(list,msg){if(!list.some(s=>st.chk[s.id])||!confirm(msg))return;list.forEach(s=>delete st.chk[s.id]);save();redraw()}
document.addEventListener('click',e=>{
 const hd=e.target.closest('#sim button.sm-hd');if(hd){toggleOpen(hd.closest('.sm-st').dataset.id);return}
 const b=e.target.closest('#sim [data-act]');if(!b)return;const k=b.dataset.act,a=cur();
 if(k==='mode'||k==='ac'){st[k]=b.dataset.v;save();redraw()}
 else if(k==='exp'){a.ph.forEach(p=>p.s.forEach(s=>open.add(s.id)));redraw()}
 else if(k==='col'){a.ph.forEach(p=>p.s.forEach(s=>open.delete(s.id)));redraw()}
 else if(k==='rstph'){const p=a.ph.find(x=>x.id===b.dataset.ph);reset(p.s,`¿Reiniciar la fase «${p.n}»? Se desmarcarán sus pasos.`)}
 else if(k==='rstall')reset(a.ph.flatMap(p=>p.s),`¿Reiniciar todo el checklist del ${a.n}? Se desmarcarán todos sus pasos.`)});
document.addEventListener('change',e=>{const c=e.target.closest('#sim input.sm-cb');if(!c)return;const row=c.closest('.sm-st');st.chk[row.dataset.id]=c.checked?1:0;if(!c.checked)delete st.chk[row.dataset.id];row.classList.toggle('on',c.checked);save();prog()});
})();