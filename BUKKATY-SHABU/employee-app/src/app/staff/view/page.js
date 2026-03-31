"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// หน้านี้จะ redirect ไปหน้า staff หลัก
// เนื่องจากการดูข้อมูลจะใช้ /staff/view/[id] แทน
export default function StaffViewRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/staff');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
