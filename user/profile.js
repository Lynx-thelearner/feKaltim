import API_URL from "../../config.js";

let currentUser = {};

document.addEventListener("DOMContentLoaded", () => {
    // 1. Ambil Elemen DOM
    const profileName = document.getElementById("profile-name");
    const profileAvatar = document.getElementById("profile-avatar");
    const profileEmail = document.getElementById("profile-email");
    const navUsername = document.getElementById("nav-username");

    const inputName = document.getElementById("input-name");
    const inputUsername = document.getElementById("input-username");
    const inputEmail = document.getElementById("input-email");
    const inputPassword = document.getElementById("input-password");
    const saveBtn = document.getElementById("save-btn");
    const profileForm = document.getElementById("profile-form");

    // 2. Cek Token
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Anda belum login.");
        window.location.href = "../logres/login.html";
        return;
    }

    // 3. Load Data User dari LocalStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
        currentUser = JSON.parse(userStr);
        renderProfile(currentUser);
    }

    // Fungsi Render UI
    function renderProfile(user) {
        if(profileName) profileName.textContent = user.name || "User";
        if(profileEmail) profileEmail.textContent = user.email || "-";
        if(navUsername) navUsername.textContent = user.name || "User";
        
        // Avatar Initials
        if(profileAvatar) {
            const initial = (user.name || "U").charAt(0).toUpperCase();
            profileAvatar.textContent = initial;
        }

        // Form Inputs
        if(inputName) inputName.value = user.name || "";
        if(inputUsername) inputUsername.value = user.username || "";
        if(inputEmail) inputEmail.value = user.email || "";
    }

    // 4. Handle Update Profile
    if (profileForm) {
        profileForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Pastikan elemen input ada sebelum ambil value
            if (!inputName || !inputUsername || !inputEmail) return;

            // --- PERBAIKAN PAYLOAD ---
            // Hanya kirim field yang diizinkan backend (name, username, email)
            const payload = {
                name: inputName.value,
                username: inputUsername.value,
                email: inputEmail.value
            };

            // Hanya kirim password jika diisi
            if (inputPassword && inputPassword.value.trim() !== "") {
                payload.password = inputPassword.value;
            }

            try {
                if(saveBtn) {
                    saveBtn.disabled = true;
                    saveBtn.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Menyimpan...`;
                }

                const res = await fetch(`${API_URL}/user/update-me`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                        "ngrok-skip-browser-warning": "true"
                    },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const err = await res.json();
                    let errMsg = err.message || "Gagal mengupdate profil";
                    
                    // Handle Error Validasi FastAPI (422)
                    if (err.detail && Array.isArray(err.detail)) {
                        errMsg = `${err.detail[0].loc[1]}: ${err.detail[0].msg}`;
                    }
                    throw new Error(errMsg);
                }

                const updatedData = await res.json();
                
                // Update LocalStorage
                const newUser = updatedData.data || updatedData;
                const storageData = {
                    ...currentUser, 
                    ...newUser      
                };
                
                localStorage.setItem("user", JSON.stringify(storageData));
                
                // Update UI
                renderProfile(storageData);
                if(inputPassword) inputPassword.value = ""; 
                alert("Profil berhasil diperbarui!");

            } catch (error) {
                console.error(error);
                alert(error.message);
            } finally {
                if(saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = `<span>Simpan Perubahan</span>`;
                }
            }
        });
    }

    // Init Icons
    if(window.lucide) lucide.createIcons();
});

// 5. Global Logout Logic
window.handleLogout = () => {
    if(confirm("Yakin ingin logout?")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "home.html";
    }
};