"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import styles from './chart.module.css';

export default function TableUsageChartPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const COLORS = ['#ffd700', '#4ade80', '#60a5fa', '#f87171', '#c084fc', '#fb923c'];

    const fetchData = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8080/api/bookings/all_details');
            const resData = await response.json();

            if (!resData.isError) {
                // ประมวลผลข้อมูล: นับจำนวนครั้งที่แต่ละโต๊ะถูกใช้
                const counts = resData.data.reduce((acc, curr) => {
                    const tableKey = curr.table_number || curr.table_name || '';
                    acc[tableKey] = (acc[tableKey] || 0) + 1;
                    return acc;
                }, {});

                // แปลงเป็นรูปแบบที่ Recharts ต้องการ
                const chartData = Object.keys(counts).map(key => ({
                    name: key.toString().startsWith('โต๊ะ') ? key : `โต๊ะ ${key}`,
                    value: counts[key]
                })).sort((a, b) => {
                    // เรียงตามเลขโต๊ะ 
                    const numA = parseInt(a.name.replace(/\D/g, ''));
                    const numB = parseInt(b.name.replace(/\D/g, ''));
                    return (numA || 0) - (numB || 0);
                });

                setData(chartData);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                ประวัติการใช้โต๊ะและรายการสั่งซื้อ
            </h1>

            <div className={styles.chartSection}>
                <h2 className={styles.chartTitle}>สรุปจำนวนครั้งที่เปิดโต๊ะ </h2>

                {loading ? (
                    <div className={styles.loading}>กำลังโหลดข้อมูลสถิติ...</div>
                ) : data.length > 0 ? (
                    <div style={{ width: '100%', height: 400, marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#fff"
                                    tick={{ fontSize: 13 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                                />
                                <YAxis
                                    stroke="#fff"
                                    tick={{ fontSize: 13 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                                    allowDecimals={false}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    <LabelList dataKey="value" position="top" fill="#ffd700" fontSize={16} fontWeight="bold" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className={styles.emptyState}>ยังไม่มีข้อมูลในประวัติเพื่อแสดงสถิติ</div>
                )}
            </div>

            <button onClick={() => router.push('/staff/tables/history')} className={styles.backBtn}>
                ← กลับหน้าหลัก
            </button>
        </div>
    );
}
