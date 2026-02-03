import API_URL from "/config.js";

const tableBody = document.getElementById("wisata-tbody");
const token = localStorage.getItem("token");

// 1. Cek Token
if (!token) {
    alert("Sesi habis. Silakan login kembali.");
    window.location.href = "/logres/login.html";
}

// Global variable untuk menyimpan nama kategori
let categoryMap = {};

// 2. Init Function (Load Kategori Dulu, baru Wisata)
async function init() {
    try {
        await fetchCategories(); // Ambil mapping kategori
        await fetchWisata();     // Ambil data wisata
    } catch (error) {
        console.error("Init Error:", error);
    }
}

// Helper: Fetch Kategori untuk Mapping ID -> Nama
async function fetchCategories() {
    try {
        const res = await fetch(`${API_URL}/category/`, {
            headers: { 
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true"
            }
        });
        const result = await res.json();
        const cats = Array.isArray(result) ? result : (result.data || []);
        
        // Simpan ke categoryMap: { 3: "Alam", 4: "Pantai" }
        cats.forEach(c => {
            const id = c.id || c.id_category;
            categoryMap[id] = c.name;
        });
    } catch (e) {
        console.error("Gagal load kategori", e);
    }
}

// 3. Fetch Data Wisata
async function fetchWisata() {
    try {
        const response = await fetch(`${API_URL}/wisata/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
                "Accept": "application/json"
            }
        });

        if (!response.ok) throw new Error("Gagal mengambil data wisata.");

        const result = await response.json();
        const wisataData = Array.isArray(result) ? result : (result.data || []);

        renderTable(wisataData);

    } catch (error) {
        console.error("Error fetching wisata:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="p-8 text-center text-red-500">
                    Gagal memuat data. <br> <small>${error.message}</small>
                </td>
            </tr>
        `;
    }
}

// Helper: Format Rupiah
function formatRupiah(angka) {
    if (!angka || angka == 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);
}

// Helper: Format Waktu (08:00:00 -> 08:00)
function formatTime(timeString) {
    if (!timeString) return "-";
    return timeString.substring(0, 5); 
}

// 4. Render Table
function renderTable(data) {
    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-gray-500">Belum ada data wisata.</td></tr>`;
        return;
    }

    let rows = "";
    data.forEach((item, index) => {
        // Mapping Data dari Database
        const id = item.id_wisata;
        const nama = item.nama_wisata;
        const lokasi = item.lokasi;
        const harga = formatRupiah(item.ticket_price);
        const buka = formatTime(item.open_time);
        const tutup = formatTime(item.close_time);
        const status = item.status;
        
        // Ambil Nama Kategori dari Map
        const categoryName = categoryMap[item.category_id] || `ID: ${item.category_id}`;

        // Badge Status
        const statusBadge = (status === 'published')
            ? `<span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Published</span>`
            : `<span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200">${status || 'Draft'}</span>`;

        rows += `
            <tr class="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-500">${index + 1}</td>
                
                <td class="px-6 py-4">
                    <div class="font-bold text-gray-800">${nama}</div>
                    <div class="text-xs text-gray-400 truncate w-40">${item.deskripsi || '-'}</div>
                </td>

                <td class="px-6 py-4 text-gray-600">
                    <span class="flex items-center gap-1 text-sm"><span class="text-red-500">📍</span> ${lokasi}</span>
                </td>

                <td class="px-6 py-4 font-mono font-semibold text-green-600 text-sm">
                    ${harga}
                </td>

                <td class="px-6 py-4 text-sm text-gray-600">
                    ${buka} - ${tutup}
                </td>

                <td class="px-6 py-4">
                    <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-200">
                        ${categoryName}
                    </span>
                </td>

                <td class="px-6 py-4 text-center">
                    ${statusBadge}
                </td>

                <td class="px-6 py-4 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-2">
                        <a href="edit.html?id=${id}" 
                           class="flex items-center px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-semibold transition-colors shadow-sm">
                            ✏️ Edit
                        </a>
                        <button onclick="deleteWisata('${id}', '${nama}')"
                           class="flex items-center px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold transition-colors shadow-sm">
                            🗑️ Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = rows;
}

// 5. Fungsi Delete
window.deleteWisata = async (id, nama) => {
    if (!confirm(`Hapus wisata "${nama}"?  Data ini tidak dapat dikembalikan.`)) return;

    try {
        const response = await fetch(`${API_URL}/wisata/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true"
            }
        });

        if (!response.ok) throw new Error("Gagal menghapus wisata.");

        alert("Wisata berhasil dihapus!");
        fetchWisata(); // Refresh tabel

    } catch (error) {
        console.error("Delete Error:", error);
        alert("Gagal menghapus: " + error.message);
    }
};

// Jalankan
document.addEventListener("DOMContentLoaded", init);