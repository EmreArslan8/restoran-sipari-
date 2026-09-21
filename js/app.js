/* ============================================================
   Müşteri Sipariş Arayüzü
   ============================================================ */

let cart = [];           // { id, name, price, qty }
let activeCategory = "Tümü";

const el = (id) => document.getElementById(id);

/* ---------- Menü Render ---------- */
function getMenuProducts() {
  return Store.getProducts().filter(p => p.active);
}

function renderFilters() {
  const cats = ["Tümü", ...SEED_CATEGORIES];
  el("filters").innerHTML = cats.map(c =>
    `<button class="chip ${c === activeCategory ? "active" : ""}" data-cat="${c}">${c}</button>`
  ).join("");
  document.querySelectorAll(".chip").forEach(btn => {
    btn.onclick = () => { activeCategory = btn.dataset.cat; renderFilters(); renderMenu(); };
  });
}

function renderMenu() {
  let list = getMenuProducts();
  if (activeCategory !== "Tümü") list = list.filter(p => p.category === activeCategory);

  if (list.length === 0) {
    el("menuGrid").innerHTML = `<p style="color:var(--gray)">Bu kategoride ürün bulunmuyor.</p>`;
    return;
  }

  el("menuGrid").innerHTML = list.map(p => `
    <div class="card">
      <div class="thumb">
        <span class="thumb-emoji">${p.emoji || "🍽️"}</span>
        ${p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.remove()">` : ""}
      </div>
      <div class="body">
        <span class="cat">${p.category}</span>
        <h3>${p.name}</h3>
        <p class="desc">${p.desc || ""}</p>
        <div class="foot">
          <span class="price">${formatPrice(p.price)}</span>
          <button class="btn-add" data-add="${p.id}">Ekle +</button>
        </div>
      </div>
    </div>
  `).join("");

  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.onclick = () => addToCart(Number(btn.dataset.add));
  });
}

/* ---------- Sepet ---------- */
function addToCart(id) {
  const p = getMenuProducts().find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(x => x.id === id);
  if (existing) existing.qty++;
  else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
  renderCart();
  showToast(`${p.name} sepete eklendi`);
}

function changeQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  renderCart();
}

function cartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function cartCount() { return cart.reduce((s, i) => s + i.qty, 0); }

function renderCart() {
  const items = el("cartItems");
  if (cart.length === 0) {
    items.innerHTML = `<div class="cart-empty"><span class="em">🛒</span>Sepetiniz boş.<br>Menüden ürün ekleyin.</div>`;
  } else {
    items.innerHTML = cart.map(i => `
      <div class="cart-item">
        <div class="ci-name">${i.name}<small>${formatPrice(i.price)}</small></div>
        <div class="qty">
          <button data-dec="${i.id}">−</button>
          <span>${i.qty}</span>
          <button data-inc="${i.id}">+</button>
        </div>
      </div>
    `).join("");
    items.querySelectorAll("[data-inc]").forEach(b => b.onclick = () => changeQty(Number(b.dataset.inc), 1));
    items.querySelectorAll("[data-dec]").forEach(b => b.onclick = () => changeQty(Number(b.dataset.dec), -1));
  }
  el("cartCount").textContent = cartCount();
  el("cartTotal").textContent = formatPrice(cartTotal());
  el("checkoutBtn").disabled = cart.length === 0;
}

/* ---------- Sipariş Modalı ---------- */
function openModal() {
  if (cart.length === 0) return;
  el("modalTotal").textContent = formatPrice(cartTotal());
  el("orderModal").classList.add("open");
}
function closeModal() { el("orderModal").classList.remove("open"); }

function submitOrder(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const order = {
    customer: fd.get("customer").trim(),
    phone: fd.get("phone").trim(),
    address: fd.get("address").trim(),
    note: (fd.get("note") || "").trim(),
    payment: fd.get("payment"),
    items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
  };
  const saved = Store.addOrder(order);
  cart = [];
  renderCart();
  closeModal();
  e.target.reset();
  showToast(`✅ Siparişiniz alındı! Sipariş No: #${saved.id}`);
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
  const t = el("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------- Başlat ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderFilters();
  renderMenu();
  renderCart();
  el("checkoutBtn").onclick = openModal;
  el("orderForm").onsubmit = submitOrder;
  document.querySelectorAll("[data-close]").forEach(b => b.onclick = closeModal);
  el("orderModal").addEventListener("click", (e) => { if (e.target.id === "orderModal") closeModal(); });
});
