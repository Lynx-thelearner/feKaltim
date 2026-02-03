import API_URL from "../../config.js";

const tableBody = document.getElementById("image-tbody");
const token = localStorage.getItem("token");

// 1. Cek Token
if (!token) {
    alert("Sesi habis, silakan login kembali.");
    window.location.href = "../../logres/login.html";
}

let wisataMap = {};
let allImages = []; 

// 2. Init Function
async function init() {
    try {
        await fetchAndProcessData(); 
    } catch (error) {
        console.error("Init Error:", error);
    }
}

// 3. Fetch Data (Gabungan Wisata & Images)
async function fetchAndProcessData() {
    try {
 
        const headers = { 
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
        };

        const [resWisata, resImages] = await Promise.all([
            fetch(`${API_URL}/wisata/`, { headers }),       // Ambil Nama Wisata
            fetch(`${API_URL}/wisata/images`, { headers })  // Ambil Data Gambar Lengkap
        ]);

        if (!resWisata.ok || !resImages.ok) throw new Error("Gagal mengambil data dari server");

        const rawWisata = await resWisata.json();
        const rawImages = await resImages.json();

    

        // --- A. PROSES DATA WISATA (Untuk Mapping Nama & Dropdown) ---
        const listWisata = Array.isArray(rawWisata) ? rawWisata : (rawWisata.data || []);
        
        wisataMap = {};
        const filterSelect = document.getElementById("filter-wisata");
        if(filterSelect) filterSelect.innerHTML = '<option value="all">Semua Wisata</option>'; 

        listWisata.forEach(w => {
            const id = w.id || w.id_wisata;
            const nama = w.nama_wisata || w.name;
            
            // Simpan ke Map (biar di tabel muncul nama, bukan angka ID)
            wisataMap[id] = nama;

            // Isi Dropdown
            if(filterSelect) {
                const option = document.createElement("option");
                option.value = id;
                option.textContent = nama;
                filterSelect.appendChild(option);
            }
        });

        // --- B. PROSES DATA IMAGES (Langsung dari endpoint /images) ---
        const listImages = Array.isArray(rawImages) ? rawImages : (rawImages.data || []);
        
        allImages = []; // Reset

        listImages.forEach(imgData => {
   
            
            allImages.push({
                id_wisata: imgData.id_wisata,
                image_url: imgData.image_url,
                is_primary: imgData.is_primary,
                id_image: imgData.id_image 
            });
        });

        // C. Sorting & Render
        // Gambar Cover ditaruh paling atas
        allImages.sort((a, b) => (b.is_primary === true) - (a.is_primary === true));
        renderTable(allImages);

    } catch (e) {
        console.error("Error Fetching:", e);
        if(tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-red-500">Error: ${e.message}</td></tr>`;
        }
    }
}

// 4. Helper: Normalisasi Path Gambar
function normalizePath(path) {
    if (!path) return "";
    return String(path).replace(/\\/g, "/").trim();
}

// 5. Render Table
function renderTable(images) {
    if (!tableBody) return;

    if (images.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Tidak ada gambar ditemukan.</td></tr>`;
        return;
    }

    let rows = "";
    images.forEach((img, index) => {
        // Ambil nama wisata dari Mapping yang sudah kita buat di atas
        const wisataName = wisataMap[img.id_wisata] || `(ID: ${img.id_wisata})`;
        
        // Fix Display URL
        let displayUrl = normalizePath(img.image_url);
        if (!displayUrl.startsWith("http")) {
            if(displayUrl.startsWith("/")) displayUrl = displayUrl.substring(1);
            displayUrl = `${API_URL}/${displayUrl}`;
        }

        // Status Badge
        let statusBadge = img.is_primary 
            ? `<span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">✅ Cover</span>`
            : `<span class="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200">Galeri</span>`;

        let rowClass = img.is_primary ? "bg-green-50/50" : "";
        
        // Tombol Delete (Sekarang ID Image pasti ada!)
        let actionButton = `
            <button onclick="deleteImage('${img.id_wisata}', '${img.id_image}')" 
                class="flex items-center px-4 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-full text-xs font-bold transition-colors shadow-sm cursor-pointer" title="Hapus Gambar ID ${img.id_image}">
                🗑️ Hapus
            </button>
        `;

        rows += `
            <tr class="hover:bg-gray-50 border-b border-gray-100 transition-colors ${rowClass}">
                <td class="px-6 py-4 font-medium text-gray-500">${index + 1}</td>
                <td class="px-6 py-4 font-mono text-sm text-blue-600 font-bold">${img.id_wisata}</td>
                <td class="px-6 py-4">
                    <div class="font-bold text-gray-800">${wisataName}</div>
                    <div class="text-xs text-gray-400 truncate w-32" title="${img.image_url}">${img.image_url}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="h-20 w-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative group shadow-sm">
                        <img src="${displayUrl}" alt="Preview" class="w-full h-full object-cover">
                        <a href="${displayUrl}" target="_blank" class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span class="text-white text-xs bg-black/50 px-2 py-1 rounded">Lihat</span>
                        </a>
                    </div>
                </td>
                <td class="px-6 py-4">${statusBadge}</td>
                <td class="px-6 py-4 text-center">
                    <div class="flex flex-col items-center max-w-[140px] mx-auto">
                        ${actionButton}
                    </div>
                </td>
            </tr>
        `;
    });
    tableBody.innerHTML = rows;
}

// 6. Fungsi Delete Image (Sesuai Swagger: Query Param + Typo 'id_iamge')
window.deleteImage = async (idWisata, idImage) => {
    
    if(!idWisata || !idImage) {
        alert("Gagal: ID tidak valid.");
        return;
    }

    if (!confirm(`Yakin hapus gambar ID ${idImage}?`)) return;

    try {
        console.log(`Menghapus Image... Wisata: ${idWisata}, ImageID: ${idImage}`);
        
        // PENTING: URL Query Param sesuai Swagger 'id_iamge'
        const url = `${API_URL}/wisata/image/${idImage}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'ngrok-skip-browser-warning': "true"
            }
        });

        if (!response.ok) {
            const resText = await response.text();
            throw new Error(resText || 'Gagal menghapus gambar');
        }

        alert("Gambar berhasil dihapus!");
        window.location.reload(); 
    } catch (error) {
        console.error("Delete Error:", error);
        alert("Gagal menghapus: " + error.message);
    }
};

// 7. Fungsi Filter
window.applyFilters = () => {
    const selectedWisata = document.getElementById("filter-wisata").value; 
    const selectedType = document.getElementById("filter-type").value;    

    const filteredImages = allImages.filter(img => {
        const matchWisata = (selectedWisata === "all") || (img.id_wisata == selectedWisata);
        let matchType = true;
        if (selectedType === "cover") matchType = img.is_primary;
        else if (selectedType === "gallery") matchType = !img.is_primary;
        return matchWisata && matchType;
    });
    renderTable(filteredImages);
};

document.addEventListener("DOMContentLoaded", init);