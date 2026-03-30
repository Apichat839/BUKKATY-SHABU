const handleAddMenu = async (formData) => {
    // ดึง Token ที่เก็บไว้ตอน Login (ปกติจะเก็บใน localStorage)
    const token = localStorage.getItem('access_token'); 

    const response = await fetch('http://localhost:8080/api/menu/all', { // แก้ path เป็น /api/menu/add
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}` // ส่ง Token ไปยืนยันตัวตน
        },
        body: formData // ข้อมูลจาก Form (ชื่อ, ราคา, หมวดหมู่, ไฟล์รูป)
    });

    const result = await response.json();
    if (result.isError) {
        alert(result.message); // เช่น "ยังไม่ได้เข้าสู่ระบบ" หรือ "Token หมดอายุ"
    } else {
        alert("เพิ่มเมนูสำเร็จ!");
    }
};