const { PORT } = require("./config");
const { openDatabase, hasApplicationSchema } = require("./db");
const { ensureOwnerMetricsCompatibility, ensureRegionMetricsCompatibility } = require("./seed");
const { createApp } = require("./app");

async function startServer() {
  try {
    // 1. Inisialisasi Database Cloud
    const db = openDatabase();

    // 2. Cek apakah schema sudah ada (Sekarang menggunakan async)
    const hasSchema = await hasApplicationSchema(db);

    if (!hasSchema) {
      console.error("Schema database tidak ditemukan di SQLite Cloud.");
      console.error("Pastikan Anda sudah mengunggah database dashboard.sqlite ke dashboard.sqlitecloud.io");
      // Di Vercel, kita tidak bisa menjalankan npm run db:reset secara otomatis saat runtime
      process.exit(1);
    }

    // 3. Jalankan pemeliharaan schema (Wajib pakai await jika fungsi ini diubah ke async)
    // Catatan: Anda mungkin perlu mengedit file seed.js juga agar mendukung async
    await ensureRegionMetricsCompatibility(db);
    await ensureOwnerMetricsCompatibility(db);

    // 4. Buat index jika belum ada
    await db.sql`CREATE INDEX IF NOT EXISTS idx_packages_owner_lookup ON packages(owner_type, owner_name);`;

    // 5. Jalankan Express App
    const app = createApp(db);
    
    app.listen(PORT, () => {
      console.log(`Backend aktif di port ${PORT}`);
      console.log(`Terhubung ke SQLite Cloud`);
    });

  } catch (error) {
    console.error("Gagal menjalankan server:", error);
    process.exit(1);
  }
}

// Jalankan fungsi start
startServer();