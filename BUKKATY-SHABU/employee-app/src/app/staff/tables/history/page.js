"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './historypage.module.css'; // นำเข้าไฟล์ CSS

export default function OrderHistoryPage() {
    const [history, setHistory] = useState([]);
    const router = useRouter();

    const fetchHistory = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8080/api/bookings/all_details');
            const resData = await response.json();
            if (!resData.isError) {
                setHistory(resData.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                ประวัติการใช้โต๊ะและรายการสั่งซื้อ
            </h1>

            <div className={styles.tableSection}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr>
                            <th className={styles.th}>วันที่/เวลา</th>
                            <th className={styles.th}>โต๊ะ</th>
                            <th className={styles.th}>ลูกค้า</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length > 0 ? (
                            // แก้ไขบรรทัดนี้: เพิ่ม index เข้ามาเพื่อใช้เป็น key กันเหนียว
                            history.map((h, index) => (
                                // แก้ไขบรรทัดนี้: ระบุ key โดยใช้ h.booking_id หรือ index
                                <tr key={h.booking_id || index} className={styles.tr}>
                                    <td className={styles.td}>
                                        {new Date(h.booking_date).toLocaleString('th-TH')}
                                    </td>
                                    <td className={`${styles.td} ${styles.tableNo}`}>
                                        โต๊ะ {h.table_number || h.table_name || 'ทั่วไป'}
                                    </td>
                                    <td className={styles.td}>{h.customer_name}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                {/* แก้ไข colspan ให้ตรงกับจำนวนหัวข้อตาราง (ในที่นี้คือ 3) */}
                                <td colSpan="3" className={styles.emptyState}>
                                    ไม่พบประวัติการใช้งาน
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.buttonGroup}>
                <button onClick={() => router.push('/staff/tables/')} className={styles.backBtn}>
                    ← กลับหน้าหลัก
                </button>
                <button onClick={() => router.push('/staff/tables/chart')} className={styles.chartBtn}>
                    ดูตารางสถิติ(CHART) →
                </button>
            </div>
        </div>
    );
}