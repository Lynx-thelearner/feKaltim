import API_URL from "../../config.js";

const loadingState = document.getElementById("loading-state");
const mainContent = document.getElementById("main-content");

document.addEventListener("DOMContentLoaded", () => {
    loadDetail();
});

async function loadDetail() {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        if (!id) throw new Error("ID tidak ditemukan.");

        const token = localStorage.getItem("token");
        const headers = { "ngrok-skip-browser-warning": "true" };
        if(token) headers["Authorization"] = `Bearer ${token}`;

        const [resWisata, resCat] = await Promise.all([
            fetch(`${API_URL}/wisata/${id}`, { headers }),
            fetch(`${API_URL}/category/`, { headers })
        ]);

        if (!resWisata.ok) throw new Error("Gagal mengambil data wisata");

        const dataWisata = await resWisata.json();
        const dataCategory = await resCat.json();

        const item = dataWisata.data || dataWisata;
        const categories = Array.isArray(dataCategory) ? dataCategory : (dataCategory.data || []);

        renderUI(item, categories);

    } catch (error) {
        console.error(error);
        loadingState.classList.add("hidden");
        alert("Gagal memuat data.");
    }
}

function renderUI(item, categories) {
    // 1. Cover Image
    let coverUrl = 'https://via.placeholder.com/1200x800?text=No+Cover';
    if (item.image_cover) {
        coverUrl = item.image_cover.startsWith("http") ? item.image_cover : `${API_URL}/${item.image_cover}`;
    }
    document.getElementById("hero-image").src = coverUrl;

    // 2. Info Utama (Title & Location)
    document.getElementById("hero-title").textContent = item.nama_wisata;
    document.getElementById("hero-location").textContent = item.lokasi || "Kalimantan Timur";
    document.title = `${item.nama_wisata} - Nature Kaltim`;

    // 3. Kategori (Centered Badge)
    const catObj = categories.find(c => (c.id || c.id_category) == item.category_id);
    document.getElementById("hero-category").textContent = catObj ? catObj.name : "WISATA";

    // 4. Tags Wisata (New Feature)
    const tagsContainer = document.getElementById("hero-tags");
    const tagsList = item.tag || []; // Asumsi properti dari API bernama 'tag' (array of strings)
    
    if (tagsList.length > 0) {
        tagsContainer.innerHTML = tagsList.map(tag => `
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-slate-200 backdrop-blur-sm">
                #${tag}
            </span>
        `).join("");
    } else {
        tagsContainer.innerHTML = ''; // Kosongkan jika tidak ada tag
    }

    // 5. Info Sidebar (Harga, Jam)
    const price = new Intl.NumberFormat("id-ID", {style: "currency", currency: "IDR"}).format(item.ticket_price);
    document.getElementById("info-price").textContent = price;

    const open = item.open_time ? String(item.open_time).substring(0, 5) : "00:00";
    const close = item.close_time ? String(item.close_time).substring(0, 5) : "00:00";
    document.getElementById("info-hours").textContent = `${open} - ${close}`;

    // 6. Fasilitas
    const facContainer = document.getElementById("info-facilities");
    const facilitiesList = item.facilities || [];
    
    if (facilitiesList.length > 0) {
        facContainer.innerHTML = facilitiesList.map(facName => `
            <li class="flex items-center gap-3 text-sm text-slate-600 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                <div class="w-2 h-2 bg-cyan-500 rounded-full ml-1"></div> ${facName}
            </li>
        `).join("");
    } else {
        facContainer.innerHTML = `<li class="text-slate-400 italic text-sm">Fasilitas tidak terdata.</li>`;
    }

    // 7. Deskripsi wisata
    const descEl = document.getElementById("info-description");
    if (item.deskripsi && item.deskripsi.trim() !== "") {
      descEl.innerHTML = item.deskripsi.replace(/\n/g, "<br>");
    } else {
        descEl.innerHTML = `<em class="text-slate-400">Belum ada deskripsi untuk wisata ini.</em>`;
    }

    // 8. Galeri Grid
    const galleryContainer = document.getElementById("gallery-grid");
    const galleryImages = Array.isArray(item.images) ? item.images : [];

    if (galleryImages.length > 0) {
        galleryContainer.innerHTML = galleryImages.map(imgStr => {
            let src = imgStr.startsWith("http") ? imgStr : `${API_URL}/${imgStr}`;
            if (src === coverUrl) return ''; 
            return `
                <div class="h-56 rounded-2xl overflow-hidden cursor-pointer group relative shadow-md border border-slate-200">
                    <img src="${src}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="Galeri">
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
                </div>
            `;
        }).join("");
    } else {
        document.getElementById("no-gallery-msg").classList.remove("hidden");
    }


    loadingState.classList.add("hidden");
    mainContent.classList.remove("hidden");
    lucide.createIcons();
}