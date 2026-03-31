"use client";
import { useState } from 'react';
import { Container, Button, Form, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    
    // State เก็บค่าที่พิมพ์
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // State เก็บข้อความแจ้งเตือน (Error)
    const [usernameError, setUsernameError] = useState("");
    const [fullNameError, setFullNameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    // --- ฟังก์ชันดักจับช่อง Username (บังคับไทย-อังกฤษ) ---
    const handleUsernameChange = (e) => {
        const value = e.target.value;
        const regex = /^[a-zA-Zก-๙\s]*$/;
        if (!regex.test(value)) {
            setUsernameError("รองรับเฉพาะภาษาไทยและภาษาอังกฤษเท่านั้น");
        } else {
            setUsernameError("");
            setUsername(value);
        }
    };

    // --- ฟังก์ชันดักจับช่อง ชื่อ-นามสกุล (บังคับไทย-อังกฤษ) ---
    const handleFullNameChange = (e) => {
        const value = e.target.value;
        const regex = /^[a-zA-Zก-๙\s]*$/;
        if (!regex.test(value)) {
            setFullNameError("รองรับเฉพาะภาษาไทยและภาษาอังกฤษเท่านั้น");
        } else {
            setFullNameError("");
            setFullName(value);
        }
    };

    // --- ฟังก์ชันทำงานเมื่อกดปุ่มลงทะเบียน ---
    const handleRegisterSubmit = () => {
        let isValid = true;
        
        // รีเซ็ต Error
        setUsernameError(""); 
        setFullNameError(""); 
        setPasswordError(""); 
        setConfirmPasswordError("");

        // เช็คการกรอกข้อมูล
        if (!username.trim()) { setUsernameError("กรุณากำหนดชื่อผู้ใช้งาน (Username)"); isValid = false; }
        if (!fullName.trim()) { setFullNameError("กรุณากรอกชื่อ-นามสกุล"); isValid = false; }
        if (!password) { setPasswordError("กรุณาตั้งรหัสผ่าน"); isValid = false; } 
        else if (password.length < 4) { setPasswordError("รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร"); isValid = false; }
        if (!confirmPassword) { setConfirmPasswordError("กรุณายืนยันรหัสผ่านอีกครั้ง"); isValid = false; } 
        else if (password !== confirmPassword) { setConfirmPasswordError("รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง"); isValid = false; }

        // เช็คชื่อซ้ำจาก localStorage
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        const isDuplicate = existingUsers.some(user => user.username === username);
        
        if (isDuplicate) {
            setUsernameError("ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้ว กรุณาใช้ชื่ออื่น");
            isValid = false;
        }

        if (!isValid) return; 

        // บันทึกผู้ใช้ใหม่ลงใน localStorage
        const newUser = { username, fullName, password, registeredAt: new Date().toISOString() };
        existingUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
        
        // แจ้งเตือนและไปหน้า Login
        alert(`สร้างบัญชีสำหรับคุณ ${fullName} สำเร็จ!`);
        router.push('/login'); 
    };

    // --- สไตล์สำหรับพื้นหลัง ---
    const backgroundStyle = {
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('/bg.jpg')`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '20px 0' 
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center" style={backgroundStyle}>
            <Card style={{ width: '400px', background: 'rgba(26, 26, 26, 0.95)', border: '2px solid gold', color: 'gold', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
                <Card.Body className="p-4">
                    <div className="text-center mb-4">
                        <div style={{ fontSize: '30px', color: 'gold', marginBottom: '5px' }}>📝</div>
                        <h3 style={{ fontWeight: 'bold', letterSpacing: '1px' }}>สมัครสมาชิก</h3>
                        <p className="text-secondary mb-3" style={{ fontSize: '14px' }}>BUKKATY SHABU SYSTEM</p>
                    </div>

                    <Form.Group className="mb-3 text-start">
                        <Form.Label style={{ color: 'gold', fontSize: '14px', fontWeight: 'bold' }}>ชื่อผู้ใช้งาน (Username)</Form.Label>
                        <Form.Control placeholder="เช่น admin01" className={`bg-dark text-white ${usernameError ? 'border-danger' : 'border-secondary'}`} value={username} onChange={handleUsernameChange} />
                        {usernameError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{usernameError}</div>}
                    </Form.Group>

                    <Form.Group className="mb-3 text-start">
                        <Form.Label style={{ color: 'gold', fontSize: '14px', fontWeight: 'bold' }}>ชื่อ-นามสกุล</Form.Label>
                        <Form.Control placeholder="ชื่อพนักงาน หรือ ลูกค้า" className={`bg-dark text-white ${fullNameError ? 'border-danger' : 'border-secondary'}`} value={fullName} onChange={handleFullNameChange} />
                        {fullNameError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{fullNameError}</div>}
                    </Form.Group>

                    <Form.Group className="mb-3 text-start">
                        <Form.Label style={{ color: 'gold', fontSize: '14px', fontWeight: 'bold' }}>รหัสผ่าน (Password)</Form.Label>
                        <Form.Control type="password" placeholder="ตั้งรหัสผ่านอย่างน้อย 4 ตัว" className={`bg-dark text-white ${passwordError ? 'border-danger' : 'border-secondary'}`} value={password} onChange={(e) => { setPasswordError(""); setPassword(e.target.value); }} />
                        {passwordError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{passwordError}</div>}
                    </Form.Group>

                    <Form.Group className="mb-4 text-start">
                        <Form.Label style={{ color: 'gold', fontSize: '14px', fontWeight: 'bold' }}>ยืนยันรหัสผ่าน (Confirm Password)</Form.Label>
                        <Form.Control type="password" placeholder="พิมพ์รหัสผ่านอีกครั้งให้ตรงกัน" className={`bg-dark text-white ${confirmPasswordError ? 'border-danger' : 'border-secondary'}`} value={confirmPassword} onChange={(e) => { setConfirmPasswordError(""); setConfirmPassword(e.target.value); }} />
                        {confirmPasswordError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{confirmPasswordError}</div>}
                    </Form.Group>

                    <Button variant="warning" className="w-100 mb-3 fw-bold text-dark" onClick={handleRegisterSubmit}>ลงทะเบียน</Button>
                    
                    <div className="text-center">
                        <span className="text-white" style={{ fontSize: '14px' }}>มีบัญชีอยู่แล้ว? </span>
                        <Button variant="link" className="text-warning text-decoration-none p-0 fw-bold" style={{ fontSize: '14px' }} onClick={() => router.push('/login')}>
                            เข้าสู่ระบบ
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}