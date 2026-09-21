# 🍽️ Lezzet Durağı — Restoran Sipariş Demo

Lokal, komisyonsuz restoran sipariş uygulaması için **mock veri ile çalışan** örnek demo.
Modern, sade ve responsive arayüz — sadece **HTML, CSS ve saf JavaScript** ile hazırlanmıştır (framework yok, kurulum yok).

## 📸 İçerik

| Sayfa | Dosya | Açıklama |
|-------|-------|----------|
| **Müşteri Sitesi** | `index.html` | Menü, kategori filtreleme, sepet ve sipariş formu |
| **Admin Panel** | `admin.html` | Genel bakış (KPI'lar), sipariş yönetimi ve ürün (menü) yönetimi |

## ✨ Özellikler

**Müşteri tarafı**
- Restoran başlık kartı: puan/değerlendirme, teslimat süresi, min. sepet, açık/kapalı durumu
- Kampanya şeridi + "Çok Satan", "Yeni" ve indirim (%) rozetleri, üstü çizili eski fiyat
- Menüde canlı arama + kategori filtreleme
- Canlı sepet: ara toplam, teslimat ücreti, **ücretsiz teslimat ilerleme çubuğu**, minimum sepet kontrolü
- Mahalle seçimi + açık adres ile sipariş verme
- Sipariş sonrası **canlı sipariş takip ekranı** (adım adım durum + tahmini teslimat saati)
- Verilen sipariş anında admin paneline düşer (başka sekmede açıksa canlı bildirim + bip)

**Admin panel**
- 📊 KPI kartları: aktif sipariş, ciro, toplam sipariş, ürün sayısı
- 🧾 Sipariş listesi: durum güncelleme (Yeni → Hazırlanıyor → Yolda → Teslim / İptal), detay görüntüleme
- 🍔 Ürün yönetimi: ekleme, düzenleme, silme, satışta/pasif durumu
- ♻️ Demo verisini tek tıkla sıfırlama
- Mobil uyumlu, açılır kenar menüsü

## 🖼️ Görseller

Ürün görselleri, kategoriye göre eşleşen **stok fotoğraf** servisinden (loremflickr) çekilir;
her URL `?lock` parametresiyle sabitlenmiştir (hep aynı görsel gelir) ve gerçek yemek fotoğrafı döndürür.
Görsel yüklenemezse arayüz otomatik olarak emoji ikonuna düşer (bozuk görsel görünmez).

Kendi görselinizi kullanmak için iki yol var:
- `js/data.js` içindeki ilgili ürünün `img` alanını değiştirin, veya
- Admin Panel → Menü / Ürünler → Düzenle ekranındaki **Görsel URL** alanına kendi bağlantınızı girin.

## 🗃️ Veri

Tüm veriler tarayıcının `localStorage`'ında tutulur (`js/data.js` içindeki mock veriyle başlar).
Gerçek bir sunucu/veritabanı gerektirmez — verdiğiniz siparişler ve ürün değişiklikleri tarayıcıda kalıcıdır.

## 🚀 Çalıştırma

Kurulum gerektirmez. `index.html` dosyasını doğrudan tarayıcıda açmanız yeterli.

İsteğe bağlı olarak basit bir sunucu ile:

```bash
python3 -m http.server 8000
# ardından http://localhost:8000 adresini açın
```

## 🎨 Teknoloji

- Saf HTML5 / CSS3 (CSS değişkenleri, grid & flexbox, responsive)
- Vanilla JavaScript (bağımlılık yok)
- `localStorage` tabanlı basit veri katmanı

> Bu bir **demo**dur; kimlik doğrulama, ödeme entegrasyonu ve sunucu tarafı içermez.
