// config/database.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Create MySQL connection pool using Railway DATABASE_URL
const pool = mysql.createPool(process.env.DATABASE_URL);

// Optional: test connection once at startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL database");
    connection.release();
  } catch (error) {
    console.error("❌ Error connecting to MySQL database:", error.message);
  }
})();

export default pool;