import API_URL from "/config.js";

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
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Tidak ada data tag.</td></tr>`;
    return;
  }

  let rows = "";
  tags.forEach((tag, index) => {
    // Sesuaikan dengan respon backend (misal: id, id_tag, atau id_tags)
    const id = tag.id || tag.id_tag;

    rows += `
      <tr class="hover:bg-gray-50 transition-colors duration-200">
        <td class="px-6 py-4 font-medium">${index + 1}</td>
        <td class="px-6 py-4 font-semibold text-gray-800">${tag.name}</td>
        <td class="px-6 py-4">
          <div class="flex items-center justify-center gap-3">
             <a href="edit.html?id_tag=${id}"
                class="flex items-center px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg shadow-sm transition-transform hover:scale-105">
                ✏️ Edit
             </a>
             <button class="btn-delete flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg shadow-sm transition-transform hover:scale-105"
                data-id="${id}">
                🗑️ Hapus
             </button>
          </div>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = rows;

  // Event Listener Delete
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      deleteTag(id); // Panggil fungsi deleteTag yang baru
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