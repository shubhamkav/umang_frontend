const API = "http://127.0.0.1:8000";
const token = localStorage.getItem("admin_token");

if (!token) {
  window.location.href = "admin-login.html";
}

document.getElementById("changeForm").onsubmit = async (e) => {
  e.preventDefault();

  const res = await fetch(`${API}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      old_password: old_password.value,
      new_password: new_password.value
    })
  });

  const data = await res.json();

  if (res.ok) {
    document.getElementById("status").innerText =
      "Password changed. Update .env with new hash:\n" + data.new_password_hash;
  } else {
    document.getElementById("status").innerText = data.detail;
  }
};
