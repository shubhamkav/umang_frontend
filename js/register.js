/* =========================================================
   UMANG 2025 — EVENT REGISTRATION SCRIPT
   HARDENED • AUTOFILL-SAFE • PRODUCTION-GRADE
   ========================================================= */

const API_BASE = "http://127.0.0.1:8000";

/* ================= ELEMENTS ================= */
const form = document.getElementById("registration-form");
const statusText = document.getElementById("form-status");

const eventTitle = document.getElementById("event-title");
const eventMeta = document.getElementById("event-meta");

const teamGroup = document.getElementById("team-name-group");
const teamInput = document.getElementById("team_name");

const pairTypeGroup = document.getElementById("pair-type-group");
const pairTypeSelect = document.getElementById("pair_type");
const partnerGroup = document.getElementById("partner-group");
const partnerInput = document.getElementById("partner_name");

/* ================= AUTOFILL OFF ================= */
form.setAttribute("autocomplete", "off");
document.querySelectorAll("input, select").forEach(el => {
  el.setAttribute("autocomplete", "off");
});

/* ================= GET EVENT ID ================= */
const params = new URLSearchParams(window.location.search);
const eventId = params.get("event_id");

if (!eventId) {
  eventTitle.textContent = "Invalid Registration Link";
  eventMeta.textContent = "No event selected.";
  form.style.display = "none";
  throw new Error("Missing event_id");
}

document.getElementById("event_id").value = eventId;

let currentEventType = null;

/* ================= FETCH EVENT ================= */
(async function fetchEventDetails() {
  try {
    const [sports, cultural] = await Promise.all([
      fetch(`${API_BASE}/sports/events`).then(r => r.json()),
      fetch(`${API_BASE}/cultural/events`).then(r => r.json())
    ]);

    const event = [...sports, ...cultural].find(e => String(e.id) === eventId);
    if (!event) throw new Error("Event not found");

    currentEventType = event.participation_type;

    eventTitle.textContent = `Register for ${event.name}`;
    eventMeta.textContent =
      `${event.category.toUpperCase()} • ${event.participation_type}`;

    /* ===== UI RULES ===== */
    teamGroup.style.display = "none";
    pairTypeGroup.style.display = "none";
    partnerGroup.style.display = "none";

    teamInput.required = false;
    partnerInput.required = false;

    if (event.participation_type === "team") {
      teamGroup.style.display = "block";
      teamInput.required = true;
    }

    if (event.participation_type === "both") {
      pairTypeGroup.style.display = "block";
    }

  } catch (err) {
    console.error(err);
    form.style.display = "none";
  }
})();

/* ================= PAIR TOGGLE ================= */
if (pairTypeSelect) {
  pairTypeSelect.addEventListener("change", () => {
    if (pairTypeSelect.value === "pair") {
      partnerGroup.style.display = "block";
      partnerInput.required = true;
    } else {
      partnerGroup.style.display = "none";
      partnerInput.required = false;
      partnerInput.value = "";
    }
  });
}

/* ================= SUBMIT ================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  statusText.textContent = "Submitting...";
  statusText.style.color = "#ffd34d";

  const fd = new FormData(form);

  const name = fd.get("name")?.trim();
  const rollNumber = fd.get("roll_number")?.trim();
  const department = fd.get("department");
  const year = fd.get("year");
  const email = fd.get("email")?.trim();
  const phone = fd.get("phone")?.trim();

  /* ================= VALIDATION ================= */
  if (!name || name.length > 15) {
    return showError("Name must be 1–15 characters");
  }

  if (!rollNumber || rollNumber.length !== 11) {
    return showError("Roll number must be exactly 11 characters");
  }

  if (!department) {
    return showError("Please select a department");
  }

  if (!/^[6-9][0-9]{9}$/.test(phone)) {
    return showError("Invalid phone number");
  }

  /* ================= TEAM / PAIR LOGIC ================= */
  let teamName = null;

  if (currentEventType === "team") {
    teamName = teamInput.value.trim();
    if (!teamName) return showError("Team name is required");
  }

  if (currentEventType === "both") {
    const mode = pairTypeSelect.value;

    if (mode === "pair") {
      const partner = partnerInput.value.trim();
      if (!partner) return showError("Partner name is required");
      teamName = `${name} + ${partner}`;
    } else {
      teamName = null; // solo
    }
  }

  /* ================= PAYLOAD ================= */
  const payload = {
    name,
    roll_number: rollNumber,
    department,
    year,
    email,
    phone,
    event_id: Number(eventId),
    team_name: teamName
  };

  console.log("SUBMIT PAYLOAD:", payload);

  try {
    const res = await fetch(`${API_BASE}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Registration failed");
    }

    statusText.textContent = "✅ Registration successful!";
    statusText.style.color = "#4dff88";
    form.reset();

    partnerGroup.style.display = "none";
    teamGroup.style.display = "none";

  } catch (err) {
    showError(err.message);
  }
});

/* ================= HELPERS ================= */
function showError(msg) {
  statusText.textContent = `❌ ${msg}`;
  statusText.style.color = "#ff6b6b";
}
