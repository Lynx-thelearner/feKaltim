import API_URL from "./config.js";

import { getRole } from "./auth.js";

const role = getRole();
const username = document.getElementById("username");
const password = document.getElementById("password");
const errorMsg = document.getElementById("errorMsg");
const loginBtn = document.getElementById("loginBtn");

function parseJwt(token) {
  const base64Payload = token.split(".")[1];
  return JSON.parse(atob(base64Payload));
}

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
    const token = data.access_token;

    localStorage.setItem("token", token);

    const payload = parseJwt(token);
    const role = payload.role;

    if (role === "admin") {
      window.location.href = "admin/dashboard.html";
    } else {
      window.location.href = "home.html";
    }
  } catch (err) {
    console.error(err);
    errorMsg.style.display = "block";
  }
});
