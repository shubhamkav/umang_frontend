const API = "http://127.0.0.1:8000";

document.getElementById("loginForm").onsubmit = async (e) => {
  e.preventDefault();

  const res = await fetch(`${API}/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("admin_token", data.access_token);
    window.location.href = "admin.html";
  } else {
    document.getElementById("status").innerText = data.detail;
  }
};
