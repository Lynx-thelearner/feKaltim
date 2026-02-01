function handleLogout() {
    if (confirm("Yakin ingin logout?")) {
        localStorage.clear();
        window.location.href = "../logres/login.html";
    }
}
// Ekspor ke window agar bisa dibaca HTML onclick
window.handleLogout = handleLogout;