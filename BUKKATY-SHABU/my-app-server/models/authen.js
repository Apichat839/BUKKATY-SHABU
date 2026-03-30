const db = require('../db_pool'); // แก้ไข Path ให้เรียกใช้ db_pool

const authen = {
    checkLogin: async (username, password) => {
        try {
            // ดึง id, username, และ role ให้ตรงกับตาราง staff
            const sql = `SELECT id, username, role FROM staff WHERE username = ? AND password = ?`;
            const [rows] = await db.execute(sql, [username, password]);
            
            if (rows.length > 0) {
                return { result: true, data: rows[0] };
            } else {
                return { result: false };
            }
        } catch (err) {
            return { isError: true, errorMessage: err.message };
        }
    }
};

module.exports = authen;