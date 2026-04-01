"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './tablepage.module.css';
import StaffNavbar from '@/app/components/StaffNavbar';

export default function TableMenuPage() {
    const router = useRouter();

    const menus = [
        { title: "เพิ่มโต๊ะ", path: "/staff/tables/add" },
        { title: "แก้ไขข้อมูลโต๊ะ", path: "/staff/tables/edit" },
        { title: "ลบข้อมูลโต๊ะ", path: "/staff/tables/delete" },
        { title: "แสดงยอดการโต๊ะจองแยกตามเลขโต๊ะ", path: "/staff/tables/history" }
    ];

    return (
        <>
        <StaffNavbar/>
        <div className={styles.container}>
            <h1 className={styles.title}>
                ระบบจัดการโต๊ะ (Bukkaty Shabu)
            </h1>
            <div className={styles.menuList}>
                {menus.map((item, index) => (
                    <button
                        key={index}
                        // ใช้ Optional Chaining (?.) เพื่อป้องกัน Error หาก item เป็นค่าว่าง
                        onClick={() => item?.path && router.push(item.path)}
                        className={styles.menuButton}
                    >
                        {item?.title || "ไม่พบข้อมูล"}
                    </button>
                ))}
            </div>

            <button
                onClick={() => router.push('/staff')}
                className={styles.backButton}
            >
                กลับไปหน้าหลักของพนักงาน
            </button>
        </div>
        </>
    );
}