// ดึงข้อมูลจาก LocalStorage
const savedOrder = localStorage.getItem('customerOrder');
let myOrder = savedOrder ? JSON.parse(savedOrder) : [];

const orderContainer = document.getElementById('order-item');
const totalDisplay = document.getElementById('total-amount');
let totalPrice = 0;

function displayOrder() {
    orderContainer.innerHTML = "";
    totalPrice = 0;

    if (myOrder.length === 0) {
        orderContainer.innerHTML = "<p class='empty-cart' style='text-align:center; color:#666; padding:20px;'>ยังไม่มีรายการอาหาร</p>";
        totalDisplay.innerText = "0.-";
        return;
    }

    // เพิ่ม index เพื่อใช้ระบุแถวที่จะลบ
    myOrder.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        totalPrice += itemTotal;
        
        orderContainer.innerHTML += `
            <div class="item">
                <div class="item-info">
                    <img src="${item.image || 'placeholder.png'}" alt="${item.name}" class="order-thumbnail">
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <small class="item-qty">x ${item.qty}</small>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="item-price-total">${itemTotal.toLocaleString()}.-</span>
                    <button onclick="removeItem(${index})" style="background: none; border: none; color: #b22222; cursor: pointer; font-size: 1.2rem; font-weight: bold;">&times;</button>
                </div>
            </div>
        `;
    });
    totalDisplay.innerText = totalPrice.toLocaleString() + ".-";
}

// ฟังก์ชันลบรายการทีละอัน
function removeItem(index) {
    if (confirm(`ลบรายการ "${myOrder[index].name}" หรือไม่?`)) {
        // 1. ลบออกจากตัวแปร Array
        myOrder.splice(index, 1);
        
        // 2. อัปเดต LocalStorage ให้จำค่าที่ลบแล้ว
        localStorage.setItem('customerOrder', JSON.stringify(myOrder));
        
        // 3. วาดหน้าจอใหม่
        displayOrder();
    }
}

function generateQR() {
    const modal = document.getElementById('qr');
    const modalPrice = document.getElementById('price');
    const qrImg = document.getElementById('qr-img');

    modalPrice.innerText = totalPrice.toLocaleString();

    const promptpayid = "0980509592"; //
    qrImg.src = `https://promptpay.io/${promptpayid}/${totalPrice}.png`;
    modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById('qr');
    if (modal) {
        modal.style.display = "none";
    }
}

function confirmPayment() {
    if (confirm("คุณชำระเงินเรียบร้อยแล้วใช่หรือไม่? ระบบจะเริ่มรายการใหม่ทันที")) {
        localStorage.removeItem('customerOrder');
        myOrder = [];
        closeModal();
        displayOrder();
    }
}

displayOrder();