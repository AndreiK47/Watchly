/**
 * Admin Panel Logic - Watchly
 * Proiect refăcut pentru claritate și simplitate.
 */

(function () {
  // --- CONFIGURAȚIE ȘI DATE DEFAULT ---
  const STORAGE_KEYS = {
    MOVIES: "watchly_movies",
    USERS: "watchly.users",
    HOME: "watchly.homeContent",
    ORDERS: "watchly.orders",
  };

  const DEFAULT_MOVIES = [
    {
      id: "galactic-warriors",
      title: "Galactic Warriors",
      category: "Action - Adventure",
      genre: "Action",
      year: "2025",
      duration: "128 min",
      ageRating: "PG-13",
      imdb: "4.8",
      buyPrice: 12.4,
      rentPrice: 2.4,
      poster: "../img/movies/movie (8).webp",
      heroBg: "../img/hero/pack 1/background.webp",
      logo: "../img/hero/pack 1/logo.svg",
      thumbnail: "../movie-det/1/thumbs/thumb.webp",
      trailerImages: ["../movie-det/1/trailer/trailer (1).webp", "../movie-det/1/trailer/trailer (2).webp"],
      description: "Galactic Warrior follows an elite space pilot tasked with defending humanity.",
      status: "published",
      featured: true,
    },
    {
      id: "ne-zha",
      title: "Ne Zha",
      category: "Animation - Fantasy",
      genre: "Animation",
      year: "2025",
      duration: "110 min",
      ageRating: "PG",
      imdb: "4.7",
      buyPrice: 10.9,
      rentPrice: 2.2,
      poster: "../img/movies/movie (1).webp",
      heroBg: "../img/hero/pack 2/background.webp",
      logo: "../img/hero/pack 2/logo.svg",
      thumbnail: "../img/movies/movie (1).webp",
      trailerImages: ["../img/categories/callToView/video 1.webp", "../img/categories/callToView/video 2.webp"],
      description: "A young hero discovers courage, loyalty and the price of destiny.",
      status: "published",
      featured: false,
    },
  ];

  const DEFAULT_HOME = {
    trendingMovies: [
      { title: "Galactic Warriors", image: "../img/movies/movie (8).webp", movieId: "galactic-warriors", featured: true },
      { title: "Ne Zha", image: "../img/movies/movie (1).webp", movieId: "ne-zha", featured: false },
    ],
    categories: [
      { title: "Action & Adventure", image: "../img/categories/geners/image (1).webp" },
      { title: "Sci-Fi & Fantasy", image: "../img/categories/geners/image (2).webp" },
      { title: "Animation", image: "../img/categories/geners/image (3).webp" },
      { title: "Drama", image: "../img/categories/geners/image (4).webp" },
      { title: "Comedy", image: "../img/categories/geners/image (5).webp" },
      { title: "Mystery", image: "../img/categories/geners/image (6).webp" },
      { title: "Family", image: "../img/categories/geners/image (7).webp" },
      { title: "Kids", image: "../img/categories/geners/image (8).webp" },
      { title: "Reality", image: "../img/categories/geners/image (9).webp" },
      { title: "War & Political", image: "../img/categories/geners/image (10).webp" },
      { title: "Romance", image: "../img/categories/geners/image (1).webp" },
      { title: "Crime", image: "../img/categories/geners/image (2).webp" },
      { title: "Thriller", image: "../img/categories/geners/image (3).webp" },
      { title: "Documentary", image: "../img/categories/geners/image (4).webp" },
      { title: "Horror", image: "../img/categories/geners/image (5).webp" },
    ],
    comingSoon: [
      { title: "Future Signal", image: "../img/categories/comingSoon/movie (5).webp", releaseDate: "2028-10-20", featured: true },
      { title: "Midnight Orbit", image: "../img/categories/comingSoon/movie (4).webp", releaseDate: "2026-12-31", featured: false },
    ],
  };

  // --- VARIABILE DE STARE ---
  let moviesList = [];
  let movieSearchQuery = "";
  let userSearchQuery = "";

  // --- ELEMENTE DOM ---
  const UI = {
    adminApp: document.getElementById("adminApp"),
    tabs: document.querySelectorAll("[data-admin-tab]"),
    panels: document.querySelectorAll("[data-admin-panel]"),
    
    // Filme
    movieForm: document.getElementById("movieForm"),
    movieListContainer: document.getElementById("adminMovies"),
    movieCountDisplay: document.getElementById("adminCount"),
    movieSearchInput: document.getElementById("adminSearch"),
    jsonTextarea: document.getElementById("jsonBox"),
    
    // Home Content
    homeForm: document.getElementById("homeContentForm"),
    homeSectionsContainer: document.getElementById("adminHomeSections"),
    homeCountDisplay: document.getElementById("homeContentCount"),

    // Utilizatori
    userListContainer: document.getElementById("adminUsers"),
    userCountDisplay: document.getElementById("adminUsersCount"),
    userSearchInput: document.getElementById("adminUserSearch"),

    // Comenzi
    orderListContainer: document.getElementById("adminOrders"),
    orderCountDisplay: document.getElementById("adminOrdersCount")
  };

  // --- UTILITARE LOCAL STORAGE ---
  const db = {
    read(key, fallback) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : JSON.parse(JSON.stringify(fallback));
      } catch (e) {
        return JSON.parse(JSON.stringify(fallback));
      }
    },
    write(key, value) {
      localStorage.setItem(key, JSON.stringify(value, null, 2));
    }
  };

  // --- AJUTTOARE LOGICĂ ---
  const slugify = (text) => {
    return String(text || "movie")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "movie-" + Date.now();
  };

  const normalizeMovie = (m) => {
    const poster = m.poster || "../img/movies/movie (1).webp";
    return {
      id: m.id || slugify(m.title),
      title: m.title || "Untitled Movie",
      category: m.category || m.genre || "Movie",
      genre: m.genre || "Drama",
      year: m.year || "2026",
      duration: m.duration || "120 min",
      ageRating: m.ageRating || "PG-13",
      imdb: m.imdb || "4.5",
      buyPrice: Number(m.buyPrice || 0),
      rentPrice: Number(m.rentPrice || 0),
      poster: poster,
      heroBg: m.heroBg || poster,
      logo: m.logo || "",
      thumbnail: m.thumbnail || poster,
      trailerImages: Array.isArray(m.trailerImages) ? m.trailerImages : [],
      description: m.description || "",
      status: m.status || "published",
      featured: Boolean(m.featured),
    };
  };

  // --- MANAGEMENT TAB-URI ---
  function setTab(tabName) {
    UI.tabs.forEach(t => t.classList.toggle("active", t.dataset.adminTab === tabName));
    UI.panels.forEach(p => p.hidden = p.dataset.adminPanel !== tabName);
  }

  // --- LOGICĂ FILME ---
  function loadMovies() {
    moviesList = db.read(STORAGE_KEYS.MOVIES, DEFAULT_MOVIES).map(normalizeMovie);
    db.write(STORAGE_KEYS.MOVIES, moviesList);
    renderMovies();
  }

  function renderMovies() {
    const query = movieSearchQuery.toLowerCase();
    const filtered = moviesList.filter(m => 
      `${m.title} ${m.genre} ${m.category} ${m.year}`.toLowerCase().includes(query)
    );

    UI.movieCountDisplay.textContent = `${filtered.length} movie${filtered.length === 1 ? "" : "s"}`;

    if (filtered.length === 0) {
      UI.movieListContainer.innerHTML = '<p class="admin-muted">No movies found.</p>';
      return;
    }

    UI.movieListContainer.innerHTML = filtered.map(m => `
      <article class="admin-movie">
        <img src="${m.poster}" alt="${m.title}">
        <div>
          <h3>${m.title}</h3>
          <p>${m.genre} / ${m.year} / ${m.status}</p>
          <p>Rent $${m.rentPrice.toFixed(2)} / Buy $${m.buyPrice.toFixed(2)}</p>
        </div>
        <div class="admin-movie__actions">
          <button class="admin-btn" type="button" data-edit="${m.id}">Edit</button>
          <button class="admin-btn admin-btn--danger" type="button" data-delete="${m.id}">Delete</button>
          <a href="../html/movie-detail.html?id=${encodeURIComponent(m.id)}" target="_blank">Detail</a>
        </div>
      </article>
    `).join("");
  }

  function getMovieFormData() {
    const trailerStr = document.getElementById("trailerImages").value;
    return normalizeMovie({
      id: document.getElementById("movieId").value,
      title: document.getElementById("title").value.trim(),
      genre: document.getElementById("genre").value.trim(),
      category: document.getElementById("category").value.trim(),
      year: document.getElementById("year").value.trim(),
      duration: document.getElementById("duration").value.trim(),
      ageRating: document.getElementById("ageRating").value.trim(),
      imdb: document.getElementById("imdb").value.trim(),
      buyPrice: document.getElementById("buyPrice").value,
      rentPrice: document.getElementById("rentPrice").value,
      poster: document.getElementById("poster").value.trim(),
      heroBg: document.getElementById("heroBg").value.trim(),
      logo: document.getElementById("logo").value.trim(),
      thumbnail: document.getElementById("thumbnail").value.trim(),
      trailerImages: trailerStr.split(",").map(s => s.trim()).filter(Boolean),
      description: document.getElementById("description").value.trim(),
      status: document.getElementById("status").value,
      featured: document.getElementById("featured").checked,
    });
  }

  function fillMovieForm(m) {
    document.getElementById("movieId").value = m.id;
    document.getElementById("title").value = m.title;
    document.getElementById("genre").value = m.genre;
    document.getElementById("category").value = m.category;
    document.getElementById("year").value = m.year;
    document.getElementById("duration").value = m.duration;
    document.getElementById("ageRating").value = m.ageRating;
    document.getElementById("imdb").value = m.imdb;
    document.getElementById("buyPrice").value = m.buyPrice;
    document.getElementById("rentPrice").value = m.rentPrice;
    document.getElementById("poster").value = m.poster;
    document.getElementById("heroBg").value = m.heroBg;
    document.getElementById("logo").value = m.logo;
    document.getElementById("thumbnail").value = m.thumbnail;
    document.getElementById("trailerImages").value = m.trailerImages.join(", ");
    document.getElementById("description").value = m.description;
    document.getElementById("status").value = m.status;
    document.getElementById("featured").checked = m.featured;
    document.getElementById("title").focus();
  }

  function resetMovieForm() {
    UI.movieForm.reset();
    document.getElementById("movieId").value = "";
    document.getElementById("status").value = "published";
    document.getElementById("poster").value = "../img/movies/movie (1).webp";
    document.getElementById("heroBg").value = "../img/hero/pack 1/background.webp";
    document.getElementById("thumbnail").value = "../img/movies/movie (1).webp";
  }

  // --- LOGICĂ HOME CONTENT ---
  function renderHomeContent() {
    const data = db.read(STORAGE_KEYS.HOME, DEFAULT_HOME);
    const sections = ["trendingMovies", "categories", "comingSoon"];
    const labels = { trendingMovies: "Trending Movies", categories: "Trending Categories", comingSoon: "Coming Soon" };
    
    let totalItems = 0;
    UI.homeSectionsContainer.innerHTML = sections.map(sec => {
      totalItems += data[sec].length;
      return `
        <div class="admin-home-section">
          <h3>${labels[sec]}</h3>
          <div class="admin-home-items">
            ${data[sec].map((item, idx) => `
              <article class="admin-home-item">
                <img src="${item.image}" alt="${item.title}">
                <div>
                  <strong>${item.title}</strong>
                  <p>${item.movieId || item.releaseDate || "Homepage card"}${item.featured ? " / Featured" : ""}</p>
                </div>
                <div class="admin-movie__actions">
                  <button class="admin-btn" type="button" data-home-edit="${sec}:${idx}">Edit</button>
                  <button class="admin-btn admin-btn--danger" type="button" data-home-delete="${sec}:${idx}">Delete</button>
                </div>
              </article>
            `).join("") || '<p class="admin-muted">No items yet.</p>'}
          </div>
        </div>
      `;
    }).join("");
    
    UI.homeCountDisplay.textContent = `${totalItems} item${totalItems === 1 ? "" : "s"}`;
  }

  function fillHomeForm(section, index) {
    const data = db.read(STORAGE_KEYS.HOME, DEFAULT_HOME);
    const item = data[section][index];
    if (!item) return;

    document.getElementById("homeSection").value = section;
    document.getElementById("homeItemIndex").value = index;
    document.getElementById("homeTitle").value = item.title || "";
    document.getElementById("homeImage").value = item.image || "";
    document.getElementById("homeMovieId").value = item.movieId || "";
    document.getElementById("homeReleaseDate").value = item.releaseDate || "";
    document.getElementById("homeFeatured").checked = Boolean(item.featured);
  }

  // --- LOGICĂ UTILIZATORI ---
  function loadUsers() {
    let users = db.read(STORAGE_KEYS.USERS, []);
    const adminExists = users.some(u => u.username === "admin");
    if (!adminExists) {
      users.unshift({
        id: "user-admin", username: "admin", fullName: "admin", email: "admin@watchly.local",
        password: "admin", plan: "Platinum Plan", role: "admin", status: "active", createdAt: "2026-05-19"
      });
      db.write(STORAGE_KEYS.USERS, users);
    }
    return users;
  }

  function renderUsers() {
    const users = loadUsers();
    const query = userSearchQuery.toLowerCase();
    const filtered = users.filter(u => 
      `${u.fullName} ${u.username} ${u.email} ${u.plan} ${u.role}`.toLowerCase().includes(query)
    );

    UI.userCountDisplay.textContent = `${filtered.length} account${filtered.length === 1 ? "" : "s"}`;
    UI.userListContainer.innerHTML = filtered.map(u => `
      <article class="admin-user">
        <div class="admin-user__avatar">${(u.fullName || u.username || "U")[0].toUpperCase()}</div>
        <div>
          <h3>${u.fullName || u.username}</h3>
          <p>${u.email || "no email"} / ${u.username}</p>
          <p>${u.plan || "Free Plan"} / ${u.role || "user"} / ${u.status || "active"}</p>
        </div>
        <div class="admin-user__actions">
          <select data-user-plan="${u.id}">
            ${["Free Plan", "Gold Plan", "Diamond Plan", "Platinum Plan"].map(p => 
              `<option value="${p}" ${p === u.plan ? "selected" : ""}>${p}</option>`
            ).join("")}
          </select>
          <select data-user-role="${u.id}">
            <option value="user" ${u.role === "user" ? "selected" : ""}>user</option>
            <option value="admin" ${u.role === "admin" ? "selected" : ""}>admin</option>
          </select>
          <button class="admin-btn ${u.status === "blocked" ? "" : "admin-btn--danger"}" type="button" data-user-status="${u.id}">
            ${u.status === "blocked" ? "Activate" : "Block"}
          </button>
        </div>
      </article>
    `).join("");
  }

  // --- LOGICĂ COMENZI ---
  function renderOrders() {
    const orders = db.read(STORAGE_KEYS.ORDERS, []).slice().reverse();
    UI.orderCountDisplay.textContent = `${orders.length} order${orders.length === 1 ? "" : "s"}`;

    UI.orderListContainer.innerHTML = orders.length ? orders.map(o => `
      <article class="admin-order">
        <div>
          <h3>${o.userName || "Guest"}</h3>
          <p>${o.createdAt ? new Date(o.createdAt).toLocaleString() : "No date"} / ${o.status || "new"}</p>
          <p>${(o.items || []).map(i => i.title).join(", ")}</p>
        </div>
        <strong>$${Number(o.total || 0).toFixed(2)}</strong>
      </article>
    `).join("") : '<p class="admin-muted">No checkout orders yet.</p>';
  }

  // --- IMAGE UPLOAD LOGIC ---
  function setupImageUpload() {
    document.querySelectorAll(".admin-image-input").forEach(box => {
      const urlInput = box.querySelector(".admin-image-url-input");
      const fileInput = box.querySelector(".admin-image-file-input");
      const btn = box.querySelector(".admin-image-preview-btn");
      const info = box.querySelector(".admin-image-info");

      box.querySelectorAll(".admin-image-tab").forEach(tab => {
        tab.addEventListener("click", () => {
          const isUpload = tab.dataset.imageType === "upload";
          box.querySelectorAll(".admin-image-tab").forEach(t => t.classList.toggle("active", t === tab));
          urlInput.hidden = isUpload;
          btn.hidden = !isUpload;
          info.textContent = "";
        });
      });

      btn.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => { urlInput.value = reader.result; info.textContent = file.name; };
          reader.readAsDataURL(file);
        }
      });
    });
  }

  // --- EVENT LISTENERS ---

  // Tab-uri
  UI.tabs.forEach(t => t.addEventListener("click", () => setTab(t.dataset.adminTab)));

  // Filme: Salvare
  UI.movieForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const movie = getMovieFormData();
    const idx = moviesList.findIndex(m => m.id === movie.id);

    if (idx >= 0) moviesList[idx] = movie;
    else moviesList.push(movie);

    db.write(STORAGE_KEYS.MOVIES, moviesList);
    fillMovieForm(movie);
    renderMovies();
  });

  // Filme: Editare/Ștergere
  UI.movieListContainer.addEventListener("click", (e) => {
    const editId = e.target.closest("[data-edit]")?.dataset.edit;
    const deleteId = e.target.closest("[data-delete]")?.dataset.delete;

    if (editId) {
      const movie = moviesList.find(m => m.id === editId);
      if (movie) fillMovieForm(movie);
    }

    if (deleteId && confirm("Delete this movie?")) {
      moviesList = moviesList.filter(m => m.id !== deleteId);
      db.write(STORAGE_KEYS.MOVIES, moviesList);
      resetMovieForm();
      renderMovies();
    }
  });

  // Filme: Căutare și Utilitare
  UI.movieSearchInput.addEventListener("input", (e) => {
    movieSearchQuery = e.target.value;
    renderMovies();
  });

  document.getElementById("newMovieBtn").addEventListener("click", resetMovieForm);
  
  document.getElementById("resetMoviesBtn").addEventListener("click", () => {
    if (confirm("Reset all movies to default?")) {
      moviesList = DEFAULT_MOVIES.map(normalizeMovie);
      db.write(STORAGE_KEYS.MOVIES, moviesList);
      resetMovieForm();
      renderMovies();
    }
  });

  document.getElementById("exportJsonBtn").addEventListener("click", () => {
    UI.jsonTextarea.value = JSON.stringify(moviesList, null, 2);
  });

  document.getElementById("importJsonBtn").addEventListener("click", () => {
    try {
      const imported = JSON.parse(UI.jsonTextarea.value);
      if (!Array.isArray(imported)) throw new Error("JSON must be an array.");
      moviesList = imported.map(normalizeMovie);
      db.write(STORAGE_KEYS.MOVIES, moviesList);
      resetMovieForm();
      renderMovies();
    } catch (err) {
      alert("Invalid JSON: " + err.message);
    }
  });

  // Home Content: Salvare
  UI.homeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = db.read(STORAGE_KEYS.HOME, DEFAULT_HOME);
    const section = document.getElementById("homeSection").value;
    const idxStr = document.getElementById("homeItemIndex").value;
    
    const item = {
      title: document.getElementById("homeTitle").value.trim(),
      image: document.getElementById("homeImage").value.trim(),
      movieId: document.getElementById("homeMovieId").value.trim(),
      releaseDate: document.getElementById("homeReleaseDate").value,
      featured: document.getElementById("homeFeatured").checked,
    };

    // Curățăm câmpurile care nu aparțin secțiunii
    if (section === "categories") { delete item.movieId; delete item.releaseDate; delete item.featured; }
    if (section === "trendingMovies") delete item.releaseDate;
    if (section === "comingSoon") delete item.movieId;

    const items = [...data[section]];
    const index = idxStr === "" ? -1 : Number(idxStr);
    
    if (index >= 0) items[index] = item;
    else items.push(item);

    data[section] = items;
    db.write(STORAGE_KEYS.HOME, data);
    UI.homeForm.reset();
    document.getElementById("homeItemIndex").value = "";
    renderHomeContent();
  });

  // Home Content: Editare/Ștergere
  UI.homeSectionsContainer.addEventListener("click", (e) => {
    const editData = e.target.closest("[data-home-edit]")?.dataset.homeEdit;
    const deleteData = e.target.closest("[data-home-delete]")?.dataset.homeDelete;

    if (editData) {
      const [sec, idx] = editData.split(":");
      fillHomeForm(sec, Number(idx));
    }

    if (deleteData) {
      const [sec, idx] = deleteData.split(":");
      const data = db.read(STORAGE_KEYS.HOME, DEFAULT_HOME);
      data[sec].splice(Number(idx), 1);
      db.write(STORAGE_KEYS.HOME, data);
      renderHomeContent();
    }
  });

  document.getElementById("newHomeItemBtn").addEventListener("click", () => {
    UI.homeForm.reset();
    document.getElementById("homeItemIndex").value = "";
  });

  document.getElementById("resetHomeContentBtn").addEventListener("click", () => {
    if (confirm("Reset homepage content to default?")) {
      db.write(STORAGE_KEYS.HOME, DEFAULT_HOME);
      UI.homeForm.reset();
      renderHomeContent();
    }
  });

  // Utilizatori: Căutare și Actualizare
  UI.userSearchInput.addEventListener("input", (e) => {
    userSearchQuery = e.target.value;
    renderUsers();
  });

  UI.userListContainer.addEventListener("change", (e) => {
    const userId = e.target.dataset.userPlan || e.target.dataset.userRole;
    if (!userId) return;

    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      if (e.target.dataset.userPlan) user.plan = e.target.value;
      if (e.target.dataset.userRole) user.role = e.target.value;
      db.write(STORAGE_KEYS.USERS, users);
      renderUsers();
    }
  });

  UI.userListContainer.addEventListener("click", (e) => {
    const statusId = e.target.closest("[data-user-status]")?.dataset.userStatus;
    if (!statusId) return;

    const users = loadUsers();
    const user = users.find(u => u.id === statusId);
    if (user) {
      user.status = user.status === "blocked" ? "active" : "blocked";
      db.write(STORAGE_KEYS.USERS, users);
      renderUsers();
    }
  });

  // Comenzi: Curățare
  document.getElementById("clearOrdersBtn").addEventListener("click", () => {
    if (confirm("Clear all checkout orders?")) {
      db.write(STORAGE_KEYS.ORDERS, []);
      renderOrders();
    }
  });

  // --- INIȚIALIZARE ---
  function init() {
    if (UI.adminApp) UI.adminApp.hidden = false;
    loadMovies();
    renderUsers();
    renderOrders();
    renderHomeContent();
    setupImageUpload();
    resetMovieForm();
    setTab("movies");
  }

  init();
})();