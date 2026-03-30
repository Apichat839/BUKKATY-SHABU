"use client";
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Table, Badge } from 'react-bootstrap';

export default function StaffDashboard() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/orders/all');
                const res = await response.json();
                if (!res.isError) setOrders(res.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };
        
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000); 
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
                    {orders.map((order, orderIndex) => (
                        // แก้ไขจุดที่ 1: ใช้ order.id ผสมกับ index เพื่อความชัวร์
                        <tr key={`order-${order.id || orderIndex}`}> 
                            <td>{order.table_name || order.table_no}</td>
                            <td>{order.customer_name}</td>
                            <td>
                                {JSON.parse(order.items_json).map((item, itemIndex) => (
                                    // แก้ไขจุดที่ 2: ใช้ชื่อเมนูผสมกับ index
                                    <div key={`item-${order.id}-${item.name}-${itemIndex}`}>
                                        {item.name} x {item.qty}
                                    </div>
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