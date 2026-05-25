
// Elemente pentru meniul de mobil
const butonMeniuMobil = document.getElementById("mobileMenuBtn");
const meniuMobil = document.getElementById("mobileNav");
const fundalMeniuMobil = document.getElementById("mobileMenuOverlay");

// Elemente pentru limba pe mobil
const butonLimbaMobil = document.getElementById("mobileLangBtn");
const meniuLimbaMobil = document.getElementById("mobileLangMenu");

// Functie care deschide sau inchide meniul
function seteazaMeniuMobil(deschis) {
  if (butonMeniuMobil) {
    butonMeniuMobil.classList.toggle("active", deschis);
    butonMeniuMobil.setAttribute("aria-expanded", String(deschis));
  }
  
  if (meniuMobil) {
    meniuMobil.classList.toggle("active", deschis);
  }
  
  if (fundalMeniuMobil) {
    fundalMeniuMobil.classList.toggle("is-visible", deschis);
  }

  // Blocam scroll-ul pe body cand e meniul deschis
  document.body.classList.toggle("menu-open", deschis);
}

// Functie rapida de inchidere
function inchideMeniuMobil() {
  seteazaMeniuMobil(false);
  if (meniuLimbaMobil) {
    meniuLimbaMobil.classList.remove("active");
  }
}

// Event listener pentru butonul de meniu (burger icon)
if (butonMeniuMobil) {
  butonMeniuMobil.addEventListener("click", (e) => {
    e.stopPropagation();
    let esteActiv = meniuMobil && meniuMobil.classList.contains("active");
    seteazaMeniuMobil(!esteActiv);
  });
}

// Inchide meniul daca apasam pe fundalul gri
if (fundalMeniuMobil) {
  fundalMeniuMobil.addEventListener("click", inchideMeniuMobil);
}

// Inchide meniul daca apasam tasta Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") inchideMeniuMobil();
});

// Inchide meniul daca apasam pe un link din interiorul lui
if (meniuMobil) {
  meniuMobil.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", inchideMeniuMobil);
  });
}

// Logica pentru schimbarea limbii pe mobil
if (butonLimbaMobil) {
  butonLimbaMobil.addEventListener("click", (e) => {
    e.stopPropagation();
    meniuLimbaMobil.classList.toggle("active");
  });
}

if (meniuLimbaMobil) {
  meniuLimbaMobil.querySelectorAll(".language-option").forEach((optiune) => {
    optiune.addEventListener("click", () => {
      let codLimba = optiune.getAttribute("data-lang");
      let caleSteag = optiune.getAttribute("data-flag");

      // Actualizam interfata pe mobil
      let steagMobil = document.getElementById("mobileSelectedFlag");
      let textMobil = document.getElementById("mobileSelectedLang");
      if (steagMobil) steagMobil.src = caleSteag;
      if (textMobil) textMobil.textContent = codLimba;

      meniuLimbaMobil.classList.remove("active");
      
      // Sincronizam si cu selectorul de pe desktop (daca exista)
      let steagDesktop = document.getElementById("selectedFlag");
      let textDesktop = document.getElementById("selectedLang");
      if (steagDesktop) steagDesktop.src = caleSteag;
      if (textDesktop) textDesktop.textContent = codLimba;
    });
  });
}

// Logica butoanelor de abonare (Subscribe)
document.querySelectorAll(".btn-subscribe").forEach((buton) => {
  buton.addEventListener("click", () => {
    window.location.href = "plans.html";
  });
});

// Detalii planuri (apar cand dai click pe "Learn More" sau link-uri de pret)
const detaliiPlanuri = {
  "Gold Plan": "Good for one user who wants unlimited streaming, no ads, 25 downloads and 10 TV channels.",
  "Diamond Plan": "Best for regular viewers who want more offline access, no ads, 100 downloads and 100 TV channels.",
  "Platinum Plan": "Full access for heavy viewing, unlimited downloads and unlimited TV channels."
};

document.querySelectorAll(".pricing-link, .plan-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    let card = link.closest(".price-1, .price-2, .plan-card");
    if (!card) return;

    let titluPlan = card.querySelector(".gold-plan, h2")?.textContent.trim();
    let textExistent = card.querySelector(".plan-detail-text");

    if (textExistent) {
      textExistent.remove();
    } else {
      let p = document.createElement("p");
      p.className = "plan-detail-text";
      const limba = window.WatchlyLang?.ia?.() || "EN";
      const desciere = detaliiPlanuri[titluPlan] || "This plan gives you access to Watchly movies.";
      const descTraducere = window.WatchlyLang?.obtine?.(desciere, limba) || desciere;
      p.textContent = descTraducere;
      link.insertAdjacentElement("afterend", p);
      
      // Aplicam traducerile si pe textul nou creat daca e cazul
      if (window.WatchlyLang) window.WatchlyLang.aplica();
    }
  });
});

// Adaugare abonament in cos la click pe butonul de pret
document.querySelectorAll(".pricing-btn, .plan-button").forEach((buton) => {
  buton.addEventListener("click", (e) => {
    e.preventDefault();
    let card = buton.closest(".price-1, .price-2, .plan-card");
    let titlu = card?.querySelector(".gold-plan, h2")?.textContent.trim() || "Watchly Plan";
    let pretText = card?.querySelector(".div, .plan-price span")?.textContent || "$0";
    let pretNumerat = Number(pretText.replace(/[^0-9.]/g, "")) || 0;

    if (window.WatchlyCart) {
      const limba = window.WatchlyLang?.ia?.() || "EN";
      const subtitlu = window.WatchlyLang?.obtine?.("Monthly subscription", limba) || "Monthly subscription";
      window.WatchlyCart.addItem({
        id: titlu.toLowerCase().replace(/\s+/g, "-"),
        title: titlu,
        subtitle: subtitlu,
        poster: "../img/icons/crown.webp",
        price: pretNumerat,
      });
    } else {
      window.location.href = "../html/register.html";
    }
  });
});

// Logica campului de cautare (Redirect catre pagina de filme)
document.querySelectorAll(".nav-search-input").forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      let textCautat = input.value.trim();
      if (textCautat) {
        window.location.href = `../html/movie.html?q=${encodeURIComponent(textCautat)}`;
      }
    }
  });
});

// Redirectionare automata pentru link-urile din footer
document.querySelectorAll(".footer-link, .footer-bottom-link").forEach((link) => {
  let text = link.textContent.trim().toLowerCase();
  if (text === "about us") link.href = "../html/about.html";
  if (text === "careers") link.href = "../html/careers.html";
  if (text === "contact") link.href = "../html/contact.html";
  if (text === "account") link.href = "../html/account.html";
  if (text === "terms" || text === "terms of service") link.href = "../html/terms.html";
  if (text === "privacy" || text === "privacy policy") link.href = "../html/privacy.html";
});