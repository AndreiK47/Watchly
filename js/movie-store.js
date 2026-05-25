(function () {
  let STORAGE_KEY = "watchly_movies";
  let JSON_URL = "../data/movies.json";
  let defaultMovies = [
    {
      id: "galactic-warriors",
      title: "Galactic Warriors",
      category: "Action",
      genre: "Action",
      year: "2025",
      duration: "128 min",
      ageRating: "PG-13",
      imdb: "4.8",
      buyPrice: 12.4,
      rentPrice: 2.4,
      poster: "../img/movies/movie (8).webp",
      heroBg: "../img/movies/movie (8).webp",
      logo: "",
      thumbnail: "../img/movies/movie (8).webp",
      trailerImages: [],
      description: "Film de actiune si aventura in spatiu.",
      status: "published",
      featured: true,
    },
    {
      id: "ne-zha",
      title: "Ne Zha",
      category: "Animation",
      genre: "Animation",
      year: "2025",
      duration: "110 min",
      ageRating: "PG",
      imdb: "4.7",
      buyPrice: 10.9,
      rentPrice: 2.2,
      poster: "../img/movies/movie (1).webp",
      heroBg: "../img/movies/movie (1).webp",
      logo: "",
      thumbnail: "../img/movies/movie (1).webp",
      trailerImages: [],
      description: "Film animat despre curaj si prietenie.",
      status: "published",
      featured: false,
    },
  ];

  function readSavedMovies() {
    let savedMovies = localStorage.getItem(STORAGE_KEY);
    return savedMovies ? JSON.parse(savedMovies) : null;
  }

  function saveMovies(movies) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies, null, 2));
  }

  async function loadMovies() {
    let savedMovies = readSavedMovies();
    if (savedMovies) return savedMovies;

    let movies = defaultMovies;

    try {
      let response = await fetch(JSON_URL);
      movies = await response.json();
    } catch (error) {
      movies = defaultMovies;
    }

    saveMovies(movies);
    return movies;
  }

  function slugify(value) {
    return String(value || "movie")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "movie-" + Date.now();
  }

  function normalizeMovie(movie) {
    return {
      id: movie.id || slugify(movie.title),
      title: movie.title || "Untitled Movie",
      category: movie.category || movie.genre || "Movie",
      genre: movie.genre || "Drama",
      year: movie.year || "2026",
      duration: movie.duration || "120 min",
      ageRating: movie.ageRating || "PG-13",
      imdb: movie.imdb || "4.5",
      buyPrice: Number(movie.buyPrice || 0),
      rentPrice: Number(movie.rentPrice || 0),
      poster: movie.poster || "../img/movies/movie (1).webp",
      heroBg: movie.heroBg || movie.poster || "../img/hero/pack 1/background.webp",
      logo: movie.logo || "",
      thumbnail: movie.thumbnail || movie.poster || "../img/movies/movie (1).webp",
      trailerImages: Array.isArray(movie.trailerImages) ? movie.trailerImages : [],
      description: movie.description || "",
      status: movie.status || "published",
      featured: Boolean(movie.featured),
    };
  }

  window.WatchlyStore = {
    loadMovies,
    saveMovies,
    normalizeMovie,
    slugify,
    storageKey: STORAGE_KEY,
  };
})();
