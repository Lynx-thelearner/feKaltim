import API_URL from "/config.js";

const tableBody = document.getElementById("facility-tbody");
const token = localStorage.getItem("token");

// 1. Proteksi Halaman (Cek Token)
if (!token) {
    alert("Sesi habis. Silakan login kembali.");
    window.location.href = "../../logres/login.html";
}

// 2. FUNGSI FETCH DATA (GET)
async function fetchFacilities() {
  try {
    // Efek Loading ala Kategori & Tags
    tableBody.innerHTML = `
        <tr>
            <td colspan="3" class="p-8 text-center text-gray-400">
                <div class="flex flex-col items-center justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                    Memuat data fasilitas...
                </div>
            </td>
        </tr>`;

    const response = await fetch(`${API_URL}/facility/`, { 
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
        "Accept": "application/json"
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
          alert("Sesi habis, silakan login lagi.");
          window.location.href = "../../logres/login.html";
          return;
      }
      throw new Error(`Request gagal: ${response.status}`);
    }

    const data = await response.json();

    // Normalisasi data
    const facilities = Array.isArray(data) ? data : (data.data || []);

    renderTable(facilities);
  } catch (error) {
    console.error("Error:", error);
    let pesanError = error.message;
    if (error.name === "SyntaxError") pesanError = "Data tidak valid (JSON Error).";

    tableBody.innerHTML = `
      <tr>
        <td colspan="3" class="p-8 text-center text-red-500">
          Gagal memuat data.<br>
          <small>${pesanError}</small>
        </td>
      </tr>`;
  }
}

// 3. FUNGSI RENDER TABEL (Tampilan Modern & Soft)
function renderTable(facilities) {
  if (facilities.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-gray-500">Tidak ada data fasilitas.</td></tr>`;
    return;
  }

  let rows = "";
  facilities.forEach((item, index) => {
    const id = item.id_facility || item.id;

    rows += `
      <tr class="hover:bg-gray-50 border-b border-gray-100 transition-colors">
        <td class="px-6 py-5 text-gray-600 font-medium">
            ${index + 1}
        </td>

        <td class="px-6 py-5 text-gray-800 font-medium">
            ${item.name}
        </td>

        <td class="px-6 py-5">
          <div class="flex items-center justify-center gap-3">
             <a href="edit.html?id_facility=${id}"
                class="flex items-center px-4 py-1.5 bg-orange-100 text-orange-500 hover:bg-orange-200 rounded-full text-xs font-bold transition-colors">
                <span class="mr-1">✏️</span> Edit
             </a>

             <button class="btn-delete flex items-center px-4 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-full text-xs font-bold transition-colors"
                data-id="${id}" data-name="${item.name}">
                <span class="mr-1">🗑️</span> Hapus
             </button>
          </div>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = rows;

  // Pasang event listener tombol delete
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      const name = this.getAttribute("data-name");
      deleteFacility(id, name);
    });
  });
}

// 4. FUNGSI HAPUS (DELETE)
async function deleteFacility(id, name) {
  if (!confirm(`Apakah Anda yakin ingin menghapus fasilitas "${name}"?`)) return;

  try {
    const response = await fetch(`${API_URL}/facility/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true"
      },
    });

    if (!response.ok) throw new Error("Gagal menghapus fasilitas");

    alert("Fasilitas berhasil dihapus!");
    fetchFacilities(); // Refresh data
  } catch (error) {
    console.error("Error deleting:", error);
    alert("Gagal menghapus: " + error.message);
  }
}

document.addEventListener("DOMContentLoaded", fetchFacilities);