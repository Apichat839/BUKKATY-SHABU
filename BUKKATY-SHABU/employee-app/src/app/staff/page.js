"use client";
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Card, Table, Badge } from 'react-bootstrap';

export default function StaffDashboard() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // ดึงข้อมูลออเดอร์จาก Backend API (Port 8080)
        const fetchOrders = async () => {
            const response = await fetch('http://localhost:8080/api/orders/all');
            const res = await response.json();
            if (!res.isError) setOrders(res.data);
        };
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000); // อัปเดตทุก 5 วินาที
        return () => clearInterval(interval);
    }, []);

    return (
        <Container className="mt-4">
            <h2 className="text-warning mb-4">รายการสั่งอาหาร Bukkaty Shabu</h2>
            <Table striped bordered hover variant="dark">
                <thead>
                    <tr>
                        <th>โต๊ะ</th>
                        <th>ชื่อลูกค้า</th>
                        <th>รายการ</th>
                        <th>ยอดรวม</th>
                        <th>สถานะ</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.table_no}</td>
                            <td>{order.customer_name}</td>
                            <td>
                                {JSON.parse(order.items_json).map(item => (
                                    <div key={item.name}>{item.name} x {item.qty}</div>
                                ))}
                            </td>
                            <td>{order.total_price}.-</td>
                            <td><Badge bg="success">{order.status}</Badge></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}