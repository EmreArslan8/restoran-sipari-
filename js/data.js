/* ============================================================
   Mock Veri Katmanı
   - Restoranlar, menü ürünleri ve örnek siparişler
   - localStorage ile kalıcı hale getirilir (demo amaçlı)
   ============================================================ */

const SEED_CATEGORIES = ["Ana Yemek", "Pizza", "Burger", "Çorba", "Tatlı", "İçecek"];

/* Görseller: kategori-kilitli stok fotoğraf servisinden (loremflickr) çekilir.
   Her URL anahtar kelimeye göre gerçek bir yemek fotoğrafı döndürür; ?lock ile
   sabitlenir (hep aynı görsel gelir). Görsel yüklenemezse arayüz emoji'ye düşer.
   Kendi görselinizi kullanmak isterseniz sadece img alanını değiştirmeniz yeterli. */
const IMG = (keywords, lock) => `https://loremflickr.com/600/400/${encodeURIComponent(keywords)}?lock=${lock}`;

const SEED_PRODUCTS = [
  { id: 1,  name: "Adana Kebap",        category: "Ana Yemek", price: 220, desc: "Acılı zırh kıyma, közlenmiş biber ve domates ile.", emoji: "🍢", img: IMG("kebab,grill", 11),      active: true },
  { id: 2,  name: "Izgara Köfte",       category: "Ana Yemek", price: 185, desc: "El yapımı köfte, pilav ve garnitür.",             emoji: "🍖", img: IMG("meatballs", 22),        active: true },
  { id: 3,  name: "Karışık Pizza",      category: "Pizza",     price: 240, desc: "Sucuk, mantar, biber, zeytin ve bol mozzarella.", emoji: "🍕", img: IMG("pizza", 33),            active: true },
  { id: 4,  name: "Margherita Pizza",   category: "Pizza",     price: 195, desc: "Domates sosu, mozzarella ve fesleğen.",          emoji: "🍕", img: IMG("pizza,margherita", 44), active: true },
  { id: 5,  name: "Klasik Burger",      category: "Burger",    price: 165, desc: "120gr köfte, cheddar, marul, domates.",          emoji: "🍔", img: IMG("burger", 55),           active: true },
  { id: 6,  name: "Tavuk Burger",       category: "Burger",    price: 150, desc: "Çıtır tavuk, özel sos ve turşu.",                 emoji: "🍔", img: IMG("chicken,burger", 66),   active: true },
  { id: 7,  name: "Mercimek Çorbası",   category: "Çorba",     price: 70,  desc: "Geleneksel süzme mercimek, limon ile.",          emoji: "🍲", img: IMG("soup,bowl", 77),        active: true },
  { id: 8,  name: "Ezogelin Çorbası",   category: "Çorba",     price: 75,  desc: "Baharatlı, doyurucu ve sıcacık.",                emoji: "🍲", img: IMG("soup", 88),             active: true },
  { id: 9,  name: "Künefe",             category: "Tatlı",     price: 130, desc: "Antep fıstıklı, tel kadayıflı sıcak künefe.",    emoji: "🧆", img: IMG("baklava,dessert", 99),  active: true },
  { id: 10, name: "Sütlaç",             category: "Tatlı",     price: 90,  desc: "Fırında pişmiş geleneksel sütlaç.",              emoji: "🍮", img: IMG("rice,pudding", 101),    active: true },
  { id: 11, name: "Ayran",              category: "İçecek",    price: 35,  desc: "Taze, köpüklü ayran.",                            emoji: "🥛", img: IMG("milk,drink", 111),      active: true },
  { id: 12, name: "Kola",               category: "İçecek",    price: 45,  desc: "330ml kutu.",                                     emoji: "🥤", img: IMG("cola,soda", 121),       active: true },
  { id: 13, name: "Şalgam",             category: "İçecek",    price: 40,  desc: "Acılı / acısız seçenekli.",                       emoji: "🧃", img: IMG("juice,glass", 131),     active: false },
];

// Örnek başlangıç siparişleri (admin panelini dolu göstermek için)
const SEED_ORDERS = [
  {
    id: 1042, customer: "Ahmet Yılmaz", phone: "0532 111 22 33",
    address: "Sanayi Sitesi 4. Blok No:12", note: "Zili çalmayın, arayın.",
    items: [ { id: 1, name: "Adana Kebap", price: 220, qty: 2 }, { id: 11, name: "Ayran", price: 35, qty: 2 } ],
    status: "yeni", createdAt: Date.now() - 1000 * 60 * 6,
  },
  {
    id: 1041, customer: "Zeynep Kaya", phone: "0505 444 55 66",
    address: "Çelik Cad. Demir İş Hanı Kat:3", note: "",
    items: [ { id: 3, name: "Karışık Pizza", price: 240, qty: 1 }, { id: 12, name: "Kola", price: 45, qty: 2 } ],
    status: "hazirlaniyor", createdAt: Date.now() - 1000 * 60 * 22,
  },
  {
    id: 1040, customer: "Mehmet Demir", phone: "0542 777 88 99",
    address: "Torna Sok. No:8 Zemin Kat", note: "Çorbaya limon eklenmesin.",
    items: [ { id: 7, name: "Mercimek Çorbası", price: 70, qty: 3 }, { id: 2, name: "Izgara Köfte", price: 185, qty: 1 } ],
    status: "yolda", createdAt: Date.now() - 1000 * 60 * 40,
  },
  {
    id: 1039, customer: "Elif Şahin", phone: "0533 222 33 44",
    address: "Kaynak Cad. No:21", note: "",
    items: [ { id: 9, name: "Künefe", price: 130, qty: 2 } ],
    status: "teslim", createdAt: Date.now() - 1000 * 60 * 95,
  },
  {
    id: 1038, customer: "Can Öztürk", phone: "0555 123 45 67",
    address: "Montaj Sok. B Blok No:5", note: "Kapıda kredi kartı.",
    items: [ { id: 5, name: "Klasik Burger", price: 165, qty: 2 }, { id: 6, name: "Tavuk Burger", price: 150, qty: 1 } ],
    status: "iptal", createdAt: Date.now() - 1000 * 60 * 130,
  },
];

const DB_KEYS = { products: "rs_products", orders: "rs_orders", seq: "rs_order_seq" };

const Store = {
  _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  },
  _write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  },

  init() {
    if (!localStorage.getItem(DB_KEYS.products)) this._write(DB_KEYS.products, SEED_PRODUCTS);
    if (!localStorage.getItem(DB_KEYS.orders))   this._write(DB_KEYS.orders, SEED_ORDERS);
    if (!localStorage.getItem(DB_KEYS.seq))      this._write(DB_KEYS.seq, 1043);
  },

  reset() {
    this._write(DB_KEYS.products, SEED_PRODUCTS);
    this._write(DB_KEYS.orders, SEED_ORDERS);
    this._write(DB_KEYS.seq, 1043);
  },

  // --- Ürünler ---
  getProducts() { return this._read(DB_KEYS.products, SEED_PRODUCTS); },
  saveProducts(list) { this._write(DB_KEYS.products, list); },
  upsertProduct(p) {
    const list = this.getProducts();
    if (p.id) {
      const i = list.findIndex(x => x.id === p.id);
      if (i > -1) list[i] = p; else list.push(p);
    } else {
      p.id = Math.max(0, ...list.map(x => x.id)) + 1;
      list.push(p);
    }
    this.saveProducts(list);
    return p;
  },
  deleteProduct(id) { this.saveProducts(this.getProducts().filter(x => x.id !== id)); },

  // --- Siparişler ---
  getOrders() { return this._read(DB_KEYS.orders, SEED_ORDERS); },
  saveOrders(list) { this._write(DB_KEYS.orders, list); },
  addOrder(order) {
    const seq = this._read(DB_KEYS.seq, 1043);
    order.id = seq;
    order.status = "yeni";
    order.createdAt = Date.now();
    const list = this.getOrders();
    list.unshift(order);
    this.saveOrders(list);
    this._write(DB_KEYS.seq, seq + 1);
    return order;
  },
  updateOrderStatus(id, status) {
    const list = this.getOrders();
    const o = list.find(x => x.id === id);
    if (o) { o.status = status; this.saveOrders(list); }
    return o;
  },
};

const STATUS_META = {
  yeni:         { label: "Yeni",         color: "#2563eb", bg: "#dbeafe" },
  hazirlaniyor: { label: "Hazırlanıyor", color: "#d97706", bg: "#fef3c7" },
  yolda:        { label: "Yolda",        color: "#7c3aed", bg: "#ede9fe" },
  teslim:       { label: "Teslim Edildi",color: "#16a34a", bg: "#dcfce7" },
  iptal:        { label: "İptal",        color: "#dc2626", bg: "#fee2e2" },
};

function formatPrice(v) { return v.toLocaleString("tr-TR") + " ₺"; }
function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "az önce";
  if (m < 60) return m + " dk önce";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " sa önce";
  return Math.floor(h / 24) + " gün önce";
}

Store.init();
