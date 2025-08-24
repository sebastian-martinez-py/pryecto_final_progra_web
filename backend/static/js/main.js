// ======== API helpers ========
const api = {
  async crearItem(item){
    const r = await fetch('/api/items',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(item)
    });
    if(!r.ok){ let t=''; try{t=await r.text();}catch{}; throw new Error(`HTTP ${r.status} ${t}`); }
    return r.json();
  },
  async listarItems(){
    const r = await fetch('/api/items', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' }});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  },
  async ejecutarPipeline(){
    const r = await fetch('/api/pipeline/run',{method:'POST'});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  },
  async crearInteres(itemId, data){
    const r = await fetch(`/api/items/${itemId}/interest`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    });
    if(!r.ok){ let t=''; try{t=await r.text();}catch{}; throw new Error(`HTTP ${r.status} ${t}`); }
    return r.json();
  },
  async eliminarItem(id){
    const r = await fetch(`/api/items/${id}`, { method:'DELETE' });
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    return true;
  }
};

// Datos helper
const voluntario = { nombre:'Refugio Adopta CR', tel:'+506 8888-0000', mail:'contacto@adoptacr.org' };
const dogNames = ['Luna','Rocky','Toby','Queso','Maya','Coco','Kira','Max','Nala','Bimba','Milo','Tommy','Greta'];

// ======== UI refs ========
const $ = s => document.querySelector(s);
const panelPerdido = $('#panelPerdido');
const msgPerdido = $('#msgPerdido');
const cardsAdopt = $('#cardsAdoptables');
const cardsLost = $('#cardsPerdidos');

$('#ctaAdoptar').addEventListener('click',()=> window.scrollTo({top: document.body.scrollHeight, behavior:'smooth'}));
$('#ctaPerdido').addEventListener('click', ()=>{ panelPerdido.hidden=false; panelPerdido.scrollIntoView({behavior:'smooth'}); });
$('#btnGenerar').addEventListener('click', generarPerrito);
$('#btnPerdido').addEventListener('click', ()=>{ panelPerdido.hidden=false; panelPerdido.scrollIntoView({behavior:'smooth'}); });
$('#btnReload').addEventListener('click', cargarPublicaciones);

// ======== Helpers de render ========
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m])); }

function cardTemplate({id,kind,title,description,image_url,contact_name,contact_phone,contact_email}){
  const isLost = kind === 'LOST';
  return `
  <article class="card" data-id="${id}">
    <img loading="lazy" src="${image_url||''}" alt="${escapeHtml(title)}">
    <div class="body">
      <div class="row" style="justify-content:space-between">
        <span class="chip">${isLost? '📢 Perdido' : '🐕 Adoptable'}</span>
        <div class="row">
          ${!isLost? `<button class="btn btn-primary" data-contact-for="${id}">Contactar</button>` : ''}
          <button class="btn btn-danger" data-delete="${id}" title="Eliminar">Eliminar</button>
        </div>
      </div>
      <h4 style="margin:10px 0 6px">${escapeHtml(title)}</h4>
      ${description? `<p class="muted" style="white-space:pre-wrap">${escapeHtml(description)}</p>`:''}
      ${isLost && (contact_name || contact_phone || contact_email) ? `
        <p class="muted"><strong>Contacto del aviso:</strong> ${escapeHtml(contact_name||'')} ${escapeHtml(contact_phone||'')} ${escapeHtml(contact_email||'')}</p>` : ''
      }
    </div>
  </article>`;
}

function wireCardActionsWithin(root){
  // Contactar
  root.querySelectorAll('button[data-contact-for]').forEach(btn=>{
    btn.onclick = ()=>{
      const id = btn.dataset.contactFor;
      const form = document.getElementById('formInteres');
      form.item_id.value = id;
      document.getElementById('msgInteres').textContent = '';
      modal.showModal();
    };
  });
  // Eliminar
  root.querySelectorAll('button[data-delete]').forEach(btn=>{
    btn.onclick = async ()=>{
      const id = btn.dataset.delete;
      if(!confirm('¿Eliminar esta publicación? Esta acción no se puede deshacer.')) return;
      try{
        await api.eliminarItem(id);
        const card = btn.closest('.card');
        if(card) card.remove();
      }catch(err){
        alert('No se pudo eliminar: ' + err.message);
        console.error(err);
      }
    };
  });
}

// ======== Cargar listas (con no-store) ========
async function cargarPublicaciones(){
  const items = await api.listarItems();
  const adopt = [], lost = [];
  for(const it of items){ if(it.kind === 'ADOPT') adopt.push(it); else if(it.kind === 'LOST') lost.push(it); }
  adopt.sort((a,b)=> (b.id||0)-(a.id||0)); lost.sort((a,b)=> (b.id||0)-(a.id||0));

  cardsAdopt.innerHTML = adopt.map(cardTemplate).join('') || '<p class="muted">Aún no hay adoptables. ¡Genera uno con la API!</p>';
  cardsLost.innerHTML  = lost.map(cardTemplate).join('')  || '<p class="muted">Sin reportes de pérdida por ahora.</p>';

  wireCardActionsWithin(cardsAdopt);
  wireCardActionsWithin(cardsLost);
}

// ======== Generar adoptable (optimista) ========
async function generarPerrito(){
  try{
    const dog = await fetch('https://dog.ceo/api/breeds/image/random', { cache: 'no-store' }).then(r=>r.json());
    const image_url = dog.message;
    const pet_name = dogNames[Math.floor(Math.random()*dogNames.length)];
    const title = `ADOPTA · ${pet_name}`;
    const description = `Perrito listo para adopción.`;
    const created = await api.crearItem({
      kind:'ADOPT', pet_name, title, description, image_url,
      contact_name: voluntario.nombre, contact_phone: voluntario.tel, contact_email: voluntario.mail
    });
    // ✅ Render inmediato
    const html = cardTemplate(created);
    const tmp = document.createElement('div'); tmp.innerHTML = html.trim();
    const node = tmp.firstElementChild;
    cardsAdopt.prepend(node);
    wireCardActionsWithin(node);
    // Paso no crítico
    api.ejecutarPipeline().catch(e=>console.warn('pipeline (no crítico)', e));
  }catch(err){
    alert('No se pudo generar el perrito: ' + err.message);
    console.error(err);
  }
}

// ======== Publicar perdido (optimista) ========
const formPerdido = document.getElementById('formPerdido');
formPerdido.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const submitBtn = formPerdido.querySelector('button[type="submit"]');
  submitBtn.disabled = true; submitBtn.textContent = 'Publicando…';
  msgPerdido.textContent = '';

  const fd = new FormData(formPerdido);
  const pet_name = fd.get('nombre');
  const zone = fd.get('zona');
  const title = `PERDIDO · ${pet_name} · ${zone}`;
  const description = (fd.get('desc')||'').trim();
  const image_url = fd.get('img');

  try{
    const created = await api.crearItem({
      kind:'LOST', pet_name, zone, title, description, image_url,
      contact_name: fd.get('contacto'), contact_phone: fd.get('tel'),
      contact_email: fd.get('mail') || null
    });

    // ✅ Render inmediato en "Perdidos"
    const html = cardTemplate(created);
    const tmp = document.createElement('div'); tmp.innerHTML = html.trim();
    const node = tmp.firstElementChild;
    // si había mensaje "sin reportes", lo limpiamos
    if(cardsLost.firstElementChild && cardsLost.firstElementChild.tagName === 'P') cardsLost.innerHTML = '';
    cardsLost.prepend(node);
    wireCardActionsWithin(node);

    formPerdido.reset();
    msgPerdido.textContent = '¡Aviso publicado!';
    // No bloquear por pipeline/recarga
    api.ejecutarPipeline().catch(e=>console.warn('pipeline (no crítico)', e));
    // Refresco de seguridad (background) para que IDs/orden queden perfectos
    setTimeout(()=> cargarPublicaciones().catch(()=>{}), 1200);
    // Llevar al usuario a la sección
    document.getElementById('panelListas').scrollIntoView({behavior:'smooth'});
  }catch(err){
    msgPerdido.textContent = 'Error al publicar: ' + (err.message || 'ver consola');
    console.error('crearItem falló:', err);
  }finally{
    submitBtn.disabled = false; submitBtn.textContent = 'Publicar aviso';
  }
});

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
    msg.textContent = '¡Tu interés fue enviado!'; setTimeout(()=> modal.close(), 1200);
  }catch(err){
    msg.textContent = 'Ocurrió un error al enviar tu interés.'; console.error(err);
  }
});

// ======== Init ========
cargarPublicaciones();
