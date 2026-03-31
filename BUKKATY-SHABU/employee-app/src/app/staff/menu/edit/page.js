"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffNavbar from '@/app/components/StaffNavbar';

export default function EditMenuPage() {
    const router = useRouter();
    const [menus, setMenus] = useState([]);
    const [foodTypes, setFoodTypes] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [menuName, setMenuName] = useState('');
    const [price, setPrice] = useState('');
    const [foodTypeId, setFoodTypeId] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const API_BASE_URL = 'http://localhost:8080';

    useEffect(() => {
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
            }
        };
        fetchData();
    }, []);

    const selectMenuItem = (item) => {
        setSelectedMenu(item);
        setMenuName(item.menu_name);
        setPrice(String(item.price));
        setFoodTypeId(String(item.food_type_id));
        setPreviewUrl(`${API_BASE_URL}/imgs/${item.image_url}`);
        setImageFile(null);
        setSuccess('');
        setError('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMenu) return;
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('menu_name', menuName);
            formData.append('price', price);
            formData.append('food_type_id', foodTypeId);
            if (imageFile) formData.append('file', imageFile);

            const response = await fetch(`${API_BASE_URL}/api/menu/update/${selectedMenu.menu_id}`, {
                method: 'PUT',
                body: formData
            });

            const result = await response.json();
            if (result.isError) {
                setError(result.message || 'เกิดข้อผิดพลาดในการแก้ไข');
            } else {
                setSuccess('แก้ไขเมนูสำเร็จ!');
                // อัปเดตรายการในลิสต์
                setMenus(prev => prev.map(m =>
                    m.menu_id === selectedMenu.menu_id
                        ? { ...m, menu_name: menuName, price: Number(price), food_type_id: Number(foodTypeId) }
                        : m
                ));
            }
        } catch (err) {
            setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        } finally {
            setLoading(false);
        }
    };

    const getTypeName = (typeId) => {
        const found = foodTypes.find(t => t.food_type_id === typeId);
        return found ? found.food_type_name : '';
    };

    const filteredMenus = menus.filter(m =>
        m.menu_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // จัดกลุ่มตามหมวดหมู่
    const groupedMenus = filteredMenus.reduce((acc, menu) => {
        const typeName = getTypeName(menu.food_type_id) || 'อื่นๆ';
        if (!acc[typeName]) acc[typeName] = [];
        acc[typeName].push(menu);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
            <StaffNavbar />

            <main className="max-w-6xl mx-auto px-6 py-8">
                <button onClick={() => router.push('/staff/menu')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium">กลับ</span>
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-black tracking-tight">แก้ไขเมนู</h2>
                    <p className="text-gray-500 text-sm mt-1">เลือกเมนูที่ต้องการแก้ไขจากรายการด้านล่าง</p>
                </div>

                <div className="flex gap-6 flex-col lg:flex-row">
                    {/* Left: Menu List */}
                    <div className="flex-1 min-w-0">
                        <div className="mb-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ค้นหาเมนู..."
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors"
                            />
                        </div>

                        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden max-h-[600px] overflow-y-auto">
                            {Object.entries(groupedMenus).map(([typeName, items]) => (
                                <div key={typeName}>
                                    <div className="px-4 py-2 bg-[#111] border-b border-gray-800 sticky top-0 z-10">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{typeName}</span>
                                    </div>
                                    {items.map(item => (
                                        <button
                                            key={item.menu_id}
                                            onClick={() => selectMenuItem(item)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-800/50 hover:bg-white/[0.03] transition-colors ${
                                                selectedMenu?.menu_id === item.menu_id ? 'bg-red-600/10 border-l-4 border-l-red-600' : ''
                                            }`}
                                        >
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                                                <img
                                                    src={`${API_BASE_URL}/imgs/${item.image_url}`}
                                                    alt={item.menu_name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{item.menu_name}</p>
                                                <p className="text-xs text-gray-500">{item.price} ฿</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Edit Form */}
                    <div className="w-full lg:w-96 shrink-0">
                        {!selectedMenu ? (
                            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 text-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                <p className="font-bold">เลือกเมนูที่ต้องการแก้ไข</p>
                                <p className="text-sm mt-1">คลิกที่รายการเมนูด้านซ้าย</p>
                            </div>
                        ) : (
                            <>
                                {success && (
                                    <div className="mb-4 px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-bold">✓ {success}</div>
                                )}
                                {error && (
                                    <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold">✕ {error}</div>
                                )}

                                <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 space-y-5">
                                    <h3 className="font-bold text-lg border-b border-gray-800 pb-3">แก้ไข: {selectedMenu.menu_name}</h3>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">ชื่อเมนู</label>
                                        <input type="text" value={menuName} onChange={(e) => setMenuName(e.target.value)} required
                                            className="w-full px-4 py-3 bg-[#111] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-600 transition-colors" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">ราคา (฿)</label>
                                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0"
                                            className="w-full px-4 py-3 bg-[#111] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-600 transition-colors" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">หมวดหมู่</label>
                                        <select value={foodTypeId} onChange={(e) => setFoodTypeId(e.target.value)} required
                                            className="w-full px-4 py-3 bg-[#111] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-600 transition-colors">
                                            {foodTypes.map(type => (
                                                <option key={type.food_type_id} value={type.food_type_id}>{type.food_type_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">รูปภาพ</label>
                                        <div className="flex items-center gap-3">
                                            <label className="flex-1 cursor-pointer">
                                                <div className="px-4 py-3 bg-[#111] border border-dashed border-gray-600 rounded-xl text-center text-gray-500 hover:border-red-600 transition-colors text-sm">
                                                    {imageFile ? imageFile.name : 'เปลี่ยนรูปภาพ'}
                                                </div>
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                            </label>
                                            {previewUrl && (
                                                <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-700 shrink-0">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading}
                                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${loading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.98]'}`}>
                                        {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
