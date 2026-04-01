"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffNavbar from '@/app/components/StaffNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AddMenuPage() {
    const router = useRouter();
    const [foodTypes, setFoodTypes] = useState([]);
    const [menuName, setMenuName] = useState('');
    const [price, setPrice] = useState('');
    const [foodTypeId, setFoodTypeId] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const API_BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        const fetchFoodTypes = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/food_types/all`);
                const data = await res.json();
                if (!data.isError) {
                    setFoodTypes(data.data);
                    if (data.data.length > 0) setFoodTypeId(data.data[0].food_type_id);
                }
            } catch (err) {
                console.error('Error fetching food types:', err);
            }
        };
        fetchFoodTypes();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('menu_name', menuName);
            formData.append('price', price);
            formData.append('food_type_id', foodTypeId);
            if (imageFile) formData.append('file', imageFile);

            const response = await fetch(`${API_BASE_URL}/api/menu/add`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (result.isError) {
                setError(result.message || 'เกิดข้อผิดพลาดในการเพิ่มเมนู');
            } else {
                setSuccess('เพิ่มเมนูสำเร็จ!');
                setMenuName('');
                setPrice('');
                setImageFile(null);
                setPreviewUrl('');
            }
        } catch (err) {
            setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
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
                        {success && (
                            <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm font-medium flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="menuName">ชื่อเมนู</Label>
                                <Input
                                    id="menuName"
                                    type="text"
                                    value={menuName}
                                    onChange={(e) => setMenuName(e.target.value)}
                                    required
                                    placeholder="เช่น กุ้งแม่น้ำสด"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="price">ราคา (฿)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    min="0"
                                    placeholder="0"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="foodType">หมวดหมู่</Label>
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
                                {loading ? 'กำลังเพิ่ม...' : 'เพิ่มเมนู'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
