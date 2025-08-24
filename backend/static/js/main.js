// ======== API helpers ========
const api = {
  async crearItem(item){
    const r = await fetch('/api/items',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify(item)
    });
    if(!r.ok) throw new Error(await r.text()); return r.json();
  },
  async listarItems(){
    const r = await fetch('/api/items'); if(!r.ok) throw new Error(await r.text()); return r.json();
  },
  async ejecutarPipeline(){
    const r = await fetch('/api/pipeline/run',{method:'POST'}); if(!r.ok) throw new Error(await r.text()); return r.json();
  },
  async crearInteres(itemId, data){
    const r = await fetch(`/api/items/${itemId}/interest`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    });
    if(!r.ok) throw new Error(await r.text()); return r.json();
  },
  async buscarPorNombre(nombre){
    const r = await fetch(`/api/items/search?pet_name=${encodeURIComponent(nombre)}`);
    if(!r.ok) throw new Error(await r.text()); return r.json();
  },
  async actualizarContacto(itemId, data){
    const r = await fetch(`/api/items/${itemId}/contact`,{
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    });
    if(!r.ok) throw new Error(await r.text()); return r.json();
  }
};

// Datos para generar adoptables
const voluntario = { nombre:'Refugio Adopta CR', tel:'+506 8888-0000', mail:'contacto@adoptacr.org' };
const dogNames = ['Luna','Rocky','Toby','Queso','Maya','Coco','Kira','Max','Nala','Bimba','Milo','Tommy','Greta'];

// ======== UI refs ========
const $ = s => document.querySelector(s);
const panelPerdido = $('#panelPerdido');
const msgPerdido = $('#msgPerdido');
const cardsAdopt = $('#cardsAdoptables');
const cardsLost = $('#cardsPerdidos');
const tabs = document.querySelectorAll('.tab');
const tabPanels = document.querySelectorAll('.tab-panel');

// Tabs
tabs.forEach(t => t.addEventListener('click', ()=>{
  tabs.forEach(x=>x.classList.remove('active')); t.classList.add('active');
  tabPanels.forEach(p=> p.hidden = (p.id !== `tab-${t.dataset.tab}`));
}));

$('#ctaAdoptar').addEventListener('click',()=> {
  tabs[0].click();
  window.scrollTo({top: document.body.scrollHeight, behavior:'smooth'});
});
$('#ctaPerdido').addEventListener('click', ()=>{
  tabs[0].click();
  mostrarPerdido();
});

$('#btnGenerar').addEventListener('click', generarPerrito);
$('#btnPerdido').addEventListener('click', mostrarPerdido);
$('#btnReload').addEventListener('click', cargarPublicaciones);

function mostrarPerdido(){
  panelPerdido.hidden = false;
  panelPerdido.scrollIntoView({behavior:'smooth', block:'start'});
}

// ======== Generar adoptable (API externa) ========
async function generarPerrito(){
  try{
    const dog = await fetch('https://dog.ceo/api/breeds/image/random').then(r=>r.json());
    const image_url = dog.message;
    const pet_name = dogNames[Math.floor(Math.random()*dogNames.length)];
    const title = `ADOPTA · ${pet_name}`;
    const description = `Perrito listo para adopción.`;
    const created = await api.crearItem({
      kind:'ADOPT', pet_name, title, description, image_url,
      contact_name: voluntario.nombre, contact_phone: voluntario.tel, contact_email: voluntario.mail
    });
    await api.ejecutarPipeline().catch(()=>{});
    await cargarPublicaciones();
    alert(`Se creó ${created.title}`);
  }catch(err){
    alert('No se pudo generar el perrito.'); console.error(err);
  }
}

// ======== Publicar perdido ========
$('#formPerdido').addEventListener('submit', async (e)=>{
  e.preventDefault(); msgPerdido.textContent = 'Publicando...';
  const fd = new FormData(e.currentTarget);
  const pet_name = fd.get('nombre');
  const zone = fd.get('zona');
  const title = `PERDIDO · ${pet_name} · ${zone}`;
  const description = (fd.get('desc')||'').trim();
  const image_url = fd.get('img');
  try{
    await api.crearItem({
      kind:'LOST', pet_name, zone, title, description, image_url,
      contact_name: fd.get('contacto'), contact_phone: fd.get('tel'), contact_email: fd.get('mail')||null
    });
    await api.ejecutarPipeline().catch(()=>{});
    e.currentTarget.reset();
    msgPerdido.textContent = '¡Aviso publicado!'; setTimeout(()=> msgPerdido.textContent='', 2500);
    await cargarPublicaciones();
  }catch(err){
    msgPerdido.textContent = 'Error al publicar (ver consola)';
    console.error(err);
  }
});

// ======== Render ========
function cardTemplate({id,kind,title,description,image_url,contact_name,contact_phone,contact_email}){
  const isLost = kind === 'LOST';
  return `
  <article class="card">
    <img loading="lazy" src="${image_url||''}" alt="${title}">
    <div class="body">
      <div class="row" style="justify-content:space-between">
        <span class="chip">${isLost? '📢 Perdido' : '🐕 Adoptable'}</span>
        ${!isLost? `<button class="btn btn-primary" data-contact-for="${id}">Contactar</button>` : ''}
      </div>
      <h4 style="margin:10px 0 6px">${title}</h4>
      ${description? `<p class="muted" style="white-space:pre-wrap">${escapeHtml(description)}</p>`:''}
      ${isLost && (contact_name || contact_phone || contact_email) ? `
        <p class="muted"><strong>Contacto del aviso:</strong> ${escapeHtml(contact_name||'')} ${escapeHtml(contact_phone||'')} ${escapeHtml(contact_email||'')}</p>` : ''
      }
    </div>
  </article>`;
}
function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
}

async function cargarPublicaciones(){
  const items = await api.listarItems();
  const adopt = [], lost = [];
  for(const it of items){
    if(it.kind === 'ADOPT') adopt.push(it);
    else if(it.kind === 'LOST') lost.push(it);
  }
  adopt.sort((a,b)=> (b.id||0)-(a.id||0));
  lost.sort((a,b)=> (b.id||0)-(a.id||0));
  cardsAdopt.innerHTML = adopt.map(cardTemplate).join('') || '<p class="muted">Aún no hay adoptables. ¡Genera uno con la API!</p>';
  cardsLost.innerHTML  = lost.map(cardTemplate).join('')  || '<p class="muted">Sin reportes de pérdida por ahora.</p>';

  // Botones "Contactar" -> abre modal para dejar interés
  cardsAdopt.querySelectorAll('button[data-contact-for]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id = btn.dataset.contactFor;
      const form = document.getElementById('formInteres');
      form.item_id.value = id;
      document.getElementById('msgInteres').textContent = '';
      modal.showModal();
    });
  });
}

// ======== Modal interés ========
const modal = document.getElementById('modalContacto');
document.getElementById('cerrarModal').addEventListener('click', ()=> modal.close());
document.getElementById('formInteres').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const item_id = fd.get('item_id');
  const payload = {
    person_name: fd.get('person_name'),
    phone: fd.get('phone'),
    email: fd.get('email') || null,
    message: fd.get('message') || null
  };
  const msg = document.getElementById('msgInteres');
  try{
    await api.crearInteres(item_id, payload);
    msg.textContent = '¡Tu interés fue enviado! La persona del anuncio podrá contactarte.';
    setTimeout(()=> modal.close(), 1200);
  }catch(err){
    msg.textContent = 'Ocurrió un error al enviar tu interés.';
    console.error(err);
  }
});

// ======== Buscar/Editar contacto ========
$('#formBuscar').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const nombre = $('#qNombre').value.trim();
  if(!nombre) return;
  const res = await api.buscarPorNombre(nombre);
  const cont = $('#resultados');
  if(res.length === 0){ cont.innerHTML = '<p class="muted">Sin resultados.</p>'; return; }
  cont.innerHTML = res.map(r => editorContacto(r)).join('');
  // wire guardar
  cont.querySelectorAll('form[data-edit]').forEach(f=>{
    f.addEventListener('submit', async (ev)=>{
      ev.preventDefault();
      const fd = new FormData(f);
      const body = {
        contact_name: fd.get('contact_name') || null,
        contact_phone: fd.get('contact_phone') || null,
        contact_email: fd.get('contact_email') || null,
      };
      const id = f.dataset.edit;
      const out = await api.actualizarContacto(id, body);
      f.querySelector('.help').textContent = 'Guardado ✓';
      console.log('actualizado:', out);
    });
  });
});

function editorContacto(it){
  return `
  <article class="panel" style="margin-bottom:12px">
    <div class="row" style="justify-content:space-between">
      <div class="grow">
        <strong>${escapeHtml(it.title)}</strong>
        <div class="muted">ID: ${it.id} — ${it.kind === 'ADOPT' ? 'Adoptable' : 'Perdido'}</div>
      </div>
    </div>
    <form data-edit="${it.id}" class="grid two" style="margin-top:10px">
      <div><label>Nombre contacto</label><input name="contact_name" value="${escapeHtml(it.contact_name||'')}" /></div>
      <div><label>Teléfono</label><input name="contact_phone" value="${escapeHtml(it.contact_phone||'')}" /></div>
      <div><label>Correo</label><input type="email" name="contact_email" value="${escapeHtml(it.contact_email||'')}" /></div>
      <div style="grid-column:1/-1;display:flex;gap:10px;align-items:center">
        <button class="btn btn-primary" type="submit">Guardar cambios</button>
        <span class="help"></span>
      </div>
    </form>
  </article>`;
}

// ======== Init ========
cargarPublicaciones();
