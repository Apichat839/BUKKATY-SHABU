"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffNavbar from '@/app/components/StaffNavbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const API_BASE_URL = 'http://localhost:8080';

export default function DeleteMenuPage() {
    const router = useRouter();
    const [menus, setMenus] = useState([]);
    const [foodTypes, setFoodTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [statusMap, setStatusMap] = useState({}); // { [menuId]: { type: 'success'|'error', msg } }
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmId, setConfirmId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resMenu, resTypes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/menu/all`),
                    fetch(`${API_BASE_URL}/api/food_types/all`),
                ]);
                const [menuData, typeData] = await Promise.all([resMenu.json(), resTypes.json()]);
                if (!menuData.isError) setMenus(menuData.data);
                if (!typeData.isError) setFoodTypes(typeData.data);
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (menuId, menuName) => {
        setDeleting(menuId);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch(`${API_BASE_URL}/api/menu/delete/${menuId}`, {
                method: 'POST',
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();

            if (result.isError) {
                setStatusMap(prev => ({
                    ...prev,
                    [menuId]: { type: 'error', msg: result.errorMessage || result.message || 'เกิดข้อผิดพลาดในการลบ' },
                }));
            } else {
                // ลบออกจาก state ทันที
                setMenus(prev => prev.filter(m => m.menu_id !== menuId));
                setStatusMap(prev => ({
                    ...prev,
                    [menuId]: { type: 'success', msg: `ลบ "${menuName}" สำเร็จแล้ว` },
                }));
            }
        } catch (err) {
            clearTimeout(timeout);
            const msg = err.name === 'AbortError'
                ? 'หมดเวลาเชื่อมต่อ — ตรวจสอบ Backend Server'
                : `เชื่อมต่อไม่ได้ (${err.message})`;
            setStatusMap(prev => ({
                ...prev,
                [menuId]: { type: 'error', msg },
            }));
        } finally {
            setDeleting(null);
            setConfirmId(null);
        }
    };

    const getTypeName = (typeId) => foodTypes.find(t => t.food_type_id === typeId)?.food_type_name || 'อื่นๆ';

    const filteredMenus = menus.filter(m =>
        m.menu_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedMenus = filteredMenus.reduce((acc, menu) => {
        const typeName = getTypeName(menu.food_type_id);
        if (!acc[typeName]) acc[typeName] = [];
        acc[typeName].push(menu);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50">
            <StaffNavbar />
            <main className="max-w-4xl mx-auto px-6 py-10">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/staff/menu')}
                    className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    กลับ
                </Button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">ลบเมนู</h2>
                    <p className="text-muted-foreground text-sm mt-1">เลือกเมนูที่ต้องการลบออกจากระบบ</p>
                </div>

                <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ค้นหาเมนู..."
                    className="mb-4"
                />

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="ml-3 text-muted-foreground text-sm">กำลังโหลด...</span>
                    </div>
                ) : (
                    <Card className="shadow-sm overflow-hidden">
                        <div className="divide-y divide-border">
                            {Object.entries(groupedMenus).map(([typeName, items]) => (
                                <div key={typeName}>
                                    <div className="px-5 py-2.5 bg-muted flex items-center gap-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{typeName}</span>
                                        <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                                    </div>
                                    <div className="divide-y divide-border">
                                        {items.map((item) => (
                                            <div key={item.menu_id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                                                {/* รูปภาพ */}
                                                <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                                                    <img
                                                        src={`${API_BASE_URL}/imgs/${item.image_url}`}
                                                        alt={item.menu_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>

                                                {/* ชื่อและราคา */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm truncate text-foreground">{item.menu_name}</p>
                                                    <p className="text-xs text-muted-foreground">{Number(item.price).toLocaleString()} ฿</p>
                                                </div>

                                                {/* ปุ่มลบ / ยืนยัน */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {confirmId === item.menu_id ? (
                                                        <>
                                                            <span className="text-xs text-red-600 font-semibold">ยืนยันลบ?</span>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleDelete(item.menu_id, item.menu_name)}
                                                                disabled={deleting === item.menu_id}
                                                                className="h-7 px-3 text-xs"
                                                            >
                                                                {deleting === item.menu_id ? (
                                                                    <span className="flex items-center gap-1">
                                                                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                        ลบ...
                                                                    </span>
                                                                ) : 'ยืนยันลบ'}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setConfirmId(null)}
                                                                className="h-7 px-3 text-xs"
                                                            >
                                                                ยกเลิก
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setConfirmId(item.menu_id)}
                                                            className="h-7 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            ลบ
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {filteredMenus.length === 0 && !loading && (
                                <div className="p-8 text-center text-muted-foreground text-sm">ไม่พบเมนู</div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Toast แจ้งผลด้านล่าง */}
                {Object.entries(statusMap).map(([id, s]) => (
                    <div
                        key={id}
                        className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 z-50 ${
                            s.type === 'success'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-600 text-white'
                        }`}
                        onClick={() => setStatusMap(prev => {
                            const n = { ...prev };
                            delete n[id];
                            return n;
                        })}
                    >
                        {s.type === 'success' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        {s.msg}
                    </div>
                ))}
            </main>
        </div>
    );
}
