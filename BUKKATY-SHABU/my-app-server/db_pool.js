const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,        // XAMPP MySQL default port
    user: 'root',
    password: '',      // XAMPP default: ไม่มี password
    database: 'tuu',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ทดสอบ connection ตอน server เริ่ม
pool.getConnection()
    .then(conn => {
        console.log('✅ MySQL (XAMPP) เชื่อมต่อสำเร็จ — database: tuu');
        conn.release();
    })
    .catch(err => {
        console.error('❌ MySQL เชื่อมต่อไม่ได้:', err.message);
        console.error('   → ตรวจสอบว่า XAMPP เปิด MySQL อยู่ และมี database ชื่อ "tuu"');
    });

module.exports = pool;