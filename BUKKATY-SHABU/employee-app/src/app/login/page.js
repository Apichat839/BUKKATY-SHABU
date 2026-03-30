"use client";
import { useState } from 'react';
import { Container, Button, Form, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [view, setView] = useState("main"); 
    const [name, setName] = useState("");
    const [table, setTable] = useState("");
    const [password, setPassword] = useState("");

    // --- ส่วนของลูกค้า ---
    const handleCustomerSubmit = () => {
        if (!name || !table) return alert("กรุณากรอกข้อมูลให้ครบ");
        
        /** * ปรับ Key ให้ตรงตามมาตรฐานที่หน้า Menu และ Bill เรียกใช้:
         * หน้า Menu ใช้: table_number
         * หน้า Bill ใช้: name และ table
         * ดังนั้นเราจะ set ไว้ให้ครบทุกตัวเพื่อความชัวร์ครับ
         */
        sessionStorage.setItem("name", name);
        sessionStorage.setItem("customer_name", name);
        sessionStorage.setItem("table", table);
        sessionStorage.setItem("table_number", table);
        
        router.push('/menu'); 
    };

    // --- ส่วนของพนักงาน ---
    const handleStaffLogin = () => {
        // เช็คแบบง่ายตามโค้ดเดิม หรือจะ Fetch ไปที่ /api/login ของ Backend ก็ได้ครับ
        if (password === "1234") { 
            router.push('/staff'); 
        } else {
            alert("รหัสผ่านไม่ถูกต้อง");
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#000' }}>
            <Card style={{ width: '350px', background: '#1a1a1a', border: '2px solid gold', color: 'gold', borderRadius: '15px' }}>
                <Card.Body className="text-center p-4">
                    <h2 className="mb-4" style={{ fontWeight: 'bold', letterSpacing: '2px' }}>BUKKATY SHABU</h2>

                    {view === "main" && (
                        <div className="d-grid gap-3">
                            <Button variant="warning" size="lg" className="fw-bold" onClick={() => setView("customer")}>
                                สำหรับลูกค้า
                            </Button>
                            <Button variant="outline-warning" size="lg" onClick={() => setView("staff")}>
                                สำหรับพนักงาน
                            </Button>
                        </div>
                    )}

                    {view === "customer" && (
                        <div>
                            <h4 className="mb-3 text-white">ข้อมูลการสั่งอาหาร</h4>
                            <Form.Control 
                                placeholder="ชื่อลูกค้า" 
                                className="mb-2 bg-dark text-white border-secondary" 
                                onChange={(e) => setName(e.target.value)} 
                            />
                            <Form.Control 
                                type="number"
                                placeholder="เลขโต๊ะ" 
                                className="mb-3 bg-dark text-white border-secondary" 
                                onChange={(e) => setTable(e.target.value)} 
                            />
                            <Button variant="success" className="w-100 mb-2 fw-bold" onClick={handleCustomerSubmit}>
                                เข้าสู่หน้าร้าน
                            </Button>
                            <Button variant="link" className="text-warning text-decoration-none" onClick={() => setView("main")}>
                                ย้อนกลับ
                            </Button>
                        </div>
                    )}

                    {view === "staff" && (
                        <div>
                            <h4 className="mb-3 text-white">พนักงานเข้าสู่ระบบ</h4>
                            <Form.Control 
                                type="password" 
                                placeholder="รหัสผ่าน" 
                                className="mb-3 bg-dark text-white border-secondary" 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                            <Button variant="warning" className="w-100 mb-2 fw-bold" onClick={handleStaffLogin}>
                                ตกลง
                            </Button>
                            <Button variant="link" className="text-warning text-decoration-none" onClick={() => setView("main")}>
                                ย้อนกลับ
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}