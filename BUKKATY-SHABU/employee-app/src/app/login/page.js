"use client";
import { useState } from 'react';
import { Container, Button, Form, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [view, setView] = useState("main"); 
    
    // State เก็บค่าที่พิมพ์
    const [name, setName] = useState("");
    const [table, setTable] = useState("");
    const [password, setPassword] = useState("");

    // State เก็บข้อความแจ้งเตือน (Error)
    const [nameError, setNameError] = useState("");
    const [tableError, setTableError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // --- ส่วนของลูกค้า ---
    const handleCustomerSubmit = () => {
        let isValid = true;
        
        // รีเซ็ต Error ก่อนเช็คใหม่
        setNameError("");
        setTableError("");

        // เช็คชื่อ
        if (!name.trim()) {
            setNameError("กรุณากรอกชื่อลูกค้า");
            isValid = false;
        }

        // เช็คเลขโต๊ะ
        if (!table) {
            setTableError("กรุณากรอกหมายเลขโต๊ะ");
            isValid = false;
        } else if (Number(table) <= 0) {
            setTableError("หมายเลขโต๊ะต้องมากกว่า 0");
            isValid = false;
        }

        // ถ้ามีจุดที่ผิด ให้หยุดการทำงานทันที
        if (!isValid) return; 
        
        sessionStorage.setItem("name", name);
        sessionStorage.setItem("customer_name", name);
        sessionStorage.setItem("table", table);
        sessionStorage.setItem("table_number", table);
        
        router.push('/menu'); 
    };

    // ฟังก์ชันจัดการช่องกรอกชื่อ
    const handleNameChange = (e) => {
        const value = e.target.value;
        const regex = /^[a-zA-Zก-๙\s]*$/;
        
        if (!regex.test(value)) {
            setNameError("รองรับเฉพาะภาษาไทยและภาษาอังกฤษเท่านั้น");
        } else {
            setNameError("");
            setName(value);
        }
    };

    // ฟังก์ชันจัดการช่องกรอกเลขโต๊ะ
    const handleTableChange = (e) => {
        const value = e.target.value;
        setTableError(""); 
        
        if (value === "" || Number(value) >= 0) {
            setTable(value);
        }
    };

    // --- ส่วนของพนักงาน ---
    const handleStaffLogin = () => {
        setPasswordError(""); 
        
        if (!password) {
            setPasswordError("กรุณากรอกรหัสผ่าน");
        } else if (password === "1234") { 
            router.push('/staff'); 
        } else {
            setPasswordError("รหัสผ่านไม่ถูกต้อง");
        }
    };

    // ===== 1. เพิ่ม Style สำหรับ Background ที่นี่ =====
    const backgroundStyle = {
        minHeight: '100vh',
        // ใช้ linear-gradient เพื่อสร้างสีดำจางๆ (overlay) ทับรูปภาพ จะได้อ่านตัวหนังสือในกล่องง่ายๆ
        // URL ของรูปภาพ สมมติว่าไฟล์ชื่อ bg.jpg เก็บไว้ในโฟลเดอร์ public
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('/bg.jpg')`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
    };

    return (
        // ===== 2. นำ style ไปใส่ใน Container =====
        <Container fluid className="d-flex justify-content-center align-items-center" style={backgroundStyle}>
            {/* ปรับสีพื้นหลังของ Card ให้มีความโปร่งใสเล็กน้อย (0.9) เพื่อความสวยงาม */}
            <Card style={{ width: '380px', background: 'rgba(26, 26, 26, 0.9)', border: '2px solid gold', color: 'gold', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
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
                            
                            <Form.Group className="mb-3 text-start">
                                <Form.Label style={{ color: 'gold', fontSize: '15px', fontWeight: 'bold' }}>
                                    กรุณากรอกชื่อ
                                </Form.Label>
                                <Form.Control 
                                    className={`bg-dark text-white ${nameError ? 'border-danger' : 'border-secondary'}`} 
                                    value={name}
                                    onChange={handleNameChange} 
                                />
                                {nameError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{nameError}</div>}
                            </Form.Group>
                            
                            <Form.Group className="mb-4 text-start">
                                <Form.Label style={{ color: 'gold', fontSize: '15px', fontWeight: 'bold' }}>
                                    กรุณาใส่หมายเลขโต๊ะ
                                </Form.Label>
                                <Form.Control 
                                    type="number"
                                    min="1"
                                    className={`bg-dark text-white ${tableError ? 'border-danger' : 'border-secondary'}`} 
                                    value={table}
                                    onChange={handleTableChange} 
                                    onKeyDown={(e) => {
                                        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                {tableError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{tableError}</div>}
                            </Form.Group>

                            <Button variant="success" className="w-100 mb-2 fw-bold" onClick={handleCustomerSubmit}>
                                เข้าสู่หน้าร้าน
                            </Button>
                            <Button variant="link" className="text-warning text-decoration-none" onClick={() => {
                                setView("main");
                                setNameError(""); setTableError(""); setName(""); setTable("");
                            }}>
                                ย้อนกลับ
                            </Button>
                        </div>
                    )}

                    {view === "staff" && (
                        <div>
                            <h4 className="mb-3 text-white">พนักงานเข้าสู่ระบบ</h4>
                            
                            <Form.Group className="mb-4 text-start">
                                <Form.Label style={{ color: 'gold', fontSize: '15px', fontWeight: 'bold' }}>
                                    กรุณากรอกรหัสผ่าน
                                </Form.Label>
                                <Form.Control 
                                    type="password" 
                                    className={`bg-dark text-white ${passwordError ? 'border-danger' : 'border-secondary'}`} 
                                    onChange={(e) => {
                                        setPasswordError("");
                                        setPassword(e.target.value);
                                    }} 
                                />
                                {passwordError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{passwordError}</div>}
                            </Form.Group>

                            <Button variant="warning" className="w-100 mb-2 fw-bold" onClick={handleStaffLogin}>
                                ตกลง
                            </Button>
                            <Button variant="link" className="text-warning text-decoration-none" onClick={() => {
                                setView("main");
                                setPasswordError("");
                            }}>
                                ย้อนกลับ
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}