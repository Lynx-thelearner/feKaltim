import API_URL from "../../config.js";

const form = document.getElementById("image-form");
const feedback = document.getElementById("feedback-message");
const submitBtn = document.getElementById("submit-btn");
const wisataSelect = document.getElementById("wisata-select");
const fileInput = document.getElementById("image-file"); // Pastikan ID di HTML sudah diganti jadi type="file"

const token = localStorage.getItem("token");
if (!token) { 
    alert("Sesi habis."); 
    window.location.href = "../../logres/login.html"; 
}

// 1. Load Dropdown Wisata
async function loadWisataOptions() {
    try {
        const res = await fetch(`${API_URL}/wisata/`, {
            headers: { "Authorization": `Bearer ${token}`, "ngrok-skip-browser-warning": "true" }
        });
        const result = await res.json();
        const wisataList = Array.isArray(result) ? result : (result.data || []);

        let options = `<option value="">-- Pilih Wisata Terkait --</option>`;
        wisataList.forEach(w => {
            // Sesuai respons JSON wisata sebelumnya
            const id = w.id || w.id_wisata;
            const nama = w.nama_wisata || w.name;
            options += `<option value="${id}">${nama}</option>`;
        });
        wisataSelect.innerHTML = options;
    } catch (e) {
        console.error("Gagal load wisata", e);
        wisataSelect.innerHTML = `<option value="">Gagal memuat data wisata</option>`;
    }
}
loadWisataOptions();

// 2. Submit Form (Upload Image)
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Ambil Values
    const idWisata = wisataSelect.value;
    const file = fileInput.files[0];

    // Validasi
    if (!idWisata) {
        showFeedback("Pilih wisata terlebih dahulu.", "error");
        return;
    }
    if (!file) {
        showFeedback("Pilih file gambar terlebih dahulu.", "error");
        return;
    }

    // Loading State
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Uploading...`;

    try {
        // Persiapan FormData untuk Multipart Upload
        const formData = new FormData();
        formData.append("file", file); // Key harus "file" sesuai Swagger

        // Endpoint sesuai Swagger: POST /wisata/{id_wisata}/upload-image
        const response = await fetch(`${API_URL}/wisata/${idWisata}/upload-image`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true"
                // Jangan set Content-Type manual untuk FormData! Browser akan set otomatis boundary-nya.
            },
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || errData.detail || "Gagal upload gambar.");
        }

        // Sukses: simpan flash message lalu redirect ke index
        const flash = { message: "Gambar berhasil diupload!", type: "success" };
        localStorage.setItem("admin_feedback", JSON.stringify(flash));
        showFeedback(flash.message, flash.type);
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);

    } catch (err) {
        console.error(err);
        showFeedback(err.message, "error");
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Simpan";
    }
});

// Helper Feedback
function showFeedback(message, type) {
    feedback.textContent = message;
    if (type === "success") {
        feedback.className = "text-sm font-medium mt-4 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200";
    } else {
        feedback.className = "text-sm font-medium mt-4 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200";
    }
}