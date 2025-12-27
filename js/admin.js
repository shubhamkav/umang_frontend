/* ==================================================
   UMANG 2025 — ADMIN DASHBOARD SCRIPT (PROTECTED)
   ================================================== */

const API_BASE = "http://127.0.0.1:8000";
const REG_API = `${API_BASE}/admin/registrations`;

/* ================= AUTH CHECK ================= */
const token = localStorage.getItem("admin_token");

if (!token) {
  window.location.href = "admin-login.html";
}

/* ================= ELEMENTS ================= */
const tableBody = document.getElementById("table-body");
const filter = document.getElementById("categoryFilter");

const exportCategory = document.getElementById("exportCategory");
const exportEvent = document.getElementById("exportEvent");
const downloadBtn = document.getElementById("downloadExcel");

let allData = [];

/* ================= LOAD REGISTRATIONS ================= */
async function loadRegistrations() {
  try {
    const res = await fetch(REG_API, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (res.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "admin-login.html";
      return;
    }

    if (!res.ok) throw new Error("Failed to load registrations");

    allData = await res.json();
    renderTable(allData);

  } catch (err) {
    console.error(err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="10">⚠️ Unable to load registrations</td>
      </tr>
    `;
  }
}

/* ================= RENDER TABLE ================= */
function renderTable(data) {
  tableBody.innerHTML = "";

  if (!data || data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="10">No registrations found</td>
      </tr>
    `;
    return;
  }

  data.forEach((r, i) => {
    const row = `
      <tr>
        <td>${i + 1}</td>
        <td>${r.name}</td>
        <td>${r.roll_number}</td>
        <td>${r.department}</td>
        <td>${r.year}</td>
        <td>${r.email}</td>
        <td>${r.event}</td>
        <td>${r.category}</td>
        <td>${r.team ?? "-"}</td>
        <td>${new Date(r.time).toLocaleString()}</td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
}

/* ================= FILTER ================= */
filter.addEventListener("change", () => {
  if (filter.value === "all") {
    renderTable(allData);
  } else {
    renderTable(allData.filter(r => r.category === filter.value));
  }
});

/* ================= EXPORT EVENTS ================= */

// Load events for export dropdown
async function loadExportEvents() {
  const category = exportCategory.value;

  // ✅ Correct backend routes
  const endpoint =
    category === "sport"
      ? `${API_BASE}/sports/events`
      : `${API_BASE}/cultural/events`;

  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error("Failed to load events");

    const events = await res.json();
    exportEvent.innerHTML = "";

    events.forEach(e => {
      const option = document.createElement("option");
      option.value = e.name;
      option.textContent = e.name;
      exportEvent.appendChild(option);
    });

  } catch (err) {
    console.error(err);
    exportEvent.innerHTML = `<option>Error loading events</option>`;
  }
}

// Reload events when category changes
exportCategory.addEventListener("change", loadExportEvents);

/* ================= DOWNLOAD CSV ================= */
downloadBtn.addEventListener("click", async () => {
  const category = exportCategory.value;
  const eventName = exportEvent.value;

  if (!eventName) {
    alert("Please select an event");
    return;
  }

  const url =
    `${API_BASE}/admin/export` +
    `?category=${category}&event_name=${encodeURIComponent(eventName)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      alert("Failed to download file");
      return;
    }

    const blob = await res.blob();
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = `${eventName}_${category}_registrations.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    console.error(err);
    alert("Download failed");
  }
});

/* ================= INIT ================= */
loadRegistrations();
loadExportEvents();
