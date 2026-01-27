import API_URL from "/config.js";

const tableBody = document.getElementById("category-tbody");

// 1. FUNGSI FETCH DATA (GET)
// GANTI BAGIAN INI DI DALAM fetchCategories
// 1. FUNGSI FETCH DATA (GET) YANG SUDAH DIPERBAIKI
// 1. FUNGSI FETCH DATA (GET) - VERSI FINAL
async function fetchCategories() {
  try {
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Memuat data...</td></tr>`;

    // Request ke API
    const response = await fetch(`${API_URL}/category/`, { 
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "ngrok-skip-browser-warning": "true"
      },
    });

    // 1. Cek Error HTTP (404, 500, dll)
    if (!response.ok) {
      const text = await response.text();
      console.error("Server Error:", text);
      throw new Error(
        `Request gagal: ${response.status} ${response.statusText}`,
      );
    }

    // --- BAGIAN INI DIHAPUS ---
    // Kita hapus pengecekan content-type karena backend mungkin lupa mengirim header json
    // ---------------------------

    // 2. Langsung coba parsing JSON
    // Jika ternyata isinya HTML, baris ini akan error dan loncat ke 'catch'
    const data = await response.json();

    // Normalisasi data (handle jika dibungkus { data: [] } atau array langsung)
    const categories = Array.isArray(data) ? data : data.data || [];

    renderTable(categories);
  } catch (error) {
    console.error("Error:", error);

    let pesanError = error.message;
    // Jika error parsing JSON (artinya dapet HTML)
    if (error.name === "SyntaxError") {
      pesanError = "Data tidak valid (HTML). Cek URL API.";
    }

    tableBody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; color:red;">
          Gagal memuat data.<br>
          <small>${pesanError}</small>
        </td>
      </tr>`;
  }
}

// 2. FUNGSI RENDER TABEL
function renderTable(categories) {
  if (categories.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Tidak ada data kategori.</td></tr>`;
    return;
  }

 let rows = "";
  categories.forEach((category, index) => {
    // Pastikan property ID sesuai (id atau id_category)
    const id = category.id || category.id_category;

    rows += `
      <tr class="hover:bg-gray-50 border-b border-gray-200 transition-colors duration-200">
        <td class="px-6 py-4 text-gray-700 font-medium">
            ${index + 1}
        </td>

        <td class="px-6 py-4 text-gray-800 font-semibold">
            ${category.name}
        </td>

        <td class="px-6 py-4 ">
          <div class="flex items-center justify-center gap-3">
             <a href="edit.html?id_category=${id}"
                class="flex items-center px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105">
                ✏️ <span class="ml-2">Edit</span>
             </a>

             <button class="btn-delete flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105"
                data-id="${id}">
                🗑️ <span class="ml-2">Hapus</span>
             </button>
          </div>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = rows;

  // Pasang event listener untuk tombol delete setelah render selesai
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      deleteCategory(id);
    });
  });
}

// 3. FUNGSI HAPUS (DELETE)
async function deleteCategory(id) {
  const confirmDelete = confirm(
    "Apakah Anda yakin ingin menghapus kategori ini?",
  );
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_URL}/category/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Gagal menghapus kategori");
    }

    alert("Kategori berhasil dihapus!");
    // Refresh tabel tanpa reload halaman
    fetchCategories();
  } catch (error) {
    console.error("Error deleting:", error);
    alert("Gagal menghapus kategori. Cek console.");
  }
}

// Jalankan fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", fetchCategories);
