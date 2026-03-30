"use client";
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Card } from 'react-bootstrap';

export default function BookingPage() {
    const [formData, setFormData] = useState({
        customer_name: '',
        booking_date: '',
        number_of_guests: 1,
        table_id: '' // ใส่เป็น ID ของโต๊ะ (ถ้ามีระบบเลือกโต๊ะ)
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/bookings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const res = await response.json();
            
            if (!res.isError) {
                alert("การจองของคุณสำเร็จแล้ว!");
                setFormData({ customer_name: '', booking_date: '', number_of_guests: 1, table_id: '' });
            } else {
                alert("เกิดข้อผิดพลาด: " + res.errorMessage);
            }
        } catch (error) {
            console.error("Booking error:", error);
        }
    };

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card style={{ width: '400px' }} className="shadow border-warning">
                <Card.Body>
                    <Card.Title className="text-warning text-center mb-4">จองโต๊ะ Bukkaty Shabu</Card.Title>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>ชื่อผู้จอง</Form.Label>
                            <Form.Control 
                                type="text" 
                                required 
                                value={formData.customer_name}
                                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>วันที่และเวลา</Form.Label>
                            <Form.Control 
                                type="datetime-local" 
                                required 
                                value={formData.booking_date}
                                onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>จำนวนแขก (ท่าน)</Form.Label>
                            <Form.Control 
                                type="number" 
                                min="1" 
                                required 
                                value={formData.number_of_guests}
                                onChange={(e) => setFormData({...formData, number_of_guests: e.target.value})}
                            />
                        </Form.Group>

                        <Button variant="warning" type="submit" className="w-full font-bold">
                            ยืนยันการจอง
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}