"use client";
import React from 'react';
import { useRouter } from 'next/navigation'; // เพิ่ม router สำหรับเปลี่ยนหน้า

export default function TableMenuPage() {
    const router = useRouter();

    const menus = [
        { title: "เพิ่มโต๊ะ", path: "/staff/tables/add" },
        { title: "แก้ไขข้อมูลโต๊ะ", path: "/staff/tables/edit" },
        { title: "ลบข้อมูลโต๊ะ", path: "/staff/tables/delete" },
        { title: "แสดงยอดการจองโต๊ะแยกตามเลขโต๊ะ", path: "/staff/tables/report" }
    ];

    return (
        <div className="p-6 max-w-md mx-auto min-h-screen bg-white shadow-lg mt-4 border rounded">
            <h1 className="text-xl font-bold mb-4 border-b pb-2">
                ระบบจัดการโต๊ะ (Bukkaty Shabu)
            </h1>
            <div className="flex flex-col gap-2">
                {menus.map((item, index) => (
                    <button 
                        key={index}
                        onClick={() => router.push(item.path)} // สั่งให้เปลี่ยนหน้าตาม path
                        className="w-full text-left p-4 rounded shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors font-medium text-gray-700"
                    >
                        {item.title}
                    </button>
                ))}
            </div>
            
            {/* ปุ่มย้อนกลับ เพื่อความสะดวกของพนักงาน */}
            <button 
                onClick={() => router.push('/staff')} 
                className="mt-6 w-full text-center text-sm text-gray-500 hover:text-gray-700 underline"
            >
                กลับไปหน้าหลักของพนักงาน
            </button>
        </div>
    );
}