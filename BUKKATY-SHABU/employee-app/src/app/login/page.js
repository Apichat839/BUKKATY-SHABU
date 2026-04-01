"use client";
import { useState, useMemo } from 'react';
import { Container, Button, Form, Card, Badge, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/navigation';
import './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [view, setView] = useState("main"); 
    
    const [name, setName] = useState("");
    const [table, setTable] = useState("");
    const [password, setPassword] = useState("");
    const [staffLoggedIn, setStaffLoggedIn] = useState(false);
    const [expandedMonth, setExpandedMonth] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const [editingUser, setEditingUser] = useState(null);
    const [editUsername, setEditUsername] = useState("");
    const [editFullName, setEditFullName] = useState("");
    const [editError, setEditError] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [nameError, setNameError] = useState("");
    const [tableError, setTableError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // --- Business Logic ---
    const monthlyStats = useMemo(() => {
        if (typeof window === 'undefined') return [];
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const groups = {};
        users.forEach(user => {
            const date = user.registeredAt ? new Date(user.registeredAt) : new Date();
            const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
            const label = `${monthNames[date.getMonth()]} ${date.getFullYear() + 543}`;
            if (!groups[key]) groups[key] = { label, count: 0, users: [] };
            groups[key].count++;
            groups[key].users.push({
                username: user.username || '-',
                fullName: user.fullName || '-',
                registeredAt: date
            });
        });
        return Object.entries(groups)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([key, val]) => ({ key, ...val }));
    }, [staffLoggedIn, refreshKey]);

    const handleDeleteUser = (username) => {
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        const updated = users.filter(u => u.username !== username);
        localStorage.setItem('registeredUsers', JSON.stringify(updated));
        setRefreshKey(k => k + 1);
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    const handleStartEdit = (user) => {
        setEditingUser(user.username);
        setEditUsername(user.username);
        setEditFullName(user.fullName);
        setEditError("");
    };

    const handleSaveEdit = (originalUsername) => {
        setEditError("");
        if (!editUsername.trim() || !editFullName.trim()) {
            setEditError("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
        const regex = /^[a-zA-Zก-๙\s]*$/;
        if (!regex.test(editUsername) || !regex.test(editFullName)) {
            setEditError("รองรับเฉพาะภาษาไทยและภาษาอังกฤษเท่านั้น");
            return;
        }

        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        if (editUsername !== originalUsername && users.some(u => u.username === editUsername)) {
            setEditError("ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้ว");
            return;
        }

        const updated = users.map(u => (u.username === originalUsername ? { ...u, username: editUsername, fullName: editFullName } : u));
        localStorage.setItem('registeredUsers', JSON.stringify(updated));
        setEditingUser(null);
        setRefreshKey(k => k + 1);
    };

    const handleCustomerSubmit = () => {
        let isValid = true;
        setNameError(""); 
        setTableError("");

        if (!name.trim()) { 
            setNameError("กรุณากรอกชื่อผู้ใช้งาน"); 
            isValid = false; 
        } else {
            const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            if (!existingUsers.some(user => user.username === name)) {
                setNameError("ไม่พบชื่อผู้ใช้งานในระบบ");
                isValid = false;
            }
        }

        if (!table || Number(table) <= 0) { 
            setTableError("กรุณากรอกหมายเลขโต๊ะที่ถูกต้อง"); 
            isValid = false; 
        }

        if (isValid) {
            sessionStorage.setItem("name", name);
            sessionStorage.setItem("table", table);
            router.push('/menu'); 
        }
    };

    const handleStaffLogin = () => {
        if (password === "1234") { 
            setStaffLoggedIn(true);
            setView("staff_dashboard");
        } else {
            setPasswordError("รหัสผ่านไม่ถูกต้อง");
        }
    };

    // --- Styles Object ---
    const styles = {
        background: {
            minHeight: '100vh',
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('/bg.jpg')`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            padding: '20px 0' 
        },
        mainCard: {
            width: view === 'staff_dashboard' ? '560px' : '400px',
            background: 'rgba(26, 26, 26, 0.95)',
            border: '2px solid gold',
            color: 'gold',
            borderRadius: '15px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
            transition: 'width 0.3s ease'
        },
        dashboardContainer: {
            background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.08))',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '16px',
            maxHeight: '400px',
            overflowY: 'auto'
        },
        iconBtn: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '2px 5px',
            borderRadius: '4px',
            lineHeight: '1'
        }
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center" style={styles.background}>
            <Card style={styles.mainCard}>
                <Card.Body className="text-center p-4">
                    <div style={{ fontSize: '35px', marginBottom: '10px' }}>🥘</div>
                    <h2 className="mb-4" style={{ fontWeight: 'bold', letterSpacing: '2px' }}>BUKKATY SHABU</h2>

                    {view === "main" && (
                        <>
                            <div className="d-grid gap-3 mb-4">
                                <Button variant="warning" size="lg" className="fw-bold text-dark" onClick={() => setView("customer")}>สำหรับลูกค้า</Button>
                                <Button variant="info" size="lg" className="fw-bold text-dark" onClick={() => router.push('/bookings')}>📅 จองวันล่วงหน้า</Button>
                                <Button variant="outline-warning" size="lg" onClick={() => setView("staff")}>สำหรับพนักงาน</Button>
                            </div>
                            <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255, 215, 0, 0.3)' }}>
                                <span className="text-white" style={{ fontSize: '14px' }}>ยังไม่มีบัญชีผู้ใช้? </span>
                                <Button variant="link" className="text-warning text-decoration-none p-0 fw-bold" onClick={() => router.push('/register')}>สมัครสมาชิก</Button>
                            </div>
                        </>
                    )}

                    {view === "customer" && (
                        <div>
                            <h4 className="mb-3 text-white">ข้อมูลการสั่งอาหาร</h4>
                            <Form.Group className="mb-3 text-start">
                                <Form.Label className="fw-bold">ชื่อผู้ใช้งาน (Username)</Form.Label>
                                <Form.Control className="bg-dark text-white" value={name} onChange={(e) => setName(e.target.value)} />
                                {nameError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{nameError}</div>}
                            </Form.Group>
                            <Form.Group className="mb-4 text-start">
                                <Form.Label className="fw-bold">หมายเลขโต๊ะ</Form.Label>
                                <Form.Control type="number" className="bg-dark text-white" value={table} onChange={(e) => setTable(e.target.value)} />
                                {tableError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{tableError}</div>}
                            </Form.Group>
                            <Button variant="success" className="w-100 mb-2 fw-bold" onClick={handleCustomerSubmit}>เข้าสู่หน้าร้าน</Button>
                            <Button variant="link" className="text-warning text-decoration-none" onClick={() => setView("main")}>ย้อนกลับ</Button>
                        </div>
                    )}

                    {view === "staff" && (
                        <div>
                            <h4 className="mb-3 text-white">พนักงานเข้าสู่ระบบ</h4>
                            <Form.Group className="mb-4 text-start">
                                <Form.Label className="fw-bold">รหัสผ่าน</Form.Label>
                                <Form.Control type="password" placeholder="รหัสผ่าน 1234" className="bg-dark text-white" onChange={(e) => setPassword(e.target.value)} />
                                {passwordError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{passwordError}</div>}
                            </Form.Group>
                            <Button variant="warning" className="w-100 mb-2 fw-bold text-dark" onClick={handleStaffLogin}>ตกลง</Button>
                            <Button variant="link" className="text-warning text-decoration-none" onClick={() => setView("main")}>ย้อนกลับ</Button>
                        </div>
                    )}

                    {view === "staff_dashboard" && (
                        <div>
                            <h4 className="mb-3 text-white">📊 ยอดสมัครสมาชิกรายเดือน</h4>
                            <div style={styles.dashboardContainer}>
                                {monthlyStats.length === 0 ? <div className="text-center text-secondary p-3">ยังไม่มีข้อมูล</div> : 
                                    monthlyStats.map((stat) => (
                                        <div key={stat.key} className="mb-2">
                                            <div onClick={() => setExpandedMonth(expandedMonth === stat.key ? null : stat.key)} 
                                                style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', cursor: 'pointer' }}>
                                                <span>{expandedMonth === stat.key ? '▼' : '▶'} 📅 {stat.label}</span>
                                                <Badge bg="warning" text="dark">{stat.count} คน</Badge>
                                            </div>
                                            {expandedMonth === stat.key && (
                                                <div style={{ background: 'rgba(0,0,0,0.45)', padding: '8px', borderRadius: '0 0 8px 8px' }}>
                                                    {stat.users.map((user, idx) => (
                                                        <div key={idx} className="d-flex justify-content-between align-items-center mb-1 text-white" style={{ fontSize: '12px' }}>
                                                            <span>{user.username} - {user.fullName}</span>
                                                            <div>
                                                                <button onClick={() => handleStartEdit(user)} style={styles.iconBtn}>✏️</button>
                                                                <button onClick={() => { setDeleteTarget(user.username); setShowDeleteModal(true); }} style={styles.iconBtn}>🗑️</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                }
                            </div>
                            <Button variant="warning" className="w-100 mb-2 fw-bold text-dark" onClick={() => router.push('/staff')}>เข้าสู่หน้าพนักงาน →</Button>
                            <Button variant="link" className="text-warning text-decoration-none" onClick={() => setView("main")}>ย้อนกลับ</Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className="bg-dark text-warning border-secondary">
                    <Modal.Title>ยืนยันการลบ</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white">ต้องการลบผู้ใช้ {deleteTarget} ใช่หรือไม่?</Modal.Body>
                <Modal.Footer className="bg-dark border-secondary">
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>ยกเลิก</Button>
                    <Button variant="danger" onClick={() => handleDeleteUser(deleteTarget)}>ลบ</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}