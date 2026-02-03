import API_URL from "/config.js"; // Pastikan path config benar (naik 2 level)

const tableBody = document.getElementById("category-tbody");
const token = localStorage.getItem("token");

// 1. Cek Token
if (!token) {
    alert("Sesi habis. Silakan login kembali.");
    window.location.href = "../../logres/login.html";
}

// 2. FUNGSI UTAMA FETCH
async function fetchCategories() {
  try {
    // Tampilkan Loading
    tableBody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-gray-400">Memuat data...</td></tr>`;

    // Fetch ke endpoint /category/ (Sesuai Swagger)
    const res = await fetch(`${API_URL}/category/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
        "Accept": "application/json"
      }
    });

    // Cek Status HTTP
    if (!res.ok) {
        throw new Error(`Gagal mengambil data: ${res.status}`);
    }

    // Parse JSON
    const result = await res.json();
    
    // Normalisasi Data (Handle {data: []} atau [])
    const categories = Array.isArray(result) ? result : (result.data || []);

    // Render ke Tabel
    renderTable(categories);

  } catch (error) {
    console.error("Fetch Error:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" class="p-8 text-center text-red-500">
            Gagal memuat data. <br>
            <small>${error.message}</small>
        </td>
      </tr>`;
  }
}

// 3. FUNGSI RENDER TABEL
function renderTable(categories) {
  if (categories.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-gray-500">Belum ada data kategori.</td></tr>`;
    return;
  }

  let rows = "";
  categories.forEach((category, index) => {
    
    // Pastikan ID sesuai database (id_category atau id)
    const id = category.id_category || category.id; 

    rows += `
      <tr class="hover:bg-gray-50 border-b border-gray-100 transition-colors">
        <td class="px-6 py-4 font-medium text-gray-500">${index + 1}</td>
        
        <td class="px-6 py-4 font-semibold text-gray-800">
            ${category.name}
        </td>

        <td class="px-6 py-4">
          <div class="flex items-center justify-center gap-2">
             <a href="edit.html?id_category=${id}"
                class="flex items-center px-3 py-1.5 bg-amber-100 text-amber-600 hover:bg-amber-200 rounded-lg text-xs font-semibold transition-colors">
                ✏️ Edit
             </a>
             
             <button class="btn-delete flex items-center px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors"
                data-id="${id}" data-name="${category.name}">
                🗑️ Hapus
             </button>
          </div>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = rows;

  // Pasang Event Listener Delete
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", function() {
        const id = this.getAttribute("data-id");
        const name = this.getAttribute("data-name");
        deleteCategory(id, name);
    });
  });
}

// 4. FUNGSI DELETE
async function deleteCategory(id, name) {
    if (!confirm(`Hapus kategori "${name}"?`)) return;

    try {
        const res = await fetch(`${API_URL}/category/${id}`, { // Endpoint Delete biasanya /
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true"
            }
        });

        if (!res.ok) throw new Error("Gagal menghapus.");

        alert("Berhasil dihapus!");
        fetchCategories(); 

    } catch (error) {
        console.error("Delete Error:", error);
        alert("Gagal menghapus: " + error.message);
    }
}

// Jalankan saat load
fetchCategories();