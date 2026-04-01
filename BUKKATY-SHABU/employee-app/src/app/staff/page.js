"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import StaffNavbar from '../components/StaffNavbar';
import { Card, CardContent } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faFire, faCircleCheck, faFileInvoiceDollar, faQrcode, faCheckDouble, faXmark } from '@fortawesome/free-solid-svg-icons';
import QRCode from 'react-qr-code';
import generatePayload from 'promptpay-qr';

const API_BASE_URL = 'http://localhost:8080';

// *** เปลี่ยนเป็นเบอร์ PromptPay ของร้าน ***
const PROMPTPAY_ID = '0812345678';

const CAT_COLORS = [
    '#dc2626', '#ea580c', '#d97706', '#16a34a',
    '#0891b2', '#7c3aed', '#db2777', '#0d9488',
];

// ---- SVG Bar Chart ----
function BarChart({ bars, unit = '', width = 500, height = 220 }) {
    if (!bars || bars.length === 0) return (
        <div className="flex items-center justify-center h-40 text-gray-300 text-sm">ไม่มีข้อมูล</div>
    );

    const maxVal = Math.max(...bars.map(b => b.value), 1);
    const pL = 48, pB = 52, pT = 20, pR = 16;
    const cW = width - pL - pR;
    const cH = height - pB - pT;
    const bW = Math.max(18, Math.floor(cW / bars.length) - 12);
    const gap = (cW - bW * bars.length) / (bars.length + 1);
    const yLines = [0, 0.25, 0.5, 0.75, 1];

    const fmtLabel = (v) => {
        if (unit === '฿') return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);
        return String(v);
    };

    return (
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
            {yLines.map((pct, i) => {
                const y = pT + cH * (1 - pct);
                return (
                    <g key={i}>
                        <line x1={pL} y1={y} x2={width - pR} y2={y}
                            stroke={i === 0 ? '#d1d5db' : '#f3f4f6'}
                            strokeWidth={i === 0 ? 1.5 : 1}
                            strokeDasharray={i === 0 ? 'none' : '4 3'} />
                        <text x={pL - 5} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                            {fmtLabel(Math.round(maxVal * pct))}
                        </text>
                    </g>
                );
            })}

            {bars.map((bar, i) => {
                const bH = Math.max(2, (bar.value / maxVal) * cH);
                const x = pL + gap + i * (bW + gap);
                const y = pT + cH - bH;
                return (
                    <g key={i}>
                        <rect x={x + 2} y={y + 2} width={bW} height={bH} rx={4} fill={bar.color} opacity={0.15} />
                        <rect x={x} y={y} width={bW} height={bH} rx={4} fill={bar.color} opacity={0.88} />
                        {bar.value > 0 && (
                            <text x={x + bW / 2} y={y - 5} textAnchor="middle" fontSize="10" fontWeight="bold" fill={bar.color}>
                                {fmtLabel(bar.value)}{unit === '฿' ? '฿' : ''}
                            </text>
                        )}
                        <text x={x + bW / 2} y={pT + cH + 16} textAnchor="middle" fontSize="9" fill="#374151">
                            {bar.label.length > 5 ? bar.label.slice(0, 5) + '…' : bar.label}
                        </text>
                        {unit !== '฿' && (
                            <text x={x + bW / 2} y={pT + cH + 28} textAnchor="middle" fontSize="8" fill="#9ca3af">
                                {bar.value} ชิ้น
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

// ---- SVG Donut Chart ----
function DonutChart({ segments, size = 180 }) {
    const r = 62, cx = size / 2, cy = size / 2;
    const circ = 2 * Math.PI * r;
    const total = segments.reduce((s, g) => s + g.value, 0);
    let acc = 0;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={28} />
            {segments.map((seg, i) => {
                if (seg.value === 0) return null;
                const pct = seg.value / total;
                const dash = pct * circ;
                const offset = circ * (1 - acc);
                acc += pct;
                return (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                        stroke={seg.color} strokeWidth={28}
                        strokeDasharray={`${dash} ${circ}`}
                        strokeDashoffset={offset}
                        style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
                );
            })}
            <text x={cx} y={cy - 7} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#111">{total}</text>
            <text x={cx} y={cy + 11} textAnchor="middle" fontSize="9" fill="#6b7280">ชิ้นรวม</text>
        </svg>
    );
}

// ---- Bill Modal ----
function BillModal({ group, onClose, onPaid }) {
    const [clearing, setClearing] = useState(false);
    const [done, setDone] = useState(false);

    // รวมทุก item ของทุกออเดอร์ในโต๊ะ
    const allItems = group.allItems;
    const total = group.totalPrice;
    const qrPayload = (() => {
        try { return generatePayload(PROMPTPAY_ID, { amount: total }); }
        catch { return PROMPTPAY_ID; }
    })();

    const handlePaid = async () => {
        setClearing(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/orders/clear_table`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table_name: group.tableKey }),
            });
            const data = await res.json();
            if (!data.isError) {
                setDone(true);
                setTimeout(() => { onPaid(group.tableKey); onClose(); }, 1200);
            }
        } catch { }
        finally { setClearing(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center">
                            <span className="font-black text-red-600 text-sm">{group.tableKey}</span>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-base">ใบสรุปยอด · โต๊ะ {group.tableKey}</p>
                            <p className="text-xs text-gray-400">{group.customerName} · {group.orders.length} ออเดอร์</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                    </button>
                </div>

                {/* Item list */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">รายการทั้งหมด</p>
                    {allItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 h-5 rounded bg-gray-100 text-[10px] font-bold text-gray-500 flex items-center justify-center shrink-0">{i + 1}</span>
                                <span className="text-sm text-gray-800 truncate">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 text-sm">
                                <span className="text-gray-400">×{item.qty}</span>
                                <span className="font-semibold text-gray-700 w-20 text-right">
                                    {item.price ? `${(item.price * item.qty).toLocaleString()} ฿` : '-'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total + QR */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    {/* ยอดรวม */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-gray-600">ยอดรวมทั้งหมด</span>
                        <span className="text-2xl font-black text-red-600">{total.toLocaleString()} ฿</span>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="bg-white p-3 rounded-xl border-2 border-gray-200 inline-block">
                            <QRCode value={qrPayload} size={150} />
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            <FontAwesomeIcon icon={faQrcode} className="h-3 w-3" />
                            สแกน QR PromptPay เพื่อชำระเงิน
                        </p>
                    </div>

                    {/* Confirm button */}
                    {done ? (
                        <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold">
                            <FontAwesomeIcon icon={faCheckDouble} className="h-4 w-4" />
                            ชำระเงินเสร็จสิ้น · เคลียร์โต๊ะแล้ว
                        </div>
                    ) : (
                        <button
                            onClick={handlePaid}
                            disabled={clearing}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all hover:shadow-md active:scale-[0.98]">
                            {clearing
                                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <FontAwesomeIcon icon={faCheckDouble} className="h-4 w-4" />}
                            ยืนยันชำระเงิน · เคลียร์โต๊ะ
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ---- Toast Notification ----
function ToastList({ toasts, onDismiss }) {
    if (toasts.length === 0) return null;
    return (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-xs w-full">
            {toasts.map(t => (
                <div key={t.id}
                    className="flex items-start gap-3 bg-white border border-amber-300 shadow-lg rounded-xl px-4 py-3 animate-in slide-in-from-right-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-base">🔔</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">อัปเดตออเดอร์</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">
                            โต๊ะ {t.table} · {t.count} ออเดอร์ใหม่
                        </p>
                    </div>
                    <button onClick={() => onDismiss(t.id)}
                        className="text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0 mt-0.5">×</button>
                </div>
            ))}
        </div>
    );
}

export default function StaffDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [menus, setMenus] = useState([]);
    const [foodTypes, setFoodTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [billGroup, setBillGroup] = useState(null); // group ที่เปิด BillModal

    // Track previously seen order IDs to detect new ones
    const prevOrderIdsRef = useRef(null); // null = first load (don't notify)

    const dismissToast = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const fetchAll = useCallback(async () => {
        try {
            const [resOrders, resMenus, resTypes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/orders/all`),
                fetch(`${API_BASE_URL}/api/menu/all`),
                fetch(`${API_BASE_URL}/api/food_types/all`),
            ]);
            const [oData, mData, tData] = await Promise.all([
                resOrders.json(), resMenus.json(), resTypes.json(),
            ]);

            if (!oData.isError) {
                const newOrders = oData.data || [];

                // Detect new orders (skip on first load)
                if (prevOrderIdsRef.current !== null) {
                    const tableUpdates = {};
                    newOrders.forEach(o => {
                        if (!prevOrderIdsRef.current.has(o.order_id)) {
                            const t = String(o.table_name || o.table_no || '?');
                            tableUpdates[t] = (tableUpdates[t] || 0) + 1;
                        }
                    });
                    const newToasts = Object.entries(tableUpdates).map(([table, count]) => ({
                        id: Date.now() + Math.random(),
                        table,
                        count,
                    }));
                    if (newToasts.length > 0) {
                        setNotifications(prev => [...prev, ...newToasts]);
                        newToasts.forEach(t => {
                            setTimeout(() => dismissToast(t.id), 5000);
                        });
                    }
                }

                prevOrderIdsRef.current = new Set(newOrders.map(o => o.order_id));
                setOrders(newOrders);
            }
            if (!mData.isError) setMenus(mData.data || []);
            if (!tData.isError) setFoodTypes(tData.data || []);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [dismissToast]);

    useEffect(() => {
        fetchAll();
        const iv = setInterval(fetchAll, 5000);
        return () => clearInterval(iv);
    }, [fetchAll]);

    // map menu_id → food_type_id
    const menuTypeMap = useMemo(() => {
        const m = {};
        menus.forEach(mn => { m[mn.menu_id] = mn.food_type_id; });
        return m;
    }, [menus]);

    // map food_type_id → name
    const typeNameMap = useMemo(() => {
        const m = {};
        foodTypes.forEach(ft => { m[ft.food_type_id] = ft.food_type_name; });
        return m;
    }, [foodTypes]);

    // สรุปตามประเภท
    const categorySummary = useMemo(() => {
        const data = {};
        orders.forEach(order => {
            let items = [];
            try { items = JSON.parse(order.items_json); } catch { }
            items.forEach(item => {
                const tid = menuTypeMap[item.id] ?? 0;
                const name = typeNameMap[tid] || 'อื่นๆ';
                if (!data[tid]) data[tid] = { name, typeId: tid, qty: 0, revenue: 0 };
                data[tid].qty += item.qty;
                data[tid].revenue += item.qty * (item.price || 0);
            });
        });
        return Object.values(data).sort((a, b) => b.qty - a.qty);
    }, [orders, menuTypeMap, typeNameMap]);

    // Format Thai date/time
    const fmtTime = (ts) => {
        if (!ts) return null;
        const d = new Date(ts);
        if (isNaN(d)) return null;
        const pad = n => String(n).padStart(2, '0');
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear() + 543} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // Group orders by table — sorted oldest→newest (latest updated at bottom)
    const groupedOrders = useMemo(() => {
        const groups = {};
        orders.forEach(order => {
            const key = String(order.table_name || order.table_no || 'unknown');
            if (!groups[key]) {
                groups[key] = {
                    tableKey: key,
                    orders: [],
                    totalPrice: 0,
                    customerName: order.customer_name || '-',
                    allItems: [],
                    latestOrderId: 0,
                    latestTime: null,
                };
            }
            groups[key].orders.push(order);
            groups[key].totalPrice += Number(order.total_price || 0);
            // Track the latest order by order_id (higher = newer)
            if (order.order_id > groups[key].latestOrderId) {
                groups[key].latestOrderId = order.order_id;
                groups[key].latestTime = order.created_at || order.order_date || order.updated_at || null;
            }
            try {
                const items = JSON.parse(order.items_json);
                groups[key].allItems.push(...items);
            } catch { }
        });
        // Sort ascending by latest order_id → oldest group first, newest group last (bottom)
        return Object.values(groups).sort((a, b) => a.latestOrderId - b.latestOrderId);
    }, [orders]);

    const totalQty = categorySummary.reduce((s, c) => s + c.qty, 0);
    const totalRevenue = orders.reduce((s, o) => s + (Number(o.total_price) || 0), 0);

    const qtyBars = categorySummary.map((c, i) => ({
        label: c.name, value: c.qty, color: CAT_COLORS[i % CAT_COLORS.length],
    }));
    const revBars = categorySummary.map((c, i) => ({
        label: c.name, value: c.revenue, color: CAT_COLORS[i % CAT_COLORS.length],
    }));
    const donutSegs = categorySummary.map((c, i) => ({
        value: c.qty, color: CAT_COLORS[i % CAT_COLORS.length],
    }));

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': case 'สำเร็จ':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'pending': case 'รอดำเนินการ':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'cooking': case 'กำลังทำ':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <StaffNavbar />
            <ToastList toasts={notifications} onDismiss={dismissToast} />
            {billGroup && (
                <BillModal
                    group={billGroup}
                    onClose={() => setBillGroup(null)}
                    onPaid={(tableKey) => {
                        setOrders(prev => prev.filter(o => String(o.table_name || o.table_no) !== tableKey));
                        setBillGroup(null);
                    }}
                />
            )}

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
                            <p className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1">โต๊ะที่ใช้งาน</p>
                            <p className="text-3xl font-bold text-foreground">{groupedOrders.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-amber-200 bg-white shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">ออเดอร์ทั้งหมด</p>
                            <p className="text-3xl font-bold text-foreground">{orders.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-emerald-200 bg-white shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">ยอดรวมทั้งหมด</p>
                            <p className="text-3xl font-bold text-foreground">
                                {totalRevenue.toLocaleString()} ฿
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ===== แดชบอร์ดยอดการสั่งตามประเภท ===== */}
                {!loading && categorySummary.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-1 h-6 bg-red-600 rounded-full" />
                            <h3 className="text-lg font-bold text-gray-900">แดชบอร์ดยอดการสั่งตามประเภท</h3>
                        </div>

                        {/* Category stat mini-cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                            {categorySummary.map((cat, i) => {
                                const color = CAT_COLORS[i % CAT_COLORS.length];
                                const pct = totalQty > 0 ? ((cat.qty / totalQty) * 100).toFixed(0) : 0;
                                return (
                                    <div key={cat.typeId} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm overflow-hidden relative">
                                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: color }} />
                                        <p title={cat.name} className="text-xs font-bold text-gray-500 mt-1 line-clamp-2 leading-tight min-h-[2rem]">{cat.name}</p>
                                        <p className="text-2xl font-black mt-1" style={{ color }}>{cat.qty}</p>
                                        <p className="text-[10px] text-gray-400">ชิ้น · {pct}%</p>
                                        <div className="mt-2 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                                        </div>
                                        <p className="text-xs font-bold text-gray-700 mt-2">{cat.revenue.toLocaleString()} ฿</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Charts grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <Card className="shadow-sm border border-gray-100 bg-white">
                                <CardContent className="p-5">
                                    <p className="text-sm font-bold text-gray-700 mb-4">สัดส่วนจำนวนที่สั่ง</p>
                                    <div className="flex flex-col items-center gap-4">
                                        <DonutChart segments={donutSegs} size={180} />
                                        <div className="w-full space-y-1.5">
                                            {categorySummary.map((cat, i) => {
                                                const pct = totalQty > 0 ? ((cat.qty / totalQty) * 100).toFixed(1) : '0.0';
                                                return (
                                                    <div key={cat.typeId} className="flex items-start gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-sm shrink-0 mt-0.5" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                                                        <span title={cat.name} className="text-xs text-gray-600 flex-1 line-clamp-2 leading-tight">{cat.name}</span>
                                                        <span className="text-xs font-bold text-gray-800 shrink-0">{cat.qty}</span>
                                                        <span className="text-[10px] text-gray-400 w-10 text-right shrink-0">{pct}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border border-gray-100 bg-white">
                                <CardContent className="p-5">
                                    <p className="text-sm font-bold text-gray-700 mb-2">จำนวนที่สั่งต่อประเภท (ชิ้น)</p>
                                    <BarChart bars={qtyBars} unit="ชิ้น" width={420} height={210} />
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border border-gray-100 bg-white">
                                <CardContent className="p-5">
                                    <p className="text-sm font-bold text-gray-700 mb-2">ยอดรวมราคาต่อประเภท (฿)</p>
                                    <BarChart bars={revBars} unit="฿" width={420} height={210} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

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

                {/* ===== Orders Table (grouped by table) ===== */}
                {!loading && groupedOrders.length > 0 && (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-6 bg-red-600 rounded-full" />
                            <h3 className="text-lg font-bold text-gray-900">รายการออเดอร์แยกตามโต๊ะ</h3>
                            <span className="text-xs text-gray-400 font-medium">{groupedOrders.length} โต๊ะ · {orders.length} ออเดอร์</span>
                        </div>

                        <Card className="shadow-sm overflow-hidden border border-border">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted">
                                            <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">โต๊ะ</th>
                                            <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">ชื่อลูกค้า</th>
                                            <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">รายการ</th>
                                            <th className="text-right px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">ราคารวม</th>
                                            <th className="text-center px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">ออเดอร์</th>
                                            <th className="text-center px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">จัดการ</th>
                                            <th className="text-center px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">ชำระเงิน</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {groupedOrders.map((group) => {
                                            // รวม items ทั้งหมดในโต๊ะ แสดงแค่ 3 รายการแรก
                                            const allItems = group.allItems;
                                            const shownItems = allItems.slice(0, 3);
                                            const moreCount = allItems.length - shownItems.length;

                                            // สถานะรวม: ถ้ามี pending ให้แสดง pending
                                            const statuses = group.orders.map(o => o.status || 'pending');
                                            const displayStatus = statuses.includes('pending') || statuses.includes('รอดำเนินการ')
                                                ? 'pending'
                                                : statuses.includes('cooking') || statuses.includes('กำลังทำ')
                                                    ? 'cooking'
                                                    : 'completed';

                                            return (
                                                <tr key={group.tableKey} className="hover:bg-muted/40 transition-colors align-top">
                                                    {/* โต๊ะ */}
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                        <div className="flex flex-col items-start gap-1">
                                                            <div className="min-w-[2.5rem] px-2 h-9 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center">
                                                                <span className="font-bold text-red-600 text-xs sm:text-sm">{group.tableKey}</span>
                                                            </div>
                                                            <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border md:hidden ${getStatusStyle(displayStatus)}`}>
                                                                {displayStatus === 'pending' ? 'รอ' : displayStatus === 'cooking' ? 'ทำ' : 'เสร็จ'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* ชื่อลูกค้า */}
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 max-w-[100px] hidden sm:table-cell">
                                                        <span className="font-semibold text-foreground break-words text-sm">{group.customerName}</span>
                                                    </td>

                                                    {/* รายการรวม */}
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                        <div className="flex flex-wrap gap-1 sm:gap-1.5 max-w-[200px] sm:max-w-[260px]">
                                                            {shownItems.map((item, i) => (
                                                                <span key={i} title={item.name}
                                                                    className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-muted text-foreground text-[11px] sm:text-xs font-medium border border-border max-w-[140px]">
                                                                    <span className="truncate">{item.name}</span>
                                                                    <span className="text-red-600 ml-1 shrink-0">x{item.qty}</span>
                                                                </span>
                                                            ))}
                                                            {moreCount > 0 && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-muted text-muted-foreground text-[11px] font-medium border border-border shrink-0">
                                                                    +{moreCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* ราคารวม */}
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                                                        <span className="font-bold text-foreground text-sm">{group.totalPrice.toLocaleString()} ฿</span>
                                                    </td>

                                                    {/* จำนวนออเดอร์ + สถานะ + เวลา */}
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden md:table-cell">
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <span className="text-sm font-bold text-gray-700">{group.orders.length} ออเดอร์</span>
                                                            <span className={`inline-flex text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusStyle(displayStatus)}`}>
                                                                {displayStatus === 'pending' ? 'รอดำเนินการ' : displayStatus === 'cooking' ? 'กำลังทำ' : 'สำเร็จ'}
                                                            </span>
                                                            {fmtTime(group.latestTime) && (
                                                                <span className="text-[10px] text-gray-400 leading-tight">
                                                                    🕐 {fmtTime(group.latestTime)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* ปุ่มดูข้อมูลแต่ละออเดอร์ */}
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                                        <div className="flex flex-col gap-1.5 items-center">
                                                            {[...group.orders].sort((a, b) => b.order_id - a.order_id).map((order, oi) => {
                                                                const isLatest = oi === 0;
                                                                const s = order.status || 'pending';
                                                                const btnStyle =
                                                                    s === 'completed' || s === 'สำเร็จ'
                                                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                                                        : s === 'cooking' || s === 'กำลังทำ'
                                                                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                                                            : isLatest
                                                                                ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-300'
                                                                                : 'bg-amber-400 hover:bg-amber-500 text-white';
                                                                const statusIcon =
                                                                    s === 'completed' || s === 'สำเร็จ'
                                                                        ? faCircleCheck
                                                                        : s === 'cooking' || s === 'กำลังทำ'
                                                                            ? faFire
                                                                            : faClock;
                                                                return (
                                                                    <button key={order.order_id}
                                                                        onClick={() => router.push(`/staff/view/${order.order_id}`)}
                                                                        className={`inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all hover:shadow-md active:scale-95 whitespace-nowrap ${btnStyle}`}>
                                                                        <FontAwesomeIcon icon={statusIcon} className="h-3 w-3 shrink-0" />
                                                                        <span className="hidden sm:inline">ออเดอร์ {oi + 1}</span>
                                                                        <span className="sm:hidden">{oi + 1}</span>
                                                                        {isLatest && (s === 'pending') && <span className="hidden sm:inline text-[9px] font-black opacity-90 ml-0.5">●NEW</span>}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>

                                                    {/* ปุ่มสรุปยอด */}
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                                        <button
                                                            onClick={() => setBillGroup(group)}
                                                            className="inline-flex flex-col items-center gap-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all hover:shadow-md active:scale-95">
                                                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="h-4 w-4" />
                                                            <span className="hidden sm:inline text-[10px]">สรุปยอด</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </>
                )}
            </main>
        </div>
    );
}
