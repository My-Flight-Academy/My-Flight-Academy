// Utilidades compartidas por todas las lecciones.
//
// fig(archivo, descripción, crédito)
//   Muestra una imagen. La carpeta se deduce sola del archivo de la lección:
//   js/lessons/fase1-fundamentos-de-aviacion/partes-del-avion.js
//     -> images/fase1-fundamentos-de-aviacion/partes-del-avion/<archivo>
//   - Escribe solo el nombre del archivo, con extensión y respetando mayúsculas.
//   - Para una imagen compartida entre lecciones, usa una ruta con carpeta
//     desde /images, por ejemplo fig('comunes/ejes-del-avion.png', '...').
//   - Si "archivo" va vacío (''), se muestra un marcador de "imagen pendiente".
//   - "crédito" es opcional: autor y licencia (obligatorio en imágenes CC BY).
function fig(file,alt,credit){
 if(!file)return `<div class="fig ph">Imagen pendiente: ${alt}.</div>`;
 let dir='';
 if(!file.includes('/')){ // document.currentScript es el archivo de lección que se está ejecutando
  const cs=document.currentScript,m=cs&&cs.src&&cs.src.match(/\/js\/lessons\/([^/]+)\/([^/]+)\.js/);
  if(m)dir=m[1]+'/'+m[2]+'/'}
 const src='images/'+dir+encodeURI(file),cap=`${alt}.${credit?' '+credit+'.':''}`;
 if(/\.pdf$/i.test(file))return `<figure class="fig"><iframe src="${src}" title="${alt}" style="width:100%;height:520px;border:1px solid var(--ln);border-radius:5px;background:#fff"></iframe><figcaption>${cap} <a href="${src}" target="_blank" rel="noopener" style="color:var(--am)">Abrir el PDF</a></figcaption></figure>`;
 return `<figure class="fig"><img loading="lazy" src="${src}" alt="${alt}"><figcaption>${cap}</figcaption></figure>`}
