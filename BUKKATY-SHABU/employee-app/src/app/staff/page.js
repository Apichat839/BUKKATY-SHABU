"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffNavbar from '../components/StaffNavbar';
import { Card, CardContent } from '@/components/ui/card';

export default function StaffDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/orders/all`);
                const res = await response.json();
                if (!res.isError) {
                    setOrders(res.data);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed':
            case 'สำเร็จ':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'pending':
            case 'รอดำเนินการ':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'cooking':
            case 'กำลังทำ':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <StaffNavbar />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Title */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">รายการสั่งอาหาร</h2>
                        <p className="text-muted-foreground text-sm mt-1">Bukkaty Shabu · ติดตามออเดอร์แบบเรียลไทม์</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-emerald-700 text-xs font-bold">อัปเดตอัตโนมัติ</span>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Card className="border border-red-200 bg-white shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1">ออเดอร์ทั้งหมด</p>
                            <p className="text-3xl font-bold text-foreground">{orders.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-amber-200 bg-white shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">รอดำเนินการ</p>
                            <p className="text-3xl font-bold text-foreground">
                                {orders.filter(o => o.status === 'pending' || o.status === 'รอดำเนินการ').length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border border-emerald-200 bg-white shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">ยอดรวมทั้งหมด</p>
                            <p className="text-3xl font-bold text-foreground">
                                {orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0).toLocaleString()} ฿
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-4 text-muted-foreground text-lg">กำลังโหลดข้อมูล...</span>
                    </div>
                )}

                {/* Empty */}
                {!loading && orders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-xl font-bold text-foreground">ยังไม่มีรายการสั่งอาหาร</p>
                    </div>
                )}

                {/* Orders Table */}
                {!loading && orders.length > 0 && (
                    <Card className="shadow-sm overflow-hidden border border-border">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted">
                                        <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">โต๊ะ</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">ชื่อลูกค้า</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">รายการ</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">ราคา</th>
                                        <th className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">สถานะ</th>
                                        <th className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {orders.map((order, idx) => {
                                        let items = [];
                                        try {
                                            items = JSON.parse(order.items_json);
                                        } catch (e) {
                                            items = [];
                                        }

                                        return (
                                            <tr
                                                key={`order-${order.id || idx}`}
                                                className="hover:bg-muted/40 transition-colors"
                                            >
                                                {/* เลขโต๊ะ */}
                                                <td className="px-6 py-4">
                                                    <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center">
                                                        <span className="font-bold text-red-600 text-sm">{order.table_name || order.table_no}</span>
                                                    </div>
                                                </td>

                                                {/* ชื่อลูกค้า */}
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-foreground">{order.customer_name || '-'}</span>
                                                </td>

                                                {/* รายการอาหาร */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                        {items.slice(0, 3).map((item, i) => (
                                                            <span
                                                                key={i}
                                                                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-medium border border-border"
                                                            >
                                                                {item.name} <span className="text-red-600 ml-1">x{item.qty}</span>
                                                            </span>
                                                        ))}
                                                        {items.length > 3 && (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium border border-border">
                                                                +{items.length - 3} รายการ
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* ราคา */}
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-foreground">{Number(order.total_price || 0).toLocaleString()} ฿</span>
                                                </td>

                                                {/* สถานะ */}
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${getStatusStyle(order.status)}`}>
                                                        {order.status || 'รอดำเนินการ'}
                                                    </span>
                                                </td>

                                                {/* ปุ่มดูข้อมูล */}
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => router.push(`/staff/view/${order.order_id}`)}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all hover:shadow-md active:scale-95"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        ดูข้อมูล
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </main>
        </div>
    );
}
