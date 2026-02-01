import API_URL from "/config.js";

const form = document.getElementById("facility-form");
const nameInput = document.getElementById("facility-name");
const feedback = document.getElementById("feedback-message");
const submitBtn = document.getElementById("submit-btn");

const urlParams = new URLSearchParams(window.location.search);
const id_facility = urlParams.get("id_facility");

// Cek ID di URL
if (!id_facility) {
    alert("ID Fasilitas tidak ditemukan!");
    window.location.href = "/admin/facility/index.html";
}

// Cek Token sebelum Fetch
const token = localStorage.getItem("token");
if (!token) {
    alert("Kamu belum login!");
    window.location.href = "/login.html";
}

// 1. FUNGSI FETCH DATA (GET)
async function fetchCategoryData() {
    try {
        nameInput.disabled = true;
        submitBtn.disabled = true;
        submitBtn.textContent = "Memuat data...";

        // Debugging: Cek URL di console
        console.log("Fetching URL:", `${API_URL}/facility/${id_facility}`);

        const res = await fetch(`${API_URL}/facility/${id_facility}`, {
            method: "GET",
            headers: {
                "ngrok-skip-browser-warning": "true",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}` // Pastikan token tidak null
            }
        });

        // Tangkap Error 500 / 404 dari Server
        if (!res.ok) {
            const status = res.status;
            const text = await res.text();
            
            if (status === 500) {
                throw new Error("Server Backend Error (500). Minta teman backend cek terminalnya.");
            } else if (status === 404) {
                throw new Error("Data fasilitas tidak ditemukan di database.");
            } else {
                throw new Error(`Gagal mengambil data (${status}): ${text}`);
            }
        }

        const result = await res.json();
        const data = result.data || result; // Handle format {data: ...} atau langsung object

        if (!data || !data.name) {
            throw new Error("Struktur data dari backend tidak sesuai (nama kategori tidak ditemukan).");
        }

        nameInput.value = data.name;

    } catch (error) {
        console.error("Fetch Error:", error);
        feedback.innerHTML = `Gagal memuat: ${error.message}`;
        feedback.className = "error";
    } finally {
        nameInput.disabled = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Edit Facility";
    }
}

// Jalankan saat halaman dimuat
fetchCategoryData();

// 2. FUNGSI UPDATE DATA (PATCH)
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();

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
        const res = await fetch(`${API_URL}/facility/${id_facility}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Jangan lupa token di sini juga
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify({ name: name }),
        });

        let result;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            result = await res.json();
        } else {
            const text = await res.text();
            throw new Error(`Server Error: ${text}`);
        }

        if (!res.ok) {
            throw new Error(result.message || "Gagal mengupdate fasilitas.");
        }

        feedback.textContent = "Fasilitas berhasil diperbarui!";
        feedback.className = "success";

        setTimeout(() => {
            window.location.href = "/admin/facility/index.html";
        }, 1200);

    } catch (err) {
        console.error(err);
        feedback.textContent = err.message;
        feedback.className = "error";
        submitBtn.disabled = false;
        submitBtn.textContent = "Edit Category";
    }
});