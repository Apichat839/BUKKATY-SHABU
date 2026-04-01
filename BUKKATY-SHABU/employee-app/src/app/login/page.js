"use client";
import { useState, useMemo } from 'react';
import { Container, Button, Form, Card, Badge, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/navigation';
import './login.module.css';

// ---- SVG Mini Bar Chart ----
function MiniBarChart({ bars, color, height = 80 }) {
    if (!bars || bars.length === 0) return null;
    const maxVal = Math.max(...bars.map(b => b.value), 1);
    const w = 420, h = height;
    const pL = 28, pB = 22, pT = 10, pR = 8;
    const cW = w - pL - pR;
    const cH = h - pB - pT;
    const bW = Math.max(10, Math.floor(cW / bars.length) - 4);
    const gap = (cW - bW * bars.length) / (bars.length + 1);

    return (
        <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
            {/* baseline */}
            <line x1={pL} y1={pT + cH} x2={w - pR} y2={pT + cH} stroke="rgba(255,215,0,0.3)" strokeWidth={1} />
            {bars.map((bar, i) => {
                const bH = Math.max(2, (bar.value / maxVal) * cH);
                const x = pL + gap + i * (bW + gap);
                const y = pT + cH - bH;
                return (
                    <g key={i}>
                        <rect x={x} y={y} width={bW} height={bH} rx={3}
                            fill={color} opacity={bar.isToday ? 1 : 0.55} />
                        {bar.value > 0 && (
                            <text x={x + bW / 2} y={y - 3} textAnchor="middle" fontSize="8" fill={color} fontWeight="bold">
                                {bar.value}
                            </text>
                        )}
                        <text x={x + bW / 2} y={pT + cH + 12} textAnchor="middle" fontSize="7.5" fill="rgba(255,215,0,0.6)">
                            {bar.label}
                        </text>
                    </g>
                );
            })}
            {/* Y label */}
            <text x={pL - 3} y={pT + 6} textAnchor="end" fontSize="7" fill="rgba(255,215,0,0.4)">{maxVal}</text>
            <text x={pL - 3} y={pT + cH} textAnchor="end" fontSize="7" fill="rgba(255,215,0,0.4)">0</text>
        </svg>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const [view, setView] = useState("main");

    const [name, setName] = useState("");
    const [table, setTable] = useState("");
    const [password, setPassword] = useState("");
    const [staffLoggedIn, setStaffLoggedIn] = useState(false);
    const [expandedMonth, setExpandedMonth] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [chartMode, setChartMode] = useState("daily"); // "daily" | "monthly"

    const [editingUser, setEditingUser] = useState(null);
    const [editUsername, setEditUsername] = useState("");
    const [editFullName, setEditFullName] = useState("");
    const [editError, setEditError] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [nameError, setNameError] = useState("");
    const [tableError, setTableError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // ---- Track login ----
    const trackLogin = (username) => {
        const history = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        history.push({ username, timestamp: new Date().toISOString() });
        // เก็บแค่ 1000 รายการล่าสุด
        if (history.length > 1000) history.splice(0, history.length - 1000);
        localStorage.setItem('loginHistory', JSON.stringify(history));
    };

    // ---- Daily stats (14 วันล่าสุด) ----
    const dailyStats = useMemo(() => {
        if (typeof window === 'undefined') return { login: [], register: [] };
        const logins = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const today = new Date();
        const pad = n => String(n).padStart(2, '0');

        const days = Array.from({ length: 14 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (13 - i));
            const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            const label = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
            const isToday = i === 13;
            return { key, label, isToday };
        });

        const loginCounts = {};
        logins.forEach(l => { const k = l.timestamp?.slice(0, 10); if (k) loginCounts[k] = (loginCounts[k] || 0) + 1; });

        const regCounts = {};
        users.forEach(u => { const k = u.registeredAt?.slice(0, 10); if (k) regCounts[k] = (regCounts[k] || 0) + 1; });

        return {
            login: days.map(d => ({ label: d.label, value: loginCounts[d.key] || 0, isToday: d.isToday })),
            register: days.map(d => ({ label: d.label, value: regCounts[d.key] || 0, isToday: d.isToday })),
        };
    }, [staffLoggedIn, refreshKey]);

    // ---- Monthly stats ----
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
            groups[key].users.push({ username: user.username || '-', fullName: user.fullName || '-', registeredAt: date });
        });
        return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a)).map(([key, val]) => ({ key, ...val }));
    }, [staffLoggedIn, refreshKey]);

    // ---- Monthly chart bars ----
    const monthlyChartData = useMemo(() => {
        if (typeof window === 'undefined') return { login: [], register: [] };
        const logins = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const today = new Date();

        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
            return {
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                label: `${monthNames[d.getMonth()]}`,
                isToday: i === 5,
            };
        });

        const loginM = {};
        logins.forEach(l => {
            const d = l.timestamp ? new Date(l.timestamp) : null;
            if (!d) return;
            const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            loginM[k] = (loginM[k] || 0) + 1;
        });

        const regM = {};
        users.forEach(u => {
            const d = u.registeredAt ? new Date(u.registeredAt) : null;
            if (!d) return;
            const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            regM[k] = (regM[k] || 0) + 1;
        });

        return {
            login: months.map(m => ({ label: m.label, value: loginM[m.key] || 0, isToday: m.isToday })),
            register: months.map(m => ({ label: m.label, value: regM[m.key] || 0, isToday: m.isToday })),
        };
    }, [staffLoggedIn, refreshKey]);

    // ---- Summary numbers ----
    const summaryNums = useMemo(() => {
        if (typeof window === 'undefined') return {};
        const today = new Date().toISOString().slice(0, 10);
        const logins = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        return {
            totalUsers: users.length,
            totalLogins: logins.length,
            todayLogins: logins.filter(l => l.timestamp?.slice(0, 10) === today).length,
            todayRegisters: users.filter(u => u.registeredAt?.slice(0, 10) === today).length,
        };
    }, [staffLoggedIn, refreshKey]);

    // ---- Handlers ----
    const handleDeleteUser = (username) => {
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        localStorage.setItem('registeredUsers', JSON.stringify(users.filter(u => u.username !== username)));
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
        if (!editUsername.trim() || !editFullName.trim()) { setEditError("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }
        const regex = /^[a-zA-Zก-๙\s]*$/;
        if (!regex.test(editUsername) || !regex.test(editFullName)) { setEditError("รองรับเฉพาะภาษาไทยและภาษาอังกฤษเท่านั้น"); return; }
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        if (editUsername !== originalUsername && users.some(u => u.username === editUsername)) { setEditError("ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้ว"); return; }
        localStorage.setItem('registeredUsers', JSON.stringify(users.map(u => u.username === originalUsername ? { ...u, username: editUsername, fullName: editFullName } : u)));
        setEditingUser(null);
        setRefreshKey(k => k + 1);
    };

    const handleCustomerSubmit = () => {
        let isValid = true;
        setNameError(""); setTableError("");
        if (!name.trim()) { setNameError("กรุณากรอกชื่อผู้ใช้งาน"); isValid = false; }
        else {
            const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            if (!existingUsers.some(user => user.username === name)) { setNameError("ไม่พบชื่อผู้ใช้งานในระบบ"); isValid = false; }
        }
        if (!table || Number(table) <= 0) { setTableError("กรุณากรอกหมายเลขโต๊ะที่ถูกต้อง"); isValid = false; }
        if (isValid) {
            trackLogin(name);
            sessionStorage.setItem("name", name);
            sessionStorage.setItem("table", table);
            router.push('/menu');
        }
    };

    const handleStaffLogin = () => {
        if (password === "1234") {
            trackLogin('staff');
            sessionStorage.setItem('staff_auth', 'true');
            setStaffLoggedIn(true);
            setView("staff_dashboard");
        } else {
            setPasswordError("รหัสผ่านไม่ถูกต้อง");
        }
    };

    const chartData = chartMode === 'daily' ? dailyStats : monthlyChartData;

    // ---- Styles ----
    const styles = {
        background: {
            minHeight: '100vh',
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('/bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            padding: '20px 0',
            alignItems: 'flex-start',
        },
        mainCard: {
            width: view === 'staff_dashboard' ? 'min(860px, 95vw)' : '400px',
            background: 'rgba(26, 26, 26, 0.95)',
            border: '2px solid gold',
            color: 'gold',
            borderRadius: '15px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
            transition: 'width 0.3s ease',
            marginTop: view === 'staff_dashboard' ? '20px' : '0',
        },
        dashboardContainer: {
            background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.05))',
            border: '1px solid rgba(255,215,0,0.25)',
            borderRadius: '10px',
            padding: '10px',
            maxHeight: '280px',
            overflowY: 'auto',
        },
        iconBtn: {
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '14px', padding: '2px 5px', borderRadius: '4px', lineHeight: '1',
        },
        sectionTitle: {
            fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px',
            color: 'rgba(255,215,0,0.6)', textTransform: 'uppercase', marginBottom: '6px',
        },
        chartBox: {
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,215,0,0.2)',
            borderRadius: '10px',
            padding: '10px 12px 6px',
        },
    };

    return (
        <Container fluid className="d-flex justify-content-center" style={styles.background}>
            <Card style={styles.mainCard}>
                <Card.Body className="text-center p-4">
                    <div style={{ fontSize: '35px', marginBottom: '10px' }}>🥘</div>
                    <h2 className="mb-4" style={{ fontWeight: 'bold', letterSpacing: '2px' }}>BUKKATY SHABU</h2>

                    {/* ===== MAIN ===== */}
                    {view === "main" && (
                        <>
                            <div className="d-grid gap-3 mb-4">
                                <Button variant="warning" size="lg" className="fw-bold text-dark" onClick={() => setView("customer")}>สำหรับลูกค้า</Button>
                                <Button variant="info" size="lg" className="fw-bold text-dark" onClick={() => router.push('/bookings')}>📅 จองวันล่วงหน้า</Button>
                                <Button variant="outline-warning" size="lg" onClick={() => setView("staff")}>สำหรับพนักงาน</Button>
                            </div>
                            <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,215,0,0.3)' }}>
                                <span className="text-white" style={{ fontSize: '14px' }}>ยังไม่มีบัญชีผู้ใช้? </span>
                                <Button variant="link" className="text-warning text-decoration-none p-0 fw-bold" onClick={() => router.push('/register')}>สมัครสมาชิก</Button>
                            </div>
                        </>
                    )}

                    {/* ===== CUSTOMER ===== */}
                    {view === "customer" && (
                        <div>
                            <h4 className="mb-3 text-white">ข้อมูลการสั่งอาหาร</h4>
                            <Form.Group className="mb-3 text-start">
                                <Form.Label className="fw-bold">ชื่อผู้ใช้งาน (Username)</Form.Label>
                                <Form.Control className="bg-dark text-white" value={name} onChange={e => setName(e.target.value)} />
                                {nameError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{nameError}</div>}
                            </Form.Group>
                            <Form.Group className="mb-4 text-start">
                                <Form.Label className="fw-bold">หมายเลขโต๊ะ</Form.Label>
                                <Form.Control type="number" className="bg-dark text-white" value={table} onChange={e => setTable(e.target.value)} />
                                {tableError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{tableError}</div>}
                            </Form.Group>
                            <Button variant="success" className="w-100 mb-2 fw-bold" onClick={handleCustomerSubmit}>เข้าสู่หน้าร้าน</Button>
                            <Button variant="link" className="text-warning text-decoration-none" onClick={() => setView("main")}>ย้อนกลับ</Button>
                        </div>
                    )}

                    {/* ===== STAFF LOGIN ===== */}
                    {view === "staff" && (
                        <div>
                            <h4 className="mb-3 text-white">พนักงานเข้าสู่ระบบ</h4>
                            <Form.Group className="mb-4 text-start">
                                <Form.Label className="fw-bold">รหัสผ่าน</Form.Label>
                                <Form.Control type="password" placeholder="รหัสผ่าน 1234" className="bg-dark text-white" onChange={e => setPassword(e.target.value)} />
                                {passwordError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{passwordError}</div>}
                            </Form.Group>
                            <Button variant="warning" className="w-100 mb-2 fw-bold text-dark" onClick={handleStaffLogin}>ตกลง</Button>
                            <Button variant="link" className="text-warning text-decoration-none" onClick={() => setView("main")}>ย้อนกลับ</Button>
                        </div>
                    )}

                    {/* ===== STAFF DASHBOARD ===== */}
                    {view === "staff_dashboard" && (
                        <div className="text-start">

                            {/* Summary Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
                                {[
                                    { label: 'สมาชิกทั้งหมด', value: summaryNums.totalUsers, color: '#fbbf24' },
                                    { label: 'Login ทั้งหมด', value: summaryNums.totalLogins, color: '#60a5fa' },
                                    { label: 'Login วันนี้', value: summaryNums.todayLogins, color: '#34d399' },
                                    { label: 'สมัครวันนี้', value: summaryNums.todayRegisters, color: '#f87171' },
                                ].map((s, i) => (
                                    <div key={i} style={{
                                        background: 'rgba(0,0,0,0.4)', border: `1px solid ${s.color}44`,
                                        borderRadius: '10px', padding: '10px 8px', textAlign: 'center',
                                        borderTop: `3px solid ${s.color}`,
                                    }}>
                                        <div style={{ fontSize: '22px', fontWeight: 'black', color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '2px', lineHeight: '1.2' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Chart toggle */}
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                                {['daily', 'monthly'].map(m => (
                                    <button key={m} onClick={() => setChartMode(m)} style={{
                                        padding: '4px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
                                        background: chartMode === m ? 'gold' : 'rgba(255,215,0,0.15)',
                                        color: chartMode === m ? '#111' : 'gold',
                                        border: '1px solid rgba(255,215,0,0.4)',
                                    }}>
                                        {m === 'daily' ? '14 วัน' : '6 เดือน'}
                                    </button>
                                ))}
                            </div>

                            {/* Login Chart */}
                            <div style={{ marginBottom: '10px' }}>
                                <div style={styles.chartBox}>
                                    <div style={styles.sectionTitle}>
                                        Login · {chartMode === 'daily' ? '14 วันล่าสุด' : '6 เดือนล่าสุด'}
                                    </div>
                                    <MiniBarChart bars={chartData.login} color="#60a5fa" height={90} />
                                </div>
                            </div>

                            {/* Register Chart */}
                            <div style={{ marginBottom: '14px' }}>
                                <div style={styles.chartBox}>
                                    <div style={styles.sectionTitle}>
                                        สมัครสมาชิก · {chartMode === 'daily' ? '14 วันล่าสุด' : '6 เดือนล่าสุด'}
                                    </div>
                                    <MiniBarChart bars={chartData.register} color="#fbbf24" height={90} />
                                </div>
                            </div>

                            {/* Member list accordion */}
                            <div style={{ ...styles.sectionTitle, marginBottom: '8px' }}>รายชื่อสมาชิกรายเดือน</div>
                            <div style={styles.dashboardContainer}>
                                {monthlyStats.length === 0
                                    ? <div className="text-center text-secondary p-3" style={{ fontSize: '13px' }}>ยังไม่มีข้อมูล</div>
                                    : monthlyStats.map(stat => (
                                        <div key={stat.key} className="mb-2">
                                            <div onClick={() => setExpandedMonth(expandedMonth === stat.key ? null : stat.key)}
                                                style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                                                <span>{expandedMonth === stat.key ? '▼' : '▶'} 📅 {stat.label}</span>
                                                <Badge bg="warning" text="dark">{stat.count} คน</Badge>
                                            </div>
                                            {expandedMonth === stat.key && (
                                                <div style={{ background: 'rgba(0,0,0,0.45)', padding: '8px', borderRadius: '0 0 8px 8px' }}>
                                                    {stat.users.map((user, idx) => (
                                                        <div key={idx}>
                                                            {editingUser === user.username ? (
                                                                <div className="d-flex gap-1 mb-1" style={{ fontSize: '11px' }}>
                                                                    <input value={editUsername} onChange={e => setEditUsername(e.target.value)}
                                                                        style={{ flex: 1, background: '#222', color: 'gold', border: '1px solid gold', borderRadius: '4px', padding: '2px 4px', fontSize: '11px' }} />
                                                                    <input value={editFullName} onChange={e => setEditFullName(e.target.value)}
                                                                        style={{ flex: 1, background: '#222', color: 'gold', border: '1px solid gold', borderRadius: '4px', padding: '2px 4px', fontSize: '11px' }} />
                                                                    <button onClick={() => handleSaveEdit(user.username)} style={{ ...styles.iconBtn, color: '#4ade80' }}>✓</button>
                                                                    <button onClick={() => setEditingUser(null)} style={{ ...styles.iconBtn, color: '#f87171' }}>✗</button>
                                                                </div>
                                                            ) : (
                                                                <div className="d-flex justify-content-between align-items-center mb-1 text-white" style={{ fontSize: '12px' }}>
                                                                    <span>{user.username} — {user.fullName}</span>
                                                                    <div>
                                                                        <button onClick={() => handleStartEdit(user)} style={styles.iconBtn}>✏️</button>
                                                                        <button onClick={() => { setDeleteTarget(user.username); setShowDeleteModal(true); }} style={styles.iconBtn}>🗑️</button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {editError && <div style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>{editError}</div>}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                }
                            </div>

                            <div className="d-grid gap-2 mt-3">
                                <Button variant="warning" className="fw-bold text-dark" onClick={() => router.push('/staff')}>เข้าสู่หน้าพนักงาน →</Button>
                                <Button variant="link" className="text-warning text-decoration-none" onClick={() => setView("main")}>ย้อนกลับ</Button>
                            </div>
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
