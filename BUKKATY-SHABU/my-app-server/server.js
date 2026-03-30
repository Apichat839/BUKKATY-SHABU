const express = require('express');
const bp = require('body-parser');
const cors = require("cors");
const jwt = require('jsonwebtoken'); 
const multer = require("multer");
const path = require('path');

// เรียกใช้ Models
const menu = require('./models/menu');
const orders = require('./models/orders');
const authen = require('./models/authen');

const app = express();
app.use(cors());
app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());

const hostname = '127.0.0.1';
const port = 8080;
const SECRET_KEY = "BukkatySecretKey";

// --- Middleware ตรวจสอบ Access Token ---
const checkAccessToken = (req, res, next) => {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        token = req.headers.authorization.split(' ')[1];
    } else {
        token = req.query.token || req.body.token;
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
        cb(null, "upload/img");
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


app.get("/api/food_types/all", async (req, res) => {
    try {
        const db = require('./db_pool'); //
        const [rows] = await db.execute("SELECT * FROM food_type ORDER BY food_type_id ASC");
        res.json({ isError: false, data: rows });
    } catch (err) {
        res.json({ isError: true, errorMessage: err.message });
    }
});

app.post("/api/menu/add", checkAccessToken, upload.single('file'), async (req, res) => {
    const result = await menu.addMenu(
        req.body.menu_name,
        req.body.price,
        req.body.food_type_id,
        req.file ? req.file.filename : null
    );
    res.json(result);
});

// --- API สำหรับออเดอร์ (Orders) ---
app.post("/api/orders/create", async (req, res) => {
    // ปรับชื่อตัวแปรให้รองรับทั้ง table_name (จาก BillPage) และ table_no
    const { table_name, table_no, customer_name, items, total_price } = req.body;
    
    // เลือกใช้ตัวแปรที่มีค่าส่งมา
    const finalTable = table_name || table_no;
    
    const result = await orders.saveOrder(customer_name, finalTable, items, total_price);
    res.json(result);
});

app.get("/api/orders/all", async (req, res) => {
    // ถอด checkAccessToken ออกชั่วคราวหากหน้า Staff Dashboard ยังไม่ได้ทำระบบ Login สมบูรณ์
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
        // ปรับให้ดึงค่า id และ role ตามที่ Model authen.js ส่งมาจริง
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

// --- API สำหรับดึงหมวดหมู่อาหาร (ต้องมีเพื่อให้หน้าเมนูแยกหัวข้อได้) ---
app.get("/api/food_types/all", async (req, res) => {
    try {
        const db = require('./db_pool');
        const [rows] = await db.execute("SELECT * FROM food_type ORDER BY food_type_id ASC");
        res.json({ isError: false, data: rows });
    } catch (err) {
        res.json({ isError: true, errorMessage: err.message });
    }
});

app.listen(port, () => {
    console.log(`Bukkaty Shabu Backend running at http://${hostname}:${port}`);
});