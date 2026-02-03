import API_URL from "../config.js";
import { getRole } from "../auth/auth.js";

const username = document.getElementById("username");
const password = document.getElementById("password");
const errorMsg = document.getElementById("errorMsg");
const loginBtn = document.getElementById("loginBtn");
const btnText = document.getElementById("btnText");
const btnIcon = document.getElementById("btnIcon");
const btnLoading = document.getElementById("btnLoading");

// Fungsi helper untuk mengatur state tombol
const setLoadingState = (isLoading) => {
  if (isLoading) {
    loginBtn.disabled = true;
    btnText.textContent = "Memproses...";
    btnIcon.style.display = "none";
    btnLoading.style.display = "block";
    errorMsg.style.display = "none"; // Sembunyikan error lama
  } else {
    loginBtn.disabled = false;
    btnText.textContent = "Masuk";
    btnIcon.style.display = "block";
    btnLoading.style.display = "none";
  }
};

// Fungsi helper untuk animasi error
const showError = (message) => {
  errorMsg.textContent = message || "Username atau Password salah";
  errorMsg.style.display = "block";
  
  // Reset animasi shake agar bisa diputar ulang
  errorMsg.classList.remove("animate-shake");
  void errorMsg.offsetWidth; // Trigger reflow
  errorMsg.classList.add("animate-shake");
};

loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  // Validasi sederhana
  if (!username.value || !password.value) {
    showError("Harap isi semua kolom");
    return;
  }

  // Mulai Loading
  setLoadingState(true);

  try {
    const form = new FormData();
    form.set("username", username.value.trim());
    form.set("password", password.value.trim());

    const response = await fetch(`${API_URL}/auth/login`, {
        headers: { 
        "ngrok-skip-browser-warning": "true" },
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      // Jika gagal, tampilkan error dengan animasi
      showError("Username atau Password salah");
      setLoadingState(false);
      return;
    }

    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    
    // Ambil data user/role
    const role = getRole();

    // Beri sedikit delay agar user melihat status sukses (opsional, tapi bagus untuk UX)
    btnText.textContent = "Berhasil!";
    setTimeout(() => {
        if (role === "admin") {
          window.location.href = "/admin/dashboard.html";
        } else {
          window.location.href = "/user/home.html";
        }
    }, 500);

  } catch (err) {
    console.error(err);
    showError("Terjadi kesalahan koneksi");
    setLoadingState(false);
  }
});