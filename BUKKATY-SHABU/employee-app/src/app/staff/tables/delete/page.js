"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteTablePage() {
    const [tables, setTables] = useState([]);
    const router = useRouter();

    // ฟังก์ชันดึงข้อมูลโต๊ะ (เพื่อให้เพิ่มปุ๊บ ขึ้นมาให้ลบปั๊บ)
    const fetchTables = () => {
        fetch('http://127.0.0.1:8080/api/tables/all')
            .then(res => res.json())
            .then(data => {
                // เช็คว่า data.data มีค่า (ตามโครงสร้างที่ backend ส่งมา)
                if (!data.isError && data.data) {
                    setTables(data.data);
                }
            })
            .catch(err => console.error("Error fetching tables:", err));
    };

    useEffect(() => { 
        fetchTables(); 
    }, []);

    const handleDelete = async (id, no) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "โต๊ะที่ ${no}"?`)) return;

        // แก้ไข: ตัดเรื่อง Token ออก เพื่อให้ลบได้ทันที (No Token)
        try {
            const response = await fetch(`http://127.0.0.1:8080/api/tables/delete/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (data.result) {
                alert("ลบข้อมูลสำเร็จ!");
                fetchTables(); // โหลดข้อมูลใหม่มาแสดงทันที
            } else {
                alert("เกิดข้อผิดพลาด: " + data.message);
            }
        } catch (error) {
            alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto mt-10 bg-white shadow-md rounded-lg border text-black">
            <h1 className="text-xl font-bold mb-6 text-red-600 border-b pb-2">ลบข้อมูลโต๊ะ</h1>
            
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">เลขโต๊ะ</th>
                            <th className="p-4">ความจุ</th>
                            <th className="p-4 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tables.length > 0 ? (
                            tables.map(t => (
                                <tr key={t.table_id} className="border-b hover:bg-gray-50">
                                    {/* แก้ไข: ใช้ table_number และ seating_capacity ตาม DB */}
                                    <td className="p-4 font-medium">โต๊ะ {t.table_number}</td>
                                    <td className="p-4">{t.seating_capacity} ที่นั่ง</td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => handleDelete(t.table_id, t.table_number)}
                                            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition-colors"
                                        >
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="p-10 text-center text-gray-500 italic">ไม่พบข้อมูลโต๊ะ</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <button 
                onClick={() => router.back()} 
                className="mt-6 text-gray-500 hover:text-black flex items-center gap-1"
            >
                ← กลับหน้าเมนู
            </button>
        </div>
    );
}