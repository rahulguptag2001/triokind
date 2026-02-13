// config/database.js - MySQL Database Connection
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'trokind_pharmaceuticals',
  port: Number(process.env.DB_PORT) || 3307,   
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
  connection.release();
});

module.exports = pool.promise();
