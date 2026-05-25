/**
 * Watchly Authentication Logic
 * Gestionează utilizatorii, login-ul, sesiunile și filmele salvate.
 */

(function () {
  // --- CONFIGURAȚIE ȘI CHEI STORAGE ---
  const STORAGE = {
    USERS: "watchly.users",
    SESSION: "watchly.session",
    SAVED: "watchly.savedMovies"
  };

  const DEFAULT_AVATAR = "../img/account/Customer.svg";

  // --- UTILITARE DATE (LocalStorage) ---
  const readData = (key, fallback) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (err) {
      console.error("Eroare la citirea datelor:", err);
      return fallback;
    }
  };

  const writeData = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value, null, 2));
  };

  // --- VALIDĂRI ȘI MESAJE ---
  const showMessage = (form, text, type = "error") => {
    let msgBox = form.querySelector(".auth-message");
    if (!msgBox) {
      msgBox = document.createElement("p");
      msgBox.className = "auth-message";
      form.prepend(msgBox); // Îl punem la începutul formularului
    }
    msgBox.textContent = text;
    msgBox.className = "auth-message " + (type === "success" ? "success" : "");
  };

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // --- MANAGEMENT UTILIZATORI ---

  // Creează obiectul standard pentru admin
  const createAdminObject = (existing = {}) => {
    return {
      id: "user-admin",
      username: "admin",
      fullName: "admin",
      email: "admin@watchly.local",
      password: "admin",
      plan: "Platinum Plan",
      role: "admin",
      country: "Moldova",
      language: "English",
      birthDate: "",
      profileImage: DEFAULT_AVATAR,
      createdAt: "2026-05-19",
      status: "active",
      ...existing, // Suprascriem dacă există date vechi
      username: "admin", // Forțăm valorile de admin
      fullName: "admin",
      password: "admin",
      role: "admin",
      status: "active"
    };
  };

  const loadUsers = () => {
    let users = readData(STORAGE.USERS, []);

    // 1. Curățare: scoatem user-ul "andrei" dacă există (logică originală)
    const initialCount = users.length;
    users = users.filter(u => u.id !== "user-andrei");

    // 2. Verificăm adminul
    const adminIndex = users.findIndex(u => u.username === "admin" || u.id === "user-admin");
    
    if (adminIndex < 0) {
      users.unshift(createAdminObject());
    } else {
      // Ne asigurăm că adminul are datele corecte
      const currentAdmin = users[adminIndex];
      if (currentAdmin.password !== "admin" || currentAdmin.role !== "admin") {
        users[adminIndex] = createAdminObject(currentAdmin);
      }
    }

    // Dacă am modificat lista (curățare sau seeding admin), salvăm înapoi
    if (users.length !== initialCount || adminIndex < 0) {
      writeData(STORAGE.USERS, users);
      // Dacă am șters un user care era logat, scoatem sesiunea
      if (users.length !== initialCount) localStorage.removeItem(STORAGE.SESSION);
    }

    return users;
  };

  const saveUsersList = (list) => writeData(STORAGE.USERS, list);

  // --- LOGICĂ SESIUNE ---
  const getCurrentUser = () => {
    const session = readData(STORAGE.SESSION, null);
    if (!session) return null;
    const users = loadUsers();
    return users.find(u => u.id === session.userId) || null;
  };

  const loginUser = (user) => {
    writeData(STORAGE.SESSION, { 
      userId: user.id, 
      loggedAt: new Date().toISOString() 
    });
    updateNavbar(user);
  };

  const logoutUser = () => {
    localStorage.removeItem(STORAGE.SESSION);
    updateNavbar(null);
  };

  // --- FUNCȚII PRINCIPALE AUTH ---
  const register = (username, email, password) => {
    const users = loadUsers();
    const emailLower = email.trim().toLowerCase();
    
    const exists = users.some(u => 
      u.email.toLowerCase() === emailLower || 
      u.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) throw new Error("Acest email sau username exista deja.");

    const newUser = {
      id: `user-${Date.now()}`,
      username: username.trim(),
      fullName: username.trim(),
      email: emailLower,
      password: password,
      plan: "Free Plan",
      role: users.length === 0 ? "admin" : "user",
      country: "Moldova",
      language: "English",
      birthDate: "",
      profileImage: DEFAULT_AVATAR,
      createdAt: new Date().toISOString().slice(0, 10),
      status: "active"
    };

    users.push(newUser);
    saveUsersList(users);
    loginUser(newUser);
    return newUser;
  };

  const login = (identifier, password) => {
    const search = identifier.trim().toLowerCase();
    const user = loadUsers().find(u => 
      u.email.toLowerCase() === search || u.username.toLowerCase() === search
    );

    if (!user || user.password !== password) {
      throw new Error("Email, username sau parola incorecta.");
    }
    if (user.status === "blocked") {
      throw new Error("Contul este blocat din admin.");
    }

    loginUser(user);
    return user;
  };

  const loginWithSocial = (provider) => {
    const users = loadUsers();
    const providerName = provider.toLowerCase();
    const userId = `user-${providerName}`;
    
    let user = users.find(u => u.id === userId);
    
    if (!user) {
      user = {
        id: userId,
        username: providerName,
        fullName: `${provider} User`,
        email: `${providerName}@watchly.local`,
        password: provider,
        plan: "Free Plan",
        role: "user",
        country: "Moldova",
        language: "English",
        birthDate: "",
        profileImage: DEFAULT_AVATAR,
        createdAt: new Date().toISOString().slice(0, 10),
        status: "active"
      };
      users.push(user);
      saveUsersList(users);
    }
    
    loginUser(user);
    return user;
  };

  // --- FILME SALVATE (FAVORITE) ---
  const getSavedMovies = (userId) => {
    if (!userId) return [];
    const allSaved = readData(STORAGE.SAVED, {});
    return Array.isArray(allSaved[userId]) ? allSaved[userId] : [];
  };

  const toggleFavorite = (movie) => {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = "../html/register.html";
      return false;
    }

    const saved = getSavedMovies(user.id);
    const index = saved.findIndex(m => m.id === movie.id);
    const exists = index !== -1;

    let updatedList;
    if (exists) {
      updatedList = saved.filter(m => m.id !== movie.id);
    } else {
      updatedList = [{ ...movie, savedAt: new Date().toISOString() }, ...saved];
    }

    // Salvăm în storage
    const allSaved = readData(STORAGE.SAVED, {});
    allSaved[user.id] = updatedList;
    writeData(STORAGE.SAVED, allSaved);

    // Mesaj feedback (dacă există componenta de cart)
    if (window.WatchlyCart?.showMessage) {
      window.WatchlyCart.showMessage(exists ? "Filmul a fost scos de la favorite." : "Filmul a fost adaugat la favorite.");
    }

    return !exists;
  };

  // --- INTERFAȚĂ (NAVBAR) ---
  const updateNavbar = (user = getCurrentUser()) => {
    // Ștergem butoanele de admin vechi ca să nu se multiplice
    document.querySelectorAll(".admin-navbar-btn").forEach(btn => btn.remove());

    const accountSections = document.querySelectorAll(".account");
    accountSections.forEach(section => {
      const link = section.querySelector("a");
      const avatar = section.querySelector(".avatar");
      if (!link) return;

      if (user) {
        link.textContent = user.username || user.fullName;
        link.href = "../html/account.html";
        if (avatar) {
          avatar.classList.add("has-profile-image");
          avatar.style.backgroundImage = `url("${user.profileImage || DEFAULT_AVATAR}")`;
        }
      } else {
        link.textContent = "Login";
        link.href = "../html/login.html";
        if (avatar) {
          avatar.classList.remove("has-profile-image");
          avatar.style.backgroundImage = `url("${DEFAULT_AVATAR}")`;
        }
      }
    });

    // Buton special pentru admin
    if (user?.role === "admin") {
      document.querySelectorAll(".nav-action").forEach(nav => {
        const subBtn = nav.querySelector(".btn-subscribe");
        if (subBtn) {
          const adminLink = document.createElement("a");
          adminLink.className = "admin-navbar-btn";
          adminLink.href = "../html/admin.html";
          adminLink.innerHTML = `<img src="../img/account/Customer.svg" alt="Admin">`;
          subBtn.insertAdjacentElement("afterend", adminLink);
        }
      });
    }
  };

  // --- FORMULARE ȘI EVENIMENTE ---
  const initAuthForms = () => {
    // Login Form
    const loginForm = document.querySelector(".login-body:not(.register-body) .login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputs = loginForm.querySelectorAll("input");
        const ident = inputs[0].value;
        const pass = inputs[1].value;

        if (!ident || pass.length < 5) {
          showMessage(loginForm, "Completeaza campurile corect (parola minim 5 caractere).");
          return;
        }

        try {
          login(ident, pass);
          const next = new URLSearchParams(window.location.search).get("next");
          if (next === "favorites") window.location.href = "../html/account.html#saved";
          else if (next === "admin") window.location.href = "../html/admin.html";
          else window.location.href = "../html/home.html";
        } catch (err) {
          showMessage(loginForm, err.message);
        }
      });
    }

    // Register Form
    const regForm = document.querySelector(".register-body .login-form");
    if (regForm) {
      regForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputs = regForm.querySelectorAll("input");
        const user = inputs[0].value.trim();
        const email = inputs[1].value.trim();
        const pass = inputs[2].value;

        if (!user || !isEmailValid(email) || pass.length < 5) {
          showMessage(regForm, "Date invalide. Verifica emailul si parola (minim 5 caractere).");
          return;
        }

        try {
          register(user, email, pass);
          const next = new URLSearchParams(window.location.search).get("next");
          window.location.href = (next === "favorites") ? "../html/account.html#saved" : "../html/account.html";
        } catch (err) {
          showMessage(regForm, err.message);
        }
      });
    }

    // Social Providers
    document.querySelectorAll(".login-provider").forEach(btn => {
      btn.addEventListener("click", () => {
        const provider = btn.textContent.trim() || "Google";
        loginWithSocial(provider);
        window.location.href = "../html/account.html";
      });
    });

    // Forgot Password
    const forgotForm = document.getElementById("forgotPasswordForm");
    if (forgotForm) {
      forgotForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailInput = document.getElementById("forgotEmail");
        const email = emailInput?.value.trim();

        if (!email || !isEmailValid(email)) {
          showMessage(forgotForm, "Introdu un email valid.");
          return;
        }

        const user = loadUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          showMessage(forgotForm, `Parola ta este: ${user.password}`, "success");
        } else {
          showMessage(forgotForm, "Nu am gasit un cont cu acest email.");
        }
      });
    }
  };

  const initFavoriteLinks = () => {
    document.querySelectorAll('a[href*="account.html#saved"], .favorite-link').forEach(link => {
      link.addEventListener("click", (e) => {
        if (!getCurrentUser()) {
          e.preventDefault();
          window.location.href = "../html/register.html?next=favorites";
        }
      });
    });
  };

  const protectAdmin = () => {
    if (!document.body.classList.contains("admin-body")) return;
    const user = getCurrentUser();
    
    if (!user) {
      window.location.href = "../html/login.html?next=admin";
      return;
    }

    if (user.role !== "admin") {
      document.body.innerHTML = `
        <main class="admin-page" style="text-align:center; padding: 100px 20px;">
          <h1 class="admin-title">Acces interzis</h1>
          <p class="admin-muted">Doar administratorii pot vedea aceasta pagina.</p>
          <a class="admin-btn admin-btn--primary" href="../html/home.html" style="display:inline-block; margin-top:20px; padding:10px 20px; background: #e50914; color:white; border-radius:4px; text-decoration:none;">Inapoi la site</a>
        </main>
      `;
    }
  };

  // --- EXPORT GLOBAL ---
  window.WatchlyAuth = {
    loadUsers,
    saveUsers: saveUsersList,
    getCurrentUser,
    updateUser: (id, patch) => {
      const users = loadUsers();
      const idx = users.findIndex(u => u.id === id);
      if (idx === -1) return null;
      users[idx] = { ...users[idx], ...patch };
      saveUsersList(users);
      // Dacă e userul curent, re-logăm pentru a actualiza sesiunea
      const current = getCurrentUser();
      if (current?.id === id) loginUser(users[idx]);
      return users[idx];
    },
    registerUser: (data) => register(data.username, data.email, data.password),
    login,
    logout: logoutUser,
    loadSavedMovies: (uid) => getSavedMovies(uid || getCurrentUser()?.id),
    toggleSavedMovie: toggleFavorite,
    isMovieSaved: (mid, uid) => getSavedMovies(uid || getCurrentUser()?.id).some(m => m.id === mid),
    updateNavAccount: updateNavbar
  };

  // --- PORNIRE ---
  document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
    updateNavbar();
    initAuthForms();
    initFavoriteLinks();
    protectAdmin();
  });

})();