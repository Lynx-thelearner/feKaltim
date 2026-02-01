import API_URL from "../config.js";

const form = document.getElementById("register-form");
const feedback = document.getElementById("feedback");
const submitBtn = document.getElementById("submit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  feedback.textContent = "";
  feedback.className = "";

  const nama = document.getElementById("nama").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm = document.getElementById("confirm-password").value.trim();

  // Validasi simple
  if (password !== confirm) {
    feedback.textContent = "Password dan konfirmasi tidak sama.";
    feedback.className = "error";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = `<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div> Memproses...`;
  try {

    if (!nama || !username || !email || !password || !confirm) {
      feedback.textContent = "Semua field wajib diisi.";
      feedback.className = "error";
      submitBtn.disabled = false;
      submitBtn.textContent = `<span>Daftar</span>`;
      return;
    }

    const res = await fetch(`${API_URL}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: nama,
        username: username,
        email: email,
        password: password,
      }),
    });

    // coba baca JSON, kalau gagal baca text
    let data;
    try {
      data = await res.json();
    } catch (e) {
      const text = await res.text();
      data = { detail: text || "Unknown response" };
    }

    // kalau error
    if (!res.ok) {
      let message = "Gagal mendaftar.";

      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        message = data.detail
          .map((d) => (d.msg ? d.msg : JSON.stringify(d)))
          .join("; ");
      } else if (typeof data.detail === "object") {
        const parts = [];
        for (const [k, v] of Object.entries(data.detail)) {
          if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
          else parts.push(`${k}: ${v}`);
        }
        message = parts.join("; ");
      }

      feedback.textContent = message;
      feedback.className = "error";
      submitBtn.disabled = false;
      submitBtn.textContent = "Daftar";
      return;
    }


    feedback.textContent =
      data.message || data.detail || "Akun berhasil dibuat! Mengalihkan...";
    feedback.className = "success";

    setTimeout(() => {
      window.location.href = "/logres/login.html";
    }, 1200);
  } catch (err) {
    feedback.textContent = "Terjadi kesalahan. Coba lagi.";
    feedback.className = "error";
  }

  submitBtn.disabled = false;
  submitBtn.textContent = "Daftar";
});
