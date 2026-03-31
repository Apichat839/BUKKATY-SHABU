"use client";
import { useState, useMemo } from 'react';
import { Container, Button, Form, Card, Badge, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [view, setView] = useState("main"); 
    
    const [name, setName] = useState("");
    const [table, setTable] = useState("");
    const [password, setPassword] = useState("");
    const [staffLoggedIn, setStaffLoggedIn] = useState(false);
    const [expandedMonth, setExpandedMonth] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // --- state สำหรับแก้ไขผู้ใช้ ---
    const [editingUser, setEditingUser] = useState(null); // username ที่กำลังแก้ไข
    const [editUsername, setEditUsername] = useState("");
    const [editFullName, setEditFullName] = useState("");
    const [editError, setEditError] = useState("");

    // --- state สำหรับ confirm ลบ ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [nameError, setNameError] = useState("");
    const [tableError, setTableError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // --- คำนวณยอดสมัครสมาชิกรายเดือน พร้อมรายชื่อผู้สมัคร ---
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staffLoggedIn, refreshKey]);

    // --- ฟังก์ชันลบผู้ใช้ ---
    const handleDeleteUser = (username) => {
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        const updated = users.filter(u => u.username !== username);
        localStorage.setItem('registeredUsers', JSON.stringify(updated));
        setRefreshKey(k => k + 1);
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    // --- ฟังก์ชันเริ่มแก้ไขผู้ใช้ ---
    const handleStartEdit = (user) => {
        setEditingUser(user.username);
        setEditUsername(user.username);
        setEditFullName(user.fullName);
        setEditError("");
    };

    // --- ฟังก์ชันบันทึกการแก้ไข ---
    const handleSaveEdit = (originalUsername) => {
        setEditError("");
        
        if (!editUsername.trim()) {
            setEditError("กรุณากรอกชื่อผู้ใช้งาน");
            return;
        }
        if (!editFullName.trim()) {
            setEditError("กรุณากรอกชื่อ-นามสกุล");
            return;
        }

        const regex = /^[a-zA-Zก-๙\s]*$/;
        if (!regex.test(editUsername) || !regex.test(editFullName)) {
            setEditError("รองรับเฉพาะภาษาไทยและภาษาอังกฤษเท่านั้น");
            return;
        }

        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        
        // เช็คชื่อซ้ำ (ถ้าเปลี่ยน username)
        if (editUsername !== originalUsername) {
            const isDuplicate = users.some(u => u.username === editUsername);
            if (isDuplicate) {
                setEditError("ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้ว");
                return;
            }
        }

        const updated = users.map(u => {
            if (u.username === originalUsername) {
                return { ...u, username: editUsername, fullName: editFullName };
            }
            return u;
        });
        localStorage.setItem('registeredUsers', JSON.stringify(updated));
        setEditingUser(null);
        setRefreshKey(k => k + 1);
    };

    // --- ฟังก์ชันยกเลิกการแก้ไข ---
    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditError("");
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
            const isRegistered = existingUsers.some(user => user.username === name);
            
            if (!isRegistered) {
                setNameError("ไม่พบชื่อผู้ใช้งานนี้ในระบบ กรุณาสมัครสมาชิกก่อน!");
                isValid = false;
            }
        }

        if (!table) { 
            setTableError("กรุณากรอกหมายเลขโต๊ะ"); 
            isValid = false; 
        } else if (Number(table) <= 0) { 
            setTableError("หมายเลขโต๊ะต้องมากกว่า 0"); 
            isValid = false; 
        }

        if (!isValid) return; 
        
        sessionStorage.setItem("name", name);
        sessionStorage.setItem("customer_name", name);
        sessionStorage.setItem("table", table);
        sessionStorage.setItem("table_number", table);
        
        router.push('/menu'); 
    };

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

    const handleTableChange = (e) => {
        const value = e.target.value;
        setTableError(""); 
        if (value === "" || Number(value) >= 0) {
            setTable(value);
        }
    };

    const handleStaffLogin = () => {
        setPasswordError(""); 
        if (!password) {
            setPasswordError("กรุณากรอกรหัสผ่าน");
        } else if (password === "1234") { 
            setStaffLoggedIn(true);
            setView("staff_dashboard");
        } else {
            setPasswordError("รหัสผ่านไม่ถูกต้อง");
        }
    };

    const handleGoToStaffPage = () => {
        sessionStorage.setItem("role", "staff");
        router.push('/staff');
    };

    const backgroundStyle = {
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('/bg.jpg')`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '20px 0' 
    };

    // สไตล์ปุ่ม icon เล็กๆ
    const iconBtnStyle = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '2px 5px',
        borderRadius: '4px',
        transition: 'all 0.15s',
        lineHeight: '1'
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center" style={backgroundStyle}>
            <Card style={{ width: view === 'staff_dashboard' ? '560px' : '400px', background: 'rgba(26, 26, 26, 0.95)', border: '2px solid gold', color: 'gold', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', transition: 'width 0.3s ease' }}>
                <Card.Body className="text-center p-4">
                    <div style={{ fontSize: '35px', color: 'gold', marginBottom: '10px' }}>🥘</div>
                    <h2 className="mb-4" style={{ fontWeight: 'bold', letterSpacing: '2px', color: 'gold' }}>BUKKATY SHABU</h2>

                    {view === "main" && (
                        <>
                            <div className="d-grid gap-3 mb-4">
                                <Button variant="warning" size="lg" className="fw-bold text-dark" onClick={() => setView("customer")}>
                                    สำหรับลูกค้า
                                </Button>
                                <Button variant="outline-warning" size="lg" onClick={() => setView("staff")}>
                                    สำหรับพนักงาน
                                </Button>
                            </div>
                            
                            <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255, 215, 0, 0.3)' }}>
                                <span className="text-white" style={{ fontSize: '14px' }}>ยังไม่มีบัญชีผู้ใช้? </span>
                                <Button variant="link" className="text-warning text-decoration-none p-0 fw-bold" style={{ fontSize: '14px' }} onClick={() => router.push('/register')}>
                                    สมัครสมาชิก
                                </Button>
                            </div>
                        </>
                    )}

                    {view === "customer" && (
                        <div>
                            <h4 className="mb-3 text-white">ข้อมูลการสั่งอาหาร</h4>
                            
                            <Form.Group className="mb-3 text-start">
                                <Form.Label style={{ color: 'gold', fontSize: '15px', fontWeight: 'bold' }}>ชื่อผู้ใช้งาน (Username)</Form.Label>
                                <Form.Control className={`bg-dark text-white ${nameError ? 'border-danger' : 'border-secondary'}`} value={name} onChange={handleNameChange} />
                                {nameError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{nameError}</div>}
                            </Form.Group>
                            
                            <Form.Group className="mb-4 text-start">
                                <Form.Label style={{ color: 'gold', fontSize: '15px', fontWeight: 'bold' }}>กรุณาใส่หมายเลขโต๊ะ</Form.Label>
                                <Form.Control type="number" min="1" className={`bg-dark text-white ${tableError ? 'border-danger' : 'border-secondary'}`} value={table} onChange={handleTableChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault(); }} />
                                {tableError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{tableError}</div>}
                            </Form.Group>

                            <Button variant="success" className="w-100 mb-2 fw-bold" onClick={handleCustomerSubmit}>เข้าสู่หน้าร้าน</Button>
                            <Button variant="link" className="text-warning text-decoration-none" onClick={() => { setView("main"); setNameError(""); setTableError(""); setName(""); setTable(""); }}>ย้อนกลับ</Button>
                        </div>
                    )}

                    {view === "staff" && (
                        <div>
                            <h4 className="mb-3 text-white">พนักงานเข้าสู่ระบบ</h4>
                            
                            <Form.Group className="mb-4 text-start">
                                <Form.Label style={{ color: 'gold', fontSize: '15px', fontWeight: 'bold' }}>กรุณากรอกรหัสผ่าน</Form.Label>
                                <Form.Control type="password" className={`bg-dark text-white ${passwordError ? 'border-danger' : 'border-secondary'}`} onChange={(e) => { setPasswordError(""); setPassword(e.target.value); }} />
                                {passwordError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{passwordError}</div>}
                            </Form.Group>

                            <Button variant="warning" className="w-100 mb-2 fw-bold text-dark" onClick={handleStaffLogin}>ตกลง</Button>
                            <Button variant="link" className="text-warning text-decoration-none" onClick={() => { setView("main"); setPasswordError(""); }}>ย้อนกลับ</Button>
                        </div>
                    )}

                    {view === "staff_dashboard" && (
                        <div>
                            <h4 className="mb-3 text-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                📊 ยอดสมัครสมาชิกรายเดือน
                            </h4>

                            <div style={{
                                background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.08))',
                                border: '1px solid rgba(255, 215, 0, 0.3)',
                                borderRadius: '12px',
                                padding: '12px',
                                marginBottom: '16px',
                                maxHeight: '400px',
                                overflowY: 'auto'
                            }}>
                                {monthlyStats.length === 0 ? (
                                    <div className="text-center text-secondary" style={{ fontSize: '14px', padding: '20px 0' }}>
                                        ยังไม่มีข้อมูลการสมัครสมาชิก
                                    </div>
                                ) : (
                                    monthlyStats.map((stat) => (
                                        <div key={stat.key} style={{ marginBottom: '8px' }}>
                                            {/* --- หัวข้อเดือน (กดเพื่อขยาย/ย่อ) --- */}
                                            <div
                                                onClick={() => { setExpandedMonth(expandedMonth === stat.key ? null : stat.key); setEditingUser(null); }}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '10px 14px',
                                                    background: expandedMonth === stat.key ? 'rgba(255,215,0,0.2)' : 'rgba(0,0,0,0.3)',
                                                    borderRadius: expandedMonth === stat.key ? '8px 8px 0 0' : '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    border: expandedMonth === stat.key ? '1px solid rgba(255,215,0,0.4)' : '1px solid transparent'
                                                }}
                                            >
                                                <span style={{ color: '#ffd700', fontWeight: '600', fontSize: '15px' }}>
                                                    {expandedMonth === stat.key ? '▼' : '▶'} 📅 {stat.label}
                                                </span>
                                                <Badge bg="warning" text="dark" pill style={{
                                                    fontSize: '13px',
                                                    padding: '5px 12px',
                                                    fontWeight: 'bold',
                                                    minWidth: '55px'
                                                }}>
                                                    {stat.count} คน
                                                </Badge>
                                            </div>

                                            {/* --- รายละเอียดผู้สมัครในเดือนนั้น --- */}
                                            {expandedMonth === stat.key && (
                                                <div style={{
                                                    background: 'rgba(0,0,0,0.45)',
                                                    borderRadius: '0 0 8px 8px',
                                                    border: '1px solid rgba(255,215,0,0.2)',
                                                    borderTop: 'none',
                                                    padding: '8px'
                                                }}>
                                                    {/* หัวตาราง */}
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '0.4fr 1fr 1fr 0.9fr 0.7fr',
                                                        padding: '6px 10px',
                                                        fontSize: '11px',
                                                        color: '#aaa',
                                                        fontWeight: 'bold',
                                                        borderBottom: '1px solid rgba(255,215,0,0.15)',
                                                        marginBottom: '4px'
                                                    }}>
                                                        <span>#</span>
                                                        <span>Username</span>
                                                        <span>ชื่อ-นามสกุล</span>
                                                        <span>วันที่สมัคร</span>
                                                        <span style={{ textAlign: 'center' }}>จัดการ</span>
                                                    </div>

                                                    {/* แต่ละแถวผู้ใช้ */}
                                                    {stat.users.map((user, userIdx) => (
                                                        <div key={userIdx}>
                                                            {editingUser === user.username ? (
                                                                /* --- โหมดแก้ไข --- */
                                                                <div style={{
                                                                    background: 'rgba(255,215,0,0.1)',
                                                                    borderRadius: '6px',
                                                                    padding: '10px',
                                                                    marginBottom: '4px',
                                                                    border: '1px solid rgba(255,215,0,0.3)'
                                                                }}>
                                                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                                        <div style={{ flex: 1 }}>
                                                                            <label style={{ fontSize: '10px', color: '#aaa', display: 'block', marginBottom: '3px' }}>Username</label>
                                                                            <input
                                                                                type="text"
                                                                                value={editUsername}
                                                                                onChange={(e) => setEditUsername(e.target.value)}
                                                                                style={{
                                                                                    width: '100%',
                                                                                    background: 'rgba(0,0,0,0.5)',
                                                                                    border: '1px solid rgba(255,215,0,0.3)',
                                                                                    borderRadius: '4px',
                                                                                    color: '#ffd700',
                                                                                    padding: '5px 8px',
                                                                                    fontSize: '12px',
                                                                                    outline: 'none'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div style={{ flex: 1 }}>
                                                                            <label style={{ fontSize: '10px', color: '#aaa', display: 'block', marginBottom: '3px' }}>ชื่อ-นามสกุล</label>
                                                                            <input
                                                                                type="text"
                                                                                value={editFullName}
                                                                                onChange={(e) => setEditFullName(e.target.value)}
                                                                                style={{
                                                                                    width: '100%',
                                                                                    background: 'rgba(0,0,0,0.5)',
                                                                                    border: '1px solid rgba(255,215,0,0.3)',
                                                                                    borderRadius: '4px',
                                                                                    color: '#fff',
                                                                                    padding: '5px 8px',
                                                                                    fontSize: '12px',
                                                                                    outline: 'none'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    {editError && (
                                                                        <div style={{ color: '#ff6b6b', fontSize: '11px', marginBottom: '6px' }}>
                                                                            ⚠️ {editError}
                                                                        </div>
                                                                    )}
                                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                                        <button
                                                                            onClick={() => handleSaveEdit(user.username)}
                                                                            style={{
                                                                                background: 'linear-gradient(135deg, #28a745, #20c997)',
                                                                                border: 'none',
                                                                                borderRadius: '4px',
                                                                                color: '#fff',
                                                                                padding: '4px 14px',
                                                                                fontSize: '12px',
                                                                                cursor: 'pointer',
                                                                                fontWeight: 'bold'
                                                                            }}
                                                                        >
                                                                            ✓ บันทึก
                                                                        </button>
                                                                        <button
                                                                            onClick={handleCancelEdit}
                                                                            style={{
                                                                                background: 'rgba(255,255,255,0.1)',
                                                                                border: '1px solid rgba(255,255,255,0.2)',
                                                                                borderRadius: '4px',
                                                                                color: '#ccc',
                                                                                padding: '4px 14px',
                                                                                fontSize: '12px',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                        >
                                                                            ✕ ยกเลิก
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                /* --- โหมดแสดงปกติ --- */
                                                                <div style={{
                                                                    display: 'grid',
                                                                    gridTemplateColumns: '0.4fr 1fr 1fr 0.9fr 0.7fr',
                                                                    padding: '7px 10px',
                                                                    fontSize: '12px',
                                                                    color: '#e0e0e0',
                                                                    borderBottom: userIdx < stat.users.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                                                    transition: 'background 0.15s',
                                                                    borderRadius: '4px',
                                                                    alignItems: 'center'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,215,0,0.08)'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                                >
                                                                    <span style={{ color: '#888' }}>{userIdx + 1}</span>
                                                                    <span style={{ color: '#ffd700', fontWeight: '500' }}>{user.username}</span>
                                                                    <span>{user.fullName}</span>
                                                                    <span style={{ color: '#bbb', fontSize: '11px' }}>
                                                                        {user.registeredAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                                                                    </span>
                                                                    <span style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleStartEdit(user); }}
                                                                            style={{ ...iconBtnStyle, color: '#ffc107' }}
                                                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,193,7,0.2)'}
                                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                                                            title="แก้ไขข้อมูล"
                                                                        >
                                                                            ✏️
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(user.username); setShowDeleteModal(true); }}
                                                                            style={{ ...iconBtnStyle, color: '#dc3545' }}
                                                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,53,69,0.2)'}
                                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                                                            title="ลบผู้ใช้"
                                                                        >
                                                                            🗑️
                                                                        </button>
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="text-center mb-3" style={{
                                background: 'rgba(255, 215, 0, 0.1)',
                                borderRadius: '8px',
                                padding: '10px'
                            }}>
                                <span style={{ color: '#aaa', fontSize: '13px' }}>สมาชิกทั้งหมดในระบบ: </span>
                                <span style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '18px' }}>
                                    {monthlyStats.reduce((sum, s) => sum + s.count, 0)} คน
                                </span>
                            </div>

                            <Button variant="warning" className="w-100 mb-2 fw-bold text-dark" onClick={handleGoToStaffPage}>
                                เข้าสู่หน้าพนักงาน →
                            </Button>
                            <Button variant="link" className="text-warning text-decoration-none" onClick={() => { setView("main"); setStaffLoggedIn(false); setExpandedMonth(null); setEditingUser(null); setPasswordError(""); setPassword(""); }}>
                                ย้อนกลับ
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* --- Modal ยืนยันการลบ --- */}
            <Modal show={showDeleteModal} onHide={() => { setShowDeleteModal(false); setDeleteTarget(null); }} centered>
                <Modal.Header style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(255,215,0,0.3)' }} closeButton closeVariant="white">
                    <Modal.Title style={{ color: '#ffd700', fontSize: '18px' }}>⚠️ ยืนยันการลบ</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: '#1a1a1a', color: '#fff' }}>
                    <p style={{ marginBottom: '8px' }}>คุณต้องการลบผู้ใช้ <strong style={{ color: '#ffd700' }}>&quot;{deleteTarget}&quot;</strong> ใช่หรือไม่?</p>
                    <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '0' }}>⚠️ การลบจะไม่สามารถกู้คืนได้</p>
                </Modal.Body>
                <Modal.Footer style={{ background: '#1a1a1a', borderTop: '1px solid rgba(255,215,0,0.3)' }}>
                    <Button variant="secondary" size="sm" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>
                        ยกเลิก
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteUser(deleteTarget)}>
                        🗑️ ลบผู้ใช้
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}