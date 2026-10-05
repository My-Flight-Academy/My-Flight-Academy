// Fase 1 — Fundamentos de aviación  ·  Lección: Partes del avión
LESSONS['Partes del avión']={lvl:'Básico',min:25,svg:false,body:`
<h3>1. Las partes principales</h3>
<p>Un avión convencional puede dividirse en cinco grandes grupos. La FAA utiliza esta división general para explicar la estructura básica de un avión.</p>
<ul><li><b>Fuselaje</b> — Fuselage</li><li><b>Alas</b> — Wings</li><li><b>Empenaje / cola</b> — Empennage</li><li><b>Tren de aterrizaje</b> — Landing gear</li><li><b>Planta motriz</b> — Powerplant</li></ul>
${fig('Partes principales de un avion.pdf','Partes principales de un avión (diagrama FAA)')}

<h3>2. Fuselaje — Fuselage</h3>
<p>El fuselaje es el cuerpo principal del avión. Es la estructura que normalmente contiene:</p>
<ul><li>Cabina de pilotos.</li><li>Cabina de pasajeros, si corresponde.</li><li>Compartimentos de carga y equipaje.</li><li>Instrumentos y equipos.</li><li>Parte de los sistemas eléctricos y otros sistemas.</li><li>Estructuras que conectan las diferentes partes del avión.</li></ul>
<div class="key"><b>Concepto importante.</b> El fuselaje proporciona el espacio y la estructura central donde se integran muchos de los sistemas y componentes de la aeronave.</div>
<p><b>Ejemplo.</b> En una Cessna 172, el fuselaje contiene la cabina donde están el piloto y el pasajero, el panel de instrumentos y parte de los sistemas del avión.</p>
${fig('cessna_172_vista_lateral.jpg','Cessna 172, vista lateral')}

<h3>3. Alas — Wings</h3>
<p>Las alas son una de las partes fundamentales del avión. Su función principal durante el vuelo es generar sustentación (<i>lift</i>). En ellas encontramos diferentes superficies y estructuras:</p>
<ul><li><b>Borde de ataque — Leading edge:</b> parte delantera del ala, la que primero encuentra el flujo de aire.</li>
<li><b>Borde de salida — Trailing edge:</b> parte posterior del ala. Normalmente aloja los alerones y los flaps.</li>
<li><b>Punta del ala — Wingtip:</b> extremo exterior del ala.</li>
<li><b>Alerón — Aileron:</b> controla principalmente el roll.</li>
<li><b>Flap:</b> se utiliza sobre todo en despegue y aterrizaje para modificar las características aerodinámicas del ala y permitir volar a velocidades más bajas con mayor sustentación.</li></ul>
${fig('Cessna_172_vista_inferior.jpg','Cessna 172, vista inferior')}

<h3>4. Alerones — Ailerons</h3>
<p>Están normalmente en las partes exteriores del borde de salida de las alas y trabajan de manera diferencial:</p>
<ul><li>Alerón izquierdo arriba y derecho abajo: aumenta la sustentación del ala derecha y disminuye la del ala izquierda, y el avión hace <b>roll hacia la izquierda</b>.</li>
<li>Alerón izquierdo abajo y derecho arriba: <b>roll hacia la derecha</b>.</li></ul>
<div class="key"><b>Relación fundamental:</b> <span class="mono">Ailerons → Roll</span>. Conviene memorizarla.</div>

<h3>5. Flaps</h3>
<p>Son superficies móviles ubicadas normalmente en la parte interior del borde de salida de las alas. Se utilizan principalmente durante el despegue, la aproximación y el aterrizaje. Al extenderlos, según el diseño y la configuración, aumentan la sustentación y también la resistencia aerodinámica, lo que permite usar velocidades más bajas en determinadas fases del vuelo.</p>
${fig('Flaps_cessna.jpg','Flaps de una Cessna 172')}${fig('cessna_172_flaps_extendidos.png','Cessna 172 con flaps extendidos')}

<h3>6. Empenaje — Empennage</h3>
<p>Es el conjunto de estructuras de la cola, con superficies fijas y móviles. Incluye principalmente:</p>
<ul><li>Estabilizador horizontal.</li><li>Elevador (elevator).</li><li>Estabilizador vertical (deriva o fin).</li><li>Rudder.</li><li>En algunos aviones, trim tabs.</li></ul>
${fig('Empennage_components.png','Componentes del empenaje')}

<h3>7. Estabilizador horizontal — Horizontal stabilizer</h3>
<p>Es la superficie horizontal situada en la parte posterior del avión. Su función se relaciona con la estabilidad longitudinal, es decir, la estabilidad alrededor del eje lateral. En muchos aviones incorpora el elevator.</p>

<h3>8. Elevador — Elevator</h3>
<p>Es una superficie de control ubicada normalmente en el estabilizador horizontal. Controla principalmente el <b>pitch</b>: el movimiento del morro hacia arriba o hacia abajo alrededor del eje lateral.</p>
<div class="key"><b>Relación fundamental:</b> <span class="mono">Elevator → Pitch</span></div>
<p>Cuando el piloto mueve el control hacia atrás, normalmente el avión tiende a elevar el morro; hacia adelante, tiende a bajarlo. La respuesta exacta depende del avión y de sus sistemas.</p>

<h3>9. Estabilizador vertical — Vertical stabilizer</h3>
<p>Es la superficie vertical situada en la cola. Proporciona principalmente estabilidad direccional, importante para mantener el avión estable respecto al movimiento de yaw.</p>

<h3>10. Rudder</h3>
<p>Es la superficie móvil ubicada en el estabilizador vertical. Controla principalmente el <b>yaw</b>: el movimiento del morro hacia la izquierda o la derecha alrededor del eje vertical. Se controla normalmente mediante los pedales.</p>
<div class="key"><span class="mono">Rudder → Yaw</span> · <span class="mono">Pedales → Rudder</span></div>

<h3>11. Las tres superficies de control principales</h3>
<div class="wrap"><table><tr><th>SUPERFICIE</th><th>MOVIMIENTO</th><th>EJE</th></tr>
<tr><td class="mono">Ailerons</td><td class="mono">Roll</td><td>Longitudinal</td></tr>
<tr><td class="mono">Elevator</td><td class="mono">Pitch</td><td>Lateral</td></tr>
<tr><td class="mono">Rudder</td><td class="mono">Yaw</td><td>Vertical</td></tr></table></div>
<p>Esto conecta directamente con la lección de Controles de vuelo.</p>

<h3>12. Planta motriz — Powerplant</h3>
<p>Es el conjunto encargado de producir la potencia necesaria para propulsar la aeronave. Según el avión puede usar:</p>
<ul><li><b>Motor de pistón:</b> común en aeronaves ligeras de entrenamiento, como la Cessna 172.</li>
<li><b>Motor turbohélice:</b> combina una turbina con una hélice.</li>
<li><b>Motor turbofán:</b> muy usado en aviones comerciales como los Airbus y Boeing.</li>
<li><b>Motor turborreactor:</b> motor de turbina cuya propulsión se produce principalmente mediante el chorro.</li></ul>

<h3>13. Hélice — Propeller</h3>
<p>En un avión propulsado por hélice, esta convierte la potencia del motor en empuje. En una Cessna 172, el motor mueve la hélice y esta produce el empuje necesario para el vuelo.</p>
${fig('cessna_172_vista_lateral.jpg','Cessna 172, vista lateral')}

<h3>14. Tren de aterrizaje — Landing gear</h3>
<p>Permite soportar el peso del avión en tierra, rodar durante el taxi, absorber las cargas durante el aterrizaje y mantener el avión estable en tierra. Puede ser:</p>
<ul><li><b>Fijo — Fixed landing gear:</b> permanece expuesto durante el vuelo.</li><li><b>Retráctil — Retractable landing gear:</b> se guarda dentro de la estructura del avión durante el vuelo.</li></ul>
${fig('tren_aterrizaje.JPG','Tren de aterrizaje')}

<h3>15. Nariz — Nose</h3>
<p>Es la parte frontal del avión. Según el diseño puede contener el motor, la hélice, el radar, sensores, compartimentos y equipos electrónicos. En una Cessna 172 con motor de pistón, el motor está en la parte delantera.</p>

<h3>16. Cabina — Cockpit</h3>
<p>Es el espacio donde trabajan los pilotos. Allí encontramos controles de vuelo, instrumentos, pantallas, radios, navegación, controles del motor, sistemas eléctricos y comunicaciones.</p>
${fig('cabina_cessna.jpg','Cabina de una Cessna 172')}

<h3>17. Luces exteriores</h3>
<p><b>Navigation lights.</b> Normalmente: rojo en el ala izquierda, verde en el ala derecha y blanco en la parte trasera. También pueden existir beacon, strobe, landing light y taxi light.</p>

<h3>18. Más a fondo: estructura interna del ala</h3>
<ul><li><b>Largueros — Spars:</b> soportan una parte importante de las cargas estructurales del ala.</li><li><b>Costillas — Ribs:</b> ayudan a mantener la forma del ala.</li><li><b>Larguerillos — Stringers:</b> refuerzan la estructura.</li></ul>
${fig('Wing_Components.png','Componentes estructurales del ala')}

<h3>Lo que debes recordar</h3>
<div class="sum">
<div><b class="mono">FUSELAGE</b><br>Cuerpo principal del avión.</div>
<div><b class="mono">WINGS</b><br>Generan sustentación.</div>
<div><b class="mono">AILERONS</b><br>Controlan principalmente el roll.</div>
<div><b class="mono">ELEVATOR</b><br>Controla principalmente el pitch.</div>
<div><b class="mono">RUDDER</b><br>Controla principalmente el yaw.</div>
<div><b class="mono">EMPENNAGE</b><br>Conjunto de estructuras de la cola.</div>
<div><b class="mono">POWERPLANT</b><br>Produce la potencia para propulsar el avión.</div>
<div><b class="mono">LANDING GEAR</b><br>Permite operar y desplazarse en tierra.</div></div>
<div class="note">Material de estudio general. La configuración y los nombres exactos varían según el modelo de avión y su manual.</div>`,
q:[
{p:'¿Qué superficie controla principalmente el roll?',o:['Rudder','Elevator','Ailerons','Flaps'],a:2,e:'Los ailerons actúan de forma diferencial y producen alabeo (roll).'},
{p:'¿Qué superficie controla principalmente el pitch?',o:['Elevator','Rudder','Aileron','Flap'],a:0,e:'El elevator sube o baja el morro alrededor del eje lateral.'},
{p:'¿Qué superficie controla principalmente el yaw?',o:['Elevator','Rudder','Aileron','Spoiler'],a:1,e:'El rudder, accionado con los pedales, controla la guiñada (yaw).'},
{p:'¿Cuál es la función principal del tren de aterrizaje?',o:['Generar sustentación','Controlar el yaw','Soportar el avión y permitir su operación en tierra','Generar empuje'],a:2,e:'Soporta el peso, permite rodar y absorbe las cargas del aterrizaje.'}]};
