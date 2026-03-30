"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddTablePage() {
    const [tableNo, setTableNo] = useState('');
    const [capacity, setCapacity] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://127.0.0.1:8080/api/tables/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
                alert("เกิดข้อผิดพลาด: " + (data.message || "ไม่สามารถเพิ่มข้อมูลได้"));
            }
        } catch (error) {
            alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาเช็คว่ารัน node server.js หรือยัง");
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto bg-white shadow-md rounded-lg mt-10 border text-black">
            <h1 className="text-xl font-bold mb-6 text-blue-600 border-b pb-2">เพิ่มโต๊ะใหม่ (ไม่ต้อง Login)</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700">หมายเลขโต๊ะ</label>
                    <input 
                        type="number"
                        value={tableNo}
                        onChange={(e) => setTableNo(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="กรอกหมายเลขโต๊ะ"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700">จำนวนที่นั่ง</label>
                    <input 
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ระบุจำนวนที่นั่ง"
                        required
                    />
                </div>
                <div className="flex gap-2 pt-4">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-bold shadow-md transition-all">
                        บันทึกทันที
                    </button>
                    <button type="button" onClick={() => router.back()} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 font-bold">
                        ยกเลิก
                    </button>
                </div>
            </form>
        </div>
    );
}