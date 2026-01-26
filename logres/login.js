import API_URL from "../config.js";
import { getRole } from "../auth/auth.js";

const username = document.getElementById("username");
const password = document.getElementById("password");
const errorMsg = document.getElementById("errorMsg");
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    const form = new FormData();
    form.set("username", username.value.trim());
    form.set("password", password.value.trim());

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      errorMsg.style.display = "block";
      return;
    }

    const data = await response.json();
    localStorage.setItem("token", data.access_token);

    const role = getRole();

    if (role === "admin") {
      window.location.href = "/admin/dashboard.html";
    } else {
      window.location.href = "/home.html";
    }

  } catch (err) {
    console.error(err);
    errorMsg.style.display = "block";
  }
});
