import API_URL from "../../config.js";

const form = document.getElementById("image-form");
const titleInput = document.getElementById("image-title");
const urlInput = document.getElementById("image-url");
const wisataSelect = document.getElementById("wisata-select");
const feedback = document.getElementById("feedback-message");
const submitBtn = document.getElementById("submit-btn");

const urlParams = new URLSearchParams(window.location.search);
const id_gallery = urlParams.get("id_gallery");
const token = localStorage.getItem("token");

if (!id_gallery) { alert("ID tidak ditemukan!"); window.location.href = "index.html"; }
if (!token) { alert("Sesi habis."); window.location.href = "../../logres/login.html"; }

// 1. Load Data
async function loadData() {
    try {
        // Load Dropdown Wisata
        const resWisata = await fetch(`${API_URL}/wisata/`, {
            headers: { "Authorization": `Bearer ${token}`, "ngrok-skip-browser-warning": "true" }
        });
        const wisataResult = await resWisata.json();
        const wisataList = Array.isArray(wisataResult) ? wisataResult : (wisataResult.data || []);

        let options = `<option value="">-- Pilih Wisata --</option>`;
        wisataList.forEach(w => {
            const id = w.id_wisata || w.id;
            options += `<option value="${id}">${w.name}</option>`;
        });
        wisataSelect.innerHTML = options;

        // Load Data Gambar
        const resGal = await fetch(`${API_URL}/gallery/${id_gallery}`, {
            headers: { "Authorization": `Bearer ${token}`, "ngrok-skip-browser-warning": "true" }
        });
        if (!resGal.ok) throw new Error("Gagal ambil data gambar");
        
        const result = await resGal.json();
        const data = result.data || result;

        // Isi Form
        titleInput.value = data.name || data.title || "";
        urlInput.value = data.file || data.url || "";
        // Pastikan key id_wisata sesuai dengan response backend
        if(data.id_wisata) wisataSelect.value = data.id_wisata;
        else if (data.wisata && data.wisata.id) wisataSelect.value = data.wisata.id;

        // Enable Inputs
        titleInput.disabled = false;
        urlInput.disabled = false;
        wisataSelect.disabled = false;
        submitBtn.disabled = false;

    } catch (error) {
        feedback.textContent = error.message;
        feedback.className = "text-red-600";
    }
}
loadData();

// 2. Submit Update
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.innerHTML = "Menyimpan...";
    submitBtn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/gallery/${id_gallery}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify({ 
                name: titleInput.value,
                file: urlInput.value,
                id_wisata: wisataSelect.value
            })
        });

        if (!res.ok) throw new Error("Gagal update.");

        feedback.textContent = "Berhasil update!";
        feedback.className = "text-green-600 font-bold";
        setTimeout(() => window.location.href = "index.html", 1000);

    } catch (err) {
        feedback.textContent = err.message;
        feedback.className = "text-red-600";
        submitBtn.innerHTML = "Simpan Perubahan";
        submitBtn.disabled = false;
    }
});