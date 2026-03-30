const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',      // ชื่อผู้ใช้ DB ของคุณ
    password: '',      // รหัสผ่าน DB ของคุณ
    database: 'bukkaty_shabu', // ชื่อฐานข้อมูล
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;