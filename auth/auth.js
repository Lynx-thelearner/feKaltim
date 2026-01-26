function getToken() {
  return localStorage.getItem("token");
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
