"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './historypage.module.css'; // นำเข้าไฟล์ CSS

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [tables, setTables] = useState([]);
    const router = useRouter();

    const fetchHistory = async () => {
        try {
            // 1. ดึงประวัติออเดอร์
            const resOrders = await fetch('http://127.0.0.1:8080/api/orders/history');
            const orderData = await resOrders.json();
            if (!orderData.isError) {
                setOrders(orderData.data);
            }

            // 2. ดึงข้อมูลโต๊ะปัจจุบัน (ที่ดึงมาจากหน้า Edit)
            const resTables = await fetch('http://127.0.0.1:8080/api/tables/all');
            const tableData = await resTables.json();
            if (!tableData.isError) {
                setTables(tableData.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // ฟังก์ชันช่วยจัดกลุ่มออเดอร์ตามชื่อโต๊ะ
    const groupedOrders = orders.reduce((acc, order) => {
        const key = order.table_name || 'ทั่วไป';
        if (!acc[key]) acc[key] = [];
        acc[key].push(order);
        return acc;
    }, {});

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                ประวัติการใช้โต๊ะและรายการสั่งซื้อ
            </h1>

            {/* ส่วนที่ 1: ประวัติการสั่งซื้อ (แยกเป็นโต๊ะๆ) */}
            <h2 style={{ color: '#fff', alignSelf: 'flex-start', marginBottom: '20px', fontSize: '1.5rem', borderLeft: '5px solid #ffd700', paddingLeft: '15px' }}>
                📋 ประวัติการสั่งซื้อแยกตามโต๊ะ
            </h2>

            {Object.keys(groupedOrders).length > 0 ? (
                Object.keys(groupedOrders).sort().map((tableName) => {
                    const tableOrders = groupedOrders[tableName];
                    const tableTotal = tableOrders.reduce((sum, o) => sum + Number(o.total_price), 0);

                    return (
                        <div key={tableName} style={{ width: '100%', marginBottom: '50px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h3 style={{ color: '#ffd700', margin: 0, fontSize: '1.3rem' }}>
                                    📍 {tableName}
                                </h3>
                                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'rgba(0,0,0,0.4)', padding: '5px 15px', borderRadius: '8px' }}>
                                    ยอดรวมโต๊ะนี้: <span style={{ color: '#4ade80' }}>{tableTotal.toLocaleString()} บาท</span>
                                </div>
                            </div>
                            
                            <div className={styles.tableSection}>
                                <table className={styles.table}>
                                    <thead className={styles.thead}>
                                        <tr>
                                            <th className={styles.th}>วันที่/เวลา</th>
                                            <th className={styles.th}>ลูกค้า</th>
                                            <th className={`${styles.th} ${styles.textRight}`}>ยอดรวม</th>
                                            <th className={`${styles.th} ${styles.textCenter}`}>สถานะออเดอร์</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableOrders.map((h, index) => (
                                            <tr key={index} className={styles.tr}>
                                                <td className={styles.td}>
                                                    {new Date(h.order_date).toLocaleString('th-TH')}
                                                </td>
                                                <td className={styles.td}>{h.customer_name}</td>
                                                <td className={`${styles.td} ${styles.price}`}>
                                                    {Number(h.total_price).toLocaleString()} บาท
                                                </td>
                                                <td className={`${styles.td} ${styles.textCenter}`}>
                                                    <span className={styles.statusBadge}>
                                                        {h.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className={styles.tableSection} style={{ width: '100%', marginBottom: '40px' }}>
                    <div className={styles.emptyState}>ไม่พบประวัติการสั่งซื้อ</div>
                </div>
            )}

            {/* ส่วนที่ 2: ข้อมูลโต๊ะปัจจุบัน (จากหน้า Edit/Add) */}
            <hr style={{ width: '100%', border: '0.5px solid rgba(255,255,255,0.2)', marginBottom: '40px' }} />
            <h2 style={{ color: '#fff', alignSelf: 'flex-start', marginBottom: '10px', fontSize: '1.2rem' }}>
                🪑 ข้อมูลโต๊ะปัจจุบัน (ซิงค์ตาม Add, Edit, Delete)
            </h2>
            <div className={styles.tableSection} style={{ width: '100%' }}>
                <table className={styles.table}>
                    <thead className={styles.thead} style={{ backgroundColor: '#fff7ed' }}>
                        <tr>
                            <th className={styles.th}>เลขโต๊ะ</th>
                            <th className={styles.th}>จำนวนที่นั่ง</th>
                            <th className={`${styles.th} ${styles.textCenter}`}>สถานะปัจจุบัน</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tables.length > 0 ? (
                            tables.map((t) => (
                                <tr key={t.table_id} className={styles.tr}>
                                    <td className={`${styles.td} ${styles.tableNo}`}>
                                        โต๊ะ {t.table_number}
                                    </td>
                                    <td className={styles.td}>
                                        {t.seating_capacity} ที่นั่ง
                                    </td>
                                    <td className={`${styles.td} ${styles.textCenter}`}>
                                        <span className={styles.statusBadge} style={{ 
                                            backgroundColor: t.table_status === 'Available' ? '#dcfce7' : '#fee2e2',
                                            color: t.table_status === 'Available' ? '#166534' : '#991b1b',
                                            padding: '0.4rem 0.8rem'
                                        }}>
                                            {t.table_status === 'Available' ? 'โต๊ะว่าง' : 'โต๊ะไม่ว่าง'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className={styles.emptyState}>
                                    ไม่พบข้อมูลโต๊ะในระบบ
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <button onClick={() => router.back()} className={styles.backBtn}>
                ← กลับหน้าหลัก
            </button>
        </div>
    );
}