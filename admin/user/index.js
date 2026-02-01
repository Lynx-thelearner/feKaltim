import API_URL from "../../config.js";

const tableBody = document.getElementById("user-tbody");
const token = localStorage.getItem("token");

// 1. Cek Token (Wajib Login)
if (!token) {
    alert("Sesi habis, silakan login kembali.");
    window.location.href = "../../logres/login.html";
}

// 2. Fungsi Utama: Fetch Data User
async function fetchUsers() {
    try {
        // Tampilkan Loading State
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="p-8 text-center text-gray-400">
                    <div class="flex flex-col items-center justify-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                        Memuat data user...
                    </div>
                </td>
            </tr>
        `;

        const response = await fetch(`${API_URL}/user/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
                "Accept": "application/json"
            }
        });

        if (!response.ok) throw new Error("Gagal mengambil data user.");

        const result = await response.json();
        // Normalisasi data (jika backend mengembalikan {data: []} atau langsung [])
        const users = Array.isArray(result) ? result : (result.data || []);

        renderTable(users);

    } catch (error) {
        console.error("Error fetching users:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="p-8 text-center text-red-500 bg-red-50">
                    Gagal memuat data user. <br>
                    <span class="text-xs text-red-400">${error.message}</span>
                </td>
            </tr>
        `;
    }
}

// 3. Fungsi Render Tabel
function renderTable(users) {
    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="p-8 text-center text-gray-500">
                    Belum ada data user.
                </td>
            </tr>
        `;
        return;
    }

    let rows = "";
    users.forEach((user, index) => {
        // ID handling (backend mungkin pakai 'id' atau 'id_user')
        const userId = user.id || user.id_user;
        
        // Styling Badge Role
        let roleBadge = "";
        if (user.role === 'admin') {
            roleBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            Admin
                         </span>`;
        } else {
            roleBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            User
                         </span>`;
        }

        rows += `
            <tr class="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-500">
                    ${index + 1}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-semibold text-gray-800">${user.name || '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-blue-600 font-medium">
                    @${user.username || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                    ${user.email || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    ${roleBadge}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center gap-2">
                        <a href="edit.html?id=${userId}" 
                           class="flex items-center px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-semibold transition-colors shadow-sm">
                            ✏️ Edit
                        </a>
                        <button onclick="deleteUser('${userId}', '${user.username}')"
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

// 4. Fungsi Hapus User (Global Scope)
window.deleteUser = async (id, username) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user @${username}?`)) return;

    try {
        const response = await fetch(`${API_URL}/user/${id}`, { 
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true"
            }
        });

        if (!response.ok) throw new Error("Gagal menghapus user.");

        alert("User berhasil dihapus!");
        fetchUsers(); // Refresh tabel

    } catch (error) {
        console.error("Delete Error:", error);
        alert("Gagal menghapus: " + error.message);
    }
};

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", fetchUsers);