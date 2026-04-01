const db = require('../db_pool');

const tables = {
    // 1. ดึงข้อมูลโต๊ะทั้งหมด
    getAllTables: async () => {
        try {
            const [rows] = await db.execute("SELECT * FROM tables ORDER BY table_number ASC");
            return { isError: false, data: rows };
        } catch (err) {
            return { isError: true, message: err.message };
        }
    },

    // 2. เพิ่มโต๊ะใหม่
    addTable: async (table_no, capacity) => {
        try {
            const sql = "INSERT INTO tables (table_number, seating_capacity, table_status) VALUES (?, ?, 'available')";
            const [result] = await db.execute(sql, [table_no, capacity]);
            return { result: true, message: "เพิ่มโต๊ะสำเร็จ", insertId: result.insertId };
        } catch (err) {
            return { result: false, message: err.message };
        }
    },

    // 3. แก้ไขข้อมูลโต๊ะ
    updateTable: async (table_id, table_no, capacity, status) => {
        try {
            // เช็คชื่อคอลัมน์ใน SET ให้ตรงกับ phpMyAdmin คือ table_status
            const sql = `UPDATE tables SET table_number = ?, seating_capacity = ?, table_status = ? WHERE table_id = ?`;
            const [result] = await db.execute(sql, [table_no, capacity, status, table_id]);
            return { result: true };
        } catch (err) {
            return { result: false, message: err.message };
        }
    },

    // 4. ลบข้อมูลโต๊ะ
    deleteTable: async (table_id) => {
        try {
            const sql = "DELETE FROM tables WHERE table_id = ?";
            await db.execute(sql, [table_id]);
            return { result: true, message: "ลบข้อมูลสำเร็จ" };
        } catch (err) {
            return { result: false, message: err.message };
        }
    }
};

module.exports = tables;