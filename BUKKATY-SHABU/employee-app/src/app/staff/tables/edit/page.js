"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditTablePage() {
    const [tables, setTables] = useState([]);
    const [editingTable, setEditingTable] = useState(null); // เก็บข้อมูลโต๊ะที่กำลังจะแก้
    const [tableNo, setTableNo] = useState('');
    const [capacity, setCapacity] = useState('');
    const [status, setStatus] = useState('available');
    const router = useRouter();

    // 1. ดึงข้อมูลโต๊ะทั้งหมดจากฐานข้อมูลมาโชว์ก่อน
    const fetchTables = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8080/api/tables/all');
            const resData = await response.json();
            if (!resData.isError) {
                setTables(resData.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    useEffect(() => { fetchTables(); }, []);

    // 2. เมื่อกดปุ่ม "แก้ไข" ให้ดึงข้อมูลบรรทัดนั้นขึ้นมาบนฟอร์ม
    const handleEditClick = (table) => {
        setEditingTable(table);
        setTableNo(table.table_number);
        setCapacity(table.seating_capacity);
        setStatus(table.table_status);
        // เลื่อนหน้าจอขึ้นไปที่ฟอร์มแก้ไข
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 3. ส่งข้อมูลที่แก้แล้วกลับไปบันทึกที่ Backend
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8080/api/tables/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table_id: editingTable.table_id,
                    table_no: parseInt(tableNo),
                    capacity: parseInt(capacity),
                    status: status
                })
            });

            const data = await response.json();
            if (data.result) {
                alert("อัปเดตข้อมูลสำเร็จ!");
                setEditingTable(null); // ปิดฟอร์มแก้ไข
                fetchTables(); // โหลดข้อมูลใหม่ล่าสุดมาโชว์
            } else {
                alert("แก้ไขไม่สำเร็จ: " + data.message);
            }
        } catch (error) {
            alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto mt-10 text-black">
            <h1 className="text-2xl font-bold mb-6 text-blue-600 border-b pb-2">แก้ไขข้อมูลโต๊ะ</h1>

            {/* ฟอร์มแก้ไข (จะปรากฏเมื่อกดปุ่มแก้ไขเท่านั้น) */}
            {editingTable && (
                <div className="mb-10 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg shadow-sm">
                    <h2 className="font-bold mb-4 text-blue-800 underline">กำลังแก้ไข: โต๊ะ {editingTable.table_number}</h2>
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold">หมายเลขโต๊ะ</label>
                            <input type="number" value={tableNo} onChange={(e) => setTableNo(e.target.value)} className="w-full border p-2 rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold">จำนวนที่นั่ง</label>
                            <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full border p-2 rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold">สถานะ</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border p-2 rounded">
                                <option value="available">โต๊ะว่าง</option>
                                <option value="occupied">โต๊ะไม่ว่าง</option>
                            </select>
                        </div>
                        <div className="md:col-span-3 flex gap-2">
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">บันทึกการแก้ไข</button>
                            <button type="button" onClick={() => setEditingTable(null)} className="bg-gray-400 text-white px-6 py-2 rounded font-bold hover:bg-gray-500">ยกเลิก</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ตารางแสดงข้อมูลโต๊ะ */}
        <div className="bg-white border rounded-lg overflow-hidden shadow-md">
            <table className="w-full text-left">
                <thead className="bg-gray-100 border-b">
                    <tr>
                        <th className="p-4">เลขโต๊ะ</th>
                        <th className="p-4">ที่นั่ง</th>
                        <th className="p-4">สถานะ</th>
                        <th className="p-4 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {tables.map(t => (
                        <tr key={t.table_id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-bold">โต๊ะ {t.table_number}</td>
                            <td className="p-4">{t.seating_capacity} ที่นั่ง</td>
                            <td className="p-4">
                                {/* แสดงสถานะเป็นภาษาไทยตามเงื่อนไข */}
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    t.table_status === 'available' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                    {t.table_status === 'available' ? 'โต๊ะว่าง' : 'โต๊ะไม่ว่าง'}
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                <button 
                                    onClick={() => handleEditClick(t)}
                                    className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 transition-colors"
                                >
                                    แก้ไข
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
            
            <button onClick={() => router.back()} className="mt-6 text-gray-500 hover:underline">← กลับหน้าเมนู</button>
        </div>
    );
}