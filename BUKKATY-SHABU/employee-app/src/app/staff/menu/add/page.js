"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffNavbar from '@/app/components/StaffNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_BASE_URL = 'http://localhost:8080';

export default function AddMenuPage() {
    const router = useRouter();
    const [foodTypes, setFoodTypes] = useState([]);
    const [menuName, setMenuName] = useState('');
    const [price, setPrice] = useState('');
    const [foodTypeId, setFoodTypeId] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // null | 'success' | 'error'
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/food_types/all`)
            .then(r => r.json())
            .then(data => {
                if (!data.isError && data.data.length > 0) {
                    setFoodTypes(data.data);
                    setFoodTypeId(String(data.data[0].food_type_id));
                }
            })
            .catch(() => {});
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setMenuName('');
        setPrice('');
        setImageFile(null);
        setPreviewUrl('');
        if (foodTypes.length > 0) setFoodTypeId(String(foodTypes[0].food_type_id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!menuName.trim() || !price || !foodTypeId) return;

        setLoading(true);
        setStatus(null);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // timeout 10s

        try {
            const formData = new FormData();
            formData.append('menu_name', menuName.trim());
            formData.append('price', price);
            formData.append('food_type_id', foodTypeId);
            if (imageFile) formData.append('file', imageFile);

            const response = await fetch(`${API_BASE_URL}/api/menu/add`, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();

            if (result.isError) {
                setStatus('error');
                setStatusMsg(result.errorMessage || result.message || 'เกิดข้อผิดพลาดในการเพิ่มเมนู');
            } else {
                setStatus('success');
                setStatusMsg(`เพิ่มเมนู "${menuName.trim()}" สำเร็จแล้ว`);
                resetForm();
            }
        } catch (err) {
            clearTimeout(timeout);
            if (err.name === 'AbortError') {
                setStatus('error');
                setStatusMsg('หมดเวลาเชื่อมต่อ — ตรวจสอบว่า Backend Server (port 8080) รันอยู่');
            } else {
                setStatus('error');
                setStatusMsg(`ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (${err.message})`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <StaffNavbar />
            <main className="max-w-xl mx-auto px-6 py-10">
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

                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold">เพิ่มเมนูใหม่</CardTitle>
                        <p className="text-muted-foreground text-sm">กรอกข้อมูลเมนูอาหารที่ต้องการเพิ่ม</p>
                    </CardHeader>
                    <CardContent>

                        {/* Alert */}
                        {status === 'success' && (
                            <div className="mb-5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p>{statusMsg}</p>
                                    <button
                                        onClick={() => router.push('/staff/menu')}
                                        className="text-emerald-600 underline text-xs mt-1 hover:text-emerald-800"
                                    >
                                        กลับหน้าจัดการเมนู
                                    </button>
                                </div>
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {statusMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* ชื่อเมนู */}
                            <div className="space-y-1.5">
                                <Label htmlFor="menuName">ชื่อเมนู <span className="text-red-500">*</span></Label>
                                <Input
                                    id="menuName"
                                    type="text"
                                    value={menuName}
                                    onChange={(e) => setMenuName(e.target.value)}
                                    required
                                    placeholder="เช่น กุ้งแม่น้ำสด"
                                />
                            </div>

                            {/* ราคา */}
                            <div className="space-y-1.5">
                                <Label htmlFor="price">ราคา (฿) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                />
                            </div>

                            {/* หมวดหมู่ */}
                            <div className="space-y-1.5">
                                <Label htmlFor="foodType">หมวดหมู่ <span className="text-red-500">*</span></Label>
                                <select
                                    id="foodType"
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

                            {/* รูปภาพ */}
                            <div className="space-y-1.5">
                                <Label>รูปภาพ</Label>
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 cursor-pointer">
                                        <div className="h-9 px-3 flex items-center rounded-md border border-dashed border-input bg-background text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                                            {imageFile ? imageFile.name : 'คลิกเพื่อเลือกรูปภาพ'}
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                    {previewUrl && (
                                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-border shrink-0">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        กำลังเพิ่ม...
                                    </span>
                                ) : 'เพิ่มเมนู'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
