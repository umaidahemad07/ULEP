const form = document.querySelector('#reset-password-form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password1 = document.querySelector('#resetPasswordInput1').value;
    const password2 = document.querySelector('#resetPasswordInput2').value;
    if (password1 !== password2) {
        alert("Please Enter Same password in both fields.");
        return; // Yahin ruk jayega
    }
    try {
        const response = await fetch(form.action, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password1 }),
        });
        const data = await response.json();
        if (response.ok) {
            alert("Password updated successfully!");
            window.location.href = '/ulep/login';
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Internal Server Error");
    }
});