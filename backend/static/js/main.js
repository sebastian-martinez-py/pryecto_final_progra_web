// ======== API helpers ========
const api = {
  async crearItem(item){
    const r = await fetch('/api/items',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(item)
    });
    if(!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async listarItems(){
    const r = await fetch('/api/items');
    if(!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async ejecutarPipeline(){
    const r = await fetch('/api/pipeline/run',{method:'POST'});
    if(!r.ok) throw new Error(await r.text());
    return r.json();
  }
};

// Datos ficticios para contacto en adoptables
const voluntarios = [
  { nombre:'María Pérez', tel:'+506 8888-0001', mail:'maria@adoptacr.org' },
  { nombre:'Carlos Gómez', tel:'+506 8888-0002', mail:'carlos@adoptacr.org' },
  { nombre:'Luisa Rojas', tel:'+506 8888-0003', mail:'luisa@adoptacr.org' },
  { nombre:'Diego Mena',  tel:'+506 8888-0004', mail:'diego@adoptacr.org' },
];
const dogNames = ['Luna','Rocky','Toby','Queso','Maya','Coco','Kira','Max','Nala','Bimba','Milo','Tommy','Greta'];

// ======== UI refs ========
const $ = s => document.querySelector(s);
const panelPerdido = $('#panelPerdido');
const msgPerdido = $('#msgPerdido');
const cardsAdopt = $('#cardsAdoptables');
const cardsLost = $('#cardsPerdidos');

// Dropdown
const dd = $('#menuActions');
dd.querySelector('.dropdown-toggle').addEventListener('click',()=> dd.classList.toggle('open'));
dd.addEventListener('mouseleave',()=> dd.classList.remove('open'));
dd.querySelectorAll('[data-action]').forEach(btn=> btn.addEventListener('click', e=>{
  const act = e.currentTarget.dataset.action;
  dd.classList.remove('open');
  if(act==='adoptar') window.scrollTo({top: document.body.scrollHeight, behavior:'smooth'});
  if(act==='generar') generarPerrito();
  if(act==='perdido') mostrarPerdido();
  if(act==='recargar') cargarPublicaciones();
}));

$('#ctaAdoptar').addEventListener('click',()=> window.scrollTo({top: document.body.scrollHeight, behavior:'smooth'}));
$('#ctaPerdido').addEventListener('click', mostrarPerdido);
$('#btnGenerar').addEventListener('click', generarPerrito);
$('#btnPerdido').addEventListener('click', mostrarPerdido);
$('#btnReload').addEventListener('click', cargarPublicaciones);

function mostrarPerdido(){
  panelPerdido.hidden = false;
  panelPerdido.scrollIntoView({behavior:'smooth', block:'start'});
}

// ======== Generar adoptable con API externa ========
async function generarPerrito(){
  try{
    const dog = await fetch('https://dog.ceo/api/breeds/image/random').then(r=>r.json());
    const image_url = dog.message;
    const title = `ADOPTA · ${dogNames[Math.floor(Math.random()*dogNames.length)]}`;
    const v = voluntarios[Math.floor(Math.random()*voluntarios.length)];
    const description = `Contacto: ${v.nombre} | Tel: ${v.tel} | Email: ${v.mail}`;
    await api.crearItem({ title, description, image_url });
    await api.ejecutarPipeline().catch(()=>{});
    await cargarPublicaciones();
  }catch(err){
    alert('No se pudo generar el perrito. Intenta de nuevo.');
    console.error(err);
  }
}

// ======== Publicar perdido ========
$('#formPerdido').addEventListener('submit', async (e)=>{
  e.preventDefault(); msgPerdido.textContent = 'Publicando...';
  const fd = new FormData(e.currentTarget);
  const title = `PERDIDO · ${fd.get('nombre')} · ${fd.get('zona')}`;
  const contact = `Contacto: ${fd.get('contacto')} | Tel: ${fd.get('tel')}${fd.get('mail')? ' | Email: '+fd.get('mail'):''}`;
  const description = `${fd.get('desc')||''}\n${contact}`.trim();
  const image_url = fd.get('img');
  try{
    await api.crearItem({title, description, image_url});
    await api.ejecutarPipeline().catch(()=>{});
    e.currentTarget.reset();
    msgPerdido.textContent = '¡Aviso publicado!';
    await cargarPublicaciones();
    setTimeout(()=> msgPerdido.textContent='', 2500);
  }catch(err){
    msgPerdido.textContent = 'Error al publicar';
    console.error(err);
  }
});

// ======== Render ========
function cardTemplate({id,title,description,image_url,isLost,contact}){
  return `
  <article class="card">
    <img loading="lazy" src="${image_url}" alt="${title}">
    <div class="body">
      <div class="row" style="justify-content:space-between">
        <span class="chip">${isLost? '📢 Perdido' : '🐕 Adoptable'}</span>
        ${!isLost? `<button class="btn btn-primary" data-contact='${JSON.stringify(contact)}' data-id='${id}'>Contactar</button>` : ''}
      </div>
      <h4 style="margin:10px 0 6px">${title}</h4>
      ${description? `<p class="muted" style="white-space:pre-wrap">${escapeHtml(description)}</p>`:''}
    </div>
  </article>`;
}
function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
}
function parseContacto(text=''){
  const nombre = /Contacto:\s*([^|\n]+)/i.exec(text)?.[1]?.trim();
  const tel    = /Tel:\s*([^|\n]+)/i.exec(text)?.[1]?.trim();
  const mail   = /Email:\s*([^|\n]+)/i.exec(text)?.[1]?.trim();
  return { nombre, tel, mail };
}

async function cargarPublicaciones(){
  const items = await api.listarItems();
  const adopt = [], lost = [];
  for(const it of items){
    const isLost = /^PERDIDO/i.test(it.title||'');
    const isAdopt = /^ADOPTA/i.test(it.title||'');
    if(isAdopt){
      const c = parseContacto(it.description);
      adopt.push({ ...it, isLost:false, contact:c });
    } else if(isLost){
      lost.push({ ...it, isLost:true });
    }
  }
  adopt.sort((a,b)=> (b.id||0)-(a.id||0));
  lost.sort((a,b)=> (b.id||0)-(a.id||0));
  cardsAdopt.innerHTML = adopt.map(cardTemplate).join('') || '<p class="muted">Aún no hay adoptables. ¡Genera uno con la API!</p>';
  cardsLost.innerHTML  = lost.map(cardTemplate).join('')  || '<p class="muted">Sin reportes de pérdida por ahora.</p>';

  // Botones "Contactar" -> modal
  cardsAdopt.querySelectorAll('button[data-contact]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const c = JSON.parse(btn.dataset.contact||'{}');
      mostrarContacto(c);
    });
  });
}

// ======== Modal de contacto ========
const modal = document.getElementById('modalContacto');
const contenido = document.getElementById('contactoContenido');
document.getElementById('cerrarModal').addEventListener('click', ()=> modal.close());
function mostrarContacto(c={}){
  contenido.innerHTML = `
    <p class="muted">Escribe o llama para conocer el proceso de adopción responsable.</p>
    <div class="grid">
      <div><strong>Nombre:</strong> ${escapeHtml(c.nombre||'—')}</div>
      <div><strong>Teléfono:</strong> <a href="https://wa.me/${encodeURIComponent((c.tel||'').replace(/\D/g,''))}" target="_blank">${escapeHtml(c.tel||'—')}</a></div>
      <div><strong>Correo:</strong> <a href="mailto:${escapeHtml(c.mail||'')}">${escapeHtml(c.mail||'—')}</a></div>
    </div>`;
  modal.showModal();
}

// ======== Init ========
cargarPublicaciones();
