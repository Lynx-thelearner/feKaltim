import API_URL from "./config.js";

const username = document.getElementById("username");
const password = document.getElementById("password");
const errorMsg = document.getElementById("errorMsg");
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    // Form data
    const form = new FormData();
    form.set("username", username.value.trim());
    form.set("password", password.value.trim());

    //Send requestnya
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      body: form,
    });

    // Ngecek Response
    if (!response.ok) {
      errorMsg.style.display = "block";
      return;
    }

    const data = await response.json();
    console.log(data);

    //Save token
    localStorage.setItem("token", data.access_token);

    // Arahin ke page selanjutnya
    window.location.href = "home.html";
  } catch (error) {
    console.error(error);
    errorMsg.style.display = "block";
  }
});
