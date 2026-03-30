"use client";
import React from 'react';

export default function TableMenuPage() {
    const menus = [
        { title: "เพิ่มโต๊ะ", color: "bg-blue-500" },
        { title: "แก้ไขข้อมูลโต๊ะ", color: "bg-yellow-500" },
        { title: "ลบข้อมูลโต๊ะ", color: "bg-red-500" },
        { title: "แสดงยอดการจองโต๊ะแยกตามเลขโต๊ะ", color: "bg-green-500" }
    ];

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4 border-b pb-2">ระบบจัดการโต๊ะ (Bukkaty Shabu)</h1>
            <div className="flex flex-col gap-2">
                {menus.map((item, index) => (
                    <button 
                        key={index}
                        className={`w-full text-left p-4 rounded shadow-sm border hover:bg-gray-50 transition-colors`}
                    >
                        {item.title}
                    </button>
                ))}
            </div>
        </div>
    );
}