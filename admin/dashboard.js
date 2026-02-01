import API_URL from "/config.js";

// 1. Ambil Element DOM
const countWisataEl = document.getElementById("count-wisata");
const countUsersEl = document.getElementById("count-users");
const countCategoryEl = document.getElementById("count-category");
const countTagsEl = document.getElementById("count-tags");
const countFacilityEl = document.getElementById("count-facility");
const adminNameEl = document.getElementById("admin-name");
const recentUsersTbody = document.getElementById("recent-users-tbody"); // Elemen Tabel Baru

// 2. Cek Token
const token = localStorage.getItem("token");
if (!token) {
    alert("Sesi habis, silakan login kembali.");
    window.location.href = "../logres/login.html";
}

// 3. Tampilkan Nama Admin
const userSession = localStorage.getItem("user");
if (userSession) {
    try {
        const user = JSON.parse(userSession);
        if (user.name) adminNameEl.textContent = user.name;
    } catch (e) {
        console.error("Gagal parsing data user", e);
    }
}

// 4. Helper Fetch Count (Untuk Kartu Statistik)
async function fetchCount(endpoint) {
    try {
        const res = await fetch(`${API_URL}/${endpoint}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
                "Accept": "application/json"
            }
        });

        if (!res.ok) return 0;
        const result = await res.json();
        const data = result.data || result;
        return Array.isArray(data) ? data.length : 0;
    } catch (error) {
        console.error(`Error fetching count ${endpoint}:`, error);
        return 0;
    }
}

// 5. Fungsi Load Tabel Riwayat User (BARU)
async function loadRecentUsers() {
    try {
        // Ambil data user dari endpoint /user/
        const res = await fetch(`${API_URL}/user/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
                "Accept": "application/json"
            }
        });

        if (!res.ok) throw new Error("Gagal mengambil data user");

        const result = await res.json();
        let users = result.data || result;

        if (!Array.isArray(users)) users = [];

        // Ambil 5 user terakhir (Asumsi data terbaru ada di akhir atau perlu disortir)
        // Kita balik urutannya (reverse) agar yang terakhir fetch muncul di atas
        // Atau jika ada field 'created_at', bisa di sort: users.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
        const recentUsers = users.slice(-5).reverse(); 

        let rows = "";
        if (recentUsers.length === 0) {
            rows = `<tr><td colspan="4" class="p-4 text-center">Belum ada data user.</td></tr>`;
        } else {
            recentUsers.forEach(user => {
                // Badge Role
                const roleBadge = user.role === 'admin' 
                    ? '<span class="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold">Admin</span>'
                    : '<span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold">User</span>';

                rows += `
                    <tr class="hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <td class="px-6 py-3 font-medium text-gray-800">${user.name || '-'}</td>
                        <td class="px-6 py-3 text-blue-600">@${user.username || '-'}</td>
                        <td class="px-6 py-3 text-gray-500">${user.email || '-'}</td>
                        <td class="px-6 py-3 text-center">${roleBadge}</td>
                    </tr>
                `;
            });
        }

        if(recentUsersTbody) recentUsersTbody.innerHTML = rows;

    } catch (error) {
        console.error("Gagal load recent users:", error);
        if(recentUsersTbody) recentUsersTbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-500">Gagal memuat data.</td></tr>`;
    }
}

// 6. Fungsi Utama Load Dashboard
async function loadDashboard() {
    try {
        // Load Statistik
        const [totalWisata, totalUsers, totalCategory, totalTags, totalFacility] = await Promise.all([
            fetchCount("wisata/"),   
            fetchCount("user/"),     
            fetchCount("category/"), 
            fetchCount("tag/"),      
            fetchCount("facility/")  
        ]);

        // Update Kartu Statistik
        if (countWisataEl) countWisataEl.textContent = totalWisata;
        if (countUsersEl) countUsersEl.textContent = totalUsers;
        if (countCategoryEl) countCategoryEl.textContent = totalCategory;
        if (countTagsEl) countTagsEl.textContent = totalTags;
        if (countFacilityEl) countFacilityEl.textContent = totalFacility;

        // Load Tabel User Terbaru
        loadRecentUsers();

    } catch (error) {
        console.error("Gagal memuat dashboard:", error);
    }
}

// Jalankan
loadDashboard();