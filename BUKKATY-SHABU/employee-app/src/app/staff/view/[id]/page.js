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
    const [updating, setUpdating] = useState(false);
    const [updateMsg, setUpdateMsg] = useState(null); // { type: 'success'|'error', text }

    const API_BASE_URL = 'http://localhost:8080';

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

    useEffect(() => {
        if (orderId) fetchOrder();
    }, [orderId]);

    const handleUpdateStatus = async (newStatus) => {
        setUpdating(true);
        setUpdateMsg(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/orders/update_status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId, status: newStatus }),
            });
            const data = await res.json();
            if (!data.isError) {
                setOrder(prev => ({ ...prev, status: newStatus }));
                const labels = { cooking: 'รับออเดอร์แล้ว', completed: 'ส่งออเดอร์แล้ว' };
                setUpdateMsg({ type: 'success', text: `✓ ${labels[newStatus] || newStatus} สำเร็จ` });
                setTimeout(() => setUpdateMsg(null), 3000);
            } else {
                setUpdateMsg({ type: 'error', text: data.errorMessage || 'เกิดข้อผิดพลาด' });
            }
        } catch {
            setUpdateMsg({ type: 'error', text: 'ไม่สามารถเชื่อมต่อ server ได้' });
        } finally {
            setUpdating(false);
        }
    };

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

    const statusLabel = (s) => {
        switch (s) {
            case 'pending': return 'รอดำเนินการ';
            case 'cooking': return 'กำลังทำ';
            case 'completed': return 'ส่งแล้ว';
            default: return s || 'รอดำเนินการ';
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
                        <p className="text-xl font-bold text-foreground mb-4">{error}</p>
                        <button onClick={() => router.push('/staff')}
                            className="px-6 py-2 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition-colors">
                            กลับหน้าหลัก
                        </button>
                    </div>
                )}

                {/* Order Detail */}
                {!loading && order && (
                    <div className="space-y-5">

                        {/* Header Card */}
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
                                                <span className="text-sm font-bold">{statusLabel(order.status)}</span>
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

                        {/* ===== Action Buttons ===== */}
                        <Card className="shadow-sm border border-gray-100 bg-white overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">อัปเดตสถานะออเดอร์</h3>
                            </div>
                            <CardContent className="p-5">
                                {/* Progress Steps */}
                                <div className="flex items-center gap-2 mb-5">
                                    {[
                                        { key: 'pending', label: 'รอรับ' },
                                        { key: 'cooking', label: 'กำลังทำ' },
                                        { key: 'completed', label: 'ส่งแล้ว' },
                                    ].map((step, i, arr) => {
                                        const stepOrder = { pending: 0, cooking: 1, completed: 2 };
                                        const currentIdx = stepOrder[order.status] ?? 0;
                                        const isDone = i <= currentIdx;
                                        const isActive = i === currentIdx;
                                        return (
                                            <React.Fragment key={step.key}>
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                                        isDone
                                                            ? isActive ? 'bg-red-600 border-red-600 text-white' : 'bg-emerald-500 border-emerald-500 text-white'
                                                            : 'bg-white border-gray-200 text-gray-400'
                                                    }`}>
                                                        {!isDone || isActive ? i + 1 : '✓'}
                                                    </div>
                                                    <span className={`text-[10px] font-bold ${isActive ? 'text-red-600' : isDone ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                                {i < arr.length - 1 && (
                                                    <div className={`flex-1 h-0.5 mb-4 rounded-full ${i < currentIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>

                                {/* Feedback message */}
                                {updateMsg && (
                                    <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-semibold ${
                                        updateMsg.type === 'success'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                        {updateMsg.text}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    {(order.status === 'pending' || order.status === 'รอดำเนินการ') && (
                                        <button
                                            onClick={() => handleUpdateStatus('cooking')}
                                            disabled={updating}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all hover:shadow-md active:scale-95">
                                            {updating ? (
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                            รับออเดอร์
                                        </button>
                                    )}

                                    {(order.status === 'cooking' || order.status === 'กำลังทำ') && (
                                        <button
                                            onClick={() => handleUpdateStatus('completed')}
                                            disabled={updating}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all hover:shadow-md active:scale-95">
                                            {updating ? (
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            ส่งออเดอร์แล้ว
                                        </button>
                                    )}

                                    {(order.status === 'completed' || order.status === 'สำเร็จ') && (
                                        <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-xl">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            ส่งออเดอร์เรียบร้อยแล้ว
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items List */}
                        <Card className="shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">รายการอาหารที่สั่ง</h3>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {items.map((item, idx) => (
                                    <div key={`item-${idx}`}
                                        className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50/60 transition-colors">
                                        {/* ลำดับ */}
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                                        </div>

                                        {/* รูปภาพ */}
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
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100"
                                                style={{ display: item.img ? 'none' : 'flex' }}>
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
