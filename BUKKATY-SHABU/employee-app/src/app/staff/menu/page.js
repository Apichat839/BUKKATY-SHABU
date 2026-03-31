"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import StaffNavbar from '@/app/components/StaffNavbar';

export default function MenuManagementPage() {
    const router = useRouter();

    const menus = [
        { 
            title: "เพิ่มเมนู", 
            desc: "เพิ่มรายการอาหารใหม่เข้าสู่ระบบ",
            path: "/staff/menu/add",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            ),
            color: "from-emerald-600 to-emerald-800"
        },
        { 
            title: "แก้ไขเมนู", 
            desc: "แก้ไขข้อมูลเมนูที่มีอยู่ในระบบ",
            path: "/staff/menu/edit",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            color: "from-amber-600 to-amber-800"
        },
        { 
            title: "ลบเมนู", 
            desc: "ลบรายการอาหารออกจากระบบ",
            path: "/staff/menu/delete",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            ),
            color: "from-red-600 to-red-800"
        },
    ];

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
            <StaffNavbar />

            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-black tracking-tight">จัดการเมนูอาหาร</h2>
                    <p className="text-gray-500 text-sm mt-1">เพิ่ม แก้ไข หรือลบรายการเมนูในระบบ</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {menus.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => router.push(item.path)}
                            className="group relative bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 text-left hover:border-gray-600 transition-all hover:shadow-xl active:scale-[0.98]"
                        >
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                            <p className="text-gray-500 text-sm">{item.desc}</p>
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
}
