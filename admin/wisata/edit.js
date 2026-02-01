import API_URL from "../../config.js";

const token = localStorage.getItem("token");
if (!token) {
    alert("Sesi habis. Silakan login kembali.");
    window.location.href = "../../logres/login.html";
}

// Ambil ID dari URL
const urlParams = new URLSearchParams(window.location.search);
const wisataId = urlParams.get("id");

if (!wisataId) {
    alert("ID Wisata tidak ditemukan.");
    window.location.href = "index.html";
}

// 1. Init: Load Master Data dulu, baru Load Detail Wisata
async function init() {
    try {
        await loadMasterData();
        await loadWisataDetail();
    } catch (e) {
        console.error("Init Error:", e);
        alert("Terjadi kesalahan saat memuat data.");
    }
}

// 2. Load Master Data (Kategori, Fasilitas, & TAGS)
async function loadMasterData() {
    const headers = { "Authorization": `Bearer ${token}`, "ngrok-skip-browser-warning": "true" };
    
    try {
        // Fetch 3 Data sekaligus
        const [resFacs, resCats, resTags] = await Promise.all([
            fetch(`${API_URL}/facility/`, { headers }),
            fetch(`${API_URL}/category/`, { headers }),
            fetch(`${API_URL}/tag/`, { headers }) // Fetch Tags
        ]);

        const facs = await resFacs.json();
        const cats = await resCats.json();
        const tags = await resTags.json();

        // Render Checkbox Fasilitas
        renderCheckboxes("facilities-container", facs.data || facs, "facility");
        
        // Render Checkbox Tags (BARU)
        renderCheckboxes("tags-container", tags.data || tags, "tag");
        
        // Render Dropdown Kategori
        renderDropdown("category-select", cats.data || cats);

    } catch (e) {
        throw new Error("Gagal load master data");
    }
}

// Helper: Render Checkbox (Re-usable untuk Facility & Tag)
function renderCheckboxes(containerId, data, nameAttr) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!data || data.length === 0) {
        container.innerHTML = "<span class='text-gray-400 text-sm'>Data kosong</span>";
        return;
    }

    data.forEach(item => {
        // ID bisa bernama 'id', 'id_facility', atau 'id_tag' tergantung backend
        const id = item.id || item.id_facility || item.id_tag;
        const label = item.name;
        
        const html = `
            <label class="flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded transition">
                <input type="checkbox" name="${nameAttr}" value="${id}" class="rounded text-green-600 border-gray-300 focus:ring-green-500">
                <span class="text-sm text-gray-700">${label}</span>
            </label>
        `;
        container.insertAdjacentHTML("beforeend", html);
    });
}

// Helper: Render Dropdown Kategori
function renderDropdown(selectId, data) {
    const select = document.getElementById(selectId);
    let opts = `<option value="">-- Pilih Kategori --</option>`;
    data.forEach(item => {
        const id = item.id || item.id_category;
        opts += `<option value="${id}">${item.name}</option>`;
    });
    select.innerHTML = opts;
}

// 3. Load Detail Wisata & Isi Form
async function loadWisataDetail() {
    try {
        const res = await fetch(`${API_URL}/wisata/${wisataId}`, {
            headers: { "Authorization": `Bearer ${token}`, "ngrok-skip-browser-warning": "true" }
        });
        
        if (!res.ok) throw new Error("Gagal mengambil data wisata.");
        
        const result = await res.json();
        const data = result.data || result; // Normalisasi response

        // Isi Field Text
        document.getElementById("nama").value = data.nama_wisata;
        document.getElementById("harga").value = data.ticket_price;
        document.getElementById("lokasi").value = data.lokasi;
        document.getElementById("deskripsi").value = data.deskripsi;
        
        // Isi Status & Kategori
        document.getElementById("status-select").value = data.status || 'draft';
        document.getElementById("category-select").value = data.category_id;

        // Isi Waktu
        if (data.open_time) document.getElementById("open-time").value = String(data.open_time).substring(0, 5);
        if (data.close_time) document.getElementById("close-time").value = String(data.close_time).substring(0, 5);

        // --- CHECKLIST FASILITAS ---
       const facilityData = data.facility_id || data.facilities || [];
        if (Array.isArray(facilityData)) {
            facilityData.forEach(facItem => {
                const facId = (typeof facItem === 'object') ? (facItem.id_facility || facItem.id) : facItem;
                const checkbox = document.querySelector(`input[name="facility"][value="${facId}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

      // --- PROSES CENTANG TAGS ---
        const tagsData = data.tag_id || data.tags || []; 
        if (Array.isArray(tagsData)) {
            tagsData.forEach(tagItem => {
                const tagId = (typeof tagItem === 'object') ? (tagItem.id_tag || tagItem.id) : tagItem;
                const checkbox = document.querySelector(`input[name="tag"][value="${tagId}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        // Sembunyikan Loading Overlay
        document.getElementById("loading-overlay").classList.add("hidden");

    } catch (e) {
        throw e;
    }
}

// 4. Update Data (PUT/PATCH)
document.getElementById("edit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("submit-btn");

    // Ambil fasilitas yg dicentang
    const selectedFacs = Array.from(document.querySelectorAll('input[name="facility"]:checked'))
                              .map(cb => parseInt(cb.value));

    // Ambil TAGS yg dicentang (BARU)
    const selectedTags = Array.from(document.querySelectorAll('input[name="tag"]:checked'))
                              .map(cb => parseInt(cb.value));

    const payload = {
        nama_wisata: document.getElementById("nama").value,
        deskripsi: document.getElementById("deskripsi").value,
        lokasi: document.getElementById("lokasi").value,
        ticket_price: parseFloat(document.getElementById("harga").value),
        
        open_time: document.getElementById("open-time").value + ":00",
        close_time: document.getElementById("close-time").value + ":00",
        
        category_id: parseInt(document.getElementById("category-select").value),
        status: document.getElementById("status-select").value,
        
        facility_id: selectedFacs,
        tag_id: selectedTags // Kirim Array ID Tags
    };

    try {
        btn.disabled = true;
        btn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Menyimpan...`;

        const res = await fetch(`${API_URL}/wisata/${wisataId}`, {
            method: "PATCH", 
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Data wisata berhasil diperbarui!");
            window.location.href = "index.html";
        } else {
            const err = await res.json();
            let errMsg = err.message || err.detail || JSON.stringify(err);
            if (typeof err.detail === 'object') {
                 errMsg = JSON.stringify(err.detail);
            }
            throw new Error(errMsg);
        }
    } catch (e) {
        console.error(e);
        alert("Gagal update: " + e.message);
        btn.disabled = false;
        btn.innerHTML = "Simpan Perubahan";
    }
});

// Jalankan
init();