"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
        <div className="p-8 max-w-5xl mx-auto mt-10 text-black">
            <h1 className="text-2xl font-bold mb-6 text-purple-600 border-b-2 border-purple-200 pb-2">
                ประวัติการใช้โต๊ะและรายการสั่งซื้อ
            </h1>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4">วันที่/เวลา</th>
                            <th className="p-4">โต๊ะ</th>
                            <th className="p-4">ลูกค้า</th>
                            <th className="p-4 text-right">ยอดรวม</th>
                            <th className="p-4 text-center">สถานะออเดอร์</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length > 0 ? (
                            history.map((h) => (
                                <tr key={h.order_id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 text-sm">
                                        {new Date(h.order_date).toLocaleString('th-TH')}
                                    </td>
                                    <td className="p-4 font-bold text-blue-600">
                                        {/* ถ้า table_number ไม่มี (เพราะโต๊ะถูกลบ) ให้ใช้ค่า table_name จากตาราง orders แทน */}
                                        โต๊ะ {h.table_number || h.table_name || 'ทั่วไป'}
                                    </td>
                                    <td className="p-4">{h.customer_name}</td>
                                    <td className="p-4 text-right font-bold">
                                        {Number(h.total_price).toLocaleString()} บาท
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            {h.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-10 text-center text-gray-400">ไม่พบประวัติการใช้งาน</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <button onClick={() => router.back()} className="mt-8 text-gray-500 hover:underline">
                ← กลับหน้าหลัก
            </button>
        </div>
    );
}