import API_URL from "/config.js";

const form = document.getElementById("tag-form");
// Pastikan ID input di HTML edit.html adalah "tag-name"
const nameInput = document.getElementById("tag-name"); 
const feedback = document.getElementById("feedback-message");
const submitBtn = document.getElementById("submit-btn");

const urlParams = new URLSearchParams(window.location.search);
const id_tag = urlParams.get("id_tag");

// Cek ID di URL
if (!id_tag) {
    alert("ID Tag tidak ditemukan!");
    window.location.href = "/admin/tags/index.html"; // Perbaikan path
}

// Cek Token
const token = localStorage.getItem("token");
if (!token) {
    alert("Kamu belum login!");
    window.location.href = "/login.html";
}

// 1. FUNGSI FETCH DATA (GET)
async function fetchTagData() {
    try {
        nameInput.disabled = true;
        submitBtn.disabled = true;
        submitBtn.textContent = "Memuat data...";

        // PERBAIKAN: Gunakan /tags (jamak) agar konsisten, atau sesuaikan dengan backend
        const endpoint = `${API_URL}/tag/${id_tag}`; 
        console.log("Fetching URL:", endpoint);

        const res = await fetch(endpoint, {
            method: "GET",
            headers: {
                "ngrok-skip-browser-warning": "true",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const text = await res.text();
            if (res.status === 500) throw new Error("Server Backend Error (500). Cek terminal backend.");
            if (res.status === 404) throw new Error("Tag tidak ditemukan.");
            throw new Error(`Gagal ambil data (${res.status}): ${text}`);
        }

        const result = await res.json();
        const data = result.data || result; 

        if (!data || !data.name) {
            throw new Error("Data tag kosong atau struktur salah.");
        }

        nameInput.value = data.name;

    } catch (error) {
        console.error("Fetch Error:", error);
        feedback.innerHTML = `Gagal memuat: ${error.message}`;
        feedback.className = "error";
    } finally {
        nameInput.disabled = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Edit Tag"; // Perbaikan Text
    }
}

fetchTagData();

// 2. FUNGSI UPDATE DATA (PATCH)
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();

    feedback.textContent = "";
    feedback.className = "";

    if (!name) {
        feedback.textContent = "Nama tag tidak boleh kosong.";
        feedback.className = "error";
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Menyimpan...";

    try {
        // PERBAIKAN: Konsisten gunakan /tags (jamak)
        const res = await fetch(`${API_URL}/tag/${id_tag}`, {
            method: "PATCH", // Pastikan backend support PATCH (atau coba PUT)
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, 
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify({ name: name }),
        });

        // Handle respon JSON vs HTML Error
        let result;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            result = await res.json();
        } else {
            const text = await res.text();
            throw new Error(`Server Error (Bukan JSON): ${text}`);
        }

        if (!res.ok) {
            throw new Error(result.message || result.detail || "Gagal mengupdate tag.");
        }

        feedback.textContent = "Tag berhasil diperbarui!";
        feedback.className = "success";

        // PERBAIKAN: Redirect ke index tags
        setTimeout(() => {
            window.location.href = "/admin/tags/index.html"; 
        }, 1200);

    } catch (err) {
        console.error(err);
        feedback.textContent = err.message;
        feedback.className = "error";
        submitBtn.disabled = false;
        submitBtn.textContent = "Edit Tag";
    }
});