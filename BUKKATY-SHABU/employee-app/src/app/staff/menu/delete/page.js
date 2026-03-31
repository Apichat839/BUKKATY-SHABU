"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffNavbar from '@/app/components/StaffNavbar';

export default function DeleteMenuPage() {
    const router = useRouter();
    const [menus, setMenus] = useState([]);
    const [foodTypes, setFoodTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmId, setConfirmId] = useState(null);

    const API_BASE_URL = 'http://localhost:8080';

    const fetchData = async () => {
        try {
            const [resMenu, resTypes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/menu/all`),
                fetch(`${API_BASE_URL}/api/food_types/all`)
            ]);
            const menuData = await resMenu.json();
            const typeData = await resTypes.json();
            if (!menuData.isError) setMenus(menuData.data);
            if (!typeData.isError) setFoodTypes(typeData.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (menuId) => {
        setDeleting(menuId);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/menu/delete/${menuId}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (result.isError) {
                setError(result.message || 'เกิดข้อผิดพลาดในการลบ');
            } else {
                setSuccess('ลบเมนูสำเร็จ!');
                setMenus(prev => prev.filter(m => m.menu_id !== menuId));
            }
        } catch (err) {
            setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        } finally {
            setDeleting(null);
            setConfirmId(null);
        }
    };

    const getTypeName = (typeId) => {
        const found = foodTypes.find(t => t.food_type_id === typeId);
        return found ? found.food_type_name : 'อื่นๆ';
    };

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
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
            <StaffNavbar />

            <main className="max-w-4xl mx-auto px-6 py-8">
                <button onClick={() => router.push('/staff/menu')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium">กลับ</span>
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-black tracking-tight">ลบเมนู</h2>
                    <p className="text-gray-500 text-sm mt-1">เลือกเมนูที่ต้องการลบออกจากระบบ</p>
                </div>

                {/* Alerts */}
                {success && (
                    <div className="mb-6 px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-bold flex items-center gap-2">
                        ✓ {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold flex items-center gap-2">
                        ✕ {error}
                    </div>
                )}

                {/* Search */}
                <div className="mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ค้นหาเมนู..."
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors"
                    />
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Menu List */}
                {!loading && (
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden">
                        {Object.entries(groupedMenus).map(([typeName, items]) => (
                            <div key={typeName}>
                                <div className="px-5 py-3 bg-[#111] border-b border-gray-800">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{typeName}</span>
                                    <span className="text-xs text-gray-600 ml-2">({items.length} รายการ)</span>
                                </div>
                                <div className="divide-y divide-gray-800/50">
                                    {items.map(item => (
                                        <div key={item.menu_id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                                            {/* Image */}
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 shrink-0 border border-gray-700">
                                                <img
                                                    src={`${API_BASE_URL}/imgs/${item.image_url}`}
                                                    alt={item.menu_name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate">{item.menu_name}</p>
                                                <p className="text-sm text-gray-500">{item.price} ฿</p>
                                            </div>

                                            {/* Delete / Confirm */}
                                            {confirmId === item.menu_id ? (
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs text-red-400 font-bold">ยืนยันลบ?</span>
                                                    <button
                                                        onClick={() => handleDelete(item.menu_id)}
                                                        disabled={deleting === item.menu_id}
                                                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                                                    >
                                                        {deleting === item.menu_id ? '...' : 'ลบ'}
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmId(null)}
                                                        className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 text-xs font-bold hover:bg-gray-600 transition-colors"
                                                    >
                                                        ยกเลิก
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmId(item.menu_id)}
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600/20 border border-red-700/30 text-red-400 text-xs font-bold hover:bg-red-600 hover:text-white transition-all shrink-0"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    ลบ
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {filteredMenus.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                <p className="font-bold">ไม่พบเมนู</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
