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
- Kategoriye göre filtrelenebilen menü kartları
- Canlı sepet (adet artır/azalt, toplam tutar)
- Adres ve ödeme bilgisiyle sipariş verme
- Verilen sipariş anında admin paneline düşer

**Admin panel**
- 📊 KPI kartları: aktif sipariş, ciro, toplam sipariş, ürün sayısı
- 🧾 Sipariş listesi: durum güncelleme (Yeni → Hazırlanıyor → Yolda → Teslim / İptal), detay görüntüleme
- 🍔 Ürün yönetimi: ekleme, düzenleme, silme, satışta/pasif durumu
- ♻️ Demo verisini tek tıkla sıfırlama
- Mobil uyumlu, açılır kenar menüsü

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
