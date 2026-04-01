"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://localhost:8080';

// สีประจำประเภท
const CATEGORY_COLORS = [
    '#dc2626', '#ea580c', '#d97706', '#16a34a',
    '#0891b2', '#7c3aed', '#db2777', '#0d9488',
];

// ---- SVG Donut Chart ----
function DonutChart({ segments, size = 200 }) {
    const r = 70;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * r;

    let accumulated = 0;
    const total = segments.reduce((s, seg) => s + seg.value, 0);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* พื้นหลังวงกลม */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={32} />

            {segments.map((seg, i) => {
                if (seg.value === 0) return null;
                const pct = seg.value / total;
                const dash = pct * circumference;
                const offset = circumference * (1 - accumulated);
                accumulated += pct;

                return (
                    <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={32}
                        strokeDasharray={`${dash} ${circumference}`}
                        strokeDashoffset={offset}
                        strokeLinecap="butt"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
                    />
                );
            })}

            {/* ตัวเลขกลาง */}
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#111">
                {total}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#6b7280">
                รายการ
            </text>
        </svg>
    );
}

// ---- SVG Bar Chart ----
function BarChart({ bars, width = 480, height = 200 }) {
    if (bars.length === 0) return null;
    const maxVal = Math.max(...bars.map(b => b.value), 1);
    const paddingLeft = 36;
    const paddingBottom = 48;
    const paddingTop = 16;
    const paddingRight = 16;
    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingBottom - paddingTop;
    const barW = Math.max(20, Math.floor(chartW / bars.length) - 10);
    const gap = (chartW - barW * bars.length) / (bars.length + 1);

    // Y grid lines (4 lines)
    const yLines = [0, 0.25, 0.5, 0.75, 1];

    return (
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
            {/* Grid */}
            {yLines.map((pct, i) => {
                const y = paddingTop + chartH * (1 - pct);
                const label = Math.round(maxVal * pct);
                return (
                    <g key={i}>
                        <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y}
                            stroke="#e5e7eb" strokeWidth={1} strokeDasharray={i === 0 ? "none" : "4 3"} />
                        <text x={paddingLeft - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                            {label}
                        </text>
                    </g>
                );
            })}

            {/* Bars */}
            {bars.map((bar, i) => {
                const barH = (bar.value / maxVal) * chartH;
                const x = paddingLeft + gap + i * (barW + gap);
                const y = paddingTop + chartH - barH;

                return (
                    <g key={i}>
                        <rect x={x} y={y} width={barW} height={barH}
                            fill={bar.color} rx={4} opacity={0.9} />
                        {/* ตัวเลขบน bar */}
                        {bar.value > 0 && (
                            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill={bar.color}>
                                {bar.value}
                            </text>
                        )}
                        {/* ชื่อหมวด */}
                        <text
                            x={x + barW / 2}
                            y={paddingTop + chartH + 14}
                            textAnchor="middle"
                            fontSize="9"
                            fill="#374151"
                        >
                            {bar.label.length > 6 ? bar.label.slice(0, 6) + '…' : bar.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

// ---- หน้า Dashboard หลัก ----
export default function OrderDashboardPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [menus, setMenus] = useState([]);
    const [foodTypes, setFoodTypes] = useState([]);
    const [authChecked, setAuthChecked] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        try {
            const [resOrders, resMenus, resTypes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/orders/all`),
                fetch(`${API_BASE_URL}/api/menu/all`),
                fetch(`${API_BASE_URL}/api/food_types/all`),
            ]);
            const [ordersData, menusData, typesData] = await Promise.all([
                resOrders.json(),
                resMenus.json(),
                resTypes.json(),
            ]);
            if (!ordersData.isError) setOrders(ordersData.data || []);
            if (!menusData.isError) setMenus(menusData.data || []);
            if (!typesData.isError) setFoodTypes(typesData.data || []);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // ---- Auth Guard: ตรวจสอบสิทธิ์ก่อนโหลดข้อมูล ----
    useEffect(() => {
        const isStaff = sessionStorage.getItem('staff_auth') === 'true';
        if (!isStaff) {
            router.replace('/login');
        } else {
            setAuthChecked(true);
        }
    }, [router]);

    useEffect(() => {
        if (!authChecked) return;
        fetchAll();
        const iv = setInterval(fetchAll, 15000);
        return () => clearInterval(iv);
    }, [fetchAll, authChecked]);

    // สร้าง map menu_id -> food_type_id
    const menuTypeMap = React.useMemo(() => {
        const m = {};
        menus.forEach(menu => { m[menu.menu_id] = menu.food_type_id; });
        return m;
    }, [menus]);

    // สร้าง map food_type_id -> food_type_name
    const typeNameMap = React.useMemo(() => {
        const m = {};
        foodTypes.forEach(ft => { m[ft.food_type_id] = ft.food_type_name; });
        return m;
    }, [foodTypes]);

    // สรุปข้อมูลตามประเภท
    const summary = React.useMemo(() => {
        // { [typeId]: { name, totalQty, totalRevenue, items: { [name]: { qty, price } } } }
        const data = {};

        orders.forEach(order => {
            let items = [];
            try { items = JSON.parse(order.items_json); } catch { }

            items.forEach(item => {
                const typeId = menuTypeMap[item.id] || 0;
                const typeName = typeNameMap[typeId] || 'อื่นๆ';

                if (!data[typeId]) {
                    data[typeId] = { name: typeName, typeId, totalQty: 0, totalRevenue: 0, items: {} };
                }
                data[typeId].totalQty += item.qty;
                data[typeId].totalRevenue += item.qty * (item.price || 0);

                if (!data[typeId].items[item.name]) {
                    data[typeId].items[item.name] = { qty: 0, price: item.price || 0 };
                }
                data[typeId].items[item.name].qty += item.qty;
            });
        });

        return Object.values(data).sort((a, b) => b.totalQty - a.totalQty);
    }, [orders, menuTypeMap, typeNameMap]);

    const totalItems = summary.reduce((s, c) => s + c.totalQty, 0);
    const totalRevenue = summary.reduce((s, c) => s + c.totalRevenue, 0);

    const chartSegments = summary.map((cat, i) => ({
        label: cat.name,
        value: cat.totalQty,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

    const barData = summary.map((cat, i) => ({
        label: cat.name,
        value: cat.totalQty,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

    if (!authChecked) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="h-16 bg-[#1a1a1a] text-white flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <img
                        src={`${API_BASE_URL}/imgs/11bkt.png`}
                        alt="Bukkaty Logo"
                        className="w-10 h-10 rounded-full border border-red-600 object-cover bg-white"
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div>
                        <h1 className="font-bold text-lg leading-none">BUKKATY</h1>
                        <span className="text-[10px] text-red-500 font-bold uppercase">สรุปรายการสั่ง</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Live indicator */}
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-900/40 border border-emerald-700/50 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-emerald-400 text-[10px] font-bold">LIVE</span>
                    </div>

                    <button
                        onClick={() => router.push('/menu')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        กลับหน้าเมนู
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8">

                {/* Title */}
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-gray-900">แดชบอร์ดสรุปรายการสั่ง</h2>
                    <p className="text-gray-500 text-sm mt-1">สรุปจำนวนและประเภทของรายการที่สั่งทั้งหมด</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                        <span className="ml-4 text-gray-500 text-lg">กำลังโหลดข้อมูล...</span>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <p className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1">ออเดอร์ทั้งหมด</p>
                                <p className="text-3xl font-black text-gray-900">{orders.length}</p>
                                <p className="text-xs text-gray-400 mt-1">รายการ</p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">จำนวนสิ่งที่สั่ง</p>
                                <p className="text-3xl font-black text-gray-900">{totalItems}</p>
                                <p className="text-xs text-gray-400 mt-1">ชิ้น/ถ้วย</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">รายได้รวม</p>
                                <p className="text-3xl font-black text-gray-900">{totalRevenue.toLocaleString()}</p>
                                <p className="text-xs text-gray-400 mt-1">บาท</p>
                            </div>
                        </div>

                        {summary.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <p className="text-xl font-bold text-gray-500">ยังไม่มีข้อมูลการสั่ง</p>
                            </div>
                        ) : (
                            <>
                                {/* Charts Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">

                                    {/* Donut Chart */}
                                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                        <h3 className="font-bold text-gray-800 mb-4 text-base">สัดส่วนตามประเภท</h3>
                                        <div className="flex items-center gap-6 flex-wrap justify-center">
                                            <div className="shrink-0">
                                                <DonutChart segments={chartSegments} size={200} />
                                            </div>
                                            {/* Legend */}
                                            <div className="flex flex-col gap-2 min-w-[120px]">
                                                {chartSegments.map((seg, i) => {
                                                    const pct = totalItems > 0 ? ((seg.value / totalItems) * 100).toFixed(1) : '0.0';
                                                    return (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
                                                            <span className="text-xs text-gray-700 font-medium">{seg.label}</span>
                                                            <span className="text-xs text-gray-400 ml-auto">{pct}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bar Chart */}
                                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                        <h3 className="font-bold text-gray-800 mb-4 text-base">จำนวนที่สั่งตามประเภท</h3>
                                        <BarChart bars={barData} width={460} height={200} />
                                    </div>
                                </div>

                                {/* Category Detail Cards */}
                                <h3 className="font-bold text-gray-800 text-base mb-4">รายละเอียดตามประเภท</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                                    {summary.map((cat, i) => {
                                        const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                                        const pct = totalItems > 0 ? ((cat.totalQty / totalItems) * 100).toFixed(1) : '0.0';

                                        // เรียง item ตาม qty มากสุดก่อน
                                        const sortedItems = Object.entries(cat.items)
                                            .sort(([, a], [, b]) => b.qty - a.qty);

                                        return (
                                            <div key={cat.typeId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                                {/* Card Header */}
                                                <div className="px-5 py-4 flex items-center justify-between" style={{ borderLeft: `4px solid ${color}` }}>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-base">{cat.name}</h4>
                                                        <p className="text-xs text-gray-400 mt-0.5">{sortedItems.length} รายการ · {pct}% ของทั้งหมด</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black" style={{ color }}>{cat.totalQty}</p>
                                                        <p className="text-[10px] text-gray-400">ชิ้น/ถ้วย</p>
                                                    </div>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="px-5 pb-3">
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{ width: `${pct}%`, backgroundColor: color }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Item List */}
                                                <div className="px-5 pb-5 space-y-2 max-h-48 overflow-y-auto">
                                                    {sortedItems.map(([name, info], j) => {
                                                        const itemPct = cat.totalQty > 0 ? (info.qty / cat.totalQty) * 100 : 0;
                                                        return (
                                                            <div key={j} className="flex items-center gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex justify-between items-center mb-0.5">
                                                                        <span className="text-xs text-gray-700 font-medium truncate pr-2">{name}</span>
                                                                        <span className="text-xs font-bold shrink-0" style={{ color }}>{info.qty} ชิ้น</span>
                                                                    </div>
                                                                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full rounded-full"
                                                                            style={{ width: `${itemPct}%`, backgroundColor: color, opacity: 0.5 }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Footer revenue */}
                                                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 font-medium">รายได้จากประเภทนี้</span>
                                                    <span className="text-sm font-black text-gray-900">{cat.totalRevenue.toLocaleString()} ฿</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
