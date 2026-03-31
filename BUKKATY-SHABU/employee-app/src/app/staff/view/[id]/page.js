"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import StaffNavbar from '@/app/components/StaffNavbar';

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
                // ดึงข้อมูลออเดอร์ทั้งหมดแล้วหาตาม ID
                const response = await fetch(`${API_BASE_URL}/api/orders/all`);
                const res = await response.json();
                if (!res.isError) {
                    const found = res.data.find(o => String(o.id) === String(orderId));
                    if (found) {
                        setOrder(found);
                    } else {
                        setError('ไม่พบข้อมูลออเดอร์นี้');
                    }
                }
            } catch (err) {
                console.error("Error fetching order:", err);
                setError('ไม่สามารถดึงข้อมูลได้');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    let items = [];
    if (order) {
        try {
            items = JSON.parse(order.items_json);
        } catch (e) {
            items = [];
        }
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': case 'สำเร็จ':
                return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500' };
            case 'pending': case 'รอดำเนินการ':
                return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500' };
            case 'cooking': case 'กำลังทำ':
                return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-500' };
            default:
                return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', dot: 'bg-gray-500' };
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
            <StaffNavbar />

            <main className="max-w-4xl mx-auto px-6 py-8">

                {/* Back Button */}
                <button
                    onClick={() => router.push('/staff')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium">กลับไปรายการสั่งอาหาร</span>
                </button>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-4 text-gray-400 text-lg">กำลังโหลดข้อมูล...</span>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-xl font-bold text-red-400">{error}</p>
                        <button
                            onClick={() => router.push('/staff')}
                            className="mt-4 px-6 py-2 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition-colors"
                        >
                            กลับหน้าหลัก
                        </button>
                    </div>
                )}

                {/* Order Detail */}
                {!loading && order && (
                    <div className="space-y-6">

                        {/* Header Card */}
                        <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-2xl p-6 shadow-xl shadow-red-900/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                        <span className="text-2xl font-black">{order.table_name || order.table_no}</span>
                                    </div>
                                    <div>
                                        <p className="text-red-200 text-xs font-bold uppercase tracking-widest">โต๊ะ</p>
                                        <p className="text-2xl font-black">โต๊ะ {order.table_name || order.table_no}</p>
                                    </div>
                                </div>
                                {(() => {
                                    const s = getStatusStyle(order.status);
                                    return (
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${s.bg} border ${s.border}`}>
                                            <span className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`}></span>
                                            <span className={`text-sm font-bold ${s.text}`}>{order.status || 'รอดำเนินการ'}</span>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Info Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">ชื่อลูกค้า</p>
                                <p className="text-lg font-bold">{order.customer_name || '-'}</p>
                            </div>
                            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">จำนวนรายการ</p>
                                <p className="text-lg font-bold">{items.length} รายการ</p>
                            </div>
                            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">ยอดรวม</p>
                                <p className="text-lg font-bold text-red-500">{Number(order.total_price || 0).toLocaleString()} ฿</p>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-800 bg-[#111]">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">รายการอาหารที่สั่ง</h3>
                            </div>
                            <div className="divide-y divide-gray-800/50">
                                {items.map((item, idx) => (
                                    <div
                                        key={`item-${idx}`}
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors"
                                    >
                                        {/* ลำดับ */}
                                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-gray-500">{idx + 1}</span>
                                        </div>

                                        {/* รูป */}
                                        {item.img && (
                                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-800 border border-gray-700">
                                                <img
                                                    src={`${API_BASE_URL}/imgs/${item.img}`}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                        )}

                                        {/* ชื่อ */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-200 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.price ? `${Number(item.price).toLocaleString()} ฿ / ชิ้น` : 'ราคารวมในแพ็ค'}</p>
                                        </div>

                                        {/* จำนวน */}
                                        <div className="shrink-0">
                                            <span className="bg-red-600/20 text-red-400 text-sm font-bold px-3 py-1.5 rounded-lg border border-red-700/30">
                                                x{item.qty}
                                            </span>
                                        </div>

                                        {/* ราคารวม */}
                                        <div className="shrink-0 text-right min-w-[80px]">
                                            <span className="font-bold text-white">
                                                {item.price ? `${(item.price * item.qty).toLocaleString()} ฿` : '-'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total Footer */}
                            <div className="px-6 py-4 border-t border-gray-700 bg-[#111] flex justify-between items-center">
                                <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">ยอดรวมทั้งหมด</span>
                                <span className="text-2xl font-black text-red-500">
                                    {Number(order.total_price || 0).toLocaleString()} ฿
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
