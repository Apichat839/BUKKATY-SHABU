"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function MenuPage() {
    const router = useRouter();
    const [menus, setMenus] = useState([]);
    const [foodTypes, setFoodTypes] = useState([]);
    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [tableNo, setTableNo] = useState("01"); // เริ่มต้นตามไฟล์เดิม

    const API_BASE_URL = 'http://localhost:8080';

    // ดึงข้อมูลจาก API พร้อม Logic การเรียงลำดับจากไฟล์เดิม
    const fetchData = useCallback(async () => {
        try {
            // 1. ดึงหมวดหมู่ทั้งหมด
            const resTypes = await fetch(`${API_BASE_URL}/api/food_types/all`);
            const typeData = await resTypes.json();
            
            if (!typeData.isError) {
                // --- ตั้งค่าลำดับ: 1.น้ำซุป, 2.ชาบู, 3.ซาลาเปา ตาม Logic เดิม ---
                const priorityOrder = [
                    "เมนูน้ำซุป", "น้ำซุป", 
                    "เมนูชาบู", "ชาบู", 
                    "เมนูซาลาเปา", "ซาลาเปา"
                ]; 
                
                const sortedTypes = typeData.data.sort((a, b) => {
                    const indexA = priorityOrder.indexOf(a.food_type_name);
                    const indexB = priorityOrder.indexOf(b.food_type_name);

                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                    return a.food_type_id - b.food_type_id;
                });
                
                setFoodTypes(sortedTypes);
            }

            // 2. ดึงเมนูทั้งหมด
            const resMenu = await fetch(`${API_BASE_URL}/api/menu/all`);
            const menuData = await resMenu.json();
            if (!menuData.isError) setMenus(menuData.data);

        } catch (err) {
            console.error("API Error:", err);
            // ข้อมูลสำรองกรณี Error เพื่อไม่ให้หน้าจอว่าง
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

    const addToCart = (item) => {
        setCart(prev => {
            const exist = prev.find(i => i.id === item.menu_id);
            if (exist) {
                return prev.map(i => i.id === item.menu_id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { 
                id: item.menu_id, 
                name: item.menu_name, 
                price: item.price, 
                qty: 1, 
                img: item.image_url 
            }];
        });
    };

    const groupedMenus = menus.reduce((acc, menu) => {
        const id = menu.food_type_id;
        if (!acc[id]) acc[id] = [];
        acc[id].push(menu);
        return acc;
    }, {});

    return (
        /* โครงสร้างหน้าจอหลักตามที่คุณส่งมา (ห้ามแก้) */
        <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans">
            
            {/* Header ส่วนหัว */}
            <header className="h-16 bg-[#1a1a1a] text-white flex items-center justify-between px-6 shrink-0 z-50">
              <div className="flex items-center gap-3">
                  {/* แก้ไขเป็น <img> เพื่อดึงรูป 11bkt.png มาแสดงในวงกลม */}
                  <img 
                      src={`${API_BASE_URL}/imgs/11bkt.png`} 
                      alt="Bukkaty Logo" 
                      className="w-10 h-10 rounded-full border border-red-600 object-cover bg-white" 
                  />
                  <div>
                      <h1 className="font-bold text-lg leading-none">BUKKATY</h1>
                      <span className="text-[10px] text-red-500 font-bold uppercase">TABLE: {tableNo}</span>
                  </div>
              </div>
          </header>

            {/* เนื้อหาหลักแบ่งซ้ายขวา */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* ฝั่งซ้าย: เมนูอาหาร (เลื่อนได้อิสระ) */}
                <main className="flex-1 overflow-y-auto p-6 md:p-10">
                    {foodTypes.map(type => (
                        <section key={type.food_type_id} className="mb-10">
                            <h2 className="text-xl font-bold mb-6 border-l-4 border-red-600 pl-3">{type.food_type_name}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {(groupedMenus[type.food_type_id] || []).map(item => (
                                    <div key={item.menu_id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                                        <div className="w-full aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden">
                                            <img 
                                                src={`${API_BASE_URL}/imgs/${item.image_url}`} 
                                                alt={item.menu_name}
                                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                                onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 line-clamp-1">{item.menu_name}</span>
                                        <span className="text-red-600 font-bold my-2">{item.price} ฿</span>
                                        <button 
                                            onClick={() => addToCart(item)}
                                            className="w-full bg-black text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md"
                                        >
                                            +
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </main>

                {/* ฝั่งขวา: รายการที่เลือก (Sidebar ล็อกติดหน้าจอ) */}
                <aside className="flex w-96 bg-white border-l border-gray-200 flex-col shrink-0 shadow-2xl z-40">
                    <div className="p-5 border-b border-gray-100 shrink-0">
                        <h2 className="font-bold text-lg">รายการที่เลือก ({cart.reduce((s,i)=>s+i.qty,0)})</h2>
                    </div>
                    
                    {/* รายการอาหารในตะกร้า */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <p>ยังไม่ได้เลือกเมนู</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm items-center">
                                    <div className="w-14 h-14 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                                        <img 
                                            src={`${API_BASE_URL}/imgs/${item.img}`} 
                                            className="w-full h-full object-cover" 
                                            onError={(e)=>{e.target.src="https://via.placeholder.com/150";}} 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold line-clamp-1">{item.name}</p>
                                        <p className="text-red-600 text-xs font-bold mt-1">{(item.price * item.qty).toLocaleString()} ฿</p>
                                    </div>
                                    <div className="text-xs font-bold text-gray-400">x{item.qty}</div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* สรุปราคารวมและปุ่มสั่ง */}
                    <div className="p-5 border-t border-gray-100 bg-white shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex justify-between mb-4 items-center">
                            <span className="text-gray-400 font-bold uppercase text-xs">ยอดรวม</span>
                            <span className="text-2xl font-black text-red-600">{totalPrice.toLocaleString()} ฿</span>
                        </div>
                        <button 
                            disabled={cart.length === 0}
                            onClick={() => {
                                sessionStorage.setItem('customerOrder', JSON.stringify(cart));
                                router.push('/bill');
                            }}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${cart.length > 0 ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                            ส่งรายการสั่ง
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}