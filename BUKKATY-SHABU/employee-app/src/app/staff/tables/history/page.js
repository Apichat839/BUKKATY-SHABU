"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './historypage.module.css'; // นำเข้าไฟล์ CSS

export default function OrderHistoryPage() {
    const [history, setHistory] = useState([]);
    const router = useRouter();

    const fetchHistory = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8080/api/orders/history');
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
                            <th className={`${styles.th} ${styles.textRight}`}>ยอดรวม</th>
                            <th className={`${styles.th} ${styles.textCenter}`}>สถานะออเดอร์</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length > 0 ? (
                            history.map((h) => (
                                <tr key={h.order_id} className={styles.tr}>
                                    <td className={styles.td}>
                                        {new Date(h.order_date).toLocaleString('th-TH')}
                                    </td>
                                    <td className={`${styles.td} ${styles.tableNo}`}>
                                        โต๊ะ {h.table_number || h.table_name || 'ทั่วไป'}
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className={styles.emptyState}>
                                    ไม่พบประวัติการใช้งาน
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