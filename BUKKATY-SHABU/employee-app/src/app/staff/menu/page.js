"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import StaffNavbar from '@/app/components/StaffNavbar';
import { Card, CardContent } from '@/components/ui/card';

const menuActions = [
    {
        title: 'เพิ่มเมนู',
        desc: 'เพิ่มรายการอาหารใหม่เข้าสู่ระบบ',
        path: '/staff/menu/add',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
        ),
        color: 'text-emerald-600',
    },
    {
        title: 'แก้ไขเมนู',
        desc: 'แก้ไขข้อมูลเมนูที่มีอยู่ในระบบ',
        path: '/staff/menu/edit',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
        color: 'text-amber-600',
    },
    {
        title: 'ลบเมนู',
        desc: 'ลบรายการอาหารออกจากระบบ',
        path: '/staff/menu/delete',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        ),
        color: 'text-red-600',
    },
];

export default function MenuManagementPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50">
            <StaffNavbar />
            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">จัดการเมนูอาหาร</h2>
                    <p className="text-muted-foreground text-sm mt-1">เพิ่ม แก้ไข หรือลบรายการเมนูในระบบ</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {menuActions.map((item) => (
                        <Card
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className="cursor-pointer border border-border bg-white transition-all shadow-sm hover:shadow-md hover:border-gray-300 active:scale-[0.98]"
                        >
                            <CardContent className="p-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gray-50 border border-border ${item.color}`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-1">{item.title}</h3>
                                <p className="text-muted-foreground text-sm">{item.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
