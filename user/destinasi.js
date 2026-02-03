import API_URL from "../../config.js";

// DOM Elements
const grid = document.getElementById("destinasi-grid");
const filtersContainer = document.getElementById("category-filters");
const searchInput = document.getElementById("search-input");
const emptyState = document.getElementById("empty-state");
const navAuth = document.getElementById("nav-auth");
const mobileAuth = document.getElementById("mobile-auth-links");


let allData = [];  
let categories = {}; 
let currentFilter = 'all';

// 1. INIT
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    initData();
});

// 2. CHECK AUTH
function checkAuth() {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};

    if (token) {
        navAuth.innerHTML = `
            <span class="text-sm font-bold text-slate-700 hidden lg:block">Halo, ${user.name || 'User'}</span>
            <a href="profile.html" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-cyan-100 hover:text-cyan-600 transition">
                <i data-lucide="user" width="20"></i>
            </a>
            <button onclick="handleLogout()" class="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                <i data-lucide="log-out" width="20"></i>
            </button>
        `;
        mobileAuth.innerHTML = `
            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-2">
                <div class="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold">${(user.name || 'U').charAt(0)}</div>
                <span class="font-bold text-slate-700">${user.name || 'User'}</span>
            </div>
            <a href="profile.html" class="block w-full text-center py-2 rounded-lg border border-slate-200 text-slate-600 font-bold mb-2">Profil Saya</a>
            <button onclick="handleLogout()" class="block w-full py-2 rounded-lg bg-red-50 text-red-600 font-bold">Keluar</button>
        `;
    } else {
        navAuth.innerHTML = `<a href="../logres/login.html" class="px-5 py-2.5 bg-cyan-600 text-white rounded-full text-sm font-bold hover:bg-cyan-700 transition shadow-lg shadow-cyan-500/30">Masuk</a>`;
        mobileAuth.innerHTML = `<a href="../logres/login.html" class="block w-full py-3 rounded-xl bg-cyan-600 text-white font-bold text-center shadow-lg shadow-cyan-500/30">Masuk Akun</a>`;
    }
    if(window.lucide) lucide.createIcons();
}

// 3. FETCH DATA (Categories & Wisata)
async function initData() {
    try {
        const token = localStorage.getItem("token");
        const headers = { "ngrok-skip-browser-warning": "true" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // A. Load Categories
        const catRes = await fetch(`${API_URL}/category/`, { headers });
        const catData = await catRes.json();
        const catList = Array.isArray(catData) ? catData : (catData.data || []);

        let filterHTML = `
            <button onclick="filterCategory('all', this)" 
                class="filter-btn shrink-0 px-6 py-2 rounded-full text-sm font-bold transition shadow-sm bg-cyan-600 text-white shadow-cyan-500/30 ring-2 ring-cyan-600">
                Semua
            </button>
        `;
        
        catList.forEach(c => {
            const id = c.id || c.id_category;
            categories[id] = c.name;
            filterHTML += `
                <button onclick="filterCategory(${id}, this)" 
                    class="filter-btn shrink-0 px-6 py-2 rounded-full text-sm font-bold bg-white text-slate-500 border border-slate-200 hover:border-cyan-400 hover:text-cyan-600 transition">
                    ${c.name}
                </button>
            `;
        });
        filtersContainer.innerHTML = filterHTML;

        // B. Load Wisata
        const res = await fetch(`${API_URL}/wisata/published`, { headers });
        
        if (res.status === 401) {
            grid.innerHTML = `<div class="col-span-full text-center py-20 bg-slate-100 rounded-3xl border border-dashed border-slate-300">
                <p class="text-slate-500 font-medium">Silakan login untuk melihat katalog wisata.</p>
                <a href="../logres/login.html" class="inline-block mt-4 text-cyan-600 font-bold hover:underline">Login Sekarang</a>
            </div>`;
            return;
        }

        const result = await res.json();
        const rawData = Array.isArray(result) ? result : (result.data || []);

        allData = rawData.filter(item => item.status === 'published');
        
        renderGrid(allData);

    } catch (error) {
        console.error("Error:", error);
        grid.innerHTML = `<p class="col-span-full text-center text-red-400">Gagal memuat data.</p>`;
    }
}

// 4. RENDER GRID
function renderGrid(items) {
    if (!items || items.length === 0) {
        grid.classList.add("hidden");
        emptyState.classList.remove("hidden");
        return;
    }

    function formatRupiah(angka) {
    if (!angka || angka == 0.00) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0 
    }).format(angka);
}

    grid.classList.remove("hidden");
    emptyState.classList.add("hidden");

    grid.innerHTML = items.map(item => {
        const id = item.id || item.id_wisata;
        const catName = categories[item.category_id] || 'Umum';
        
        let img = item.image_cover || 'https://via.placeholder.com/400';
        if (img.startsWith("static/")) img = `${API_URL}/${img}`;

        const price = formatRupiah(item.ticket_price);

        return `
            <div class="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-200 transition-all duration-300 cursor-pointer flex flex-col h-full"
                 onclick="location.href='detail_wisata.html?id=${id}'">
                
                <div class="h-60 overflow-hidden relative">
                    <img src="${img}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                    <span class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-cyan-800 uppercase tracking-wide shadow-sm">
                        ${catName}
                    </span>
                </div>

                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="text-xl font-serif font-bold text-slate-800 line-clamp-1 group-hover:text-cyan-600 transition-colors mb-2">${item.nama_wisata}</h3>
                    <p class="text-slate-500 text-sm mb-4 flex items-center gap-1">
                        <i data-lucide="map-pin" width="14" class="text-cyan-500"></i> <span class="truncate">${item.lokasi || '-'}</span>
                    </p>
                    <div class="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                        <div>
                            <span class="text-[10px] uppercase font-bold text-slate-400 block">Mulai Dari</span>
                            <span class="text-cyan-700 font-bold text-lg">${price}</span>
                        </div>
                        <span class="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300">
                            <i data-lucide="arrow-right" width="20"></i>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    if(window.lucide) lucide.createIcons();
}

// 5. FILTERING LOGIC
window.filterCategory = (catId, btn) => {
    currentFilter = catId;
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.className = "filter-btn shrink-0 px-6 py-2 rounded-full text-sm font-bold bg-white text-slate-500 border border-slate-200 hover:border-cyan-400 hover:text-cyan-600 transition";
    });
    btn.className = "filter-btn shrink-0 px-6 py-2 rounded-full text-sm font-bold transition shadow-sm bg-cyan-600 text-white shadow-cyan-500/30 ring-2 ring-cyan-600";
    applyFilters();
};

searchInput.addEventListener("input", applyFilters);

function applyFilters() {
    const keyword = searchInput.value.toLowerCase();
    

    if (!allData) return;

    const filtered = allData.filter(item => {
      const matchName = item.nama_wisata.toLowerCase().includes(keyword);
        const matchTags = (item.tags || "").toLowerCase().includes(keyword); 
        const matchSearch = matchName || matchTags;
        const matchCat = (currentFilter === 'all') || (item.category_id == currentFilter);

        return matchSearch && matchCat;
    });

    renderGrid(filtered);
}

// 6. LOGOUT
window.handleLogout = () => {
    if(confirm("Yakin ingin logout?")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
    }
};