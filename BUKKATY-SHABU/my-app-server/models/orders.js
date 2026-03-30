const db = require('../db_pool'); // เปลี่ยนให้ตรงกับชื่อไฟล์เชื่อมต่อ DB ของคุณ

const orders = {
    // 1. ดึงออเดอร์ทั้งหมด (ไปโชว์ในหน้า Staff Dashboard)
    getAllOrders: async () => {
        try {
            // ดึงข้อมูลออเดอร์ล่าสุดเรียงจากใหม่ไปเก่า
            const sql = `SELECT * FROM orders ORDER BY order_date DESC`;
            const [rows] = await db.execute(sql);
            return { isError: false, data: rows };
        } catch (err) {
            return { isError: true, errorMessage: err.message };
        }
    },

    // 2. บันทึกออเดอร์ใหม่ (เมื่อลูกค้ากดสั่งจากหน้า Bill)
    saveOrder: async (customerName, tableName, items, total) => {
        try {
            // ใช้ชื่อคอลัมน์ table_name และ items_json ตามที่ตกลงกันไว้
            const sql = `INSERT INTO orders (customer_name, table_name, items_json, total_price, status) 
                         VALUES (?, ?, ?, ?, 'pending')`;
            const [result] = await db.execute(sql, [
                customerName, 
                tableName, 
                JSON.stringify(items), 
                total
            ]);
            return { isError: false, result: true, orderId: result.insertId };
        } catch (err) {
            return { isError: true, errorMessage: err.message };
        }
    },

    // 3. อัปเดตสถานะ (เช่น pending -> served -> paid)
    updateStatus: async (orderId, status) => {
        try {
            // ใช้ order_id เป็นตัวอ้างอิงในการอัปเดต
            const sql = `UPDATE orders SET status = ? WHERE order_id = ?`;
            await db.execute(sql, [status, orderId]);
            return { isError: false, result: true };
        } catch (err) {
            return { isError: true, errorMessage: err.message };
        }
    },

    // 4. ลบออเดอร์ (เพิ่มเข้ามาใหม่เพื่อให้คัดลอกไปใช้ง่ายๆ)
    deleteOrder: async (orderId) => {
        try {
            const sql = `DELETE FROM orders WHERE order_id = ?`;
            await db.execute(sql, [orderId]);
            return { isError: false, result: true };
        } catch (err) {
            return { isError: true, errorMessage: err.message };
        }
    }
};

module.exports = orders;