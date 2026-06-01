# Panduan Setup & Pengujian Stripe Webhook

Stripe Webhook digunakan untuk mengonfirmasi pembayaran secara andal dan sinkronisasi otomatis status ketersediaan jadwal pemotretan meskipun tab browser pengguna terputus atau ditutup sebelum dialihkan ke halaman sukses.

---

## 1. Instalasi Stripe CLI (Pengujian Lokal)

Untuk menerima webhook dari Stripe di mesin lokal atau server pengujian, Anda dapat menggunakan **Stripe CLI**:

### macOS (Homebrew):
```bash
brew install stripe/stripe-cli/stripe
```

### Windows (scoop atau download zip):
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```
*Atau download binary .exe secara manual dari [Stripe GitHub Releases](https://github.com/stripe/stripe-cli/releases).*

### Linux:
```bash
curl -s https://packages.stripe.dev/keyring.gpg | sudo gpg --dearmor -o /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/node/deb/ any main" | sudo tee /etc/apt/sources.list.d/stripe.list
sudo apt-get update
sudo apt-get install stripe
```

---

## 2. Pengujian Webhook Secara Lokal

Ikuti langkah-langkah berikut untuk menguji webhook secara lokal:

1. **Login ke Akun Stripe Anda melalui CLI:**
   ```bash
   stripe login
   ```
   Ikuti instruksi penautan akun di terminal Anda.

2. **Jalankan Listener Webhook lokal:**
   Arahkan semua event Stripe ke endpoint webhook server lokal yang berjalan di port `3000`:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```

3. **Dapatkan `STRIPE_WEBHOOK_SECRET` Anda:**
   Saat menjalankan perintah di atas, Stripe CLI akan menampilkan output seperti berikut di baris pertama:
   ```text
   > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   Salin nilai tersebut dan masukkan ke berkas `.env` atau konfigurasi lingkungan Anda:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Jalankan Aplikasi Anda:**
   Pastikan port `3000` aktif dan mendengarkan permintaan.

5. **Trigger Event Simulasi:**
   Buka terminal baru dan picu event checkout menggunakan Stripe CLI:
   ```bash
   stripe trigger checkout.session.completed
   ```
   Atau lakukan checkout manual melalui formulir antarmuka pemesanan di aplikasi untuk melihat konfirmasi penuh.

---

## 3. Pendaftaran Webhook di Stripe Dashboard (Production)

Ketika aplikasi siap dirilis ke production (seperti Cloud Run), Anda harus menambahkan webhook di Dashboard Stripe Anda:

1. Buka [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks).
2. Klik tombol **Add endpoint**.
3. Isi parameter konfigurasi berikut:
   - **Endpoint URL:** `https://alamat-domain-anda.com/api/webhook`
   - **Version:** Gunakan versi API terbaru.
   - **Select events to listen to:** Pilih tipe event berikut:
     - `checkout.session.completed`
     - `payment_intent.payment_failed`
     - `charge.refunded`
     - `checkout.session.expired`
4. Klik **Add endpoint**.
5. Temukan **Signing secret** untuk endpoint baru tersebut, dan atur di variabel lingkungan production server Anda sebagai `STRIPE_WEBHOOK_SECRET`.

---

## 4. Troubleshooting & Debugging

Jika webhook tidak berjalan seperti yang diharapkan, periksa poin-poin berikut:

* **Masalah Tanda Tangan (Signature Verification Failed):**
  - Pastikan nilai `STRIPE_WEBHOOK_SECRET` dalam berkas `.env` Anda sesuai dengan rahasia yang dihasilkan oleh `stripe listen` (lokal) atau Dashboard Webhook Stripe (production).
  - Pastikan route `/api/webhook` diletakkan **sebelum** middleware `express.json()` di aplikasi Express Anda. Webhook membutuhkan body asli (`express.raw`) untuk memvalidasi tanda tangan pengirim. Jika data di-parse oleh parser global terlebih dahulu, tanda tangan akan selalu ditolak.

* **Menguji Respon Webhook:**
  - Anda dapat mengecek status pengiriman webhook, kode status HTTP balasan (harus `200 OK`), serta muatan JSON request di panel **Dashboard Stripe > Developers > Webhooks > Klik pada endpoint Anda > Tab Events / Delivery**.
