import API_URL from "/config.js";

// 1. Ambil elemen HTML
const form = document.getElementById("category-form");
const nameInput = document.getElementById("category-name");
const feedback = document.getElementById("feedback-message");
const submitBtn = document.getElementById("submit-btn");

// 2. Ambil ID Kategori dari URL (contoh: edit.html?id=5)
const urlParams = new URLSearchParams(window.location.search);
const id_category = urlParams.get("id_category");

// Cek apakah ID ada. Jika tidak, kembalikan ke halaman index
if (!id_category) {
  alert("ID Kategori tidak ditemukan!");
  window.location.href = "/admin/category/index.html";
}

// 3. FUNGSI: Ambil Data Lama (GET) dan Tampilkan
async function fetchCategoryData() {
  try {
    // Matikan input saat loading data
    nameInput.disabled = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Memuat data...";

    // Request ke API untuk ambil 1 kategori
    const res = await fetch(`${API_URL}/category/${id_category}`);
    
    if (!res.ok) throw new Error("Gagal mengambil data kategori");

    const data = await res.json();

    // MASUKKAN DATA LAMA KE INPUT (Pre-fill)
    // Asumsi response backend adalah object: { id: 1, name: "Elektronik" }
    nameInput.value = data.name; 

  } catch (error) {
    console.error(error);
    feedback.textContent = "Gagal memuat data kategori. Pastikan ID benar.";
    feedback.className = "error";
  } finally {
    // Hidupkan kembali input
    nameInput.disabled = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Edit Category";
  }
}

// Jalankan fungsi fetch saat halaman dibuka
fetchCategoryData();

// 4. FUNGSI: Update Data (PUT) saat Submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();

  // Reset feedback
  feedback.textContent = "";
  feedback.className = "";

  if (!name) {
    feedback.textContent = "Nama kategori tidak boleh kosong.";
    feedback.className = "error";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Menyimpan...";

  try {
    // Perhatikan method diganti menjadi PUT
    const res = await fetch(`${API_URL}/category/${id_category}`, {
      method: "PUT", // Atau PATCH, tergantung backend
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
      }),
    });

    // Parsing Error/Success sama seperti create
    let data;
    try {
      data = await res.json();
    } catch (e) {
      const text = await res.text();
      data = { detail: text || "Unknown response" };
    }

    if (!res.ok) {
        // ... (Logika error handling sama seperti create) ...
        let message = "Gagal mengupdate kategori.";
        if (typeof data.detail === "string") message = data.detail;
        // ... dst
        
        feedback.textContent = message;
        feedback.className = "error";
        submitBtn.disabled = false;
        submitBtn.textContent = "Edit Category";
        return;
    }

    // SUKSES
    feedback.textContent = "Kategori berhasil diperbarui!";
    feedback.className = "success";

    setTimeout(() => {
      window.location.href = "/admin/category/index.html";
    }, 1200);

  } catch (err) {
    console.error(err);
    feedback.textContent = "Terjadi kesalahan jaringan.";
    feedback.className = "error";
    submitBtn.disabled = false;
    submitBtn.textContent = "Edit Category";
  }
});