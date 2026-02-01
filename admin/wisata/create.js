import API_URL from "../../config.js";

const token = localStorage.getItem("token");
if (!token) {
    alert("Sesi habis. Silakan login kembali.");
    window.location.href = "../../logres/login.html";
}

// 1. Load Data Master (Kategori, Fasilitas, & Tags)
async function loadMasterData() {
    try {
        // Fetch 3 Data Sekaligus: Facility, Category, Tag
        const [resFacs, resCats, resTags] = await Promise.all([
            fetch(`${API_URL}/facility/`, { 
                headers: { "Authorization": `Bearer ${token}`, "ngrok-skip-browser-warning": "true" } 
            }),
            fetch(`${API_URL}/category/`, { 
                headers: { "Authorization": `Bearer ${token}`, "ngrok-skip-browser-warning": "true" } 
            }),
            fetch(`${API_URL}/tag/`, { 
                headers: { "Authorization": `Bearer ${token}`, "ngrok-skip-browser-warning": "true" } 
            })
        ]);

        const facs = await resFacs.json();
        const cats = await resCats.json();
        const tags = await resTags.json();

        // Render Fasilitas (Checkbox)
        renderCheckboxes("facilities-container", facs.data || facs, "facility");
        
        // Render Kategori (Dropdown)
        renderDropdown("category-select", cats.data || cats);

        // Render Tags (Checkbox) - BARU
        renderCheckboxes("tags-container", tags.data || tags, "tag");

    } catch (e) {
        console.error("Gagal load master data", e);
        alert("Gagal memuat data master (Kategori/Fasilitas/Tags).");
    }
}

function renderCheckboxes(containerId, data, nameAttr) {
    const container = document.getElementById(containerId);
    if (!container) return; // Safety check jika elemen belum ada di HTML

    container.innerHTML = "";
    
    if (!data || data.length === 0) {
        container.innerHTML = "<span class='text-gray-400 text-sm italic'>Data kosong</span>";
        return;
    }

    data.forEach(item => {
        // ID: id_facility, id_tag, atau id
        const id = item.id || item.id_facility || item.id_tag; 
        const label = item.name;

        // Value Checkbox = ID (integer)
        const html = `
            <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg border border-transparent hover:border-gray-200 transition">
                <input type="checkbox" name="${nameAttr}" value="${id}" class="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-gray-300">
                <span class="text-sm text-gray-700 font-medium">${label}</span>
            </label>
        `;
        container.insertAdjacentHTML("beforeend", html);
    });
}

function renderDropdown(selectId, data) {
    const select = document.getElementById(selectId);
    if (!select) return;

    let opts = `<option value="">-- Pilih Kategori --</option>`;
    
    if (data && data.length > 0) {
        data.forEach(item => {
            const id = item.id || item.id_category;
            opts += `<option value="${id}">${item.name}</option>`;
        });
    }
    select.innerHTML = opts;
}

// 2. Submit Form
document.getElementById("create-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("submit-btn");

    // Ambil Data Fasilitas (Array of IDs)
    const selectedFacs = Array.from(document.querySelectorAll('input[name="facility"]:checked'))
                              .map(cb => parseInt(cb.value));

    // Ambil Data Tags (Array of IDs) - BARU
    const selectedTags = Array.from(document.querySelectorAll('input[name="tag"]:checked'))
                              .map(cb => parseInt(cb.value));

    const statusValue = document.getElementById("status-select").value;

    // Siapkan Payload
    const payload = {
        nama_wisata: document.getElementById("nama").value,
        deskripsi: document.getElementById("deskripsi").value || "Deskripsi belum diisi",
        lokasi: document.getElementById("lokasi").value,
        ticket_price: parseFloat(document.getElementById("harga").value) || 0,
        
        // Format Waktu: tambah :00 jika perlu
        open_time: document.getElementById("open-time").value + ":00", 
        close_time: document.getElementById("close-time").value + ":00",
        
        category_id: parseInt(document.getElementById("category-select").value),
        
        status: statusValue,

        facility_id: selectedFacs, // Array ID Fasilitas
        tag_id: selectedTags       // Array ID Tags (BARU)
    };

    // Validasi Sederhana
    if (!payload.category_id) {
        alert("Harap pilih kategori wisata.");
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Menyimpan...`;

        const res = await fetch(`${API_URL}/wisata/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Wisata berhasil ditambahkan!");
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
        alert("Gagal menyimpan: " + e.message);
        btn.disabled = false;
        btn.innerHTML = "Simpan Data";
    }
});

// Jalankan Load Data saat halaman siap
loadMasterData();