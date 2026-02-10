import API_URL from "../config.js";

const form = document.getElementById("register-form");
const feedback = document.getElementById("feedback");
const submitBtn = document.getElementById("submit");

// Ambil elemen-elemen DI DALAM tombol
const btnText = document.getElementById("btnText");
const btnIcon = document.getElementById("btnIcon");
const btnLoading = document.getElementById("btnLoading");
const processing = document.getElementById("processing");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = document.getElementById("nama").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm = document.getElementById("confirm-password").value.trim();

  // Reset feedback
  feedback.classList.add("hidden");
  
  // 1. Validasi Password
  if (password !== confirm) {
    showFeedback("Password dan konfirmasi tidak sama.", "error");
    return;
  }

  // 2. Set Loading State (Gunakan fungsi helper)
  setLoading(true);

  try {
    const res = await fetch(`${API_URL}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nama,
        username: username,
        email: email,
        password: password,
      }),
    });

    const data = await res.json().catch(() => ({ detail: "Gagal memproses data server." }));

    if (!res.ok) {
      let msg = data.detail || "Gagal mendaftar.";
      if (Array.isArray(data.detail)) msg = data.detail.map(d => d.msg).join("; ");
      
      showFeedback(msg, "error");
      setLoading(false); // Matikan loading, kembalikan tombol
      return;
    }

    // Berhasil
    showFeedback("Akun berhasil dibuat! Mengalihkan...", "success");
    

    btnText.textContent = "Berhasil!";
    btnLoading.classList.add("hidden"); 

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);

  } catch (err) {
    showFeedback("Terjadi kesalahan koneksi. Coba lagi.", "error");
    setLoading(false); // Matikan loading
  }
});


function setLoading(isLoading) {
  if (isLoading) {
    submitBtn.disabled = true;

    

    btnIcon.classList.add("hidden");       
    btnLoading.classList.remove("hidden"); 
    if (processing) processing.classList.remove('hidden');
  } else {
    submitBtn.disabled = false;
    btnText.textContent = "Daftar";
    
    btnIcon.classList.remove("hidden");    
    btnLoading.classList.add("hidden");    
    if (processing) processing.classList.add('hidden');
  }
}

function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.classList.remove("hidden");
  
  // Reset styling dasar
  feedback.className = "mb-6 px-4 py-3 rounded-lg text-sm text-center font-medium block border";

  if (type === "error") {
    feedback.classList.add("bg-red-100", "text-red-700", "border-red-200");
  } else {
    feedback.classList.add("bg-green-100", "text-green-700", "border-green-200");
  }
}