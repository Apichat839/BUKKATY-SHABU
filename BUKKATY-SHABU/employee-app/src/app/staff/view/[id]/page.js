"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import StaffNavbar from '@/app/components/StaffNavbar';
import { Card, CardContent } from '@/components/ui/card';

export default function StaffViewOrderPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/orders/all`);
                const res = await response.json();
                if (!res.isError) {
                    const found = res.data.find(o => String(o.order_id) === String(orderId));
                    if (found) setOrder(found);
                    else setError('ไม่พบข้อมูลออเดอร์นี้');
                }
            } catch (err) {
                setError('ไม่สามารถดึงข้อมูลได้');
            } finally {
                setLoading(false);
            }
        };
        if (orderId) fetchOrder();
    }, [orderId]);

    let items = [];
    if (order) {
        try { items = JSON.parse(order.items_json); } catch { }
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': case 'สำเร็จ':
                return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
            case 'pending': case 'รอดำเนินการ':
                return { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
            case 'cooking': case 'กำลังทำ':
                return { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
            default:
                return { badge: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <StaffNavbar />

            <main className="max-w-4xl mx-auto px-6 py-8">

                {/* Back Button */}
                <button
                    onClick={() => router.push('/staff')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium">กลับไปรายการสั่งอาหาร</span>
                </button>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                        <span className="ml-4 text-muted-foreground text-lg">กำลังโหลดข้อมูล...</span>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-xl font-bold text-foreground mb-4">{error}</p>
                        <button
                            onClick={() => router.push('/staff')}
                            className="px-6 py-2 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition-colors"
                        >
                            กลับหน้าหลัก
                        </button>
                    </div>
                )}

                {/* Order Detail */}
                {!loading && order && (
                    <div className="space-y-5">

                        {/* Header Card — โต๊ะ + สถานะ */}
                        <Card className="shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-1 bg-red-600 w-full" />
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center shrink-0">
                                            <span className="text-xl font-black text-red-600">{order.table_name || order.table_no}</span>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">โต๊ะ</p>
                                            <p className="text-2xl font-black text-foreground">โต๊ะ {order.table_name || order.table_no}</p>
                                        </div>
                                    </div>

                                    {(() => {
                                        const s = getStatusStyle(order.status);
                                        return (
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${s.badge}`}>
                                                <span className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`} />
                                                <span className="text-sm font-bold">{order.status || 'รอดำเนินการ'}</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Card className="shadow-sm border border-gray-100 bg-white">
                                <CardContent className="p-5">
                                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">ชื่อลูกค้า</p>
                                    <p className="text-lg font-bold text-foreground break-words">{order.customer_name || '-'}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm border border-gray-100 bg-white">
                                <CardContent className="p-5">
                                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">จำนวนรายการ</p>
                                    <p className="text-lg font-bold text-foreground">{items.length} รายการ</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm border border-red-100 bg-white">
                                <CardContent className="p-5">
                                    <p className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1">ยอดรวม</p>
                                    <p className="text-lg font-bold text-red-600">{Number(order.total_price || 0).toLocaleString()} ฿</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Items List */}
                        <Card className="shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">รายการอาหารที่สั่ง</h3>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {items.map((item, idx) => (
                                    <div
                                        key={`item-${idx}`}
                                        className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50/60 transition-colors"
                                    >
                                        {/* ลำดับ */}
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                                        </div>

                                        {/* รูปภาพ — แสดงเสมอ มี placeholder กรณีไม่มีรูป */}
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                                            {item.img ? (
                                                <img
                                                    src={`${API_BASE_URL}/imgs/${item.img}`}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            {/* Placeholder icon */}
                                            <div
                                                className="w-full h-full flex items-center justify-center bg-gray-100"
                                                style={{ display: item.img ? 'none' : 'flex' }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* ชื่อ + ราคาต่อชิ้น */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-foreground break-words leading-snug text-sm sm:text-base">{item.name}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {item.price ? `${Number(item.price).toLocaleString()} ฿ / ชิ้น` : '-'}
                                            </p>
                                        </div>

                                        {/* จำนวน */}
                                        <div className="shrink-0">
                                            <span className="bg-red-50 text-red-600 text-sm font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-red-200">
                                                ×{item.qty}
                                            </span>
                                        </div>

                                        {/* ราคารวม */}
                                        <div className="shrink-0 text-right min-w-[60px] sm:min-w-[80px]">
                                            <span className="font-bold text-foreground text-sm sm:text-base">
                                                {item.price ? `${(item.price * item.qty).toLocaleString()} ฿` : '-'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total Footer */}
                            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50/80 flex justify-between items-center">
                                <span className="text-muted-foreground font-bold uppercase text-xs tracking-wider">ยอดรวมทั้งหมด</span>
                                <span className="text-2xl font-black text-red-600">
                                    {Number(order.total_price || 0).toLocaleString()} ฿
                                </span>
                            </div>
                        </Card>

                    </div>
                )}
            </main>
        </div>
    );
}
