import API_URL from "/config.js"; // Naik 2 level untuk mencari config.js

const userForm = document.getElementById("user-form");
const submitBtn = document.getElementById("submit-btn");
const feedbackMessage = document.getElementById("feedback-message");

// 1. Cek Token (Keamanan)
const token = localStorage.getItem("token");
if (!token) {
    alert("Sesi habis, silakan login kembali.");
    window.location.href = "../../logres/login.html";
}

// 2. Event Listener Submit
userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset Pesan Feedback
    feedbackMessage.className = "text-sm font-medium mt-4";
    feedbackMessage.innerText = "";
    
    // Ambil Data dari Form
    const formData = new FormData(userForm);
    const data = Object.fromEntries(formData); // Konversi ke Object JSON

    // Validasi Sederhana
    if (data.password.length < 6) {
        showFeedback("Password minimal 6 karakter.", "error");
        return;
    }

    try {
        // Ubah tampilan tombol loading
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Menyimpan...
        `;
        submitBtn.disabled = true;

        // Kirim Data ke API
        // NOTE: Endpoint ini biasanya '/auth/register' atau '/user/'. Sesuaikan dengan Backend Anda.
        const response = await fetch(`${API_URL}/user/register`, { 
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            // Handle error jika username/email sudah ada
            throw new Error(result.message || result.detail || "Gagal menambahkan user.");
        }

        // Sukses
        showFeedback("User berhasil ditambahkan! Mengalihkan...", "success");
        
        // Reset Form
        userForm.reset();

        // Redirect ke halaman index user setelah 1.5 detik
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);

    } catch (error) {
        console.error("Error create user:", error);
        showFeedback(error.message, "error");
        
        // Kembalikan tombol
        submitBtn.innerHTML = `<span>Simpan User</span>`;
        submitBtn.disabled = false;
    }
});

// Helper Function untuk Pesan
function showFeedback(message, type) {
    feedbackMessage.innerText = message;
    if (type === "success") {
        feedbackMessage.className = "text-sm font-medium mt-4 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200";
    } else {
        feedbackMessage.className = "text-sm font-medium mt-4 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200";
    }
}