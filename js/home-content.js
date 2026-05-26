const STORAGE_KEY = "watchly.homeContent";
const JSON_URL = "../data/home-content.json";

const dateImplicite = {
  trendingMovies: [
    { title: "Galactic Warriors", image: "../img/movies/movie (8).webp", movieId: "galactic-warriors", featured: true },
    { title: "Ne Zha", image: "../img/movies/movie (1).webp", movieId: "ne-zha", featured: false },
    { title: "Aquaman", image: "../img/movies/movie (3).webp", movieId: "aquaman", featured: false },
    { title: "When I Fly Towards You", image: "../img/movies/movie (2).webp", movieId: "when-i-fly-towards-you", featured: true },
    { title: "Cinderella", image: "../img/movies/movie (4).webp", movieId: "cinderella", featured: false },
    { title: "Born Sexy Yesterday", image: "../img/movies/movie (5).webp", movieId: "born-sexy-yesterday", featured: false },
    { title: "Kotovasiya", image: "../img/movies/movie (6).webp", movieId: "kotovasiya", featured: false },
    { title: "Arnie & Barney", image: "../img/movies/movie (7).webp", movieId: "arnie-and-barney", featured: false },
    { title: "Future Signal", image: "../img/categories/comingSoon/movie (5).webp", movieId: "future-signal", featured: true },
    { title: "Midnight Orbit", image: "../img/categories/comingSoon/movie (4).webp", movieId: "midnight-orbit", featured: false },
    { title: "Silent Moon", image: "../img/categories/comingSoon/movie (3).webp", movieId: "silent-moon", featured: false },
    { title: "Blue Horizon", image: "../img/categories/comingSoon/movie (2).webp", movieId: "blue-horizon", featured: false },
    { title: "Last Echo", image: "../img/categories/comingSoon/movie (1).webp", movieId: "last-echo", featured: false },
    { title: "Storm City", image: "../img/movies/movie (8).webp", movieId: "storm-city", featured: false },
    { title: "Golden Road", image: "../img/movies/movie (5).webp", movieId: "golden-road", featured: false },
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
    { title: "Future Signal", image: "../img/categories/comingSoon/movie (5).webp", movieId: "future-signal", releaseDate: "2026-06-20", featured: true },
    { title: "Midnight Orbit", image: "../img/categories/comingSoon/movie (4).webp", movieId: "midnight-orbit", releaseDate: "2026-07-05", featured: false },
    { title: "Silent Moon", image: "../img/categories/comingSoon/movie (3).webp", movieId: "silent-moon", releaseDate: "2026-07-18", featured: false },
    { title: "Blue Horizon", image: "../img/categories/comingSoon/movie (2).webp", movieId: "blue-horizon", releaseDate: "2026-08-02", featured: false },
    { title: "Last Echo", image: "../img/categories/comingSoon/movie (1).webp", movieId: "last-echo", releaseDate: "2026-08-16", featured: false },
    { title: "Red Planet", image: "../img/categories/comingSoon/movie (5).webp", movieId: "", releaseDate: "2026-09-01", featured: false },
    { title: "Night Academy", image: "../img/categories/comingSoon/movie (4).webp", movieId: "", releaseDate: "2026-09-15", featured: false },
    { title: "Ocean Lights", image: "../img/categories/comingSoon/movie (3).webp", movieId: "", releaseDate: "2026-10-04", featured: true },
    { title: "Shadow Runner", image: "../img/categories/comingSoon/movie (2).webp", movieId: "", releaseDate: "2026-10-19", featured: false },
    { title: "Winter Code", image: "../img/categories/comingSoon/movie (1).webp", movieId: "", releaseDate: "2026-11-03", featured: false },
    { title: "Crystal Gate", image: "../img/categories/comingSoon/movie (5).webp", movieId: "", releaseDate: "2026-11-18", featured: false },
    { title: "Broken Stars", image: "../img/categories/comingSoon/movie (4).webp", movieId: "", releaseDate: "2026-12-01", featured: false },
    { title: "Silver River", image: "../img/categories/comingSoon/movie (3).webp", movieId: "", releaseDate: "2026-12-15", featured: false },
    { title: "Final Hour", image: "../img/categories/comingSoon/movie (2).webp", movieId: "", releaseDate: "2027-01-08", featured: false },
    { title: "New Dawn", image: "../img/categories/comingSoon/movie (1).webp", movieId: "", releaseDate: "2027-01-22", featured: true },
  ],
};

function salveazaInStorage(date) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(date));
}

async function obtineDatele() {
  let dateLocale = localStorage.getItem(STORAGE_KEY);
  
  if (dateLocale) {
    return JSON.parse(dateLocale);
  }

  try {
    let raspuns = await fetch(JSON_URL);
    let dateJson = await raspuns.json();
    salveazaInStorage(dateJson);
    return dateJson;
  } catch (eroare) {
    salveazaInStorage(dateImplicite);
    return dateImplicite;
  }
}

async function afiseazaSectiuneTrending(date) {
  let container = document.getElementById("homeTrendingMovies");
  if (!container) return;

  let codHtml = "";
  for (let i = 0; i < date.trendingMovies.length; i++) {
    let film = date.trendingMovies[i];
    let url = film.movieId ? "../html/movie-detail.html?id=" + film.movieId : "../html/movie.html";
    let badge = film.featured ? '<div class="movie-badge"><img src="../img/icons/crown.webp"></div>' : "";

    codHtml += '<a class="movie-card" href="' + url + '">' +
                 '<div class="movie-image">' +
                   '<img src="' + film.image + '">' + badge +
                 '</div>' +
                 '<h3>' + film.title + '</h3>' +
               '</a>';
  }
  container.innerHTML = codHtml;
}

async function afiseazaSectiuneCategorii(date) {
  let container = document.getElementById("homeTrendingCategories");
  if (!container) return;

  let codHtml = "";
  for (let i = 0; i < date.categories.length; i++) {
    let cat = date.categories[i];
    let clasaImagine = (i === 0) ? "category-image" : "category-generic-image";

    codHtml += '<div class="mov-card mov-' + (i + 1) + '">' +
                 '<img class="' + clasaImagine + '" src="' + cat.image + '">' +
                 '<b class="section-label">' + cat.title + '</b>' +
               '</div>';
  }
  container.innerHTML = codHtml;
}

async function afiseazaSectiuneComingSoon(date) {
  let container = document.getElementById("homeComingSoon");
  if (!container) return;

  let codHtml = "";
  for (let i = 0; i < date.comingSoon.length; i++) {
    let film = date.comingSoon[i];
    let clasaItem = (i === 0) ? "timeline-item active" : "timeline-item";
    let coroana = film.featured ? '<img class="crown-icon" src="../img/icons/crown.webp">' : "";

    codHtml += '<div class="timeline-column">' +
                 '<div class="' + clasaItem + '"><div class="dot"></div></div>' +
                 '<div class="timeline-date">' + film.releaseDate + '</div>' +
                 '<div class="coming-card">' +
                   '<div class="coming-image-wrapper">' +
                     '<img class="coming-image" src="' + film.image + '">' + coroana +
                   '</div>' +
                   '<button class="btn-reserve" type="button">' +
                     '<img class="alarm-clock-icon" src="../img/icons/Alarm Clock.svg">' +
                     '<b class="section-label">Reserve</b>' +
                   '</button>' +
                 '</div>' +
               '</div>';
  }
  container.innerHTML = codHtml;
}

async function pornesteHome() {
  let date = await obtineDatele();
  afiseazaSectiuneTrending(date);
  afiseazaSectiuneCategorii(date);
  afiseazaSectiuneComingSoon(date);
}

window.WatchlyHomeContent = {
  read: obtineDatele,
  save: salveazaInStorage,
  defaults: dateImplicite
};

document.addEventListener("DOMContentLoaded", pornesteHome);