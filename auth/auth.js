function getToken() {
  return localStorage.getItem("token");
}

// Parse JWT token dan kembalikan decoded data
export function parseJwt(token) {
  try {
    if (!token) return null;
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;
    const decoded = atob(base64Payload);
    return JSON.parse(decoded);
  } catch (e) {
    console.error("Gagal parse JWT:", e);
    return null;
  }
}

function getUser() {
  const token = getToken();
  return token ? parseJwt(token) : null;
}

export function requireAuth(pathToLogin) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Akses ditolak! Silakan login terlebih dahulu.");
    window.location.href = pathToLogin;
    throw new Error("No token found");
  }

  return token;
}

// Fungsi untuk mendapatkan data user yang sedang login
export function getUserData() {
  const userSession = localStorage.getItem("user");
  if (userSession && userSession !== "null") {
    try {
      return JSON.parse(userSession);
    } catch (e) {
      console.error("Gagal parsing user data:", e);
      return null;
    }
  }
  return null;
}

// Fetch data user dari API endpoint /user/profile
export async function fetchUserProfile(apiUrl) {
  try {
    const token = getToken();
    if (!token) {
      return null;
    }

    const res = await fetch(`${apiUrl}/user/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true"
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      return null;
    }

    const data = await res.json();

    // Extract user data - cek struktur response
    let userData = null;
    
    if (data.data) {
      userData = data.data;
    } else if (data.user) {
      userData = data.user;
    } else {
      userData = data;
    }

    if (userData && userData.name) {
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } else {
      return userData;
    }
  } catch (e) {
    return null;
  }
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
