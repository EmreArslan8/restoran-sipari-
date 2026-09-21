/* ============================================================
   Müşteri Sipariş Arayüzü
   ============================================================ */

let cart = [];           // { id, name, price, qty }
let activeCategory = "Tümü";
let searchQuery = "";

const el = (id) => document.getElementById(id);

/* ---------- Restoran Başlığı ---------- */
function renderRestaurant() {
  el("rName").textContent = RESTAURANT.name;
  el("rSlogan").textContent = RESTAURANT.slogan;
  const open = isOpenNow();
  el("rMeta").innerHTML = `
    <span class="meta-pill star">⭐ ${RESTAURANT.rating} <span style="color:var(--gray);font-weight:500">(${RESTAURANT.ratingCount})</span></span>
    <span class="meta-pill">🛵 ${RESTAURANT.deliveryMin}-${RESTAURANT.deliveryMax} dk</span>
    <span class="meta-pill">🧺 Min. ${formatPrice(RESTAURANT.minOrder)}</span>
    <span class="meta-pill">📦 ${formatPrice(RESTAURANT.deliveryFee)} teslimat</span>
    <span class="meta-pill ${open ? "open" : "closed"}">${open ? "🟢 Şu an açık" : "🔴 Kapalı"}</span>
  `;
  el("promoStrip").innerHTML = `🎉 <span>${formatPrice(RESTAURANT.freeDeliveryOver)} ve üzeri siparişlerde <strong>teslimat ücretsiz</strong>!</span>`;
}

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
  if (searchQuery) {
    const q = searchQuery.toLocaleLowerCase("tr");
    list = list.filter(p =>
      p.name.toLocaleLowerCase("tr").includes(q) ||
      p.category.toLocaleLowerCase("tr").includes(q) ||
      (p.desc || "").toLocaleLowerCase("tr").includes(q)
    );
  }

  if (list.length === 0) {
    el("menuGrid").innerHTML = `<p style="color:var(--gray);grid-column:1/-1">Aradığınız kritere uygun ürün bulunamadı.</p>`;
    return;
  }

  el("menuGrid").innerHTML = list.map(p => {
    const badges = [];
    if (p.oldPrice && p.oldPrice > p.price) {
      const pct = Math.round((1 - p.price / p.oldPrice) * 100);
      badges.push(`<span class="badge-tag disc">%${pct} İndirim</span>`);
    }
    if (p.popular) badges.push(`<span class="badge-tag pop">🔥 Çok Satan</span>`);
    if (p.isNew) badges.push(`<span class="badge-tag new">Yeni</span>`);

    const priceHtml = p.oldPrice && p.oldPrice > p.price
      ? `<span class="old">${formatPrice(p.oldPrice)}</span>${formatPrice(p.price)}`
      : formatPrice(p.price);

    return `
    <div class="card">
      <div class="thumb">
        ${badges.length ? `<div class="card-badges">${badges.join("")}</div>` : ""}
        <span class="thumb-emoji">${p.emoji || "🍽️"}</span>
        ${p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.remove()">` : ""}
      </div>
      <div class="body">
        <span class="cat">${p.category}</span>
        <h3>${p.name}</h3>
        <p class="desc">${p.desc || ""}</p>
        <div class="foot">
          <span class="price">${priceHtml}</span>
          <button class="btn-add" data-add="${p.id}">Ekle +</button>
        </div>
      </div>
    </div>`;
  }).join("");

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

function cartSubtotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function cartCount() { return cart.reduce((s, i) => s + i.qty, 0); }
function deliveryFee() {
  const sub = cartSubtotal();
  if (sub === 0 || sub >= RESTAURANT.freeDeliveryOver) return 0;
  return RESTAURANT.deliveryFee;
}
function cartGrandTotal() { return cartSubtotal() + deliveryFee(); }
function meetsMinOrder() { return cartSubtotal() >= RESTAURANT.minOrder; }

function renderCart() {
  const items = el("cartItems");
  const sub = cartSubtotal();

  if (cart.length === 0) {
    items.innerHTML = `<div class="cart-empty"><span class="em">🛒</span>Sepetiniz boş.<br>Menüden ürün ekleyin.</div>`;
    el("freeDelivery").innerHTML = "";
    el("cartLines").innerHTML = "";
    el("minWarn").classList.remove("show");
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

    // Ücretsiz teslimat barı
    const remain = RESTAURANT.freeDeliveryOver - sub;
    if (remain > 0) {
      const pct = Math.min(100, Math.round((sub / RESTAURANT.freeDeliveryOver) * 100));
      el("freeDelivery").innerHTML = `
        <div class="fd-text">🛵 Ücretsiz teslimata <strong>${formatPrice(remain)}</strong> kaldı</div>
        <div class="fd-bar"><span style="width:${pct}%"></span></div>`;
    } else {
      el("freeDelivery").innerHTML = `<div class="fd-text done">🎉 Teslimat ücretsiz!</div>`;
    }

    // Ara toplam + teslimat satırı
    const fee = deliveryFee();
    el("cartLines").innerHTML = `
      <div class="line"><span>Ara Toplam</span><span>${formatPrice(sub)}</span></div>
      <div class="line ${fee === 0 ? "free" : ""}"><span>Teslimat Ücreti</span><span>${fee === 0 ? "Ücretsiz" : formatPrice(fee)}</span></div>`;

    // Minimum sepet uyarısı
    const warn = el("minWarn");
    if (!meetsMinOrder()) {
      warn.textContent = `Minimum sepet tutarı ${formatPrice(RESTAURANT.minOrder)}. ${formatPrice(RESTAURANT.minOrder - sub)} daha ekleyin.`;
      warn.classList.add("show");
    } else {
      warn.classList.remove("show");
    }
  }

  el("cartCount").textContent = cartCount();
  el("cartTotal").textContent = formatPrice(cartGrandTotal());
  el("checkoutBtn").disabled = cart.length === 0 || !meetsMinOrder();
  el("checkoutBtn").textContent = cart.length === 0
    ? "Sipariş Ver"
    : (!meetsMinOrder() ? "Minimum tutara ulaşın" : "Sipariş Ver");
}

/* ---------- Sipariş Modalı ---------- */
function openModal() {
  if (cart.length === 0 || !meetsMinOrder()) return;
  el("neighborhoodSelect").innerHTML = RESTAURANT.neighborhoods.map(n => `<option>${n}</option>`).join("");
  el("modalTotal").textContent = formatPrice(cartGrandTotal());
  el("orderModal").classList.add("open");
}
function closeModal() { el("orderModal").classList.remove("open"); }

function submitOrder(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const neighborhood = fd.get("neighborhood") || "";
  const order = {
    customer: fd.get("customer").trim(),
    phone: fd.get("phone").trim(),
    address: (neighborhood ? neighborhood + " — " : "") + fd.get("address").trim(),
    note: (fd.get("note") || "").trim(),
    payment: fd.get("payment"),
    deliveryFee: deliveryFee(),
    items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
  };
  const saved = Store.addOrder(order);
  cart = [];
  renderCart();
  closeModal();
  e.target.reset();
  openTracking(saved);
}

/* ---------- Sipariş Takip ---------- */
function openTracking(order) {
  el("trackNo").innerHTML = `Sipariş No: <strong>#${order.id}</strong>`;
  const eta = new Date(Date.now() + RESTAURANT.deliveryMax * 60000);
  const hh = String(eta.getHours()).padStart(2, "0");
  const mm = String(eta.getMinutes()).padStart(2, "0");
  el("trackEta").innerHTML = `
    <div class="eta-label">Tahmini teslimat</div>
    <div class="eta-time">${RESTAURANT.deliveryMin}-${RESTAURANT.deliveryMax} dk · ~${hh}:${mm}</div>`;

  const steps = [
    { t: "Sipariş Alındı", s: "Siparişiniz restorana iletildi", state: "done" },
    { t: "Onaylandı", s: "Restoran siparişinizi onayladı", state: "active" },
    { t: "Hazırlanıyor", s: "Mutfakta hazırlanıyor", state: "pending" },
    { t: "Yola Çıktı", s: "Kurye size doğru yolda", state: "pending" },
    { t: "Teslim Edildi", s: "Afiyet olsun!", state: "pending" },
  ];
  el("trackSteps").innerHTML = steps.map(st => `
    <div class="track-step ${st.state}">
      <div class="ts-dot">${st.state === "done" ? "✓" : "●"}</div>
      <div class="ts-body"><div class="ts-title">${st.t}</div><div class="ts-sub">${st.s}</div></div>
    </div>`).join("");

  el("trackModal").classList.add("open");
}
function closeTracking() { el("trackModal").classList.remove("open"); }

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
  renderRestaurant();
  renderFilters();
  renderMenu();
  renderCart();

  el("searchInput").addEventListener("input", (e) => { searchQuery = e.target.value.trim(); renderMenu(); });
  el("checkoutBtn").onclick = openModal;
  el("orderForm").onsubmit = submitOrder;
  document.querySelectorAll("[data-close]").forEach(b => b.onclick = closeModal);
  document.querySelectorAll("[data-close-track]").forEach(b => b.onclick = closeTracking);
  el("orderModal").addEventListener("click", (e) => { if (e.target.id === "orderModal") closeModal(); });
  el("trackModal").addEventListener("click", (e) => { if (e.target.id === "trackModal") closeTracking(); });
});
