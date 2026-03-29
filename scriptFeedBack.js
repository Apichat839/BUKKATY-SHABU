const submitBtn = document.getElementById('submit-btn');
const form = document.getElementById('feedback-form');
const successMsg = document.getElementById('success-message');

submitBtn.addEventListener('click', () => {
    const rating = document.querySelector('input[name="rating"]:checked');
    
    if (!rating) {
        alert("กรุณาให้ดาวก่อนส่งนะครับ");
        return;
    }

    // จำลองการโหลด
    submitBtn.innerText = "กำลังบันทึก...";
    
    setTimeout(() => {
        const commentText = document.getElementById('comment').value;
        form.classList.add('hidden');
        successMsg.classList.remove('hidden');

        //บรรทัดนี้เช็กค่าใน Console (กด F12 ใน Browser เพื่อดู)
        console.log("Rating:", rating.value);
        console.log("Comment:", commentText);
    }, 800);
});

function resetForm() {
    form.classList.remove('hidden');
    successMsg.classList.add('hidden');
    submitBtn.innerText = "ส่งฟีดแบ็ก";
    document.getElementById('comment').value = '';
    const checked = document.querySelector('input[name="rating"]:checked');
    if(checked) checked.checked = false;
}