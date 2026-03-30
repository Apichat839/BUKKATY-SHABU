"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BillPage() {
    const router = useRouter();
    const [myOrder, setMyOrder] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const saved = JSON.parse(sessionStorage.getItem('customerOrder')) || [];
        setMyOrder(saved);
        setTotal(saved.reduce((sum, item) => sum + (item.price * item.qty), 0));
    }, []);

    const confirmPayment = async () => {
        if (confirm("ยืนยันการสั่งซื้อ?")) {
            // ส่งข้อมูลด้วยชื่อ Field ที่ Backend (orders.js) รอรับ
            await fetch('http://localhost:8080/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table_name: sessionStorage.getItem('table') || "01",
                    customer_name: sessionStorage.getItem('name') || "Guest",
                    items: myOrder, 
                    total_price: total
                })
            });

            sessionStorage.removeItem('customerOrder'); // ล้างตะกร้าหลังสั่งสำเร็จ
            router.push('/feedback'); 
        }
    };

    return (
        <div className="container mt-5">
            <h2>สรุปยอดชำระ: {total} บาท</h2>
            <button className="btn btn-success" onClick={confirmPayment}>ยืนยันการสั่งซื้อ</button>
        </div>
    );
}