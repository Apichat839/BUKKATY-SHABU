"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditTablePage() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [newCapacity, setNewCapacity] = useState('');
    const [newStatus, setNewStatus] = useState('available');
    const router = useRouter();

    useEffect(() => {
        fetch('http://127.0.0.1:8080/api/tables/all')
            .then(res => res.json())
            .then(data => {
                if (!data.isError) setTables(data.data);
            });
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        // เพิ่มการเช็ค: ถ้ายังไม่ได้เลือกโต๊ะ ไม่ต้องทำต่อ
        if (!selectedTable) return;

        const token = localStorage.getItem('access_token');
        const response = await fetch('http://127.0.0.1:8080/api/tables/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                table_id: selectedTable.table_id, // ตอนนี้ปลอดภัยแล้วเพราะเช็คด้านบนแล้ว
                table_no: selectedTable.table_no,
                capacity: parseInt(newCapacity),
                status: newStatus
            })
        });

        const data = await response.json();
        if (data.result) {
            alert("แก้ไขข้อมูลสำเร็จ!");
            router.push('/staff/tables');
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto bg-white shadow-md rounded-lg mt-10 border">
            <h1 className="text-xl font-bold mb-6 text-yellow-600">แก้ไขข้อมูลโต๊ะ</h1>
            
            {/* ส่วนที่ 1: รายการโต๊ะให้เลือก */}
            {!selectedTable ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {tables.length > 0 ? tables.map(t => (
                        <button 
                            key={t.table_id}
                            onClick={() => {
                                setSelectedTable(t);
                                setNewCapacity(t.capacity);
                                setNewStatus(t.status);
                            }}
                            className="p-4 border rounded hover:bg-yellow-50 text-left transition-colors"
                        >
                            <p className="font-bold text-gray-800">โต๊ะที่: {t.table_no}</p>
                            <p className="text-sm text-gray-500">ความจุ: {t.capacity} ที่นั่ง</p>
                        </button>
                    )) : <p>กำลังโหลดข้อมูลโต๊ะ...</p>}
                </div>
            ) : (
                /* ส่วนที่ 2: ฟอร์มแก้ไข (จะแสดงเมื่อเลือกโต๊ะแล้วเท่านั้น) */
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-md mb-4">
                        <p className="font-bold text-lg text-yellow-800">กำลังแก้ไข: โต๊ะที่ {selectedTable.table_no}</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">จำนวนที่นั่งใหม่</label>
                        <input 
                            type="number" 
                            value={newCapacity}
                            onChange={(e) => setNewCapacity(e.target.value)}
                            className="w-full border p-2 rounded mt-1 shadow-sm"
                            min="1"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">สถานะโต๊ะ</label>
                        <select 
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full border p-2 rounded mt-1 shadow-sm"
                        >
                            <option value="available">ว่าง (Available)</option>
                            <option value="occupied">ไม่ว่าง (Occupied)</option>
                            <option value="reserved">จองแล้ว (Reserved)</option>
                        </select>
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t">
                        <button type="submit" className="flex-1 bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 font-bold transition-colors">
                            บันทึกการเปลี่ยนแปลง
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setSelectedTable(null)} 
                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            ยกเลิก/เปลี่ยนโต๊ะ
                        </button>
                    </div>
                </form>
            )}
            
            <div className="mt-8 text-center border-t pt-4">
                <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 text-sm">
                    ← กลับหน้าจัดการโต๊ะ
                </button>
            </div>
        </div>
    );
}