"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffNavbar from '@/app/components/StaffNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
                    fetch(`${API_BASE_URL}/api/food_types/all`),
                ]);
                const menuData = await resMenu.json();
                const typeData = await resTypes.json();
                if (!menuData.isError) setMenus(menuData.data);
                if (!typeData.isError) setFoodTypes(typeData.data);
            } catch (err) {
                console.error('Error fetching data:', err);
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
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (result.isError) {
                setError(result.message || 'เกิดข้อผิดพลาดในการแก้ไข');
            } else {
                setSuccess('แก้ไขเมนูสำเร็จ!');
                setMenus((prev) =>
                    prev.map((m) =>
                        m.menu_id === selectedMenu.menu_id
                            ? { ...m, menu_name: menuName, price: Number(price), food_type_id: Number(foodTypeId) }
                            : m
                    )
                );
            }
        } catch (err) {
            setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        } finally {
            setLoading(false);
        }
    };

    const getTypeName = (typeId) => {
        const found = foodTypes.find((t) => t.food_type_id === typeId);
        return found ? found.food_type_name : '';
    };

    const filteredMenus = menus.filter((m) =>
        m.menu_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedMenus = filteredMenus.reduce((acc, menu) => {
        const typeName = getTypeName(menu.food_type_id) || 'อื่นๆ';
        if (!acc[typeName]) acc[typeName] = [];
        acc[typeName].push(menu);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50">
            <StaffNavbar />
            <main className="max-w-6xl mx-auto px-6 py-10">
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
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">แก้ไขเมนู</h2>
                    <p className="text-muted-foreground text-sm mt-1">เลือกเมนูที่ต้องการแก้ไขจากรายการด้านล่าง</p>
                </div>

                <div className="flex gap-6 flex-col lg:flex-row">
                    {/* Menu List */}
                    <div className="flex-1 min-w-0">
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ค้นหาเมนู..."
                            className="mb-3"
                        />
                        <Card className="shadow-sm overflow-hidden">
                            <div className="max-h-[560px] overflow-y-auto divide-y divide-border">
                                {Object.entries(groupedMenus).map(([typeName, items]) => (
                                    <div key={typeName}>
                                        <div className="px-4 py-2 bg-muted sticky top-0 z-10">
                                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{typeName}</span>
                                        </div>
                                        {items.map((item) => (
                                            <button
                                                key={item.menu_id}
                                                onClick={() => selectMenuItem(item)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                                                    selectedMenu?.menu_id === item.menu_id
                                                        ? 'bg-primary/5 border-l-2 border-l-primary'
                                                        : ''
                                                }`}
                                            >
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                                                    <img
                                                        src={`${API_BASE_URL}/imgs/${item.image_url}`}
                                                        alt={item.menu_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate text-foreground">{item.menu_name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.price} ฿</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ))}
                                {filteredMenus.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground text-sm">ไม่พบเมนู</div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Edit Form */}
                    <div className="w-full lg:w-96 shrink-0">
                        {!selectedMenu ? (
                            <Card className="shadow-sm">
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    <p className="font-semibold text-sm">เลือกเมนูที่ต้องการแก้ไข</p>
                                    <p className="text-xs mt-1">คลิกที่รายการเมนูด้านซ้าย</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-bold">แก้ไข: {selectedMenu.menu_name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {success && (
                                        <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm font-medium">
                                            ✓ {success}
                                        </div>
                                    )}
                                    {error && (
                                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                                            ✕ {error}
                                        </div>
                                    )}
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label>ชื่อเมนู</Label>
                                            <Input type="text" value={menuName} onChange={(e) => setMenuName(e.target.value)} required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>ราคา (฿)</Label>
                                            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>หมวดหมู่</Label>
                                            <select
                                                value={foodTypeId}
                                                onChange={(e) => setFoodTypeId(e.target.value)}
                                                required
                                                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                            >
                                                {foodTypes.map((type) => (
                                                    <option key={type.food_type_id} value={type.food_type_id}>
                                                        {type.food_type_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>รูปภาพ</Label>
                                            <div className="flex items-center gap-3">
                                                <label className="flex-1 cursor-pointer">
                                                    <div className="h-9 px-3 flex items-center rounded-md border border-dashed border-input bg-background text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                                                        {imageFile ? imageFile.name : 'เปลี่ยนรูปภาพ'}
                                                    </div>
                                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                                </label>
                                                {previewUrl && (
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0">
                                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                                            {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
