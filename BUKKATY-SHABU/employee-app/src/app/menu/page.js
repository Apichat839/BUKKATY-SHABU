"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MenuPage() {
    const router = useRouter();
    const [menus, setMenus] = useState([]);
    const [foodTypes, setFoodTypes] = useState([]);
    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [tableNo, setTableNo] = useState("01");

    const API_BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        const stashedTable = sessionStorage.getItem('table_number');
        if (stashedTable) setTableNo(stashedTable);

        const fetchData = async () => {
            try {
                // 1. ดึงหมวดหมู่ทั้งหมด
                const resTypes = await fetch(`${API_BASE_URL}/api/food_types/all`);
                const typeData = await resTypes.json();
                
                if (!typeData.isError) {
                    // --- ตั้งค่าลำดับ: 1.น้ำซุป, 2.ชาบู, 3.ซาลาเปา ---
                    const priorityOrder = [
                        "เมนูน้ำซุป", "น้ำซุป", 
                        "เมนูชาบู", "ชาบู", 
                        "เมนูซาลาเปา", "ซาลาเปา"
                    ]; 
                    
                    const sortedTypes = typeData.data.sort((a, b) => {
                        const indexA = priorityOrder.indexOf(a.food_type_name);
                        const indexB = priorityOrder.indexOf(b.food_type_name);

                        // ถ้าเจอใน priority ทั้งคู่ ให้เรียงตามลำดับใน priorityOrder
                        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                        // ถ้าตัวหนึ่งอยู่ในลิสต์ แต่อีกตัวไม่อยู่ ให้ตัวที่อยู่ในลิสต์ขึ้นก่อน
                        if (indexA !== -1) return -1;
                        if (indexB !== -1) return 1;
                        
                        // หมวดอื่นๆ เรียงตาม ID ปกติ
                        return a.food_type_id - b.food_type_id;
                    });
                    
                    setFoodTypes(sortedTypes);
                }

                // 2. ดึงเมนูทั้งหมด
                const resMenu = await fetch(`${API_BASE_URL}/api/menu/all`);
                const menuData = await resMenu.json();
                if (!menuData.isError) setMenus(menuData.data);

            } catch (err) {
                console.error("Fetch Error:", err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const sum = cart.reduce((total, item) => total + (item.price * item.qty), 0);
        setTotalPrice(sum);
    }, [cart]);

    const addToCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.menu_id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.menu_id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
                );
            }
            return [...prevCart, { id: item.menu_id, name: item.menu_name, price: item.price, qty: 1 }];
        });
    };

    const groupMenuByType = (menuList) => {
        return menuList.reduce((grouped, menu) => {
            const typeId = menu.food_type_id;
            if (!grouped[typeId]) grouped[typeId] = [];
            grouped[typeId].push(menu);
            return grouped;
        }, {});
    };

    const groupedMenus = groupMenuByType(menus);

    return (
        <div className="min-h-screen bg-[#f8f8f8] pb-24">
            <header className="bg-[#0a0a0a] text-white shadow-xl sticky top-0 z-50 border-b-2 border-[#800000]">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4"> 
                        <img 
                            src={`${API_BASE_URL}/imgs/11bkt.png`} 
                            alt="Bukkaty Logo" 
                            className="h-12 w-12 rounded-full border border-red-600 object-cover bg-white" 
                        />
                        <div>
                            <h1 className="text-xl font-bold tracking-tighter text-white">BUKKATY</h1>
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Table: {tableNo}</p>
                        </div>
                    </div>
                    
                    <nav className="hidden md:flex gap-6">
                        <button className="text-sm font-medium text-red-500">เมนูอาหาร</button>
                        <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">โปรโมชั่น</button>
                        <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">ติดต่อเรา</button>
                    </nav>

                    <div className="w-12 md:hidden"></div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8">
                {foodTypes.map((type) => {
                    const typeMenus = groupedMenus[type.food_type_id];
                    if (!typeMenus) return null;

                    return (
                        <div key={type.food_type_id} className="mb-12">
                            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-4">
                                <h2 className="text-2xl font-black text-gray-900 border-l-4 border-red-600 pl-4 tracking-wide">
                                    {type.food_type_name}
                                </h2>
                                <div className="flex-grow h-[1px] bg-gray-200"></div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {typeMenus.map((item) => (
                                    <div key={item.menu_id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all p-3 border border-gray-100 flex flex-col items-center text-center group">
                                        <div className="aspect-square w-full overflow-hidden rounded-2xl mb-4 bg-gray-50 border border-gray-50">
                                            <img
                                                src={`${API_BASE_URL}/imgs/${item.image_url}`}
                                                alt={item.menu_name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-2xl"
                                            />
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{item.menu_name}</h3>
                                        <p className="text-red-600 font-extrabold mb-3 text-lg">{item.price} ฿</p>
                                        <button
                                            onClick={() => addToCart(item)}
                                            className="mt-auto w-full py-2 bg-[#0a0a0a] hover:bg-red-700 text-white rounded-xl text-xl font-bold transition-colors shadow-md"
                                        >
                                            +
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </main>

            {cart.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50">
                    <button 
                        onClick={() => {
                            sessionStorage.setItem('customerOrder', JSON.stringify(cart));
                            router.push('/bill');
                        }}
                        className="w-full bg-[#28a745] text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center hover:scale-[1.02] transition-transform active:scale-95 border-2 border-green-600"
                    >
                        <div className="flex items-center gap-3">
                            <span className="bg-white text-[#28a745] w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-inner">
                                {cart.reduce((sum, i) => sum + i.qty, 0)}
                            </span>
                            <span className="font-bold text-lg">ดูรายการที่เลือก</span>
                        </div>
                        <span className="font-bold text-xl">{totalPrice.toLocaleString()} ฿ ➔</span>
                    </button>
                </div>
            )}
        </div>
    );
}