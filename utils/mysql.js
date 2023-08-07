const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
}

const pool = mysql.createPool(dbConfig);

const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (err) {
    console.error('Error connecting to the database:', err);
    throw err;
  }
};

module.exports = { getConnection };