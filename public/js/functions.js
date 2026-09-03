let savedOtpToken = null;

async function emailLog() {
    const emailInput = document.querySelector('.email');
    const sendOtpBtn = document.querySelector('.sendotp-btn');
    const otpInputGroup = document.querySelector('.otp-input-group');
    
    if (emailInput) {
        const emailValue = emailInput.value;
        if(!emailValue){
            alert('email is required');
            return res.status(400).json({ error: "Email is required" })};

        sendOtpBtn.disabled = true;
        sendOtpBtn.innerText = "Sending..."
        try {
            const response = await fetch('http://localhost:4000/ulep/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailValue })
            });

            const data = await response.json();
            // alert(data.message);
            otpInputGroup.classList.remove("d-none");
            if (response.ok){
                savedOtpToken = data.token;
            }


        } catch (error) {
            console.error("API call failed:", error);
            alert("Something went Wrong");
        }finally{
            sendOtpBtn.disabled = false;
            sendOtpBtn.innerText = "Re-Send OTP";
        }
    }
}

async function varifyOtp(){
    // 1. Inputs aur Button select kiye (.value abhi nahi lagaya)
    const emailElement = document.querySelector('.email');
    const otpElement = document.querySelector('#otp-input');
    const varifyOtpBtn = document.querySelector('.varify-otp');
    const submitBtn = document.querySelector('.submit');

    // Safe check: pehle elements check karo
    if (!emailElement || !otpElement || !varifyOtpBtn) {
        console.error("HTML elements missing hain bhai!");
        return;
    }

    // 2. Ab values nikaali
    const email = emailElement.value;
    const otp = otpElement.value; // 💡 Ab yahan sahi se OTP number mil gaya

    if (otp){
        varifyOtpBtn.disabled = true;
        varifyOtpBtn.innerText = 'Varifying...';

        try{
            const response = await fetch('http://localhost:4000/ulep/varify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, otp: otp, token: savedOtpToken }),
            });
            
            const data = await response.json();

            if(response.ok){
                varifyOtpBtn.innerText = "Varified";
                submitBtn.disabled = false;
            } else {
                varifyOtpBtn.disabled = false;
                varifyOtpBtn.innerText = 'varify OTP';
                alert("Error: " + (data.error || "Incorrect OTP")); 
            }
        } catch (error) {
            console.error("API call failed:", error);
            alert("Something went Wrong");
        }
    } else {
        alert("Please Enter OTP!");
    }
}

async function checkUserName() {
    const userName = document.querySelector('.username').value;
    const checkUserNameBtn = document.querySelector('.checkUserNameBtn');
    const warn = document.querySelector('.warn');
    const email = document.querySelector('.email');
    const sendOtpBtn = document.querySelector('.sendotp-btn');

    if(!userName){
        alert('Please Enter Username');
        return "username empty field";
    }

    try{
        const response = await fetch('http://localhost:4000/ulep/check-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: userName }),
        });

        const data = await response.json();

        if(response.ok){
            warn.innerText = data.message;
            warn.classList.remove("text-danger");
            sendOtpBtn.disabled = false;
            email.disabled = false;
        }else{
            warn.innerText = data.message;
            warn.classList.remove("text-success");
        }
    }catch{
        console.error("API call failed:", error);
        alert("Something went Wrong");
    }
}

