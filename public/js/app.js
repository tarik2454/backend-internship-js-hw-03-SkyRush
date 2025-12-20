const API_URL = "http://localhost:3000/api";
let token = localStorage.getItem("token");
let currentUser = null;

// DOM Elements
const authSection = document.getElementById("auth-section");
const mainSection = document.getElementById("main-section");
const userInfoEl = document.getElementById("user-info");
userInfoEl.innerHTML = '<div style="padding: 1rem;">Loading...</div>'; // Initial state
const casesGrid = document.getElementById("cases-grid");
const toastEl = document.getElementById("toast");
const logoutBtn = document.getElementById("logout-btn");
const toggleAuthBtn = document.getElementById("toggle-auth");
const authTitle = document.getElementById("auth-title");

// Init
function init() {
  if (token) {
    // Optimistic UI: Show main immediately, then populate
    showMain();
    loadUser(); // Async data fetch
  } else {
    showAuth();
  }
}

// Auth Logic
async function login(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    token = data.token;
    localStorage.setItem("token", token);
    
    // Show main section immediately
    showMain();
    // Load user data and cases
    await loadUser();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function register(username, email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    // Check if response is JSON (sometimes html error pages return)
    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await res.json();
    } else {
      const text = await res.text();
      console.error("Non-JSON response:", text);
      throw new Error("Server returned non-JSON response");
    }

    if (!res.ok) throw new Error(data.message || "Registration failed");

    // Auto login after register
    await login(email, password);
  } catch (err) {
    showToast(err.message, true);
  }
}

async function loadUser() {
  try {
    const res = await fetch(`${API_URL}/users/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      if (res.status === 401) {
        logout();
        return;
      }
      throw new Error("Failed to load user");
    }
    currentUser = await res.json();
    renderUser();
    loadCases();
  } catch (err) {
    console.error("LoadUser error:", err);
    showToast("Failed to load user: " + err.message, true);
    // Force logout on any error to ensure UI recovers
    logout();
  }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem("token");
  showAuth();
}

// Cases Logic
async function loadCases() {
  try {
    const res = await fetch(`${API_URL}/cases`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error("Failed to load cases");
    }
    const data = await res.json();
    renderCases(data.cases);
  } catch (err) {
    showToast("Failed to load cases: " + err.message, true);
  }
}

async function openCase(id) {
  try {
    const res = await fetch(`${API_URL}/cases/${id}/open`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // clientSeed auto generated
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to open case");

    showWinModal(data.item);
    loadUser(); // Refresh balance
  } catch (err) {
    showToast(err.message, true);
  }
}

// UI Renderers
function renderUser() {
  if (!currentUser) return;
  userInfoEl.innerHTML = `
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 600;">${
        currentUser.username
      }</h2>
      <p style="color: var(--text-dim);">${currentUser.email}</p>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 1.5rem; color: var(--accent-success); font-weight: 700;">$${currentUser.balance.toFixed(
        2
      )}</div>
      <div style="font-size: 0.875rem; color: var(--text-dim);">Balance</div>
    </div>
  `;
}

function renderCases(cases) {
  if (!cases || cases.length === 0) {
    casesGrid.innerHTML = '<div class="card"><p>No cases available</p></div>';
    return;
  }
  casesGrid.innerHTML = cases
    .map(
      (c) => `
    <div class="card case-item">
      <div class="case-img" style="background-image: url('${c.imageUrl}'); background-size: cover; background-position: center;"></div>
      <h3 style="margin-bottom: 0.5rem;">${c.name}</h3>
      <p style="color: var(--accent-success); font-weight: 600; margin-bottom: 1rem;">$${c.price}</p>
      <button onclick="openCase('${c._id}')">Open Case</button>
    </div>
  `
    )
    .join("");
}

function showWinModal(item) {
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.8);
    display: flex; align-items: center; justify-content: center; z-index: 100;
  `;
  modal.innerHTML = `
    <div class="card" style="text-align: center; max-width: 400px; width: 90%;">
      <h2 style="margin-bottom: 1rem;">You Won!</h2>
      <div style="width: 150px; height: 150px; background: #000; margin: 0 auto 1rem; border-radius: 0.5rem; background-image: url('${item.imageUrl}'); background-size: cover;"></div>
      <h3 class="rarity-${item.rarity}" style="font-size: 1.25rem;">${item.name}</h3>
      <p style="margin: 0.5rem 0 1.5rem;">Value: $${item.value}</p>
      <button onclick="this.parentElement.parentElement.remove()">Collect</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// Helpers
function showAuth() {
  authSection.classList.remove("hidden");
  mainSection.classList.add("hidden");
  logoutBtn.style.display = "none";
}

function showMain() {
  authSection.classList.add("hidden");
  mainSection.classList.remove("hidden");
  logoutBtn.style.display = "block";
}

function showToast(msg, isError = false) {
  toastEl.textContent = msg;
  toastEl.style.borderColor = isError
    ? "var(--accent-error)"
    : "var(--primary)";
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 3000);
}

// Event Listeners
let isLoginMode = true;

toggleAuthBtn.addEventListener("click", () => {
  isLoginMode = !isLoginMode;
  authTitle.textContent = isLoginMode ? "Login" : "Register";
  toggleAuthBtn.textContent = isLoginMode
    ? "Need an account? Register"
    : "Have an account? Login";

  if (isLoginMode) {
    document.getElementById("reg-username").classList.add("hidden");
  } else {
    document.getElementById("reg-username").classList.remove("hidden");
  }
});

document.getElementById("auth-submit").addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-password").value;

  if (!email || !password) {
    showToast("Please fill in all fields", true);
    return;
  }

  if (isLoginMode) {
    login(email, password);
  } else {
    const username = document.getElementById("auth-username").value;
    if (!username) {
      showToast("Please fill in all fields", true);
      return;
    }
    register(username, email, password);
  }
});

logoutBtn.addEventListener("click", logout);

init();
