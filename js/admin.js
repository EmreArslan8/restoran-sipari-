/* ============================================================
   Admin Panel Mantığı
   ============================================================ */

const el = (id) => document.getElementById(id);
let orderFilter = "all";
const expandedOrders = new Set();

const SECTION_META = {
  dashboard: { title: "Genel Bakış", sub: "Restoranınızın günlük performansı" },
  orders:    { title: "Siparişler",  sub: "Gelen siparişleri yönetin" },
  products:  { title: "Menü / Ürünler", sub: "Ürün ekleyin, düzenleyin veya kaldırın" },
};

function orderSum(o) { return o.items.reduce((s, i) => s + i.price * i.qty, 0); }

/* ---------- Navigasyon ---------- */
function showSection(name) {
  document.querySelectorAll(".section").forEach(s => s.classList.toggle("active", s.id === name));
  document.querySelectorAll("#sideNav button").forEach(b => b.classList.toggle("active", b.dataset.section === name));
  el("pageTitle").textContent = SECTION_META[name].title;
  el("pageSub").textContent = SECTION_META[name].sub;
  closeSidebar();
}

/* ---------- Dashboard ---------- */
function renderDashboard() {
  const orders = Store.getOrders();
  const active = orders.filter(o => !["teslim", "iptal"].includes(o.status));
  const delivered = orders.filter(o => o.status === "teslim");
  const revenue = delivered.reduce((s, o) => s + orderSum(o), 0);
  const products = Store.getProducts();

  const kpis = [
    { label: "Aktif Sipariş", value: active.length, ico: "🔥", bg: "#fef3c7", color: "#d97706" },
    { label: "Bugünkü Ciro", value: formatPrice(revenue), ico: "💰", bg: "#dcfce7", color: "#16a34a" },
    { label: "Toplam Sipariş", value: orders.length, ico: "🧾", bg: "#dbeafe", color: "#2563eb" },
    { label: "Menü Ürünü", value: products.filter(p => p.active).length, ico: "🍔", bg: "#ede9fe", color: "#7c3aed" },
  ];
  el("kpiGrid").innerHTML = kpis.map(k => `
    <div class="kpi">
      <div class="k-top">
        <span class="k-label">${k.label}</span>
        <span class="k-ico" style="background:${k.bg};color:${k.color}">${k.ico}</span>
      </div>
      <div class="k-value">${k.value}</div>
    </div>
  `).join("");

  const recent = orders.slice(0, 6);
  el("recentOrders").innerHTML = recent.map(o => {
    const m = STATUS_META[o.status];
    return `<tr>
      <td><strong>#${o.id}</strong></td>
      <td>${o.customer}</td>
      <td>${formatPrice(orderSum(o))}</td>
      <td><span class="status-pill" style="background:${m.bg};color:${m.color}">${m.label}</span></td>
      <td style="color:var(--gray)">${timeAgo(o.createdAt)}</td>
    </tr>`;
  }).join("");
}

/* ---------- Siparişler ---------- */
function renderOrders() {
  let orders = Store.getOrders();
  if (orderFilter !== "all") orders = orders.filter(o => o.status === orderFilter);

  if (orders.length === 0) {
    el("ordersTable").innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--gray);padding:30px">Sipariş bulunmuyor.</td></tr>`;
    return;
  }

  const statusOptions = (current) => Object.keys(STATUS_META).map(k =>
    `<option value="${k}" ${k === current ? "selected" : ""}>${STATUS_META[k].label}</option>`
  ).join("");

  el("ordersTable").innerHTML = orders.map(o => {
    const m = STATUS_META[o.status];
    const itemsShort = o.items.map(i => `${i.qty}× ${i.name}`).join(", ");
    const isOpen = expandedOrders.has(o.id);
    let html = `<tr>
      <td><strong>#${o.id}</strong></td>
      <td>${o.customer}<br><small style="color:var(--gray)">${o.phone}</small></td>
      <td style="max-width:220px">${itemsShort}</td>
      <td><strong>${formatPrice(orderSum(o))}</strong></td>
      <td>
        <select class="status-select" data-status="${o.id}"
          style="color:${m.color};border-color:${m.color}44">${statusOptions(o.status)}</select>
      </td>
      <td style="color:var(--gray);white-space:nowrap">${timeAgo(o.createdAt)}</td>
      <td><button class="btn-sm btn-ghost" data-toggle="${o.id}">${isOpen ? "Gizle ▲" : "Detay ▼"}</button></td>
    </tr>`;

    if (isOpen) {
      html += `<tr class="expand-row"><td colspan="7">
        <div class="order-detail">
          <ul>${o.items.map(i => `<li><span>${i.qty}× ${i.name}</span><span>${formatPrice(i.price * i.qty)}</span></li>`).join("")}</ul>
          <div class="od-meta">📍 <strong>Adres:</strong> ${o.address || "-"}</div>
          ${o.note ? `<div class="od-meta">📝 <strong>Not:</strong> ${o.note}</div>` : ""}
          ${o.payment ? `<div class="od-meta">💳 <strong>Ödeme:</strong> ${o.payment}</div>` : ""}
        </div>
      </td></tr>`;
    }
    return html;
  }).join("");

  document.querySelectorAll("[data-status]").forEach(sel => {
    sel.onchange = () => {
      Store.updateOrderStatus(Number(sel.dataset.status), sel.value);
      showToast("Sipariş durumu güncellendi");
      renderOrders(); renderDashboard();
    };
  });
  document.querySelectorAll("[data-toggle]").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.toggle);
      expandedOrders.has(id) ? expandedOrders.delete(id) : expandedOrders.add(id);
      renderOrders();
    };
  });
}

/* ---------- Ürünler ---------- */
function renderProducts() {
  const products = Store.getProducts();
  el("productsTable").innerHTML = products.map(p => `
    <tr>
      <td><span style="font-size:1.2rem;margin-right:6px">${p.emoji || "🍽️"}</span><strong>${p.name}</strong><br><small style="color:var(--gray)">${p.desc || ""}</small></td>
      <td><span class="tag">${p.category}</span></td>
      <td><strong>${formatPrice(p.price)}</strong></td>
      <td><span class="tag ${p.active ? "on" : "off"}">${p.active ? "Satışta" : "Pasif"}</span></td>
      <td style="white-space:nowrap">
        <button class="btn-sm btn-outline" data-edit="${p.id}">Düzenle</button>
        <button class="btn-sm btn-danger" data-del="${p.id}">Sil</button>
      </td>
    </tr>
  `).join("");

  document.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => openProductModal(Number(b.dataset.edit)));
  document.querySelectorAll("[data-del]").forEach(b => b.onclick = () => {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      Store.deleteProduct(Number(b.dataset.del));
      showToast("Ürün silindi");
      renderProducts(); renderDashboard();
    }
  });
}

/* ---------- Ürün Modalı ---------- */
function openProductModal(id) {
  const form = el("productForm");
  form.reset();
  el("catSelect").innerHTML = SEED_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join("");

  if (id) {
    const p = Store.getProducts().find(x => x.id === id);
    el("productModalTitle").textContent = "Ürünü Düzenle";
    form.id.value = p.id;
    form.name.value = p.name;
    form.category.value = p.category;
    form.price.value = p.price;
    form.emoji.value = p.emoji || "";
    form.active.value = String(p.active);
    form.desc.value = p.desc || "";
  } else {
    el("productModalTitle").textContent = "Yeni Ürün";
    form.id.value = "";
  }
  el("productModal").classList.add("open");
}
function closeProductModal() { el("productModal").classList.remove("open"); }

function submitProduct(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const product = {
    id: fd.get("id") ? Number(fd.get("id")) : null,
    name: fd.get("name").trim(),
    category: fd.get("category"),
    price: Number(fd.get("price")),
    emoji: (fd.get("emoji") || "").trim() || "🍽️",
    active: fd.get("active") === "true",
    desc: (fd.get("desc") || "").trim(),
  };
  Store.upsertProduct(product);
  closeProductModal();
  showToast(product.id ? "Ürün güncellendi" : "Yeni ürün eklendi");
  renderProducts(); renderDashboard();
}

/* ---------- Sidebar (mobil) ---------- */
function openSidebar() { el("sidebar").classList.add("open"); el("sideBackdrop").classList.add("open"); }
function closeSidebar() { el("sidebar").classList.remove("open"); el("sideBackdrop").classList.remove("open"); }

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
  const t = el("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ---------- Başlat ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
  renderOrders();
  renderProducts();

  document.querySelectorAll("#sideNav button").forEach(b => {
    b.onclick = () => showSection(b.dataset.section);
  });

  el("orderFilter").onchange = (e) => { orderFilter = e.target.value; renderOrders(); };
  el("addProductBtn").onclick = () => openProductModal(null);
  el("productForm").onsubmit = submitProduct;
  document.querySelectorAll("[data-close]").forEach(b => b.onclick = closeProductModal);
  el("productModal").addEventListener("click", (e) => { if (e.target.id === "productModal") closeProductModal(); });

  el("menuToggle").onclick = openSidebar;
  el("sideBackdrop").onclick = closeSidebar;

  el("resetBtn").onclick = (e) => {
    e.preventDefault();
    if (confirm("Tüm demo verisi başlangıç haline sıfırlansın mı?")) {
      Store.reset();
      renderDashboard(); renderOrders(); renderProducts();
      showToast("Demo verisi sıfırlandı");
    }
  };
});
