# Panduan Setup Pengiriman Email Konfirmasi (Dual-Provider)

Aplikasi BigApple Lens dilengkapi dengan sistem pengiriman email konfirmasi otomatis yang pintar. Sistem ini secara dinamis beralih berdasarkan lingkungan berjalan (`process.env.NODE_ENV`):
* **Lokal / Pengujian (`development`):** Menggunakan SMTP Gmail gratis dengan **Nodemailer**.
* **Produksi (`production`):** Menggunakan **Resend API** yang berkinerja tinggi.

---

## Bagian 1 — Konfigurasi Nodemailer (Gmail SMTP - Development)

Guna menghindari pemakaian layanan berbayar di tahap pengerjaan lokal, Anda dapat mengirimkan email langsung menggunakan akun Gmail pribadi Anda:

1. **Aktifkan Verifikasi 2 Langkah (2-Step Verification):**
   - Masuk ke akun Google Anda dan kunjungi halaman keamanan: [myaccount.google.com/security](https://myaccount.google.com/security).
   - Pastikan **2-Step Verification** sudah aktif.

2. **Buat Sandi Aplikasi (App Password):**
   - Cari kolom pencarian di bagian atas akun Google, cari `"Sandi Aplikasi"` atau `"App Passwords"`.
   - Pilih **Aplikasi:** *Lainnya (Nama Kustom)*, isi dengan nama **"BigApple Lens"**, lalu klik **Buat (Generate)**.
   - Google akan memunculkan kode rahasia unik sepanjang **16 karakter** (biasanya dipisahkan spasi).

3. **Salin ke Konfigurasi Lingkungan Anda (`.env`):**
   - Salin 16 karakter tanpa spasi tersebut lalu tempel ke berkas konfigurasi lokal `.env` Anda:
     ```env
     GMAIL_USER=alamat_email_anda@gmail.com
     GMAIL_APP_PASSWORD=abcdefghijklmnop
     ```

4. **Uji Pengiriman:**
   - Jalankan pembayaran pesanan secara lokal, atau picu melalui trigger Stripe CLI:
     ```bash
     stripe trigger checkout.session.completed
     ```
   - Lihat konsol server Anda: `[Mailer:dev] Email sent to client@example.com via Nodemailer`. Periksa kotak masuk Gmail Anda!

---

## Bagian 2 — Konfigurasi Resend API (Production)

Saat aplikasi siap diunggah ke server production, kita menggunakan gateway pengiriman profesional dari Resend:

1. **Registrasi Akun:**
   - Daftar akun gratis di [resend.com](https://resend.com). Tidak diperlukan informasi kartu kredit.

2. **Dapatkan API Key:**
   - Masuk ke dashboard Resend, arahkan ke menu **API Keys**.
   - Klik **Create API Key**, beri nama misalnya `BigApple Lens Prod`, pilih izin *Full Access*.
   - Salin kunci yang dihasilkan lalu tempel ke variabel lingkungan server production Anda:
     ```env
     RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
     ```

3. **Verifikasi Domain Kustom Anda:**
   - Di dashboard Resend, pilih menu **Domains** -> klik **Add Domain**.
   - Masukkan nama domain web bisnis Anda (misal: `bigapplelens.com`).
   - Resend akan memberikan entri dokumen DNS (seperti SPF, DKIM, MX). Tambahkan entri tersebut pada konfigurasi DNS registrar domain Anda (misal: Cloudflare, Namecheap, Niagahoster).
   - Setelah status terverifikasi, ganti pengirim `"confirm@yourdomain.com"` di berkas `/src/lib/mailer.ts` menjadi domain terverifikasi Anda sendiri (misal: `"confirm@bigapplelens.com"`).

4. **Kapasitas Kuota Gratis:**
   - Paket gratis Resend menyediakan kuota pengiriman hingga **3.000 email gratis per bulan** (dengan batas maksimal 100 email per hari). Kapasitas ini sangat ideal untuk mengakomodasi awal peluncuran bisnis pemotretan Anda.

---

## Bagian 3 — Pengujian End-to-End

Untuk memastikan alur dari hulu ke hilir berjalan mulus:

* **Di Development:**
  Jalankan perintah pengujian simulasi checkout Stripe CLI:
  ```bash
  stripe trigger checkout.session.completed
  ```
  Sistem akan langsung menangkap data webhook, membuat pesanan terkonfirmasi, lalu mengeksekusi Nodemailer untuk mengirim email ke kotak masuk target.

* **Di Production:**
  Lakukan pemesanan asli pada sistem dengan menggunakan kartu pengujian Stripe:
  - Nomor kartu: `4242 4242 4242 4242`
  - Expire & CVC: masa depan mana saja & nomor bebas (misal `12/28` dan `123`).
  - Setelah transaksi berhasil dinegosiasikan, server production akan langsung memicu API Resend dan mengirimkan email dengan logo brand premium ke kotak masuk Anda.
