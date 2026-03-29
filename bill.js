const savedOrder = localStorage.getItem('customerOrder');
const myOrder = savedOrder ? JSON.parse(savedOrder) : [];

const orderContainer = document.getElementById('order-item');
const totalDisplay = document.getElementById('total-amount');
let totalPrice = 0;

function displayOrder() {
    orderContainer.innerHTML = "";
    totalPrice = 0;

    if (myOrder.length === 0) {
        orderContainer.innerHTML = "<p class='empty-cart'>ยังไม่มีรายการอาหาร</p>";
        return;
    }

    myOrder.forEach(item => {
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
                <span class="item-price-total">${itemTotal.toLocaleString()}.-</span>
            </div>
        `;
    });
    totalDisplay.innerText = totalPrice.toLocaleString() + ".-";
}

function generateQR() {
    const modal = document.getElementById('qr');
    const modalPrice = document.getElementById('price');
    const qrImg = document.getElementById('qr-img');

    modalPrice.innerText = totalPrice.toLocaleString();

    const promptpayid = "0980509592";
    qrImg.src = `https://promptpay.io/${promptpayid}/${totalPrice}.png`;
    modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById('qr');
    if (modal) {
        modal.style.display = "none";
    }
}

displayOrder();