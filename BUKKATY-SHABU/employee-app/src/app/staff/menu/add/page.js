"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffNavbar from '@/app/components/StaffNavbar';

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
                console.error("Error fetching food types:", err);
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
                body: formData
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
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
            <StaffNavbar />

            <main className="max-w-2xl mx-auto px-6 py-8">
                {/* Back */}
                <button onClick={() => router.push('/staff/menu')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium">กลับ</span>
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-black tracking-tight">เพิ่มเมนูใหม่</h2>
                    <p className="text-gray-500 text-sm mt-1">กรอกข้อมูลเมนูอาหารที่ต้องการเพิ่ม</p>
                </div>

                {/* Alerts */}
                {success && (
                    <div className="mb-6 px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 space-y-5">
                    {/* ชื่อเมนู */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">ชื่อเมนู</label>
                        <input
                            type="text"
                            value={menuName}
                            onChange={(e) => setMenuName(e.target.value)}
                            required
                            placeholder="เช่น กุ้งสดแม่น้ำ"
                            className="w-full px-4 py-3 bg-[#111] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors"
                        />
                    </div>

                    {/* ราคา */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">ราคา (฿)</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            min="0"
                            placeholder="0"
                            className="w-full px-4 py-3 bg-[#111] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors"
                        />
                    </div>

                    {/* หมวดหมู่ */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">หมวดหมู่</label>
                        <select
                            value={foodTypeId}
                            onChange={(e) => setFoodTypeId(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-[#111] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-600 transition-colors"
                        >
                            {foodTypes.map(type => (
                                <option key={type.food_type_id} value={type.food_type_id}>
                                    {type.food_type_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* รูปภาพ */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">รูปภาพ</label>
                        <div className="flex items-center gap-4">
                            <label className="flex-1 cursor-pointer">
                                <div className="px-4 py-3 bg-[#111] border border-dashed border-gray-600 rounded-xl text-center text-gray-500 hover:border-red-600 hover:text-red-400 transition-colors">
                                    {imageFile ? imageFile.name : 'คลิกเพื่อเลือกรูปภาพ'}
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                            {previewUrl && (
                                <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-700 shrink-0">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                            loading
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                        }`}
                    >
                        {loading ? 'กำลังเพิ่ม...' : 'เพิ่มเมนู'}
                    </button>
                </form>
            </main>
        </div>
    );
}
