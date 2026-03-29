// ประกาศตัวแปรอ้างอิงถึง Element ต่างๆ
const modal = document.getElementById('order-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalPriceDisp = document.getElementById('modal-price-display');
const qtyText = document.getElementById('current-qty');
const cartCount = document.getElementById('cart-count');

// ดึงจำนวนสินค้าทั้งหมดที่เคยมีในตะกร้าจาก localStorage (ถ้าไม่มีให้เป็น 0)
let totalInCart = parseInt(localStorage.getItem('cartCount')) || 0;
if (cartCount) cartCount.innerText = totalInCart;

// --- 1. ฟังก์ชันเปิด Modal เมื่อคลิกที่บัตรเมนู (menu-card) ---
document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', () => {
        const title = card.querySelector('h3').innerText;
        const img = card.querySelector('img').src;
        const priceTag = card.querySelector('h4'); // ตรวจสอบว่ามีราคาใน h4 หรือไม่
        const price = priceTag ? priceTag.innerText : "0";

        modalTitle.innerText = title;
        modalImg.src = img;
        modalPriceDisp.innerText = "ราคา " + price;
        qtyText.innerText = 1; // เริ่มต้นที่ 1 เสมอเมื่อเปิดใหม่
        modal.style.display = 'flex';
    });
});

// --- 2. ฟังก์ชันปิด Modal ---
const closeBtn = document.getElementById('close-modal');
if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';

window.onclick = (event) => { 
    if (event.target == modal) modal.style.display = 'none'; 
};

// --- 3. ระบบเพิ่ม-ลดจำนวนสินค้าใน Modal ---
document.getElementById('plus-qty').onclick = () => {
    qtyText.innerText = parseInt(qtyText.innerText) + 1;
};

document.getElementById('minus-qty').onclick = () => {
    let current = parseInt(qtyText.innerText);
    if (current > 1) qtyText.innerText = current - 1;
};

// --- 4. ฟังก์ชันยืนยันเพิ่มลงตะกร้า (บันทึกข้อมูลไปหน้า Bill) ---
document.getElementById('submit-btn').onclick = () => {
    const qty = parseInt(qtyText.innerText);
    totalInCart += qty;
    if (cartCount) cartCount.innerText = totalInCart;
    
    // ดึงข้อมูลรายการอาหารเดิมจาก 'customerOrder'
    let myOrder = JSON.parse(localStorage.getItem('customerOrder')) || [];
    
    // แปลงข้อความราคา (เช่น "50 บาท") ให้เป็นตัวเลขเฉพาะ 50
    const priceValue = parseInt(modalPriceDisp.innerText.replace(/[^0-9]/g, '')) || 0;

    const newItem = {
        name: modalTitle.innerText,
        image: modalImg.src,
        price: priceValue,
        qty: qty
    };

    // เช็คว่ามีเมนูนี้ในตะกร้าอยู่แล้วหรือไม่ ถ้ามีให้บวกจำนวนเพิ่ม
    const existingIndex = myOrder.findIndex(item => item.name === newItem.name);
    if (existingIndex > -1) {
        myOrder[existingIndex].qty += qty;
    } else {
        myOrder.push(newItem);
    }

    // บันทึกกลับลง localStorage
    localStorage.setItem('cartCount', totalInCart);
    localStorage.setItem('customerOrder', JSON.stringify(myOrder));
    
    alert(`เพิ่ม ${modalTitle.innerText} จำนวน ${qty} รายการ เรียบร้อยแล้ว!`);
    modal.style.display = 'none';
};

// --- 5. คลิกที่ไอคอนตะกร้าเพื่อไปหน้า bill.html ---
const basketIcon = document.querySelector('.fa-shopping-basket');
if (basketIcon) {
    const basketContainer = basketIcon.parentElement;
    basketContainer.style.cursor = "pointer";
    basketContainer.onclick = (e) => {
        e.preventDefault();
        window.location.href = "bill.html"; 
    };
}