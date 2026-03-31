const express = require('express');
const cors = require("cors");
const jwt = require('jsonwebtoken');
const multer = require("multer");
const path = require('path');

// เรียกใช้ Models
const menu = require('./models/menu');
const orders = require('./models/orders');
const authen = require('./models/authen');
const tables = require('./models/tables');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const hostname = '127.0.0.1';
const port = 8080;
const SECRET_KEY = "BukkatySecretKey";

// --- Middleware ตรวจสอบ Access Token ---
const checkAccessToken = (req, res, next) => {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        token = req.headers.authorization.split(' ')[1];
    } else {
        token = req.query.token || (req.body ? req.body.token : null);
    }

    if (!token) {
        return res.json({ isError: true, message: "ยังไม่ได้เข้าสู่ระบบ" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.json({ isError: true, message: "Token ไม่ถูกต้อง หรือหมดอายุ" });
        }
        req.decoded = decoded;
        next();
    });
};

// --- การจัดการรูปภาพ (Static Folder) ---
app.use('/imgs', express.static(path.join(__dirname, 'upload/img')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "upload/img"));
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + "_" + file.originalname;
        cb(null, fileName);
    }
});
const upload = multer({ storage: storage });

// --- API สำหรับเมนูอาหาร (Menu) ---
app.get("/api/menu/all", async (req, res) => {
    const response = await menu.getAllMenu();
    res.json(response);
});

// --- API สำหรับดึงหมวดหมู่อาหาร ---
app.get("/api/food_types/all", async (req, res) => {
    try {
        const db = require('./db_pool');
        const [rows] = await db.execute("SELECT * FROM food_type ORDER BY food_type_id ASC");
        res.json({ isError: false, data: rows });
    } catch (err) {
        res.json({ isError: true, errorMessage: err.message });
    }
});

// เพิ่มเมนู
app.post("/api/menu/add", upload.single('file'), async (req, res) => {
    try {
        const result = await menu.addMenu(
            req.body.menu_name,
            req.body.price,
            req.body.food_type_id,
            req.file ? req.file.filename : null
        );
        res.json(result);
    } catch (err) {
        console.error("[/api/menu/add] Error:", err.message);
        res.status(500).json({ isError: true, message: err.message });
    }
});

// แก้ไขเมนู - POST แทน PUT เพื่อให้ทำงานได้กับ Express 5 + Multer 2
app.post("/api/menu/update/:id", upload.single('file'), async (req, res) => {
    try {
        const menuId = req.params.id;
        const result = await menu.updateMenu(
            menuId,
            req.body.menu_name,
            req.body.price,
            req.body.food_type_id
        );
        if (req.file) {
            await menu.updateMenuImage(menuId, req.file.filename);
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ isError: true, message: err.message });
    }
});

// ลบเมนู - POST แทน DELETE เพื่อให้ทำงานได้กับ Express 5
app.post("/api/menu/delete/:id", async (req, res) => {
    try {
        const result = await menu.deleteMenu(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ isError: true, message: err.message });
    }
});

// --- API สำหรับออเดอร์ (Orders) ---
app.post("/api/orders/create", async (req, res) => {
    const { table_name, table_no, customer_name, items, total_price } = req.body;
    const finalTable = table_name || table_no;
    const result = await orders.saveOrder(customer_name, finalTable, items, total_price);
    res.json(result);
});

app.get("/api/orders/all", async (req, res) => {
    const response = await orders.getAllOrders();
    res.json(response);
});

app.post("/api/orders/update_status", checkAccessToken, async (req, res) => {
    const result = await orders.updateStatus(req.body.order_id, req.body.status);
    res.json(result);
});

// --- API สำหรับระบบ Login ---
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const rs = await authen.checkLogin(username, password);

    if (rs.result) {
        const payload = {
            user_id: rs.data.id,
            username: rs.data.username,
            role: rs.data.role
        };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '3h' });
        res.json({
            isError: false,
            result: true,
            data: { access_token: token, user_info: payload }
        });
    } else {
        res.json({ isError: false, result: false, message: "Username หรือ Password ไม่ถูกต้อง" });
    }
});

// --- API สำหรับการจองโต๊ะ (Bookings) ---
app.post("/api/bookings/create", async (req, res) => {
    try {
        const { table_id, table_number, customer_name, booking_date, number_of_guests } = req.body;
        const db = require('./db_pool');
        const sql = `INSERT INTO bookings (table_id, table_number, customer_name, booking_date, number_of_guests) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [table_id || null, table_number || null, customer_name, booking_date, number_of_guests]);
        res.json({ isError: false, message: "จองโต๊ะสำเร็จ!", bookingId: result.insertId });
    } catch (err) {
        res.json({ isError: true, errorMessage: err.message });
    }
});

app.post("/api/bookings/update", async (req, res) => {
    try {
        const { booking_id, customer_name, booking_date, number_of_guests, table_id, table_number } = req.body;
        const db = require('./db_pool');
        const sql = `UPDATE bookings SET customer_name=?, booking_date=?, number_of_guests=?, table_id=?, table_number=? WHERE booking_id=?`;
        const [result] = await db.execute(sql, [customer_name, booking_date, number_of_guests, table_id || null, table_number || null, booking_id]);
        if (result.affectedRows > 0) {
            res.json({ isError: false, message: "อัปเดตการจองสำเร็จ" });
        } else {
            res.json({ isError: true, errorMessage: "ไม่พบข้อมูลการจองที่ต้องการแก้ไข" });
        }
    } catch (err) {
        res.json({ isError: true, errorMessage: err.message });
    }
});

app.get("/api/bookings/all_details", async (req, res) => {
    try {
        const db = require('./db_pool');
        const sql = `
            SELECT b.*,
                   COALESCE(b.table_number, t.table_number) AS table_number
            FROM bookings b
            LEFT JOIN tables t ON b.table_id = t.table_id
            ORDER BY b.booking_date DESC
        `;
        const [rows] = await db.execute(sql);
        res.json({ isError: false, data: rows });
    } catch (err) {
        res.json({ isError: true, errorMessage: err.message });
    }
});

// --- API สำหรับจัดการโต๊ะ (Tables) ---
app.get("/api/tables/all", async (req, res) => {
    const response = await tables.getAllTables();
    res.json(response);
});

app.post("/api/tables/add", async (req, res) => {
    const { table_no, capacity } = req.body;
    const result = await tables.addTable(table_no, capacity);
    res.json(result);
});

app.post("/api/tables/update", async (req, res) => {
    const { table_id, table_no, capacity, status } = req.body;
    const result = await tables.updateTable(table_id, table_no, capacity, status);
    res.json(result);
});

app.post("/api/tables/delete/:id", async (req, res) => {
    const result = await tables.deleteTable(req.params.id);
    res.json(result);
});

// --- API ดึงประวัติออเดอร์ ---
app.get("/api/orders/history", async (req, res) => {
    try {
        const db = require('./db_pool');
        const [rows] = await db.execute("SELECT * FROM orders ORDER BY order_date DESC");
        res.json({ isError: false, data: rows });
    } catch (err) {
        res.json({ isError: true, errorMessage: err.message });
    }
});

app.listen(port, () => {
    console.log(`Bukkaty Shabu Backend running at http://${hostname}:${port}`);
});
