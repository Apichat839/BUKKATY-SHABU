// ประกาศตัวแปร Global
let nameInput, tableInput, submitBtn, nameError, tableError;

document.addEventListener("DOMContentLoaded", function() {
    // ผูก Element
    nameInput = document.getElementById("name");
    tableInput = document.getElementById("table");
    submitBtn = document.getElementById("submitBtn");
    nameError = document.getElementById("nameError");
    tableError = document.getElementById("tableError");

    // ตรวจสอบ Input ตลอดเวลา
    if (nameInput) nameInput.addEventListener("input", checkForm);
    if (tableInput) tableInput.addEventListener("input", checkForm);
});

// --- ฟังก์ชันควบคุมหน้าจอ ---
function hideAll() {
    let pages = ["page1", "page2", "page3", "page4", "page5", "page6"];
    pages.forEach(p => {
        const el = document.getElementById(p);
        if (el) el.style.display = "none";
    });
}

function backTo(page) {
    hideAll();
    document.getElementById(page).style.display = "block";
}

function goCustomer() {
    backTo("page2");
}

function goStaff() {
    backTo("page5");
}

// --- ระบบ Member ---
function register() {
    localStorage.setItem("user", document.getElementById("regUser").value);
    localStorage.setItem("pass", document.getElementById("regPass").value);
    alert("สมัครสมาชิกเรียบร้อย");
    backTo("page3");
}

function login() {
    let u = document.getElementById("loginUser").value;
    let p = document.getElementById("loginPass").value;
    if (u === localStorage.getItem("user") && p === localStorage.getItem("pass")) {
        backTo("page4");
    } else {
        document.getElementById("msg").innerText = "Username หรือ Password ไม่ถูกต้อง";
    }
}

// --- ระบบ Validation ---
function validateName() {
    let name = nameInput.value.trim();
    if (name === "") {
        nameError.innerText = "กรุณากรอกชื่อ";
        nameInput.className = "invalid";
        return false;
    } else if (!/^[A-Za-zก-๙\s]+$/.test(name)) {
        nameError.innerText = "ใช้ได้เฉพาะภาษาไทยหรืออังกฤษ";
        nameInput.className = "invalid";
        return false;
    }
    nameError.innerText = "";
    nameInput.className = "valid";
    return true;
}

function validateTable() {
    let t = tableInput.value.trim();
    if (t === "" || !/^[0-9]{2}$/.test(t) || Number(t) < 1 || Number(t) > 99) {
        tableError.innerText = "ต้องเป็นเลข 01-99 เท่านั้น";
        tableInput.className = "invalid";
        return false;
    }
    tableError.innerText = "";
    tableInput.className = "valid";
    return true;
}

function checkForm() {
    submitBtn.disabled = !(validateName() && validateTable());
}

// --- ระบบบันทึกข้อมูล (Customer) ---
function saveCustomer() {
    const customerData = `ชื่อ: ${nameInput.value} | โต๊ะ: ${tableInput.value}`;
    localStorage.setItem("customerData", customerData);
    alert("บันทึกข้อมูลเรียบร้อย กำลังไปหน้าสั่งอาหาร...");
    
    // ย้ายหน้าไปยังหน้าเลือกอาหาร (index.html)
    setTimeout(() => {
        window.location.href = "index.html";
    }, 500);
}

// --- ระบบพนักงาน (Staff Login & Data Display) ---
function staffLogin() {
    const staffPass = document.getElementById("staffPass").value;
    if (staffPass === "224236") {
        hideAll();
        document.getElementById("page6").style.display = "block";
        renderStaffData();
    } else {
        document.getElementById("staffMsg").innerText = "รหัสไม่ถูกต้อง";
    }
}

function renderStaffData() {
    // 1. ดึงข้อมูลลูกค้า
    const customer = localStorage.getItem("customerData") || "ยังไม่มีข้อมูลลูกค้า";
    
    // 2. ดึงข้อมูลบิล (ต้องใช้ชื่อ 'lastBillDetails' ให้ตรงกับหน้าบิล)
    const billRaw = localStorage.getItem("lastBillDetails");
    let billHTML = "ยังไม่มีการสั่งอาหาร";

    if (billRaw) {
        const billObj = JSON.parse(billRaw);
        
        // สร้าง HTML แสดงรายการอาหาร
        billHTML = `<ul style="list-style: none; padding: 0; text-align: left;">`;
        billObj.items.forEach(item => {
            billHTML += `<li style="border-bottom: 1px solid #444; padding: 5px 0;">
                ${item.name} x ${item.qty} 
                <span style="float: right;">${(item.price * item.qty).toLocaleString()}.-</span>
            </li>`;
        });
        billHTML += `</ul>`;
        billHTML += `<p style="color: gold; text-align: right; font-size: 1.2em;">ยอดรวม: ${billObj.total.toLocaleString()} บาท</p>`;
    }

    // 3. แสดงผลลงในหน้าจอ
    document.getElementById("data").innerHTML = `
        <div style="margin-bottom: 15px;">
            📌 <strong>ข้อมูลลูกค้า:</strong><br>${customer}
        </div>
        <hr style="border: 0.5px solid #555;">
        <div>
            🧾 <strong>รายละเอียดบิล:</strong><br>${billHTML}
        </div>
    `;
}