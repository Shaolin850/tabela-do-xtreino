
//    Admin - CRUD de Produtos (+ tema)
//   =========================
const $A = (s, r=document)=> r.querySelector(s);
const $$A = (s, r=document)=> [...r.querySelectorAll(s)];
const STORAGE_KEY = 'mv_catalog_v1';
const ADMIN_TOKEN_KEY = 'mv_admin_token';
const THEME_KEY = 'mv_theme';
const money = n => n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

const ADMIN_PASSWORD = 'admin123'; // Troque em produção

function loadCatalog(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }catch{ return []; } }
function saveCatalog(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

let catalog = loadCatalog();
let editingId = null;

/* ========== Auth simples (demo) ========== */
function isAuthed(){ return localStorage.getItem(ADMIN_TOKEN_KEY)==='ok'; }
function authOn(){ localStorage.setItem(ADMIN_TOKEN_KEY,'ok'); }
function authOff(){ localStorage.removeItem(ADMIN_TOKEN_KEY); location.reload(); }

function showLogin(){ $A('#loginCard').classList.remove('hide'); $A('#dash').classList.add('hide'); }
function showDash(){ $A('#loginCard').classList.add('hide'); $A('#dash').classList.remove('hide'); renderTable(); }
function login(){
  const pass = $A('#adminPass').value.trim();
  if(pass===ADMIN_PASSWORD){ authOn(); showDash(); }
  else alert('Senha incorreta.');
}

/* ========== Tema compartilhado com a loja ========== */
function applyTheme(mode){
  document.body.classList.toggle('theme-dark', mode==='dark');
  localStorage.setItem(THEME_KEY, mode);
}
function getTheme(){
  return document.body.classList.contains('theme-dark') ? 'dark' : 'light';
}

/* ========== Tabela ========== */
function rowItem(p){
  return `
    <div class="row-item">
      <div class="ri-thumb"><img src="${p.img||''}" alt="" style="width:100%; height:100%; object-fit:cover" onerror="this.onerror=null;this.src='https://source.unsplash.com/300x200/?apparel&sig=${encodeURIComponent(p.id)}'"/></div>
      <div class="ri-meta"><strong>${p.name}</strong><span class="muted">${p.brand} • ${p.id}</span></div>
      <div>${p.cat}</div>
      <div>${p.stock}</div>
      <div>${p.rating?.toFixed? p.rating.toFixed(1): p.rating}</div>
      <div>${money(p.price)}</div>
      <div>${p.sale? 'Oferta':''} ${p.featured? '• Destaque':''}</div>
      <div style="display:flex; gap:8px; justify-content:flex-end">
        <button class="btn" data-edit="${p.id}">Editar</button>
      </div>
    </div>
  `;
}

function renderTable(){
  const q = $A('#admSearch').value.trim().toLowerCase();
  const cat = $A('#admCat').value;
  catalog = loadCatalog();

  let list = catalog.filter(p=>{
    if(cat!=='all' && p.cat!==cat) return false;
    if(q && !(p.name + ' ' + p.id).toLowerCase().includes(q)) return false;
    return true;
  });

  $A('#admGrid').innerHTML = `
    <div class="row-item" style="background:#fafbff; font-weight:600">
      <div></div><div>Produto</div><div>Categoria</div><div>Estoque</div><div>Aval.</div><div>Preço</div><div>Flags</div><div>Ações</div>
    </div>
    ${list.map(rowItem).join('')}
  `;

  $$A('[data-edit]').forEach(b=> b.onclick = ()=> openModal(b.dataset.edit));
}

/* ========== Modal Produto ========== */
function openModal(id){
  const isNew = !id;
  $A('#modal').classList.add('open');
  $A('#modalTitle').textContent = isNew? 'Novo Produto' : 'Editar Produto';
  $A('#delProduct').classList.toggle('hide', isNew);
  editingId = id || null;

  const p = isNew ? {
    id:'', name:'', brand:'', price:0, oldPrice:null, stock:0, cat:'feminino', rating:4.5, featured:false, sale:false, img:'', desc:''
  } : catalog.find(x=>x.id===id);

  $A('#pName').value = p.name || '';
  $A('#pSku').value = p.id || '';
  $A('#pPrice').value = p.price || 0;
  $A('#pStock').value = p.stock || 0;
  $A('#pCat').value = p.cat || 'feminino';
  $A('#pRating').value = p.rating || 4.5;
  $A('#pImg').value = p.img || '';
  $A('#pBrand').value = p.brand || '';
  $A('#pFeatured').checked = !!p.featured;
  $A('#pSale').checked = !!p.sale;
  $A('#pDesc').value = p.desc || '';
}
function closeModal(){
  $A('#modal').classList.remove('open');
  editingId = null;
}
function collectForm(){
  const data = {
    id: $A('#pSku').value.trim(),
    name: $A('#pName').value.trim(),
    brand: $A('#pBrand').value.trim(),
    price: parseFloat($A('#pPrice').value || '0'),
    stock: parseInt($A('#pStock').value || '0', 10),
    cat: $A('#pCat').value,
    rating: parseFloat($A('#pRating').value || '4.5'),
    img: $A('#pImg').value.trim(),
    desc: $A('#pDesc').value.trim(),
    featured: $A('#pFeatured').checked,
    sale: $A('#pSale').checked,
  };
  if(!data.id || !data.name) throw new Error('Preencha ao menos SKU e Nome.');
  if(data.price<0 || data.stock<0) throw new Error('Preço/Estoque inválidos.');
  data._ts = Date.now();
  if(data.sale && (!data.oldPrice || data.oldPrice<=data.price)){
    data.oldPrice = Math.round(data.price*1.2*100)/100;
  }
  return data;
}
function saveProduct(){
  try{
    const data = collectForm();
    let cat = loadCatalog();
    const idx = cat.findIndex(p=>p.id===data.id);

    if(editingId && editingId!==data.id){
      const oldIdx = cat.findIndex(p=>p.id===editingId);
      if(oldIdx>=0) cat.splice(oldIdx,1);
    }

    if(idx>=0) cat[idx] = {...cat[idx], ...data};
    else cat.push(data);

    saveCatalog(cat);
    closeModal();
    renderTable();
  }catch(e){
    alert(e.message);
  }
}
function deleteProduct(){
  if(!editingId) return;
  if(!confirm('Tem certeza que deseja excluir este produto?')) return;
  let cat = loadCatalog().filter(p=>p.id!==editingId);
  saveCatalog(cat);
  closeModal();
  renderTable();
}

/* ========== Import/Export ========== */
function exportData(){
  const data = JSON.stringify(loadCatalog(), null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'modaversa-catalogo.json';
  a.click();
  URL.revokeObjectURL(url);
}
function importData(file){
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const data = JSON.parse(reader.result);
      if(!Array.isArray(data)) throw new Error('Arquivo inválido.');
      // Garante imagens e notas mínimas ao importar
      const fixed = data.map((p,i)=>({
        ...p,
        img: p.img || `https://source.unsplash.com/600x750/?apparel,fashion&sig=${encodeURIComponent(p.id||i)}`,
        rating: p.rating || 4.5
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fixed));
      renderTable(); alert('Catálogo importado com sucesso.');
    }catch(e){ alert('Erro ao importar: ' + e.message); }
  };
  reader.readAsText(file);
}

/* ========== Eventos ========== */
document.addEventListener('DOMContentLoaded', ()=>{
  // Tema
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);
  $A('#btnThemeAdmin').onclick = ()=>{
    const next = getTheme()==='dark' ? 'light' : 'dark';
    applyTheme(next);
  };

  if(isAuthed()) showDash(); else showLogin();

  $A('#doLogin').onclick = login;
  $A('#logout').onclick = authOff;

  $A('#admSearch').oninput = renderTable;
  $A('#admCat').onchange = renderTable;

  $A('#newItem').onclick = ()=> openModal(null);
  $A('#closeModal').onclick = closeModal;
  $A('#saveProduct').onclick = saveProduct;
  $A('#delProduct').onclick = deleteProduct;

  $A('#exportData').onclick = exportData;
  $A('#importData').onchange = e=>{ const f = e.target.files[0]; if(f) importData(f); };
});
