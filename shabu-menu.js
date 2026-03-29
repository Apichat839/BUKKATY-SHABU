// --- ส่วนที่ต้องนำไปวางทับในไฟล์เมนูทั้ง 3 ไฟล์ ---

const modal = document.getElementById('order-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalPriceDisp = document.getElementById('modal-price-display');
const qtyText = document.getElementById('current-qty');
const cartCount = document.getElementById('cart-count');

let totalInCart = parseInt(localStorage.getItem('cartCount')) || 0;
cartCount.innerText = totalInCart;

// เปิด Modal
document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', () => {
        const title = card.querySelector('h3').innerText;
        const img = card.querySelector('img').src;
        const priceTag = card.querySelector('h4');
        const price = priceTag ? priceTag.innerText : "0 บาท.";

        modalTitle.innerText = title;
        modalImg.src = img;
        modalPriceDisp.innerText = "ราคา " + price;
        qtyText.innerText = 1;
        modal.style.display = 'flex';
    });
});

// ปิด Modal
document.getElementById('close-modal').onclick = () => modal.style.display = 'none';
window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; };

// เพิ่ม-ลดจำนวน
document.getElementById('plus-qty').onclick = () => {
    qtyText.innerText = parseInt(qtyText.innerText) + 1;
};
document.getElementById('minus-qty').onclick = () => {
    let current = parseInt(qtyText.innerText);
    if (current > 1) qtyText.innerText = current - 1;
};

// ยืนยันเพิ่มลงตะกร้า (ตัวนี้แหละที่ส่งข้อมูลไปหน้า bill)
document.getElementById('submit-btn').onclick = () => {
    const qty = parseInt(qtyText.innerText);
    totalInCart += qty;
    cartCount.innerText = totalInCart;
    
    // ดึงข้อมูลเดิมจาก 'customerOrder' เพื่อให้ตรงกับ bill.js
    let myOrder = JSON.parse(localStorage.getItem('customerOrder')) || [];
    
    // แปลงข้อความราคาให้เป็นตัวเลข เพื่อใช้คำนวณในหน้าบิล
    const priceValue = parseInt(modalPriceDisp.innerText.replace(/[^0-9]/g, '')) || 0;

    const newItem = {
        name: modalTitle.innerText,
        image: modalImg.src,
        price: priceValue,
        qty: qty
    };

    const existingIndex = myOrder.findIndex(item => item.name === newItem.name);
    if (existingIndex > -1) {
        myOrder[existingIndex].qty += qty;
    } else {
        myOrder.push(newItem);
    }

    localStorage.setItem('cartCount', totalInCart);
    localStorage.setItem('customerOrder', JSON.stringify(myOrder));
    
    alert(`เพิ่ม ${modalTitle.innerText} เรียบร้อยแล้ว!`);
    modal.style.display = 'none';
};

// คลิกที่ตะกร้าไปหน้า bill.html
const basketIcon = document.querySelector('.fa-shopping-basket');
if (basketIcon) {
    basketIcon.parentElement.style.cursor = "pointer";
    basketIcon.parentElement.onclick = (e) => {
        e.preventDefault();
        window.location.href = "bill.html"; 
    };
}