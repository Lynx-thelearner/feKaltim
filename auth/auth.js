function getToken() {
  return localStorage.getItem("token");
}


export function requireAuth(pathToLogin) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Akses ditolak! Silakan login terlebih dahulu.");
        // Redirect ke halaman login (path disesuaikan saat pemanggilan)
        window.location.href = pathToLogin;
        // Hentikan eksekusi script selanjutnya
        throw new Error("No token found");
    }

    return token; // Kembalikan token agar bisa dipakai untuk fetch
}

// Fungsi untuk mendapatkan data user yang sedang login (Opsional)
export function getUserData() {
    const userSession = localStorage.getItem("user");
    if (userSession) {
        try {
            return JSON.parse(userSession);
        } catch (e) {
            console.error("Gagal parsing user data");
            return null;
        }
    }
    return null;
}


function parseJwt(token) {
  if (!token) return null;
  const base64Payload = token.split(".")[1];
  return JSON.parse(atob(base64Payload));
}

function getUser() {
  const token = getToken();
  return token ? parseJwt(token) : null;
}

function getRole() {
  const user = getUser();
  return user?.role || null;
}

function isLoggedIn() {
  return !!getToken();
}

export {
  getToken,
  getUser,
  getRole,
  isLoggedIn
};
