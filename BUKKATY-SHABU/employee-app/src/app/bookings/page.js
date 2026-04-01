"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Card, Table, Modal, Badge } from 'react-bootstrap';
import './bookingspage.module.css'; 

export default function BookingPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        booking_id: null,
        customer_name: '',
        booking_date: '',
        number_of_guests: 1,
        table_id: '',
        table_number: ''
    });
    const [bookings, setBookings] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/bookings/all_details');
            const res = await response.json();
            if (!res.isError) setBookings(res.data);
        } catch (error) { 
            console.error("Fetch Error:", error); 
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const resetForm = () => {
        setFormData({ 
            booking_id: null, 
            customer_name: '', 
            booking_date: '', 
            number_of_guests: 1, 
            table_id: '',
            table_number: '' 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = {
            ...formData,
            table_id: formData.table_id || null,
            table_number: formData.table_number || null 
        };

        const url = formData.booking_id 
            ? `http://localhost:8080/api/bookings/update` 
            : `http://localhost:8080/api/bookings/create`;
            
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });

            const res = await response.json();
            if (!res.isError) {
                alert(formData.booking_id ? "✅ แก้ไขข้อมูลการจองสำเร็จ!" : "🎉 จองโต๊ะสำเร็จ!");
                resetForm();
                fetchBookings();
                setShowModal(false);
            } else {
                alert("❌ เกิดข้อผิดพลาด: " + res.errorMessage);
            }
        } catch (error) {
            console.error("Submit Error:", error);
            alert("⚠️ เซิร์ฟเวอร์ขัดข้อง");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบการจองนี้?")) return;
        try {
            const response = await fetch(`http://localhost:8080/api/bookings/delete/${id}`, {
                method: 'DELETE'
            });
            const res = await response.json();
            if (!res.isError) {
                alert("🗑️ ลบการจองสำเร็จ!");
                fetchBookings();
                if (formData.booking_id === id) resetForm();
            } else {
                alert("❌ เกิดข้อผิดพลาดในการลบ: " + (res.errorMessage || res.message));
            }
        } catch (error) {
            console.error("Delete Error:", error);
            alert("⚠️ ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
        }
    };

    const handleEdit = (item) => {
        let formattedDate = "";
        if (item.booking_date) {
            const d = new Date(item.booking_date);
            formattedDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000))
                            .toISOString().slice(0, 16);
        }
        setFormData({
            booking_id: item.booking_id,
            customer_name: item.customer_name,
            booking_date: formattedDate,
            number_of_guests: item.number_of_guests,
            table_id: item.table_id || '',
            table_number: item.table_number || ''
        });
        setShowModal(false);
    };

    return (
        <Container className="booking-container">
            <Card className="booking-card shadow border-warning">
                <Card.Body>
                    <Card.Title className="text-warning text-center mb-4">
                        {formData.booking_id ? '📝 แก้ไขการจอง' : <b>📅 จองโต๊ะ Bukkaty Shabu</b>}
                    </Card.Title>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>ชื่อผู้จอง</Form.Label>
                            <Form.Control 
                                type="text" required 
                                value={formData.customer_name} 
                                onChange={(e) => setFormData({...formData, customer_name: e.target.value})} 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>วันที่และเวลา</Form.Label>
                            <Form.Control 
                                type="datetime-local" required 
                                value={formData.booking_date} 
                                onChange={(e) => setFormData({...formData, booking_date: e.target.value})} 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>เลขโต๊ะ (ถ้าทราบ)</Form.Label>
                            <Form.Control 
                                type="number" min="1" placeholder="เช่น 1, 2, 3"
                                value={formData.table_number} 
                                onChange={(e) => setFormData({...formData, table_number: e.target.value})} 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>จำนวนแขก</Form.Label>
                            <Form.Control 
                                type="number" min="1" required 
                                value={formData.number_of_guests} 
                                onChange={(e) => setFormData({...formData, number_of_guests: e.target.value})} 
                            />
                        </Form.Group>
                        <div className="d-grid gap-2">
                            <Button variant={formData.booking_id ? "info" : "warning"} type="submit" className="fw-bold">
                                {formData.booking_id ? 'บันทึกการแก้ไข' : 'ยืนยันการจอง'}
                            </Button>
                            {formData.booking_id && (
                                <Button variant="secondary" onClick={resetForm}>ยกเลิกการแก้ไข</Button>
                            )}
                            <Button variant="outline-secondary" onClick={() => setShowModal(true)}>
                                🔍 ดูรายการทั้งหมด / แก้ไข
                            </Button>
                            <Button variant="danger" onClick={() => router.push('/login')} className="fw-bold mt-2">
                                ⬅️ กลับหน้าเริ่มต้น / เข้าสู่ระบบ
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* Modal รายการทั้งหมด */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-warning">
                    <Modal.Title>รายการจองทั้งหมด</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped bordered hover responsive>
                        <thead className="table-light">
                            <tr>
                                <th>ชื่อผู้จอง</th>
                                <th>วันที่ - เวลา</th>
                                <th>จำนวนแขก</th>
                                <th>เลขโต๊ะ</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length > 0 ? bookings.map(item => (
                                <tr key={item.booking_id}>
                                    <td>{item.customer_name}</td>
                                    <td>{new Date(item.booking_date).toLocaleString('th-TH')}</td>
                                    <td>{item.number_of_guests} ท่าน</td>
                                    <td>
                                        {item.table_number ? (
                                            <Badge bg="success" className="table-badge">
                                                โต๊ะ {item.table_number}
                                            </Badge>
                                        ) : (
                                            <Badge bg="secondary">ยังไม่ระบุ</Badge>
                                        )}
                                    </td>
                                    <td>
                                        <Button size="sm" variant="primary" onClick={() => handleEdit(item)} className="me-2 mb-1">แก้ไข</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(item.booking_id)} className="mb-1">ลบ</Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="text-center">ไม่พบข้อมูลการจอง</td></tr>
                            )}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>
        </Container>
    );
}