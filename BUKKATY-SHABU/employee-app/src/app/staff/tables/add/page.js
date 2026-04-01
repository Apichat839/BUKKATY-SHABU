"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './addpage.module.css';

export default function AddTablePage() {
    const [tableNo, setTableNo] = useState('');
    const [capacity, setCapacity] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8080/api/tables/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table_no: parseInt(tableNo),
                    capacity: parseInt(capacity)
                })
            });
            const data = await response.json();
            if (data.result) {
                alert("บันทึกข้อมูลสำเร็จ!");
                router.push('/staff/tables');
            } else {
                alert("เกิดข้อผิดพลาด: มีโต๊ะซ้ำ");
            }
        } catch (error) {
            alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>เพิ่มโต๊ะใหม่</h1>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>หมายเลขโต๊ะ</label>
                        <input
                            type="number"
                            min="1"
                            value={tableNo}
                            onChange={(e) => setTableNo(e.target.value)}
                            className={styles.input}
                            placeholder="กรอกหมายเลขโต๊ะ"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>จำนวนที่นั่ง</label>
                        <input
                            type="number"
                            min="1"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            className={styles.input}
                            placeholder="ระบุจำนวนที่นั่ง"
                            required
                        />
                    </div>
                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.submitBtn}>
                            บันทึกทันที
                        </button>
                        <button type="button" onClick={() => router.back()} className={styles.cancelBtn}>
                            ยกเลิก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}