const db = require('../db_pool'); // ดึงการเชื่อมต่อจาก db_pool.js

const menu = {
    // 1. ดึงเมนูทั้งหมด พร้อมชื่อประเภทอาหาร (ใช้สำหรับแสดงผลหน้าเว็บ)
    getAllMenu: async () => {
        try {
            // JOIN กับตาราง food_type เพื่อเอาชื่อหมวดหมู่มาแสดงผล
            const sql = `
                SELECT m.*, t.food_type_name 
                FROM menu m 
                JOIN food_type t ON m.food_type_id = t.food_type_id 
                ORDER BY t.food_type_id ASC, m.menu_name ASC`;
            const [rows] = await db.execute(sql);
            return { isError: false, data: rows };
        } catch (err) {
            return { isError: true, errorMessage: err.message };
        }
    },

    // 2. ดึงเมนูแยกตามหมวดหมู่ (1=น้ำซุป, 2=ชาบู, 3=เครื่องดื่ม, 4=ของหวาน, 5=กลับบ้าน)
    getMenuByCategory: async (food_type_id) => {
        try {
            const sql = `SELECT * FROM menu WHERE food_type_id = ? ORDER BY menu_name ASC`;
            const [rows] = await db.execute(sql, [food_type_id]);
            return { isError: false, data: rows };
        } catch (err) {
            return { isError: true, errorMessage: err.message };
        }
    },

    // 3. เพิ่มเมนูใหม่ (รองรับชื่อเมนู, ราคา, ประเภทอาหาร และรูปภาพ)
    addMenu: async (name, price, food_type_id, image_url) => {
        try {
            const sql = `INSERT INTO menu (menu_name, price, food_type_id, image_url) VALUES (?, ?, ?, ?)`;
            const [result] = await db.execute(sql, [name, price, food_type_id, image_url]);
            return { isError: false, result: true, insertId: result.insertId };
        } catch (err) {
            return { isError: true, errorMessage: err.message };
        }
    },

    // 4. แก้ไขข้อมูลเมนู (ชื่อ, ราคา, หมวดหมู่)
    updateMenu: async (menu_id, name, price, food_type_id) => {
        try {
            const sql = `UPDATE menu SET menu_name = ?, price = ?, food_type_id = ? WHERE menu_id = ?`;
            await db.execute(sql, [name, price, food_type_id, menu_id]);
            return { isError: false, result: true };
        } catch (err) {
            return { isError: true, errorMessage: err.message };
        }
    },

    // 5. อัปเดตรูปภาพเมนูแยกต่างหาก
    updateMenuImage: async (menu_id, fileName) => {
        try {
            const sql = `UPDATE menu SET image_url = ? WHERE menu_id = ?`;
            await db.execute(sql, [fileName, menu_id]);
            return { isError: false, result: true };
        } catch (err) {
            return { isError: true, errorMessage: err.message };
        }
    },

    // 6. ลบเมนูอาหาร
    deleteMenu: async (menu_id) => {
        try {
            const sql = `DELETE FROM menu WHERE menu_id = ?`;
            await db.execute(sql, [menu_id]);
            return { isError: false, result: true };
        } catch (err) {
            return { isError: true, errorMessage: err.message };
        }
    }
};

module.exports = menu;