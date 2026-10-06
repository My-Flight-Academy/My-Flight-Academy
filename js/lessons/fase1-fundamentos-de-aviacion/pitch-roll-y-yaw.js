// Fase 1 — Fundamentos de aviación  ·  Lección: Pitch, Roll y Yaw
//
// IMÁGENES: guárdalas en  images/fase1-fundamentos-de-aviacion/pitch-roll-yaw/
// y escribe abajo solo el nombre con su extensión (por ejemplo 'ejes-y-controles.svg').
// Mientras un nombre esté vacío (''), la lección muestra un marcador de "imagen pendiente".
{
 const IMG={
  ejes:'ejes_del_avion.jpg'  // Diagrama de los tres ejes y controles asociados (Aeroplane Coordinates and Control)
 };

 LESSONS['Pitch, Roll y Yaw']={lvl:'Básico',min:10,svg:false,body:`
<h3>1. Introducción</h3>
<p>Un avión puede moverse en tres dimensiones. Para describir estos movimientos se utilizan tres términos fundamentales:</p>
<ul>
<li><b>Pitch (cabeceo):</b> movimiento de la nariz hacia arriba o hacia abajo.</li>
<li><b>Roll (alabeo):</b> inclinación de las alas hacia la izquierda o la derecha.</li>
<li><b>Yaw (guiñada):</b> movimiento de la nariz hacia la izquierda o la derecha.</li></ul>
<p>Cada movimiento ocurre alrededor de uno de los tres ejes principales del avión.</p>
${fig(IMG.ejes,'Los tres ejes del avión y los controles asociados','Fuente: Wikimedia Commons, "Aeroplane Coordinates and Control"')}

<h3>2. Los tres ejes del avión</h3>
<p>El avión tiene tres ejes imaginarios que atraviesan su centro de gravedad.</p>
<div class="wrap"><table><tr><th>EJE</th><th>MOVIMIENTO</th><th>CONTROL PRINCIPAL</th></tr>
<tr><td>Longitudinal</td><td class="mono">Roll</td><td class="mono">Ailerons (alerones)</td></tr>
<tr><td>Lateral</td><td class="mono">Pitch</td><td class="mono">Elevator</td></tr>
<tr><td>Vertical</td><td class="mono">Yaw</td><td class="mono">Rudder</td></tr></table></div>
<div class="key"><b>Una forma fácil de recordarlo</b><br><span class="mono">Longitudinal → Roll<br>Lateral → Pitch<br>Vertical → Yaw</span></div>

<h3>3. Pitch — Cabeceo</h3>
<p>Es el movimiento de la nariz del avión hacia arriba o hacia abajo. Ocurre alrededor del <b>eje lateral</b> y lo controla principalmente el <b>elevator (timón de profundidad)</b>, situado en la parte trasera del avión, sobre el estabilizador horizontal.</p>
<ul>
<li><b>Pitch up.</b> Control hacia atrás → elevator → nariz arriba. El avión aumenta su actitud de morro arriba.</li>
<li><b>Pitch down.</b> Control hacia adelante → elevator → nariz abajo.</li></ul>
<div class="key"><b>Importante.</b> Pitch no significa simplemente subir o bajar. Describe la orientación de la nariz respecto al horizonte. Un avión puede tener la nariz arriba y estar descendiendo debido a otros factores, como la velocidad, la potencia y la trayectoria. Esto es importante para aprender a volar correctamente.</div>

<h3>4. Roll — Alabeo</h3>
<p>Es el movimiento en el que el avión inclina sus alas hacia la izquierda o la derecha. Ocurre alrededor del <b>eje longitudinal</b>, que va aproximadamente desde la nariz hasta la cola, y lo controlan principalmente los <b>ailerons (alerones)</b>.</p>
<ul>
<li><b>Roll a la derecha.</b> Control a la derecha → alerones → el avión se inclina a la derecha.</li>
<li><b>Roll a la izquierda.</b> Control a la izquierda → alerones → el avión se inclina a la izquierda.</li></ul>
<p><b>¿Por qué el avión gira al inclinarse?</b> Es una de las ideas más importantes. Cuando el avión entra en un viraje, normalmente inclina sus alas. La sustentación deja de actuar completamente hacia arriba y una parte de ella actúa hacia el interior del viraje.</p>
<div class="key"><span class="mono">Roll → inclinación → componente horizontal de la sustentación → cambio de dirección</span><br>No es que los alerones "hagan girar" directamente la nariz.</div>

<h3>5. Yaw — Guiñada</h3>
<p>Es el movimiento de la nariz hacia la izquierda o la derecha alrededor del <b>eje vertical</b>. Lo controla principalmente el <b>rudder (timón de dirección)</b>, ubicado en el estabilizador vertical de la cola, mediante los pedales de dirección.</p>
<ul>
<li><b>Yaw a la derecha.</b> Pedal derecho → rudder → la nariz gira hacia la derecha.</li>
<li><b>Yaw a la izquierda.</b> Pedal izquierdo → rudder → la nariz gira hacia la izquierda.</li></ul>

<h3>6. Diferencia entre Roll y Yaw</h3>
<p>Esta diferencia es muy importante.</p>
<div class="wrap"><table><tr><th>MOVIMIENTO</th><th>QUÉ OCURRE</th></tr>
<tr><td class="mono">Roll</td><td>El avión se inclina: una de las alas queda más alta que la otra.</td></tr>
<tr><td class="mono">Yaw</td><td>La nariz apunta hacia un lado. El avión puede cambiar la dirección de su nariz sin inclinarse como lo hace en un viraje coordinado.</td></tr></table></div>

<h3>7. Los tres movimientos juntos</h3>
<p>Imagina que estás sentado en la cabina.</p>
<div class="wrap"><table><tr><th>MOVIMIENTO</th><th>QUÉ SIENTES Y VES</th></tr>
<tr><td class="mono">Pitch</td><td>La nariz sube o baja, como si miraras hacia arriba o hacia abajo.</td></tr>
<tr><td class="mono">Roll</td><td>Te inclinas hacia un lado: el ala izquierda o la derecha baja.</td></tr>
<tr><td class="mono">Yaw</td><td>La nariz gira hacia la izquierda o la derecha.</td></tr></table></div>

<h3>8. Una forma muy fácil de recordarlos</h3>
<p>Piensa en tu propio cuerpo:</p>
<ul><li><b>Pitch</b> = cabeza arriba o abajo.</li><li><b>Roll</b> = inclinarte sobre un hombro.</li><li><b>Yaw</b> = girar la cabeza hacia la izquierda o la derecha.</li></ul>
<p>Así puedes recordar los tres movimientos incluso antes de entrar a un avión o a un simulador.</p>

<h3>9. Relación con los controles de vuelo</h3>
<p>Esta es la conexión con la lección anterior:</p>
<div class="wrap"><table><tr><th>MOVIMIENTO</th><th>SUPERFICIE</th><th>CONTROL EN CABINA</th></tr>
<tr><td class="mono">Pitch</td><td class="mono">Elevator</td><td>Yoke o stick, adelante y atrás</td></tr>
<tr><td class="mono">Roll</td><td class="mono">Ailerons</td><td>Yoke o stick, izquierda y derecha</td></tr>
<tr><td class="mono">Yaw</td><td class="mono">Rudder</td><td>Pedales</td></tr>
<tr><td class="mono">Flaps</td><td class="mono">Flaps</td><td>Palanca de flaps</td></tr></table></div>
<p><b>En una Cessna 172:</b> yoke atrás, pitch arriba; yoke adelante, pitch abajo; yoke a la izquierda, roll izquierda; yoke a la derecha, roll derecha; pedal izquierdo, yaw izquierdo; pedal derecho, yaw derecho.</p>

<h3>10. Los tres movimientos durante un viraje</h3>
<p>Para realizar un viraje correctamente no se utiliza un solo control. Por ejemplo, en un viraje a la derecha:</p>
<ol><li>Se aplican alerones hacia la derecha.</li><li>El avión comienza a hacer roll hacia la derecha.</li><li>Se utiliza el rudder para coordinar la guiñada.</li><li>Se utiliza el elevator para mantener la actitud de pitch adecuada.</li><li>Se mantiene el avión en el ángulo de alabeo deseado.</li></ol>
<p>Por eso un viraje coordinado implica trabajar con los tres controles primarios.</p>

<h3>11. Adverse Yaw</h3>
<p>Cuando se utilizan los alerones para hacer roll puede aparecer un efecto llamado <b>adverse yaw</b>: una tendencia del avión a guiñar en dirección opuesta al viraje deseado, debido a las diferencias de resistencia producidas por los alerones.</p>
<p>Por ejemplo, si quieres hacer roll a la derecha, el avión puede desarrollar inicialmente una tendencia de yaw a la izquierda. Por eso se utiliza el rudder para coordinar el viraje. Es especialmente importante cuando se está aprendiendo a volar.</p>

<h3>12. Viraje coordinado</h3>
<p>Un viraje coordinado es el que se realiza de manera equilibrada, sin exceso de derrape (<i>skid</i>) ni de deslizamiento (<i>slip</i>). En un avión ligero se puede comprobar con el indicador de coordinación: el objetivo es mantener la bola aproximadamente centrada.</p>
<div class="wrap"><table><tr><th>BOLA</th><th>SIGNIFICADO</th></tr>
<tr><td class="mono">Centrada</td><td>Viraje coordinado.</td></tr>
<tr><td class="mono">Hacia un lado</td><td>Existe slip o skid, según la situación.</td></tr></table></div>
<p>Esto se verá con más profundidad en una futura lección de virajes y coordinación.</p>

<h3>13. ¿El avión siempre utiliza solo un control?</h3>
<p>No. Los controles trabajan juntos. Por ejemplo, durante un aterrizaje:</p>
<ul><li><b>Ailerons:</b> controlan el roll.</li><li><b>Rudder:</b> ayuda a controlar el yaw y a mantener la dirección.</li><li><b>Elevator:</b> controla el pitch.</li><li><b>Flaps:</b> modifican la configuración aerodinámica.</li></ul>
<p>Aprender solamente "alerones = girar" es insuficiente. Hay que entender cómo interactúan los tres ejes.</p>

<h3>14. Pitch no es lo mismo que altitud</h3>
<div class="key"><b>Pitch</b> = actitud (orientación de la nariz).<br><b>Altitud</b> = posición vertical respecto a una referencia.</div>
<p>No son lo mismo. Con la nariz arriba el avión puede estar ascendiendo, pero también puede estar descendiendo, según la energía y la trayectoria. Por eso el piloto debe observar la actitud, la altitud, la velocidad, la potencia y el régimen de ascenso o descenso, y no solamente mirar la nariz.</p>

<h3>15. Resumen visual</h3>
<div class="wrap"><table><tr><th></th><th>PITCH</th><th>ROLL</th><th>YAW</th></tr>
<tr><td>Movimiento</td><td>Cabeceo</td><td>Alabeo</td><td>Guiñada</td></tr>
<tr><td>Superficie</td><td class="mono">Elevator</td><td class="mono">Ailerons</td><td class="mono">Rudder</td></tr>
<tr><td>Eje</td><td>Lateral</td><td>Longitudinal</td><td>Vertical</td></tr></table></div>
<div class="key"><b>Regla rápida</b><br><span class="mono">PITCH → ELEVATOR<br>ROLL → AILERONS<br>YAW → RUDDER</span><br>Esta es una de las reglas fundamentales que conviene memorizar.</div>

<h3>16. Práctica en Microsoft Flight Simulator</h3>
<p><b>Ejercicio 1 — Pitch.</b> En una Cessna 172: despega y establece un vuelo recto; mueve ligeramente el yoke hacia atrás y observa cómo sube la nariz; devuelve el control suavemente; mueve ligeramente el yoke hacia adelante y observa el cambio de actitud. Objetivo: reconocer el pitch.</p>
<p><b>Ejercicio 2 — Roll.</b> En vuelo recto: mueve ligeramente el yoke hacia la derecha y observa cómo el avión se inclina; vuelve al centro; repite hacia la izquierda. Objetivo: reconocer el roll.</p>
<p><b>Ejercicio 3 — Yaw.</b> En vuelo recto: presiona ligeramente el pedal derecho y observa el movimiento de la nariz; regresa al centro; repite hacia la izquierda. Objetivo: reconocer el yaw.</p>
<div class="note">En un avión real, estos ejercicios deben realizarse bajo la instrucción y supervisión de un instructor de vuelo. En el simulador sirven como práctica conceptual.</div>

<h3>17. Errores comunes</h3>
<ul>
<li><b>"Roll es girar la nariz".</b> No exactamente: roll es inclinar el avión.</li>
<li><b>"Yaw es inclinar el avión".</b> No: yaw es girar la nariz alrededor del eje vertical.</li>
<li><b>"Pitch es subir".</b> No necesariamente: pitch es la orientación de la nariz.</li>
<li><b>"Los flaps controlan el pitch".</b> No son un control primario de pitch: son dispositivos de alta sustentación que modifican principalmente la sustentación y la resistencia.</li>
<li><b>"Para hacer un viraje solo uso los alerones".</b> Los alerones producen el roll, pero un viraje coordinado requiere comprender también el pitch y el yaw.</li></ul>

<h3>Lo que debes recordar</h3>
<div class="sum">
<div><b class="mono">PITCH</b><br>Cabeceo, eje lateral, elevator.</div>
<div><b class="mono">ROLL</b><br>Alabeo, eje longitudinal, ailerons.</div>
<div><b class="mono">YAW</b><br>Guiñada, eje vertical, rudder.</div>
<div><b class="mono">VIRAJE</b><br>Se inclina el avión (roll) y la sustentación cambia la dirección; el rudder coordina y el elevator mantiene el pitch.</div>
<div><b class="mono">PITCH ≠ ALTITUD</b><br>Pitch es actitud, no posición vertical.</div></div>
<div class="note">Fuente principal: FAA, <i>Pilot's Handbook of Aeronautical Knowledge</i>, capítulo 6 "Flight Controls". Para la parte práctica, el <i>Airplane Flying Handbook</i> de la FAA. Es material de estudio general; los detalles dependen de cada avión y de su manual.</div>`,
 q:[
 {p:'¿Qué movimiento corresponde al Pitch?',o:['Movimiento de la nariz arriba o abajo','Inclinación de las alas','Movimiento de la nariz izquierda o derecha','Movimiento de los flaps'],a:0,e:'El pitch es el cabeceo: la nariz sube o baja respecto al horizonte.'},
 {p:'¿Qué superficie controla principalmente el Roll?',o:['Rudder','Ailerons','Elevator','Flaps'],a:1,e:'Los ailerons inclinan el avión alrededor del eje longitudinal.'},
 {p:'¿Qué superficie controla principalmente el Yaw?',o:['Ailerons','Elevator','Rudder','Flaps'],a:2,e:'El rudder, accionado con los pedales, controla la guiñada.'},
 {p:'¿El Pitch ocurre alrededor de qué eje?',o:['Longitudinal','Vertical','Lateral','De potencia'],a:2,e:'El pitch ocurre alrededor del eje lateral, de punta a punta de ala.'},
 {p:'¿El Roll ocurre alrededor de qué eje?',o:['Vertical','Lateral','Longitudinal','Horizontal'],a:2,e:'El roll ocurre alrededor del eje longitudinal, de la nariz a la cola.'},
 {p:'¿El Yaw ocurre alrededor de qué eje?',o:['Longitudinal','Lateral','Vertical','Lateral y longitudinal'],a:2,e:'El yaw ocurre alrededor del eje vertical.'},
 {p:'¿Qué controla normalmente el piloto con los pedales?',o:['Pitch','Yaw','Roll','Flaps'],a:1,e:'Los pedales mueven el rudder, que controla el yaw.'},
 {p:'¿Qué sucede principalmente cuando se aplica alerón derecho?',o:['El avión hace pitch arriba','El avión hace roll hacia la derecha','El avión hace yaw exclusivamente hacia la derecha','Se despliegan los flaps'],a:1,e:'El alerón derecho produce roll hacia la derecha; el giro llega después, al inclinarse el avión.'},
 {p:'¿Qué es el adverse yaw?',o:['Una tendencia de guiñada opuesta al roll deseado','Una pérdida de altitud','Un movimiento de pitch','Un tipo de turbulencia'],a:0,e:'Se debe a la diferencia de resistencia entre las alas al usar los alerones, y se corrige con el rudder.'},
 {p:'¿Cuál es la combinación correcta?',o:['Pitch–Rudder','Roll–Elevator','Yaw–Ailerons','Pitch–Elevator'],a:3,e:'Pitch–Elevator, Roll–Ailerons, Yaw–Rudder.'}]};
}