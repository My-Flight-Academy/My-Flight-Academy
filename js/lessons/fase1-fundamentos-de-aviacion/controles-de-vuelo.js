// Fase 1 — Fundamentos de aviación  ·  Lección: Controles de vuelo
//
// IMÁGENES: guárdalas en  images/fase1-fundamentos-de-aviacion/controles-de-vuelo/
// y escribe abajo solo el nombre con su extensión (por ejemplo 'ejes-y-controles.png').
// Mientras un nombre esté vacío (''), la lección muestra un marcador de "imagen pendiente".
{
 const IMG={
  ejes:'Aeroplane_Coordinates_and_Control.svg',        // Diagrama de ejes y controles: roll, pitch, yaw, aileron, elevator, rudder
  superficies:'componentes_empenaje.jpg', // Superficies de control: aileron, control stick, elevator, rudder
  empenaje:'superficies_de_control.jpg',    // Componentes del empenaje: estabilizadores, elevator, rudder, trim tabs
  cabina:'cabina_cessna.jpg'       // Fotografía de la cabina de una Cessna 172
 };

 LESSONS['Controles de vuelo']={lvl:'Básico',min:30,svg:false,body:`
<h3>1. ¿Qué son los controles de vuelo?</h3>
<p>Los controles de vuelo (<i>flight controls</i>) son los sistemas y superficies que permiten al piloto controlar la actitud y el movimiento de la aeronave. Actúan principalmente sobre los tres ejes de rotación:</p>
<div class="wrap"><table><tr><th>EJE</th><th>MOVIMIENTO</th><th>CONTROL PRINCIPAL</th></tr>
<tr><td>Longitudinal</td><td class="mono">Roll — Alabeo</td><td class="mono">Ailerons</td></tr>
<tr><td>Lateral</td><td class="mono">Pitch — Cabeceo</td><td class="mono">Elevator</td></tr>
<tr><td>Vertical</td><td class="mono">Yaw — Guiñada</td><td class="mono">Rudder</td></tr></table></div>
<p>La FAA explica que los tres controles primarios (ailerons, elevator o stabilator, y rudder) permiten controlar el avión alrededor de sus tres ejes de rotación.</p>
${fig(IMG.ejes,'Ejes del avión y superficies de control asociadas')}

<h3>2. Los tres ejes del avión</h3>
<p>Antes de estudiar cada control hay que entender los tres ejes.</p>
<ul>
<li><b>Eje longitudinal.</b> Va aproximadamente desde el morro hasta la cola. Movimiento: <b>Roll (alabeo)</b>. Control principal: <b>Ailerons (alerones)</b>.</li>
<li><b>Eje lateral.</b> Va aproximadamente de una punta del ala a la otra. Movimiento: <b>Pitch (cabeceo)</b>. Control principal: <b>Elevator (timón de profundidad)</b>.</li>
<li><b>Eje vertical.</b> Va aproximadamente desde la parte superior hacia la inferior del avión. Movimiento: <b>Yaw (guiñada)</b>. Control principal: <b>Rudder (timón de dirección)</b>.</li></ul>
<div class="key"><b>Regla que debes memorizar</b><br><span class="mono">AILERONS → ROLL<br>ELEVATOR → PITCH<br>RUDDER → YAW</span></div>

<h3>3. Alerones — Ailerons</h3>
<p>Son superficies móviles ubicadas normalmente en las partes exteriores del borde de salida de las alas. Su función principal es controlar el <b>roll (alabeo)</b>. Los dos alerones normalmente se mueven en direcciones opuestas.</p>
<p><b>Ejemplo.</b> Si el piloto mueve el control hacia la derecha, el alerón derecho sube y el izquierdo baja. El ala derecha genera menos sustentación y la izquierda más, y el avión hace roll hacia la derecha.</p>
<div class="key"><b>Importante.</b> No pienses que "el alerón hace que el avión simplemente gire". Su función primaria es producir roll. En un viraje coordinado intervienen además otros factores y controles.</div>

<h3>4. Elevator — Timón de profundidad</h3>
<p>Está situado normalmente en el estabilizador horizontal. Su función principal es controlar el <b>pitch (cabeceo)</b>: el movimiento del morro hacia arriba o hacia abajo respecto al horizonte.</p>
<ul><li>Elevator arriba: tendencia a <i>pitch up</i>.</li><li>Elevator abajo: tendencia a <i>pitch down</i>.</li></ul>
<p>La respuesta exacta depende de la configuración y del avión, pero esta es la relación básica que debes aprender.</p>
<div class="key"><span class="mono">Elevator → Pitch → Eje lateral</span></div>
${fig(IMG.empenaje,'Componentes del empenaje: estabilizadores, elevator, rudder y trim tabs')}

<h3>5. Rudder — Timón de dirección</h3>
<p>Está situado en el estabilizador vertical y controla principalmente el <b>yaw (guiñada)</b>: el movimiento del morro hacia la izquierda o la derecha alrededor del eje vertical. Normalmente se controla con los pedales de dirección.</p>
<div class="key"><span class="mono">Pedales → Rudder → Yaw</span></div>

<h3>6. ¿Qué hacen los pedales?</h3>
<p>Los pedales controlan principalmente el rudder. Es un punto en el que conviene fijarse al practicar en el simulador.</p>
<div class="wrap"><table><tr><th>PEDAL</th><th>RUDDER</th><th>YAW</th></tr>
<tr><td class="mono">Izquierdo</td><td class="mono">Izquierda</td><td class="mono">Izquierda</td></tr>
<tr><td class="mono">Derecho</td><td class="mono">Derecha</td><td class="mono">Derecha</td></tr></table></div>
<p>Rudder no significa simplemente "girar el avión". Tiene una función muy importante para coordinar el avión y controlar la guiñada.</p>

<h3>7. ¿Cómo se realiza un viraje?</h3>
<p>Un viraje no consiste en presionar el rudder. Para un viraje coordinado:</p>
<ul><li><b>Ailerons:</b> producen el <i>bank</i> (inclinación) y el roll.</li>
<li><b>Elevator:</b> ayuda a mantener la actitud y a gestionar el pitch.</li>
<li><b>Rudder:</b> coordina la guiñada.</li></ul>
<p>Esto es fundamental para entender más adelante qué significa <i>coordinated flight</i> (vuelo coordinado).</p>

<h3>8. Adverse Yaw — Guiñada adversa (concepto avanzado)</h3>
<p>Cuando se usan los alerones, el ala que aumenta su sustentación también puede producir más resistencia. Por eso, mientras el avión comienza a alabear, puede aparecer una tendencia de guiñada en dirección contraria al viraje. La FAA lo llama <b>adverse yaw</b> y lo explica principalmente por la diferencia de resistencia entre las alas durante la deflexión de los alerones.</p>
<p>Por eso el rudder se utiliza para ayudar a mantener el vuelo coordinado.</p>

<h3>9. Flaps</h3>
<p>Son dispositivos de alta sustentación situados normalmente en la parte interior del borde de salida del ala. Se utilizan principalmente durante el despegue, la aproximación y el aterrizaje. Al extenderlos, normalmente aumentan la <b>sustentación</b> y también la <b>resistencia</b>, lo que permite operar a velocidades más bajas en determinadas fases del vuelo.</p>
<div class="key"><b>Importante.</b> Los flaps no controlan directamente ninguno de los tres ejes como los controles primarios.<br><span class="mono">AILERON → ROLL · ELEVATOR → PITCH · RUDDER → YAW<br>FLAPS → configuración aerodinámica (lift + drag)</span></div>

<h3>10. Trim — Compensador</h3>
<p>El trim permite reducir la fuerza que el piloto necesita aplicar continuamente sobre los controles. Por ejemplo, si hay que mantener presión constante sobre el control para sostener cierta actitud, el trim reduce esa presión. Según el avión puede existir elevator trim, rudder trim y aileron trim.</p>
<div class="key"><b>Muy importante.</b> El trim no sustituye a los controles primarios: sirve para compensar las fuerzas necesarias para mantener una condición de vuelo.</div>

<h3>11. Spoilers</h3>
<p>Son superficies que se despliegan desde la parte superior del ala. Pueden utilizarse para reducir sustentación, aumentar resistencia, ayudar al control de roll en determinados aviones, ayudar a reducir velocidad y ayudar durante el aterrizaje. Su funcionamiento depende bastante del tipo de aeronave.</p>
<p>En aviones de transporte modernos, como el Airbus A320, pueden formar parte del sistema de control lateral junto con los alerones.</p>

<h3>12. Slats</h3>
<p>Están situados normalmente en el borde de ataque del ala. Modifican las características aerodinámicas del ala y permiten mejores condiciones de sustentación a velocidades relativamente bajas. Son especialmente importantes durante el despegue, la aproximación y el aterrizaje. En un avión comercial como el A320 hay <b>slats + flaps</b>, y no solamente flaps.</p>

<h3>13. Superficies primarias y secundarias</h3>
<p><b>Controles primarios</b></p>
<div class="wrap"><table><tr><th>CONTROL</th><th>INGLÉS</th><th>MOVIMIENTO</th></tr>
<tr><td>Alerones</td><td class="mono">Ailerons</td><td class="mono">Roll</td></tr>
<tr><td>Timón de profundidad</td><td class="mono">Elevator</td><td class="mono">Pitch</td></tr>
<tr><td>Timón de dirección</td><td class="mono">Rudder</td><td class="mono">Yaw</td></tr></table></div>
<p><b>Dispositivos y sistemas relacionados</b></p>
<div class="wrap"><table><tr><th>ELEMENTO</th><th>FUNCIÓN PRINCIPAL</th></tr>
<tr><td class="mono">Flaps</td><td>Aumentar sustentación y resistencia</td></tr>
<tr><td class="mono">Slats</td><td>Mejorar las características de sustentación a baja velocidad</td></tr>
<tr><td class="mono">Trim</td><td>Reducir las fuerzas de control</td></tr>
<tr><td class="mono">Spoilers</td><td>Reducir sustentación y aumentar resistencia; según el avión, ayudar al roll</td></tr></table></div>
${fig(IMG.superficies,'Superficies de control: aileron, control stick, elevator y rudder')}

<h3>14. El control dentro de la cabina</h3>
<p>Conecta las superficies externas con lo que el piloto realmente mueve:</p>
<ul>
<li><b>Control column / yoke.</b> Izquierda o derecha: ailerons y roll. Adelante o atrás: elevator y pitch.</li>
<li><b>Joystick / control stick.</b> En otros aviones se utiliza un stick en lugar de un yoke, con la misma correspondencia.</li>
<li><b>Rudder pedals.</b> Los pedales actúan sobre el rudder y el yaw.</li></ul>

<h3>15. La Cessna 172 como ejemplo</h3>
<p>Si practicas con la Cessna 172 en Microsoft Flight Simulator, esta es la correspondencia directa entre lo que mueves y lo que ocurre:</p>
<div class="wrap"><table><tr><th>MANDO</th><th>MOVIMIENTO</th><th>SUPERFICIE</th><th>EFECTO</th></tr>
<tr><td class="mono">Control yoke</td><td>Izquierda / derecha</td><td class="mono">Ailerons</td><td class="mono">Roll</td></tr>
<tr><td class="mono">Control yoke</td><td>Adelante / atrás</td><td class="mono">Elevator</td><td class="mono">Pitch</td></tr>
<tr><td class="mono">Rudder pedals</td><td>Izquierdo / derecho</td><td class="mono">Rudder</td><td class="mono">Yaw</td></tr>
<tr><td class="mono">Flap lever</td><td>Posiciones de flaps</td><td class="mono">Flaps</td><td>Configuración</td></tr></table></div>
${fig(IMG.cabina,'Cabina de una Cessna 172: yoke, pedales y panel')}
<div class="note">Los procedimientos de un simulador pueden simplificar los de la aeronave real. Para la operación real, sigue siempre el manual de vuelo del avión.</div>

<h3>16. ¿Y en un avión comercial?</h3>
<p>Los principios fundamentales son los mismos: roll con el control lateral, pitch con el control longitudinal y yaw con el control direccional. Pero la forma de controlar las superficies puede ser muy diferente.</p>
<p>Los aviones modernos pueden utilizar <b>fly-by-wire</b>, donde las órdenes del piloto se transmiten electrónicamente a los sistemas de control, con actuadores en lugar de conexiones mecánicas directas. Esto será especialmente relevante cuando llegues al módulo del Airbus A320.</p>

<h3>Lo que debes recordar</h3>
<div class="sum">
<div><b class="mono">AILERONS</b><br>Controlan principalmente el ROLL alrededor del eje longitudinal.</div>
<div><b class="mono">ELEVATOR</b><br>Controla principalmente el PITCH alrededor del eje lateral.</div>
<div><b class="mono">RUDDER</b><br>Controla principalmente el YAW alrededor del eje vertical.</div>
<div><b class="mono">FLAPS</b><br>Modifican sustentación y resistencia, sobre todo en despegue y aterrizaje.</div>
<div><b class="mono">SLATS</b><br>Mejoran la sustentación del ala a velocidades bajas.</div>
<div><b class="mono">TRIM</b><br>Reduce las fuerzas que el piloto debe mantener sobre los controles.</div>
<div><b class="mono">SPOILERS</b><br>Reducen sustentación, aumentan resistencia y, según el avión, ayudan al roll.</div></div>
<div class="note">Fuente principal: FAA, <i>Pilot's Handbook of Aeronautical Knowledge</i>, capítulo 6 "Flight Controls". Para pasar de "qué hace cada control" a su uso en maniobras reales, el siguiente texto de referencia es el <i>Airplane Flying Handbook</i> de la FAA. Es material de estudio general; los detalles dependen de cada avión y de su manual.</div>`,
 q:[
 {p:'¿Qué superficie controla principalmente el Roll?',o:['Rudder','Elevator','Ailerons','Flaps'],a:2,e:'Los ailerons actúan de forma diferencial y producen roll.'},
 {p:'¿Qué superficie controla principalmente el Pitch?',o:['Ailerons','Elevator','Rudder','Spoilers'],a:1,e:'El elevator sube o baja el morro alrededor del eje lateral.'},
 {p:'¿Qué superficie controla principalmente el Yaw?',o:['Elevator','Rudder','Ailerons','Flaps'],a:1,e:'El rudder controla la guiñada alrededor del eje vertical.'},
 {p:'¿Alrededor de qué eje ocurre el Roll?',o:['Vertical','Lateral','Longitudinal','Ninguno'],a:2,e:'El roll es la rotación alrededor del eje longitudinal, del morro a la cola.'},
 {p:'¿Qué control se acciona principalmente mediante los pedales?',o:['Elevator','Ailerons','Rudder','Flaps'],a:2,e:'Los pedales de dirección mueven el rudder.'},
 {p:'¿Cuál de estos es un control primario?',o:['Flap','Spoiler','Aileron','Slat'],a:2,e:'Los controles primarios son ailerons, elevator y rudder.'},
 {p:'¿Cuál es una función principal de los flaps?',o:['Controlar el yaw','Aumentar sustentación y resistencia durante determinadas fases','Controlar directamente el roll','Controlar directamente el pitch'],a:1,e:'Los flaps no controlan un eje: modifican sustentación y resistencia, sobre todo en despegue y aterrizaje.'},
 {p:'¿Para qué sirve principalmente el trim?',o:['Para apagar el motor','Para reducir las fuerzas necesarias para mantener una condición de vuelo','Para controlar el tren de aterrizaje','Para controlar el yaw exclusivamente'],a:1,e:'El trim reduce la presión que el piloto debe mantener sobre los controles.'},
 {p:'¿Qué puede provocar adverse yaw durante el uso de los alerones?',o:['Diferencias de resistencia entre las alas','Falta de combustible','Uso de flaps','Movimiento del elevator'],a:0,e:'El ala que gana sustentación también genera más resistencia, y eso produce una guiñada contraria al viraje.'},
 {p:'¿Qué combinación es correcta?',o:['Aileron → Yaw','Elevator → Roll','Rudder → Pitch','Aileron → Roll'],a:3,e:'Aileron → Roll, Elevator → Pitch, Rudder → Yaw.'}]};
}