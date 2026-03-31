"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './deletepage.module.css'; // นำเข้า CSS Module

export default function DeleteTablePage() {
    const [tables, setTables] = useState([]);
    const router = useRouter();

    const fetchTables = () => {
        fetch('http://127.0.0.1:8080/api/tables/all', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (!data.isError && data.data) {
                    // เรียงลำดับเลขโต๊ะก่อนแสดงผล
                    const sortedData = data.data.sort((a, b) => a.table_number - b.table_number);
                    setTables(sortedData);
                }
            })
            .catch(err => console.error("Error fetching tables:", err));
    };

    useEffect(() => { 
        fetchTables(); 
    }, []);

    const handleDelete = async (id, no) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "โต๊ะที่ ${no}"?`)) return;

        try {
            const response = await fetch(`http://127.0.0.1:8080/api/tables/delete/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (data.result) {
                alert("ลบข้อมูลสำเร็จ!");
                fetchTables(); 
            } else {
                alert("เกิดข้อผิดพลาด: " + data.message);
            }
        } catch (error) {
            alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>ลบข้อมูลโต๊ะ</h1>
            
            <div className={styles.tableSection}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr>
                            <th className={styles.th}>เลขโต๊ะ</th>
                            <th className={styles.th}>ความจุ</th>
                            <th className={`${styles.th} ${styles.textCenter}`}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tables.length > 0 ? (
                            tables.map(t => (
                                <tr key={t.table_id} className={styles.tr}>
                                    <td className={styles.td}><b>โต๊ะ {t.table_number}</b></td>
                                    <td className={styles.td}>{t.seating_capacity} ที่นั่ง</td>
                                    <td className={`${styles.td} ${styles.textCenter}`}>
                                        <button 
                                            onClick={() => handleDelete(t.table_id, t.table_number)}
                                            className={styles.deleteBtn}
                                        >
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className={styles.emptyRow}>ไม่พบข้อมูลโต๊ะ</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <button 
                onClick={() => router.back()} 
                className={styles.backLink}
            >
                ← กลับหน้าเมนู
            </button>
        </div>
    );
}