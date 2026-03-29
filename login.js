// ซ่อนหน้า
function hideAll(){
    let pages = ["page1","page2","page3","page4","page5","page6"];
    pages.forEach(p => document.getElementById(p).style.display="none");
}

// ย้อนกลับ
function backTo(page){
    hideAll();
    document.getElementById(page).style.display="block";
}

// ไปหน้า
function goCustomer(){
    hideAll();
    document.getElementById("page2").style.display="block";
}
function goStaff(){
    hideAll();
    document.getElementById("page5").style.display="block";
}


function register(){
    localStorage.setItem("user", regUser.value);
    localStorage.setItem("pass", regPass.value);
    backTo("page3");
}


function login(){
    if(loginUser.value === localStorage.getItem("user") &&
       loginPass.value === localStorage.getItem("pass")){
        backTo("page4");
    } else {
        msg.innerText="Username หรือ Password ไม่ถูกต้อง";
    }
}


function validateName(){
    let name = nameInput.value.trim();

    if(name === ""){
        nameError.innerText="กรุณากรอกชื่อ";
        nameInput.className="invalid";
        return false;
    }
    else if(!/^[A-Za-zก-๙\s]+$/.test(name)){
        nameError.innerText="ใช้ได้เฉพาะภาษาไทยหรืออังกฤษ";
        nameInput.className="invalid";
        return false;
    }
    else{
        nameError.innerText="";
        nameInput.className="valid";
        return true;
    }
}


function validateTable(){
    let t = tableInput.value.trim();

    if(t === ""){
        tableError.innerText="กรุณากรอกเลขโต๊ะ";
        tableInput.className="invalid";
        return false;
    }
    else if(!/^[0-9]{2}$/.test(t) || Number(t)<1 || Number(t)>99){
        tableError.innerText="ต้องเป็นเลข 01-99 เท่านั้น";
        tableInput.className="invalid";
        return false;
    }
    else{
        tableError.innerText="";
        tableInput.className="valid";
        return true;
    }
}


function checkForm(){
    submitBtn.disabled = !(validateName() && validateTable());
}


let nameInput, tableInput, submitBtn, nameError, tableError;

document.addEventListener("DOMContentLoaded", function(){
    nameInput = document.getElementById("name");
    tableInput = document.getElementById("table");
    submitBtn = document.getElementById("submitBtn");
    nameError = document.getElementById("nameError");
    tableError = document.getElementById("tableError");

    nameInput.addEventListener("input", checkForm);
    tableInput.addEventListener("input", checkForm);
});


function saveCustomer(){
    localStorage.setItem("customerData",
        "ชื่อ: "+nameInput.value+" | โต๊ะ: "+tableInput.value);

    alert("บันทึกข้อมูลเรียบร้อย");
}


function staffLogin(){
    if(staffPass.value==="224236"){
        backTo("page6");
        data.innerText = localStorage.getItem("customerData") || "ยังไม่มีข้อมูล";
    } else {
        staffMsg.innerText="รหัสไม่ถูกต้อง";
    }
}

document.addEventListener("DOMContentLoaded", function(){

    let btn = document.getElementById("submitBtn");

    btn.addEventListener("click", function(){

        if(!btn.disabled){

            setTimeout(function(){
                window.location.href = "index.html";
            }, 300);

        }

    });

});