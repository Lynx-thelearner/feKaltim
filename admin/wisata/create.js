import API_URL from "/config.js";

const form = document.getElementById("category-form");
// MENYESUAIKAN: Definisi variabel yang sebelumnya error
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
    // MENYESUAIKAN: Endpoint diganti agar sesuai konteks (bukan user/register)
    // Pastikan rute backendmu benar, biasanya /category atau /categories
    const res = await fetch(`${API_URL}/category`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
      // Jika error, jangan redirect, stop di sini.
      // throw new Error(message); // Opsional jika ingin lompat ke catch
    } else {
      // SUKSES
      feedback.textContent = "Kategori berhasil dibuat!";
      feedback.className = "success";
      
      setTimeout(() => {
        window.location.href = "/admin/category/index.html";
      }, 1200);
    }

  } catch (err) {
    console.error(err);
    feedback.textContent = "Terjadi kesalahan jaringan atau server.";
    feedback.className = "error";
  } finally {
    // MENYESUAIKAN: Kembalikan tombol seperti semula setelah proses selesai
    if (!feedback.classList.contains("success")) {
        // Hanya enable tombol lagi jika belum sukses (kalau sukses kan mau redirect)
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Category";
    }
  }
});