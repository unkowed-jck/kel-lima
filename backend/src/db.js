const { Database } = require("@sqlitecloud/drivers");
const { DB_PATH } = require("./config");

// PENTING: Di Vercel, kita langsung pakai URL dari Environment Variable
// Pastikan SQLITE_PATH di Vercel berisi: sqlitecloud://xxxx...
const connectionString = process.env.SQLITE_PATH || DB_PATH;

/**
 * Fungsi untuk membuka koneksi ke SQLite Cloud.
 * Kita tidak perlu lagi mengecek fs.existsSync karena DB ada di cloud.
 */
function openDatabase() {
  if (!connectionString) {
    throw new Error("SQLITE_PATH tidak terdefinisi di Environment Variables");
  }

  // Inisialisasi koneksi ke SQLite Cloud
  const db = new Database("sqlitecloud://cl6slbwodk.g1.sqlite.cloud:8860/dashboard.sqlite?apikey=W2fkCa4Br1PEFhmvQI8VzsU61Sfn1BINsMU2QV5Dx74");

  // Catatan: SQLite Cloud menangani pragma secara otomatis di sisi server, 
  // tapi kita tetap bisa menjalankannya jika diperlukan via query.
  // Namun untuk driver ini, cukup inisialisasi seperti di atas.

  return db;
}

// Karena SQLite Cloud bersifat async, fungsi pengecekan schema harus diubah
async function hasApplicationSchema(db) {
  try {
    const tables = ["packages", "regions"];
    
    // Kita cek satu per satu apakah tabel ada di cloud
    for (const tableName of tables) {
      const result = await db.sql`SELECT name FROM sqlite_master WHERE type='table' AND name=${tableName}`;
      if (result.length === 0) return false;
    }
    return true;
  } catch (err) {
    console.error("Gagal cek schema:", err);
    return false;
  }
}

module.exports = {
  DB_PATH: connectionString,
  openDatabase,
  hasApplicationSchema,
  // Fungsi listExistingSqliteFiles & resolveRuntimeDbPath tidak lagi relevan di Cloud
  // tapi kita biarkan kosong agar tidak merusak import di file lain jika ada
  listExistingSqliteFiles: () => [],
  resolveRuntimeDbPath: () => connectionString,
};