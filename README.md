# feKaltim - Frontend Nature Kaltim

Aplikasi web front-end untuk manajemen dan promosi wisata Kalimantan Timur. Aplikasi ini menyediakan antarmuka untuk admin mengelola data wisata dan interface publik untuk pengguna.

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Struktur Proyek](#struktur-proyek)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Penggunaan](#penggunaan)
- [Fitur Admin](#fitur-admin)
- [Fitur User](#fitur-user)
- [API Integration](#api-integration)
- [Autentikasi](#autentikasi)
- [Kontribusi](#kontribusi)

##  Fitur Utama

### Admin Panel
- **Dashboard** - Ringkasan statistik dan data wisata
- **Manajemen Kategori** - CRUD kategori wisata
- **Manajemen Wisata** - Tambah, edit, hapus data wisata
- **Manajemen Fasilitas** - Kelola fasilitas wisata
- **Manajemen Gambar** - Upload dan kelola gambar wisata
- **Manajemen Tags** - Buat dan kelola tag wisata
- **Manajemen User** - Kelola user aplikasi


### User Panel
- **Halaman Beranda** - Daftar wisata dan rekomendasi
- **Detail Wisata** - Informasi lengkap wisata
- **Fasilitas Wisata** - Daftar fasilitas yang tersedia


##  Struktur Proyek

```
feKaltim/
├── admin/                          # Panel Admin
│   ├── dashboard.html             # Halaman dashboard
│   ├── dashboard.js               # Logic dashboard
│   ├── category/                  # Manajemen kategori
│   │   ├── index.html            # Daftar kategori
│   │   ├── create.html           # Form tambah kategori
│   │   ├── edit.html             # Form edit kategori
│   │   ├── index-category.js     # Logic daftar kategori
│   │   ├── edit-category.js      # Logic edit kategori
│   │   └── CategoryController.js # CRUD kategori
│   ├── wisata/                    # Manajemen wisata
│   │   ├── index.html
│   │   ├── create.html
│   │   ├── edit.html
│   │   └── wisata.js
│   ├── facility/                  # Manajemen fasilitas
│   │   ├── index.html
│   │   ├── create.html
│   │   ├── edit.html
│   │   └── facility.js
│   ├── tags/                      # Manajemen tags
│   │   ├── index.html
│   │   ├── create.html
│   │   ├── edit.html
│   │   ├── index-tag.js
│   │   ├── edit-tag.js
│   │   └── tags.js
│   ├── image-wisata/              # Manajemen gambar
│   │   ├── index.html
│   │   ├── create.html
│   │   ├── edit.html
│   │   ├── index.js
│   │   ├── create.js
│   │   └── edit.js
│   ├── user/                      # Manajemen user
│       ├── index.html
│       ├── create.html
│       ├── edit.html
│       ├── index.js
│       ├── create-user.js
│       └── edit.js
│   
│       
├── user/                          # Panel User
│   └── home.html                 # Halaman beranda
├── auth/                          # Modul autentikasi
│   └── auth.js                   # Fungsi helper autentikasi
├── logres/                        # Halaman login & register
│   ├── login.html                # Form login
│   ├── login.js                  # Logic login
│   ├── logout.js                 # Logic logout
│   ├── register.html             # Form register
│   └── register.js               # Logic register
├── JS/                            # JavaScript utilities
│   ├── CategoryController.js      # Controller kategori
│   └── Controller.js              # General controller
├── config.js                      # Konfigurasi API
├── dashboard.html                 # Home page publik
├── login.html                     # Login page publik
└── README.md                      # File ini
```

##  Instalasi

### Prerequisites
- Browser modern (Chrome, Firefox, Safari, Edge)
- Text Editor atau IDE (VS Code, Sublime Text, dll)
- Git (untuk cloning repository)

### Langkah Instalasi

1. **Clone Repository**
```bash
git clone https://github.com/Lynx-thelearner/feKaltim.git
cd feKaltim
```

2. **Update Konfigurasi API** (opsional)
Edit file `config.js` untuk mengubah API URL:
```javascript
const API_URL = "https://your-api-url.com";
export default API_URL;
```

3. **Jalankan dengan Live Server**
Gunakan VS Code Live Server extension atau server lokal lainnya:
```bash
# Jika menggunakan Python
python -m http.server 8000


4. **Buka di Browser**
```
http://localhost:8000
```

##  Konfigurasi

### API Configuration (`config.js`)
```javascript
const API_URL = "https://a4f4eaf1d3b1.ngrok-free.app";
export default API_URL;
```

### Environment
- Development: Gunakan ngrok URL atau localhost API
- Production: Update API_URL ke production server

## 📖 Penggunaan

### Untuk Admin

#### Login Admin
1. Buka halaman login
2. Masukkan email dan password admin
3. Klik tombol Login
4. Akan diarahkan ke Dashboard Admin

#### Manajemen Kategori
1. Klik menu "Kategori" di sidebar
2. Lihat daftar kategori yang sudah ada
3. Tombol aksi:
   - **+ Tambah Kategori**: Form tambah kategori baru
   - **Edit**: Edit nama kategori
   - **Hapus**: Hapus kategori (dengan konfirmasi)

#### Manajemen Wisata
1. Klik menu "Data Wisata" di sidebar
2. Lihat daftar wisata yang sudah ada
3. Gunakan tombol aksi untuk CRUD operasi

### Untuk User

#### Login User
1. Buka halaman login
2. Masukkan email dan password user
3. Klik tombol Login
4. Akan diarahkan ke Halaman Beranda

#### Melihat Wisata
1. Di halaman beranda, lihat daftar wisata
2. Klik wisata untuk melihat detail
3. Lihat informasi, fasilitas



##  Fitur Admin

### 1. Dashboard
- Statistik jumlah wisata, kategori, user


### 2. Manajemen Kategori
```
GET    /category/                    # Daftar semua kategori
POST   /category/                    # Tambah kategori baru
GET    /category/{id_kategori}       # Detail kategori
PATCH  /category/{id_kategori}       # Update kategori
DELETE /category/{id_kategori}       # Hapus kategori
```

### 3. Manajemen Wisata
- CRUD lengkap untuk data wisata
- Upload gambar wisata
- Assign kategori dan tags
- Kelola fasilitas yang tersedia

### 4. Manajemen Fasilitas
- CRUD fasilitas wisata
- Assign fasilitas ke wisata

### 5. Manajemen Tags
- CRUD tags untuk klasifikasi wisata
- Assign multiple tags ke wisata

### 6. Manajemen Gambar
- Upload gambar wisata
- Edit informasi gambar
- Hapus gambar

### 7. Manajemen User
- CRUD user aplikasi
- Set role user (admin/user)
- Atur status user

##  Fitur User

### 1. Halaman Beranda
- Daftar wisata terbaru
- Pencarian wisata
- Filter berdasarkan kategori

### 2. Detail Wisata
- Informasi wisata
- Galeri gambar
- Fasilitas yang tersedia




### Autentikasi
```javascript
// Login
POST /login
Body: { email, password }
Response: { token, user_data }

// Register
POST /register
Body: { name, email, password, phone }
Response: { message, user_data }
```

### Category API
```javascript
// Daftar kategori
GET /category/
Headers: { Authorization: Bearer {token} }
Response: { data: [...] }

// Tambah kategori
POST /category/
Headers: { Authorization: Bearer {token} }
Body: { nama_kategori }
Response: { id, nama_kategori }

// Edit kategori
PATCH /category/{id}
Headers: { Authorization: Bearer {token} }
Body: { nama_kategori }
Response: { id, nama_kategori }

// Hapus kategori
DELETE /category/{id}
Headers: { Authorization: Bearer {token} }
Response: { message: "Berhasil dihapus" }
```

### Wisata API
```javascript
// Daftar wisata
GET /wisata/
Response: { data: [...] }

// Detail wisata
GET /wisata/{id}
Response: { data: {...} }

// Tambah wisata (Admin only)
POST /wisata/
Headers: { Authorization: Bearer {token} }
Body: { nama_wisata, deskripsi, kategori_id, ... }
Response: { id, ... }
```

##  Autentikasi

### Sistem Login
1. User memasukkan email dan password
2. Server melakukan validasi
3. Jika valid, server mengembalikan JWT token
4. Token disimpan di localStorage
5. Token digunakan di header request: `Authorization: Bearer {token}`

### Token Management
- Token disimpan di `localStorage` dengan key `token`
- Setiap request ke API include token di header
- Token expired akan diarahkan kembali ke login
- Logout akan menghapus token dari localStorage

### Helper Functions (`auth/auth.js`)
```javascript
getToken()        // Ambil token dari localStorage
parseJwt(token)   // Parse JWT token
getUser()         // Ambil data user dari token
getRole()         // Ambil role user
isLoggedIn()      // Cek apakah user sudah login
```

### API Connection Error
1. Pastikan API URL di `config.js` benar
2. Periksa internet connection
3. Cek CORS settings di backend


##  Contributors

- **Lynx-thelearner** - Project Owner



**Last Updated**: February 1, 2026  
**Version**: 1.0.0
