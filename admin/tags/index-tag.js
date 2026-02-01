import API_URL from "/config.js";

const token = localStorage.getItem("token");
// 1. Cek Token
if (!token) {
    alert("Sesi habis. Silakan login kembali.");
    window.location.href = "../../logres/login.html";
}

// 1. PERBAIKAN ID HTML
// Pastikan di index.html ID tbody-nya adalah "tags-tbody"
const tableBody = document.getElementById("tag-tbody"); 

// UBAH NAMA FUNGSI: fetchCategories -> fetchTags
async function fetchTags() {
  try {
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Memuat data...</td></tr>`;

    // 2. CEK ENDPOINT
    // Pastikan di Backend route-nya "/tags" (jamak) atau "/tag" (tunggal)?
    // Biasanya standar API pakai jamak: /tags
    const response = await fetch(`${API_URL}/tag`, { 
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "ngrok-skip-browser-warning": "true"
      },
    });

    if (!response.ok) {
        // Handle error token expired
        if (response.status === 401) {
            alert("Sesi habis, silakan login lagi.");
            window.location.href = "/login.html";
            return;
        }
        const text = await response.text();
        throw new Error(`Request gagal: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Normalisasi data
    const tags = Array.isArray(data) ? data : data.data || [];

    renderTable(tags);

  } catch (error) {
    console.error("Error:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; color:red;">
          Gagal memuat data.<br>
          <small>${error.message}</small>
        </td>
      </tr>`;
  }
}

function renderTable(tags) {
  if (tags.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-gray-500">Belum ada data tag.</td></tr>`;
    return;
  }

  let rows = "";
  tags.forEach((tag, index) => {
    const id = tag.id_tag || tag.id;

    rows += `
      <tr class="hover:bg-gray-50 border-b border-gray-100 transition-colors">
        <td class="px-6 py-5 text-gray-600">${index + 1}</td>
        
        <td class="px-6 py-5 font-medium text-gray-800">
            ${tag.name}
        </td>

        <td class="px-6 py-5">
          <div class="flex items-center justify-center gap-3">
             <a href="edit.html?id_tag=${id}"
                class="flex items-center px-4 py-1.5 bg-orange-100 text-orange-500 hover:bg-orange-200 rounded-full text-xs font-bold transition-colors">
                <span class="mr-1">✏️</span> Edit
             </a>
             
             <button class="btn-delete flex items-center px-4 py-1.5 bg-red-100 text-red-500 hover:bg-red-200 rounded-full text-xs font-bold transition-colors"
                data-id="${id}" data-name="${tag.name}">
                <span class="mr-1">🗑️</span> Hapus
             </button>
          </div>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = rows;

  // Re-attach event listeners
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      const name = this.getAttribute("data-name");
      deleteTag(id, name);
    });
  });
}

// UBAH NAMA FUNGSI: deleteCategory -> deleteTag
async function deleteTag(id) {
  const confirmDelete = confirm("Apakah Anda yakin ingin menghapus tag ini?");
  if (!confirmDelete) return;

  try {
    // 3. PERBAIKAN DELETE
    const response = await fetch(`${API_URL}/tag/${id}`, { // Pastikan endpoint jamak/tunggal konsisten
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // PENTING: Tambahkan Token di sini!
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "ngrok-skip-browser-warning": "true"
      },
    });

    if (!response.ok) {
      throw new Error("Gagal menghapus tag");
    }

    alert("Tag berhasil dihapus!");
    fetchTags(); // Refresh tabel

  } catch (error) {
    console.error("Error deleting:", error);
    alert("Gagal menghapus tag. Cek console.");
  }
}

document.addEventListener("DOMContentLoaded", fetchTags);