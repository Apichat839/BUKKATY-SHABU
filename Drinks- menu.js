// 1. ประกาศตัวแปรอ้างอิงถึง DOM Elements
const modal = document.getElementById('order-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalPriceDisp = document.getElementById('modal-price-display');
const qtyText = document.getElementById('current-qty');
const cartCount = document.getElementById('cart-count');

// 2. ดึงจำนวนสินค้าในตะกร้าจาก LocalStorage
let totalInCart = parseInt(localStorage.getItem('cartCount')) || 0;
cartCount.innerText = totalInCart;

// 3. จัดการการคลิกที่รายการอาหาร (Menu Cards)
document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', () => {
        const title = card.querySelector('h3').innerText;
        const img = card.querySelector('img').src;
        const priceTag = card.querySelector('h4');
        const price = priceTag ? priceTag.innerText : "0 บาท.";

        modalTitle.innerText = title;
        modalImg.src = img;
        modalPriceDisp.innerText = "ราคา " + price;
        qtyText.innerText = 1; // รีเซ็ตจำนวนเป็น 1 ทุกครั้งที่เปิด modal
        modal.style.display = 'flex';
    });
});

// 4. การปิด Modal (ปุ่มปิด และ คลิกนอก Modal)
const closeBtn = document.getElementById('close-modal');
if (closeBtn) {
    closeBtn.onclick = () => modal.style.display = 'none';
}

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// 5. ปุ่มเพิ่ม-ลด จำนวนสินค้า
document.getElementById('plus-qty').onclick = () => {
    qtyText.innerText = parseInt(qtyText.innerText) + 1;
};

document.getElementById('minus-qty').onclick = () => {
    let current = parseInt(qtyText.innerText);
    if (current > 1) {
        qtyText.innerText = current - 1;
    }
};

// 6. ปุ่มกดยืนยันการสั่งซื้อ (เพิ่มลงตะกร้า)
document.getElementById('submit-btn').onclick = () => {
    const qty = parseInt(qtyText.innerText);
    totalInCart += qty;
    cartCount.innerText = totalInCart;

    // ดึงข้อมูลออเดอร์เก่า หรือสร้างอาเรย์ใหม่ถ้ายังไม่มี
    let myOrder = JSON.parse(localStorage.getItem('customerOrder')) || [];

    // ดึงเฉพาะตัวเลขจากข้อความราคา (เช่น "ราคา 150 บาท" -> 150)
    const priceValue = parseInt(modalPriceDisp.innerText.replace(/[^0-9]/g, '')) || 0;

    const newItem = {
        name: modalTitle.innerText,
        image: modalImg.src,
        price: priceValue,
        qty: qty
    };

    // ตรวจสอบว่ามีสินค้านี้ในตะกร้าหรือยัง
    const existingIndex = myOrder.findIndex(item => item.name === newItem.name);
    if (existingIndex > -1) {
        myOrder[existingIndex].qty += qty;
    } else {
        myOrder.push(newItem);
    }

    // บันทึกลง LocalStorage
    localStorage.setItem('cartCount', totalInCart);
    localStorage.setItem('customerOrder', JSON.stringify(myOrder));

    alert(`เพิ่ม ${modalTitle.innerText} เรียบร้อยแล้ว!`);
    modal.style.display = 'none';
};

// 7. จัดการไอคอนตะกร้าเพื่อไปหน้าสรุปยอด (bill.html)
const basketIcon = document.querySelector('.fa-shopping-basket');
if (basketIcon) {
    const basketButton = basketIcon.parentElement;
    basketButton.style.cursor = "pointer";
    basketButton.onclick = (e) => {
        e.preventDefault();
        window.location.href = "bill.html";
    };
}