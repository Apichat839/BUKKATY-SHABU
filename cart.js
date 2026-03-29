function loadCart() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const listContainer = document.getElementById('cart-list');
    const totalPriceElement = document.getElementById('total-price');
    
    if (cartItems.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding:40px; color:#aaa;">ไม่มีรายการในตะกร้า</div>';
        document.getElementById('summary-area').style.display = 'none';
        return;
    }

    document.getElementById('summary-area').style.display = 'block';
    let total = 0;

    listContainer.innerHTML = cartItems.map((item, index) => {
        const itemSum = item.price * item.qty;
        total += itemSum;
        return `
            <div class="cart-item">
                <img src="${item.img}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price} บาท x ${item.qty}</p>
                </div>
                <div class="item-total">${itemSum}.-</div>
                <button class="remove-btn" onclick="removeItem(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
    }).join('');

    totalPriceElement.innerText = total.toLocaleString();
}

function removeItem(index) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    let currentTotalCount = parseInt(localStorage.getItem('cartCount')) || 0;
    
    currentTotalCount -= cartItems[index].qty;
    cartItems.splice(index, 1);
    
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('cartCount', Math.max(0, currentTotalCount));
    loadCart();
}

function clearCart() {
    if(confirm('ลบรายการทั้งหมด?')) {
        localStorage.removeItem('cartItems');
        localStorage.setItem('cartCount', 0);
        loadCart();
    }
}

function sendOrder() {
    alert('ส่งออเดอร์ไปที่ครัวเรียบร้อยแล้ว!');
    localStorage.removeItem('cartItems');
    localStorage.setItem('cartCount', 0);
    window.location.href = 'index.html';
}

window.onload = loadCart;