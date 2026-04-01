"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function MenuPage() {
    const router = useRouter();
    const [menus, setMenus] = useState([]);
    const [foodTypes, setFoodTypes] = useState([]);
    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [tableNo, setTableNo] = useState("01");
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false); // mobile cart drawer

    const API_BASE_URL = 'http://localhost:8080';

    const fetchData = useCallback(async () => {
        try {
            const resTypes = await fetch(`${API_BASE_URL}/api/food_types/all`);
            const typeData = await resTypes.json();
            if (!typeData.isError) {
                const priorityOrder = ["เมนูน้ำซุป","น้ำซุป","เมนูชาบู","ชาบู","เมนูซาลาเปา","ซาลาเปา"];
                const sortedTypes = typeData.data.sort((a, b) => {
                    const iA = priorityOrder.indexOf(a.food_type_name);
                    const iB = priorityOrder.indexOf(b.food_type_name);
                    if (iA !== -1 && iB !== -1) return iA - iB;
                    if (iA !== -1) return -1;
                    if (iB !== -1) return 1;
                    return a.food_type_id - b.food_type_id;
                });
                setFoodTypes(sortedTypes);
            }
            const resMenu = await fetch(`${API_BASE_URL}/api/menu/all`);
            const menuData = await resMenu.json();
            if (!menuData.isError) setMenus(menuData.data);
        } catch (err) {
            console.error("API Error:", err);
            setFoodTypes([{ food_type_id: 1, food_type_name: "น้ำซุป" }]);
            setMenus([{ menu_id: 101, food_type_id: 1, menu_name: "ซุปน้ำดำ", price: 0, image_url: "soup1.jpg" }]);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const stashedTable = sessionStorage.getItem('table_number');
        if (stashedTable) setTableNo(stashedTable);
    }, [fetchData]);

    useEffect(() => {
        const sum = cart.reduce((total, item) => total + (item.price * item.qty), 0);
        setTotalPrice(sum);
    }, [cart]);

    // ล็อก scroll body เมื่อเปิด cart บน mobile
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isCartOpen]);

    const addToCart = (item) => {
        setCart(prev => {
            const exist = prev.find(i => i.id === item.menu_id);
            if (exist) return prev.map(i => i.id === item.menu_id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { id: item.menu_id, name: item.menu_name, price: item.price, qty: 1, img: item.image_url }];
        });
    };

    const groupedMenus = menus.reduce((acc, menu) => {
        const id = menu.food_type_id;
        if (!acc[id]) acc[id] = [];
        acc[id].push(menu);
        return acc;
    }, {});

    const handleIncrease = (id) => setCart(cart.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item));
    const handleDecrease = (id, qty) => qty > 1
        ? setCart(cart.map(item => item.id === id ? { ...item, qty: item.qty - 1 } : item))
        : handleRemove(id);
    const handleRemove = (id) => setCart(cart.filter(item => item.id !== id));

    const handleSubmitOrder = async () => {
        if (cart.length === 0) return;
        setSubmitting(true);
        setSubmitStatus(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table_name: tableNo, table_no: tableNo, customer_name: '', items: cart, total_price: totalPrice }),
            });
            const result = await response.json();
            if (result.isError) {
                setErrorMsg(result.errorMessage || 'เกิดข้อผิดพลาด');
                setSubmitStatus('error');
            } else {
                setSubmitStatus('success');
                setCart([]);
                setIsCartOpen(false);
            }
        } catch {
            setErrorMsg('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
            setSubmitStatus('error');
        } finally {
            setSubmitting(false);
        }
    };

    const totalQty = cart.reduce((s, i) => s + i.qty, 0);

    // ---- Cart content (shared between sidebar and drawer) ----
    const CartContent = () => (
        <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-sm">ยังไม่ได้เลือกเมนู</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="flex gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm items-center">
                            <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                                <img src={`${API_BASE_URL}/imgs/${item.img}`} className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} alt={item.name} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold leading-snug break-words">{item.name}</p>
                                <p className="text-red-600 text-xs font-bold mt-0.5">{(item.price * item.qty).toLocaleString()} ฿</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <button onClick={() => handleRemove(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg p-1">
                                    <button onClick={() => handleDecrease(item.id, item.qty)}
                                        className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:bg-gray-100 transition-colors">−</button>
                                    <span className="text-xs font-bold text-gray-700 w-5 text-center">{item.qty}</span>
                                    <button onClick={() => handleIncrease(item.id)}
                                        className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:bg-gray-100 transition-colors">+</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                <div className="flex justify-between mb-3 items-center">
                    <span className="text-gray-400 font-bold uppercase text-xs">ยอดรวม</span>
                    <span className="text-2xl font-black text-red-600">{totalPrice.toLocaleString()} ฿</span>
                </div>
                <button
                    disabled={cart.length === 0 || submitting}
                    onClick={handleSubmitOrder}
                    className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all ${cart.length > 0 && !submitting ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                    {submitting ? 'กำลังส่ง...' : 'ส่งรายการสั่ง'}
                </button>
            </div>
        </>
    );

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans">

            {/* Popup สำเร็จ */}
            {submitStatus === 'success' && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center w-full max-w-sm">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-1">ส่งรายการสำเร็จ!</h3>
                        <p className="text-gray-500 text-sm text-center mb-6">รายการของคุณถูกส่งไปยังครัวแล้ว กรุณารอสักครู่</p>
                        <button onClick={() => setSubmitStatus(null)} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">ตกลง</button>
                    </div>
                </div>
            )}

            {/* Popup ไม่สำเร็จ */}
            {submitStatus === 'error' && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center w-full max-w-sm">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-1">ส่งรายการไม่สำเร็จ</h3>
                        <p className="text-gray-500 text-sm text-center mb-6">{errorMsg || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'}</p>
                        <button onClick={() => setSubmitStatus(null)} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">ลองใหม่</button>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="h-14 md:h-16 bg-[#1a1a1a] text-white flex items-center justify-between px-4 md:px-6 shrink-0 z-50">
                <div className="flex items-center gap-2 md:gap-3">
                    <img src={`${API_BASE_URL}/imgs/11bkt.png`} alt="Bukkaty Logo"
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-red-600 object-cover bg-white" />
                    <div>
                        <h1 className="font-bold text-base md:text-lg leading-none">BUKKATY</h1>
                        <span className="text-[9px] md:text-[10px] text-red-500 font-bold uppercase">TABLE: {tableNo}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* ปุ่มตะกร้า mobile only */}
                    <button onClick={() => setIsCartOpen(true)}
                        className="md:hidden relative flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        ตะกร้า
                        {totalQty > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-400 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                                {totalQty}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Layout หลัก */}
            <div className="flex flex-1 overflow-hidden">

                {/* เมนูอาหาร */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 pb-20 md:pb-6">
                    {foodTypes.map(type => (
                        <section key={type.food_type_id} className="mb-8 md:mb-10">
                            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 border-l-4 border-red-600 pl-3">{type.food_type_name}</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 lg:gap-6">
                                {(groupedMenus[type.food_type_id] || []).map(item => (
                                    <div key={item.menu_id} className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                                        <div className="w-full aspect-square bg-gray-100 rounded-xl mb-2 md:mb-3 overflow-hidden">
                                            <img src={`${API_BASE_URL}/imgs/${item.image_url}`} alt={item.menu_name}
                                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                                onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} />
                                        </div>
                                        <span className="text-xs md:text-sm font-bold text-gray-700 text-center w-full leading-snug break-words">
                                            {item.menu_name}
                                        </span>
                                        <span className="text-red-600 font-bold my-1.5 md:my-2 text-sm md:text-base shrink-0">
                                            {Number(item.price).toLocaleString()} ฿
                                        </span>
                                        <button onClick={() => addToCart(item)}
                                            className="w-full bg-black text-white py-1.5 md:py-2 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md text-sm md:text-base">
                                            +
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </main>

                {/* Sidebar ตะกร้า — desktop only */}
                <aside className="hidden md:flex w-80 lg:w-96 bg-white border-l border-gray-200 flex-col shrink-0 shadow-2xl z-40">
                    <div className="p-4 lg:p-5 border-b border-gray-100 shrink-0">
                        <h2 className="font-bold text-base lg:text-lg">รายการที่เลือก ({totalQty})</h2>
                    </div>
                    <CartContent />
                </aside>
            </div>

            {/* Sticky bottom bar — mobile only เมื่อมีของในตะกร้า */}
            {totalQty > 0 && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white border-t border-gray-200 shadow-lg">
                    <button onClick={() => setIsCartOpen(true)}
                        className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-between px-5 hover:bg-green-700 transition-colors">
                        <span className="bg-white/20 rounded-lg px-2 py-0.5 text-xs font-black">{totalQty} รายการ</span>
                        <span>ดูตะกร้า</span>
                        <span className="font-black">{totalPrice.toLocaleString()} ฿</span>
                    </button>
                </div>
            )}

            {/* Cart Drawer — mobile only */}
            {isCartOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    {/* backdrop */}
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} />
                    {/* drawer */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl flex flex-col"
                        style={{ maxHeight: '88vh' }}>
                        {/* drawer handle + header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                            <div className="w-10 h-1 bg-gray-200 rounded-full absolute left-1/2 -translate-x-1/2 top-2" />
                            <h2 className="font-bold text-base mt-1">รายการที่เลือก ({totalQty})</h2>
                            <button onClick={() => setIsCartOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <CartContent />
                    </div>
                </div>
            )}
        </div>
    );
}
