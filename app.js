
/* Loja - Catálogo, Tema e Carrinho
   ========================= */
const $ = (s, r=document)=> r.querySelector(s);
const $$ = (s, r=document)=> [...r.querySelectorAll(s)];
const money = n => n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

const STORAGE_KEY = 'mv_catalog_v1';
const CART_KEY = 'mv_cart_v1';
const THEME_KEY = 'mv_theme';

function loadCatalog(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }catch{ return []; }
}
function saveCatalog(cat){ localStorage.setItem(STORAGE_KEY, JSON.stringify(cat)); }
function loadCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }catch{ return []; } }
function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); }

let catalog = loadCatalog();
let cart = loadCart();

const state = {
  q: '', cat: 'all', sale: false, featured: false, order: 'default'
};

/* =========================
   Geração de catálogo (260 itens)
   ========================= */
function randomBetween(min, max){ return Math.random()*(max-min)+min; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function imageFor(cat, i){
  // Usa Unsplash Source com palavras-chave por categoria
  const map = {
    feminino: ['women clothing fashion model', 'dress fashion', 'blouse fashion', 'skirt outfit', 'coat women'],
    masculino: ['men clothing fashion model', 'shirt fashion', 'jacket menswear', 'pants menswear', 'hoodie men'],
    infantil: ['kids clothing', 'children fashion outfit', 'toddler clothes', 'kids wear'],
    calcados: ['shoes fashion', 'sneakers', 'heels fashion', 'boots fashion', 'loafers'],
    acessorios: ['fashion accessories', 'handbag', 'backpack fashion', 'belt fashion', 'hat fashion'],
    esporte: ['sportswear', 'gym wear', 'running outfit', 'activewear'],
    praia: ['beachwear', 'bikini', 'swimwear', 'summer outfit'],
    jeans: ['denim jacket', 'jeans pants', 'denim fashion'],
    outono: ['fall outfit', 'autumn fashion', 'coat fall', 'sweater fall']
  };
  const q = encodeURIComponent(pick(map[cat]||['fashion clothing']));
  // Sig varia por item para não repetir
  return `https://source.unsplash.com/600x750/?${q}&sig=${i}`;
}

function generateCatalog(count=260){
  const cats = ['feminino','masculino','infantil','calcados','acessorios','esporte','praia','jeans','outono'];
  const brands = ['ModaVersa','UrbanWay','OceanLeaf','PrimeFit','DenimCo','Classic&Co','Sunset','Nordic','Vetra','Monde'];
  const types = {
    feminino: ['Vestido', 'Blusa', 'Saia', 'Macacão', 'Cardigan', 'Casaco', 'Camisa', 'Calça Wide', 'Trench', 'Suéter'],
    masculino: ['Camiseta', 'Camisa', 'Jaqueta', 'Calça', 'Moletom', 'Blazer', 'Polo', 'Corta-vento', 'Bermuda', 'Colete'],
    infantil: ['Conjunto', 'Moletom', 'Camiseta', 'Vestido', 'Jaqueta', 'Mijão', 'Shorts', 'Macacão', 'Casaco', 'Pijama'],
    calcados: ['Tênis', 'Bota', 'Sapato', 'Sandália', 'Chinelo', 'Mocassim'],
    acessorios: ['Boné', 'Cinto', 'Mochila', 'Bolsa', 'Carteira', 'Gorro', 'Echarpe', 'Relógio'],
    esporte: ['Camiseta Dry', 'Legging', 'Shorts Tech', 'Jaqueta Tech', 'Top Sports', 'Calça Jogger'],
    praia: ['Biquíni', 'Sunga', 'Saída de praia', 'Canga', 'Chinelo Praia'],
    jeans: ['Jaqueta Jeans', 'Calça Jeans', 'Short Jeans', 'Camisa Jeans'],
    outono: ['Tricô', 'Cardigan', 'Casaco', 'Suéter', 'Calça de Alfaiataria']
  };
  const adjectives = ['Essential', 'Premium', 'Classic', 'Slim', 'Oversized', 'Soft', 'Vintage', 'Modern', 'Eco', 'Stretch'];

  const items = [];
  let idx = 1;

  while(items.length < count){
    const cat = pick(cats);
    const type = pick(types[cat]);
    const adj = pick(adjectives);
    const brand = pick(brands);
    const sku = `MV-${String(idx).padStart(3,'0')}`;
    const name = `${type} ${adj} ${idx}`;
    let basePrice = 0;
    switch(cat){
      case 'feminino': basePrice = randomBetween(89, 349); break;
      case 'masculino': basePrice = randomBetween(79, 329); break;
      case 'infantil': basePrice = randomBetween(49, 199); break;
      case 'calcados': basePrice = randomBetween(119, 499); break;
      case 'acessorios': basePrice = randomBetween(39, 249); break;
      case 'esporte': basePrice = randomBetween(79, 299); break;
      case 'praia': basePrice = randomBetween(59, 259); break;
      case 'jeans': basePrice = randomBetween(129, 399); break;
      case 'outono': basePrice = randomBetween(99, 449); break;
    }
    const price = Math.round(basePrice*100)/100;
    const sale = Math.random() > 0.7;
    const oldPrice = sale ? Math.round((price*randomBetween(1.1,1.35))*100)/100 : null;
    const stock = Math.floor(randomBetween(5, 40));
    const rating = Math.round(randomBetween(4.0, 5.0)*10)/10;
    const img = imageFor(cat, idx);
    const desc = `Peça ${type.toLowerCase()} ${adj.toLowerCase()} da coleção ${brand}. Conforto e qualidade para seu dia a dia.`;

    items.push({
      id: sku, name, brand, price, oldPrice, stock, cat, rating,
      featured: Math.random() > 0.8, sale, img, desc, _ts: Date.now() - Math.floor(Math.random()*1e7)
    });
    idx++;
  }
  return items;
}

/* Garante catálogo com no mínimo 250 itens e imagens */
(function ensureCatalog(){
  let cat = loadCatalog();
  if(!Array.isArray(cat) || cat.length < 250){
    cat = generateCatalog(260);
    saveCatalog(cat);
  }else{
    // Complementa dados ausentes (imagens, rating etc.)
    let changed = false;
    cat = cat.map((p,i)=>{
      if(!p.img) { p.img = imageFor(p.cat||'feminino', i+1); changed = true; }
      if(!p.rating) { p.rating = 4.5; changed = true; }
      if(p.sale && !p.oldPrice) { p.oldPrice = Math.round(p.price*1.2*100)/100; changed = true; }
      return p;
    });
    if(changed) saveCatalog(cat);
  }
  catalog = cat;
})();

/* =========================
   Tema com persistência
   ========================= */
function applyTheme(mode){
  document.body.classList.toggle('theme-dark', mode === 'dark');
  localStorage.setItem(THEME_KEY, mode);
}
function getTheme(){
  return document.body.classList.contains('theme-dark') ? 'dark' : 'light';
}

/* =========================
   Render Produtos
   ========================= */
function applyFilters(items){
  let list = items.filter(p=>{
    if(state.cat!=='all' && p.cat!==state.cat) return false;
    if(state.sale && !p.sale) return false;
    if(state.featured && !p.featured) return false;
    if(state.q && !(p.name + ' ' + p.brand).toLowerCase().includes(state.q.toLowerCase())) return false;
    return true;
  });

  if(state.order==='price-asc') list.sort((a,b)=>a.price-b.price);
  if(state.order==='price-desc') list.sort((a,b)=>b.price-a.price);
  if(state.order==='rating-desc') list.sort((a,b)=>b.rating-a.rating);
  if(state.order==='new-desc') list.sort((a,b)=> (b._ts||0)-(a._ts||0) );

  return list;
}

function productCard(p){
  const disabled = p.stock<=0;
  const saleBadge = p.sale ? `<div class="badge-corner">- Oferta</div>` : '';
  const featured = p.featured ? `<div class="badge-corner" style="right:10px; left:auto">Destaque</div>` : '';
  const safeAlt = p.name.replace(/"/g,'&quot;');
  const fallback = `this.onerror=null;this.src='https://source.unsplash.com/600x750/?apparel,fashion&sig=${encodeURIComponent(p.id)}'`;
  return `
    <div class="card col-3">
      <div class="thumb">
        <img src="${p.img}" alt="${safeAlt}" loading="lazy" width="600" height="750" onerror="${fallback}"/>
        ${saleBadge}${featured}
      </div>
      <div class="card-body">
        <div class="card-title">${p.name}</div>
        <div class="card-sub">${p.brand} • ${p.rating.toFixed(1)} ★</div>
        <div class="price">
          <span class="value">${money(p.price)}</span>
          ${p.oldPrice?`<span class="old">${money(p.oldPrice)}</span>`:''}
        </div>
        <div class="actions">
          <div class="qty">
            <button class="btn circle" data-minus="${p.id}">−</button>
            <span id="q-${p.id}">1</span>
            <button class="btn circle" data-plus="${p.id}">+</button>
          </div>
          <button class="btn primary" data-add="${p.id}" ${disabled?'disabled':''}>${disabled?'Sem estoque':'Adicionar'}</button>
        </div>
      </div>
    </div>
  `;
}

function renderGrid(){
  catalog = loadCatalog(); // reflete admin
  const grid = $('#grid');
  const list = applyFilters(catalog);
  grid.innerHTML = list.length? list.map(productCard).join('') : `<div class="panel col-12">Nenhum produto encontrado.</div>`;

  // Bind qty e add
  $$('[data-plus]').forEach(b=> b.onclick = ()=>{
    const id = b.dataset.plus; const span = $(`#q-${id}`); span.textContent = (+span.textContent)+1;
  });
  $$('[data-minus]').forEach(b=> b.onclick = ()=>{
    const id = b.dataset.minus; const span = $(`#q-${id}`); const v = (+span.textContent)-1; span.textContent = v<1?1:v;
  });
  $$('[data-add]').forEach(b=> b.onclick = ()=>{
    const id = b.dataset.add; const qty = +$(`#q-${id}`).textContent || 1;
    addToCart(id, qty);
  });
}

/* =========================
   Carrinho
   ========================= */
function addToCart(id, qty=1){
  const pr = catalog.find(p=>p.id===id); if(!pr) return;
  const ex = cart.find(i=>i.id===id);
  if(ex) ex.qty += qty; else cart.push({id, qty});
  const st = pr.stock;
  if(ex && ex.qty > st) ex.qty = st;
  if(!ex && qty > st) cart.find(i=>i.id===id).qty = st;
  saveCart(cart); renderCart();
}
function removeFromCart(id){ cart = cart.filter(i=>i.id!==id); saveCart(cart); renderCart(); }
function setQty(id, qty){
  const item = cart.find(i=>i.id===id); if(!item) return;
  const pr = catalog.find(p=>p.id===id);
  item.qty = Math.max(1, Math.min(+qty, pr.stock));
  saveCart(cart); renderCart();
}
function renderCart(){
  const el = $('#cartItems');
  if(cart.length===0){ el.innerHTML = '<div class="panel">Seu carrinho está vazio.</div>'; }
  else{
    el.innerHTML = cart.map(i=>{
      const p = catalog.find(x=>x.id===i.id);
      const fallback = `this.onerror=null;this.src='https://source.unsplash.com/300x300/?apparel&sig=${encodeURIComponent(p.id)}'`;
      return `
        <div class="cart-row">
          <div class="cart-thumb"><img src="${p.img}" alt="${p.name}" loading="lazy" width="64" height="64" onerror="${fallback}"/></div>
          <div>
            <div><strong>${p.name}</strong></div>
            <div class="muted">${p.brand} • ${money(p.price)}</div>
            <div class="qty" style="margin-top:6px">
              <button class="btn circle" data-cm="${p.id}">−</button>
              <input class="qty-input" id="c-${p.id}" value="${i.qty}" style="width:52px; text-align:center"/>
              <button class="btn circle" data-cp="${p.id}">+</button>
            </div>
          </div>
          <div class="row" style="flex-direction:column; align-items:flex-end; gap:6px">
            <strong>${money(p.price * i.qty)}</strong>
            <button class="btn" data-rm="${p.id}">Remover</button>
          </div>
        </div>
      `;
    }).join('');
  }
  const subtotal = cart.reduce((a,i)=> a + (catalog.find(p=>p.id===i.id)?.price||0)*i.qty, 0);
  const frete = subtotal>299 ? 0 : (cart.length?19.9:0);
  $('#subtotal').textContent = money(subtotal);
  $('#frete').textContent = money(frete);
  $('#total').textContent = money(subtotal+frete);
  $('#cartCount').textContent = cart.reduce((a,i)=>a+i.qty,0);

  $$('[data-rm]').forEach(b=> b.onclick = ()=> removeFromCart(b.dataset.rm));
  $$('[data-cp]').forEach(b=> b.onclick = ()=> {
    const id=b.dataset.cp; const inp = $(`#c-${id}`); setQty(id, (+inp.value)+1);
  });
  $$('[data-cm]').forEach(b=> b.onclick = ()=> {
    const id=b.dataset.cm; const inp = $(`#c-${id}`); setQty(id, Math.max(1,(+inp.value)-1));
  });
  $$('.qty-input').forEach(inp=> inp.onchange = ()=> setQty(inp.id.slice(2), +inp.value || 1));
}

/* =========================
   Eventos UI + Tema
   ========================= */
function bindUI(){
  // Pesquisa
  $('#btnSearch').onclick = ()=>{ state.q = $('#q').value.trim(); renderGrid(); };
  $('#q').oninput = (e)=>{ state.q = e.target.value; renderGrid(); };

  // Categorias
  $$('#catBar .pill').forEach(p=>{
    p.onclick = ()=>{
      $$('#catBar .pill').forEach(x=>x.classList.remove('active'));
      p.classList.add('active');
      state.cat = p.dataset.cat;
      renderGrid();
    };
  });

  // Filtros
  $('#filterSale').onchange = e=>{ state.sale = e.target.checked; renderGrid(); };
  $('#filterFeatured').onchange = e=>{ state.featured = e.target.checked; renderGrid(); };
  $('#orderBy').onchange = e=>{ state.order = e.target.value; renderGrid(); };

  // Carrinho
  $('#btnCart').onclick = ()=> $('.cart').classList.add('open');
  $('#closeCart').onclick = ()=> $('.cart').classList.remove('open');
  $('#checkout').onclick = ()=>{
    if(cart.length===0) return alert('Seu carrinho está vazio.');
    alert('Checkout de demonstração. Integre um gateway de pagamento aqui.');
  };

  // Hero ações
  $('#btnExplorar').onclick = ()=> window.scrollTo({top: $('#grid').offsetTop - 60, behavior:'smooth'});
  $('#btnOfertas').onclick = ()=>{
    $('#filterSale').checked = true; state.sale = true; renderGrid();
    window.scrollTo({top: $('#grid').offsetTop - 60, behavior:'smooth'});
  };

  // Tema com persistência
  $('#btnTheme').onclick = ()=>{
    const next = getTheme()==='dark' ? 'light' : 'dark';
    applyTheme(next);
  };
}

/* =========================
   Boot
   ========================= */
document.addEventListener('DOMContentLoaded', ()=>{
  // Tema salvo (padrão: claro)
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);

  renderGrid();
  renderCart();
  bindUI();
});
