import API_URL from "/config.js";

const editForm = document.getElementById("edit-form");
const submitBtn = document.getElementById("submit-btn");
const feedbackMessage = document.getElementById("feedback-message");
const loadingOverlay = document.getElementById("loading-overlay");

// 1. Cek Token
const token = localStorage.getItem("token");
if (!token) {
    alert("Sesi habis, silakan login kembali.");
    window.location.href = "../../logres/login.html";
}

// 2. Ambil ID dari URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");

if (!userId) {
    alert("ID User tidak ditemukan di URL.");
    window.location.href = "index.html";
}

// 3. Load Data Lama User (GET)
async function loadUserData() {
    try {
        // Sesuai Swagger: GET /user/id/{id_user}
        const response = await fetch(`${API_URL}/user/id/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
                "Accept": "application/json"
            }
        });

        if (response.status === 404) throw new Error("User tidak ditemukan di database.");
        if (!response.ok) throw new Error("Gagal mengambil data user.");

        const result = await response.json();
        const user = result.data || result; // Normalisasi response

        // Isi Form
        // Pastikan nama ID field di form HTML adalah 'userId', 'name', dll.
        document.getElementById("userId").value = user.id || user.id_user;
        document.getElementById("name").value = user.name;
        document.getElementById("username").value = user.username;
        document.getElementById("email").value = user.email;
        document.getElementById("role").value = user.role;

        // Hilangkan Loading
        loadingOverlay.classList.add("hidden");

    } catch (error) {
        console.error("Error load user:", error);
        alert("Gagal memuat data user: " + error.message);
        window.location.href = "index.html";
    }
}

// 4. Update Data User (PATCH)
editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset Feedback
    feedbackMessage.className = "text-sm font-medium mt-4";
    feedbackMessage.innerText = "";

    // Ambil Data Form
    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value;

    // Siapkan Payload
    const payload = {
        name: name,
        username: username,
        email: email,
        role: role
    };

    // Hanya kirim password jika diisi (Opsional)
    if (password) {
        if (password.length < 6) {
            showFeedback("Password baru minimal 6 karakter.", "error");
            return;
        }
        payload.password = password;
    }

    try {
        // Button Loading State
        submitBtn.innerHTML = `Menyimpan...`;
        submitBtn.disabled = true;

        // Sesuai Swagger: PATCH /user/{id_user}
        // Perhatikan method diganti jadi PATCH
        const response = await fetch(`${API_URL}/user/${userId}`, {
            method: "PATCH", 
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || result.detail || "Gagal mengupdate user.");
        }

        // Sukses
        showFeedback("Data user berhasil diperbarui!", "success");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);

    } catch (error) {
        console.error("Update Error:", error);
        showFeedback(error.message, "error");
        
        // Reset Button
        submitBtn.innerHTML = `<span>Simpan Perubahan</span>`;
        submitBtn.disabled = false;
    }
});

function showFeedback(message, type) {
    feedbackMessage.innerText = message;
    if (type === "success") {
        feedbackMessage.className = "text-sm font-medium mt-4 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200";
    } else {
        feedbackMessage.className = "text-sm font-medium mt-4 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200";
    }
}

// Jalankan Load Data saat halaman siap
document.addEventListener("DOMContentLoaded", loadUserData);