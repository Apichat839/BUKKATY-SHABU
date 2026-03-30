"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteTablePage() {
    const [tables, setTables] = useState([]);
    const router = useRouter();

    const fetchTables = () => {
        fetch('http://127.0.0.1:8080/api/tables/all')
            .then(res => res.json())
            .then(data => {
                if (!data.isError) setTables(data.data);
            });
    };

    useEffect(() => { fetchTables(); }, []);

    const handleDelete = async (id, no) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "โต๊ะที่ ${no}"?`)) return;

        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://127.0.0.1:8080/api/tables/delete/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.result) {
            alert("ลบข้อมูลสำเร็จ!");
            fetchTables(); // โหลดข้อมูลใหม่
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto mt-10">
            <h1 className="text-xl font-bold mb-6 text-red-600">ลบข้อมูลโต๊ะ</h1>
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">เลขโต๊ะ</th>
                            <th className="p-4">ความจุ</th>
                            <th className="p-4">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tables.map(t => (
                            <tr key={t.table_id} className="border-b">
                                <td className="p-4">โต๊ะ {t.table_no}</td>
                                <td className="p-4">{t.capacity} ที่นั่ง</td>
                                <td className="p-4">
                                    <button 
                                        onClick={() => handleDelete(t.table_id, t.table_no)}
                                        className="text-red-500 hover:underline"
                                    >
                                        ลบ
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={() => router.back()} className="mt-4 text-gray-500">กลับหน้าเมนู</button>
        </div>
    );
}