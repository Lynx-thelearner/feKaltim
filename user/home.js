import API_URL from "../../config.js";

// DOM Elements
const navAuth = document.getElementById("nav-auth");
const mobileAuth = document.getElementById("mobile-auth-links");
const popularGrid = document.getElementById("popular-grid");
const navContainer = document.getElementById("nav-container");

// 1. INIT
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    loadPopularWisata();
    initScrollEffect();
});

// 2. CHECK AUTH
function checkAuth() {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};

    if (token) {
        navAuth.innerHTML = `
            <span class="text-sm font-bold text-slate-700 hidden lg:block">Halo, ${user.name || 'User'}</span>
            <a href="profile.html" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-cyan-100 hover:text-cyan-600 transition" title="Profil">
                <i data-lucide="user" width="20"></i>
            </a>
            <button onclick="handleLogout()" class="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition" title="Logout">
                <i data-lucide="log-out" width="20"></i>
            </button>
        `;

        mobileAuth.innerHTML = `
            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-2">
                <div class="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold">
                    ${(user.name || 'U').charAt(0)}
                </div>
                <span class="font-bold text-slate-700">${user.name || 'User'}</span>
            </div>
            <a href="profile.html" class="block w-full text-center py-2 rounded-lg border border-slate-200 text-slate-600 font-bold mb-2">Profil Saya</a>
            <button onclick="handleLogout()" class="block w-full py-2 rounded-lg bg-red-50 text-red-600 font-bold">Keluar</button>
        `;
    } else {
        navAuth.innerHTML = `
            <a href="../logres/login.html" class="text-slate-500 font-bold hover:text-cyan-600 transition text-sm">Masuk</a>
            <a href="destinasi.html" class="px-5 py-2.5 bg-cyan-600 text-white rounded-full text-sm font-bold hover:bg-cyan-700 transition shadow-lg shadow-cyan-500/30">
                Jelajah
            </a>
        `;
        mobileAuth.innerHTML = `
            <a href="../logres/login.html" class="block w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-center mb-2 hover:bg-slate-200">Masuk Akun</a>
            <a href="destinasi.html" class="block w-full py-3 rounded-xl bg-cyan-600 text-white font-bold text-center shadow-lg shadow-cyan-500/30">Jelajah Sekarang</a>
        `;
    }
    if(window.lucide) lucide.createIcons();
}

// 3. LOAD POPULAR WISATA (PERBAIKAN UTAMA DI SINI)
async function loadPopularWisata() {
    try {
        popularGrid.innerHTML = `
            <div class="h-[400px] bg-slate-200 rounded-3xl animate-pulse"></div>
            <div class="h-[400px] bg-slate-200 rounded-3xl animate-pulse"></div>
        `;

        // Fetch Data Wisata & Kategori
        const [resWisata, resCat] = await Promise.all([
            fetch(`${API_URL}/wisata/published`, { headers: {"ngrok-skip-browser-warning": "true"} }),
            fetch(`${API_URL}/category/`, { headers: {"ngrok-skip-browser-warning": "true"} })
        ]);
        
        if (!resWisata.ok) throw new Error(`Gagal load data: ${resWisata.status}`);

        const result = await resWisata.json();
        const catResult = await resCat.json();

        // Normalisasi Data
        const data = Array.isArray(result) ? result : (result.data || []);
        const categories = Array.isArray(catResult) ? catResult : (catResult.data || []);

        // Filter Published
        let published = data.filter(i => i.status === 'published');

    

        // Ambil 2 Data Teratas
        published = published.slice(0, 2);

        // Jika kosong
        if (published.length === 0) {
            popularGrid.innerHTML = `<p class="text-slate-500 col-span-full text-center">Belum ada data populer.</p>`;
            return;
        }

        // RENDER HTML (Bagian yang sebelumnya hilang)
        popularGrid.innerHTML = published.map(item => {
            // Fix ID & Image
            const id = item.id_wisata || item.id;
            let img = item.image_cover || 'https://via.placeholder.com/600x400';
            if (img.startsWith("static/")) img = `${API_URL}/${img}`;

            const price = new Intl.NumberFormat("id-ID", {style: "currency", currency: "IDR"}).format(item.ticket_price);
            // Cari Nama Kategori
            const cat = categories.find(c => (c.id || c.id_category) == item.category_id);
            const catName = cat ? cat.name : "Wisata";

            // Generate Tags
            const tagsList = Array.isArray(item.tag) ? item.tag : [];
            const tagsHtml = tagsList.map(tag => `
                <span class="inline-block px-2 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold rounded-full shadow-sm uppercase tracking-wide">
                    #${tag}
                </span>
            `).join("");

            return `
                <div class="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500"
                     onclick="location.href='detail_wisata.html?id=${id}'">
                    
                    <img src="${img}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                    
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                    
                    <div class="absolute bottom-0 left-0 p-8 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        
                        <div class="flex flex-wrap gap-2 mb-3">
                            <span class="inline-block px-3 py-1 bg-cyan-600 text-white text-xs font-bold rounded-full shadow-lg uppercase tracking-wider">
                                ${catName}
                            </span>
                            ${tagsHtml}
                        </div>

                        <h3 class="text-3xl font-serif font-bold text-white mb-2 leading-tight">${item.nama_wisata}</h3>
                        <p class="text-slate-300 text-sm mb-4 flex items-center gap-2">
                            <i data-lucide="map-pin" width="16"></i> ${item.lokasi || '-'}
                        </p>
                        
                        <div class="flex justify-between items-center border-t border-white/20 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                            <span class="text-white font-bold text-lg">${price}</span>
                            <span class="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-cyan-400 hover:text-white transition">
                                <i data-lucide="arrow-up-right" width="20"></i>
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        if(window.lucide) lucide.createIcons();

    } catch (error) {
        console.error("Error Detail:", error); // Cek Console untuk lihat error asli
        popularGrid.innerHTML = `<p class="text-red-400 col-span-full text-center">Gagal memuat wisata: ${error.message}</p>`;
    }
}

// 4. NAVBAR SCROLL
function initScrollEffect() {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navContainer.classList.remove("py-4", "max-w-7xl");
            navContainer.classList.add("py-3", "max-w-6xl", "bg-white/95");
        } else {
            navContainer.classList.add("py-4", "max-w-7xl");
            navContainer.classList.remove("py-3", "max-w-6xl", "bg-white/95");
        }
    });
}

// 5. LOGOUT
window.handleLogout = () => {
    if(confirm("Yakin ingin logout?")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
    }
};