import API_URL from "/config.js";


const token = localStorage.getItem("token");

// 1. Cek Token
if (!token) {
    alert("Sesi habis. Silakan login kembali.");
    window.location.href = "../../logres/login.html";
}


const form = document.getElementById("category-form");
const feedback = document.getElementById("feedback-message");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("category-name").value.trim();

  // Reset feedback
  feedback.textContent = "";
  feedback.className = "";

  if (!name) {
    feedback.textContent = "Nama kategori tidak boleh kosong.";
    feedback.className = "error";
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  submitBtn.textContent = "Loading...";

  try {
    const res = await fetch(`${API_URL}/category`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name: name,
      }),
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      const text = await res.text();
      data = { detail: text || "Unknown response" };
    }

    if (!res.ok) {
      let message = "Gagal membuat kategori.";

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
    
    } else {
      // SUKSES
      feedback.textContent = "Kategori berhasil dibuat!";
      feedback.className = "success";
      // Simpan flash message sebelum redirect
      try {
        const flash = { message: "Kategori berhasil dibuat!", type: "success" };
        localStorage.setItem("admin_feedback", JSON.stringify(flash));
      } catch (e) { console.warn("Could not store flash message", e); }
      setTimeout(() => {
        window.location.href = "/admin/category/index.html";
      }, 1200);
    }

  } catch (err) {
    console.error(err);
    feedback.textContent = "Terjadi kesalahan jaringan atau server.";
    feedback.className = "error";
  } finally {

    if (!feedback.classList.contains("success")) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Category";
    }
  }
});