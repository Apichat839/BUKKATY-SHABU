"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddTablePage() {
    const [tableNo, setTableNo] = useState('');
    const [capacity, setCapacity] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ดึง Token จาก localStorage เพื่อใช้ในการยืนยันตัวตน
        const token = localStorage.getItem('access_token'); 

        const response = await fetch('http://127.0.0.1:8080/api/tables/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                table_no: parseInt(tableNo), // มั่นใจว่าเป็นตัวเลขก่อนส่ง
                capacity: parseInt(capacity)  // มั่นใจว่าเป็นตัวเลขก่อนส่ง
            })
        });

        const data = await response.json();

        if (data.result) {
            alert("เพิ่มโต๊ะสำเร็จ!");
            router.push('/staff/tables'); 
        } else {
            alert("เกิดข้อผิดพลาด: " + (data.message || "ไม่สามารถเพิ่มข้อมูลได้"));
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto bg-white shadow-md rounded-lg mt-10 border">
            <h1 className="text-xl font-bold mb-6 text-blue-600">เพิ่มโต๊ะใหม่</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">เลขโต๊ะ</label>
                    <input 
                        type="number" // ปรับเป็น number เพื่อรับแค่ตัวเลข
                        value={tableNo}
                        onChange={(e) => setTableNo(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="กรอกหมายเลขโต๊ะ (เช่น 1)"
                        min="1"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">จำนวนที่นั่ง</label>
                    <input 
                        type="number" // ปรับเป็น number เพื่อรับแค่ตัวเลข
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ระบุจำนวนคน"
                        min="1"
                        required
                    />
                </div>
                <div className="flex gap-2 pt-4">
                    <button 
                        type="submit" 
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        บันทึกข้อมูล
                    </button>
                    <button 
                        type="button" 
                        onClick={() => router.back()}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        ยกเลิก
                    </button>
                </div>
            </form>
        </div>
    );
}