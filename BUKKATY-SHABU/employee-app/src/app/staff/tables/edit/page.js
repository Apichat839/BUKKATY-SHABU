"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './editpage.module.css';

export default function EditTablePage() {
    const [tables, setTables] = useState([]);
    const [editingTable, setEditingTable] = useState(null);
    const [tableNo, setTableNo] = useState('');
    const [capacity, setCapacity] = useState('');
    const [status, setStatus] = useState('available');
    const router = useRouter();

    const fetchTables = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8080/api/tables/all', { cache: 'no-store' });
            const resData = await response.json();
            if (!resData.isError) { 
                // เรียงลำดับเลขโต๊ะจากน้อยไปมาก เพื่อให้ตารางไม่กระโดดไปมาหลังอัปเดต
                const sortedData = resData.data.sort((a, b) => a.table_number - b.table_number);
                setTables(sortedData); 
            }
        } catch (error) { 
            console.error("Fetch error:", error); 
        }
    };

    useEffect(() => { 
        fetchTables(); 
    }, []);

    const handleEditClick = (table) => {
        setEditingTable(table);
        setTableNo(table.table_number);
        setCapacity(table.seating_capacity);
        // ถ้าค่าใน DB เป็นค่าว่าง หรือ null ให้ตั้งเป็น available ทันทีในฟอร์ม
        setStatus(""); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        if (parseInt(tableNo) <= 0 || parseInt(capacity) <= 0) {
            alert("กรุณากรอกข้อมูลให้มากกว่า 0");
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8080/api/tables/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table_id: editingTable.table_id,
                    table_no: parseInt(tableNo),
                    capacity: parseInt(capacity),
                    status: status // ส่งค่า 'available' หรือ 'occupied' ไปบันทึก
                })
            });

            const data = await response.json();
            
            if (data.result) {
                alert("อัปเดตข้อมูลสำเร็จ!");
                setEditingTable(null); // ปิดฟอร์มแก้ไข
                await fetchTables();   // ดึงข้อมูลล่าสุดมาแสดงในตารางทันที
            } else { 
                alert("แก้ไขไม่สำเร็จ: " + data.message); 
            }
        } catch (error) { 
            alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"); 
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <h1 className={styles.title}>จัดการข้อมูลโต๊ะ (Bukkaty Shabu)</h1>

                {editingTable && (
                    <div className={styles.editCard}>
                        <h2 className={styles.editTitle}>กำลังแก้ไข: โต๊ะ {editingTable.table_number}</h2>
                        <form onSubmit={handleUpdate} className={styles.gridForm}>
                            <div className={styles.formControl}>
                                <label>หมายเลขโต๊ะ</label>
                                <input 
                                    type="number"
                                    min="1" 
                                    value={tableNo} 
                                    onChange={(e) => setTableNo(e.target.value)} 
                                    className={styles.input} 
                                    required 
                                />
                            </div>
                            <div className={styles.formControl}>
                                <label>จำนวนที่นั่ง</label>
                                <input 
                                    type="number"
                                    min="1" 
                                    value={capacity} 
                                    onChange={(e) => setCapacity(e.target.value)} 
                                    className={styles.input} 
                                    required 
                                />
                            </div>
                            <div className={styles.formControl}>
                                <label>สถานะ</label>
                                <select 
                                    value={status} 
                                    onChange={(e) => setStatus(e.target.value)} 
                                    className={styles.select}
                                >
                                    <option value="" disabled>-- กรุณาเลือกสถานะ --</option>
                                    <option value="available">โต๊ะว่าง</option>
                                    <option value="occupied">โต๊ะไม่ว่าง</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className={styles.updateBtn}>บันทึกการแก้ไข</button>
                                <button 
                                    type="button" 
                                    onClick={() => setEditingTable(null)} 
                                    className={styles.cancelBtn}
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className={styles.tableSection}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                <th className={styles.th}>เลขโต๊ะ</th>
                                <th className={styles.th}>ที่นั่ง</th>
                                <th className={styles.th}>สถานะ</th>
                                <th className={`${styles.th} text-center`}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables.map((t) => {
                                // เช็คว่าถ้าเป็น 'available' หรือเป็นค่าว่าง/null ให้ถือว่าเป็น "โต๊ะว่าง"
                                const isAvailable = !t.table_status || t.table_status === 'available';
                                return (
                                    <tr key={t.table_id} className={styles.tr}>
                                        <td className={styles.td}><b>โต๊ะ {t.table_number}</b></td>
                                        <td className={styles.td}>{t.seating_capacity} ที่นั่ง</td>
                                        <td className={styles.td}>
                                            <span className={`${styles.badge} ${isAvailable ? styles.available : styles.occupied}`}>
                                                {isAvailable ? 'โต๊ะไม่ว่าง' : 'โต๊ะว่าง'}
                                            </span>
                                        </td>
                                        <td className={`${styles.td} text-center`}>
                                            <button 
                                                onClick={() => handleEditClick(t)} 
                                                className={styles.editBtn}
                                            >
                                                แก้ไข
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div onClick={() => router.back()} className={styles.backLink} style={{ cursor: 'pointer' }}>
                    ← กลับหน้าหลักของพนักงาน
                </div>
            </div>
        </div>
    );
}