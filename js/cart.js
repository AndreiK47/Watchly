/**
 * Watchly Cart Logic
 * Gestionează coșul de cumpărături, dropdown-ul și procesul de checkout.
 */

// --- 1. CREAREA ELEMENTELOR DIN JAVASCRIPT (SHELL) ---
function ensureCartShell() {
  // Verificăm dacă iconița de coș există, dacă nu, o adăugăm
  if (!document.getElementById("cartIcon")) {
    const floatingCart = document.createElement("div");
    floatingCart.className = "nav-cart watchly-floating-cart";
    floatingCart.innerHTML = `
      <div class="shopping-cart" id="cartIcon" role="button" aria-expanded="false" tabindex="0">
        <img src="../img/icons/Shopping Cart.svg" alt="Cart" />
        <span id="cartCount">0</span>
      </div>
    `;
    document.body.appendChild(floatingCart);
  }

  // Verificăm dacă dropdown-ul există
  if (!document.getElementById("cartDropdown")) {
    const dropdown = document.createElement("div");
    dropdown.className = "cart";
    dropdown.id = "cartDropdown";
    dropdown.innerHTML = `
      <div class="tittle">
        <b class="my-cart">My Cart</b>
        <img class="close-icon" src="../img/icons/close.svg" alt="Close" id="closeCart">
      </div>
      <div class="tittle2">
        <div class="my-cart" id="cartItemsCount">0 items</div>
      </div>
      <div class="product-1-parent" id="cartItems"></div>
      <div class="subtotal">
        <b class="my-cart">Subtotal</b>
        <b class="my-cart" id="subtotalAmount">$0.00</b>
      </div>
      <button type="button" class="btn" id="checkoutBtn">
        <b class="my-cart">Buy</b>
      </button>
    `;
    document.body.appendChild(dropdown);
  }
}

// Apelăm funcția de shell imediat
ensureCartShell();

// --- 2. VARIABILE ȘI ELEMENTE ---
const STORAGE_CART_KEY = "watchly.cart";
const STORAGE_ORDERS_KEY = "watchly.orders";

let cartData = []; // Aici ținem lista de filme din coș

const UI = {
  icon: document.getElementById("cartIcon"),
  dropdown: document.getElementById("cartDropdown"),
  countSpan: document.getElementById("cartCount"),
  itemsCountText: document.getElementById("cartItemsCount"),
  itemsContainer: document.getElementById("cartItems"),
  subtotalText: document.getElementById("subtotalAmount"),
  closeBtn: document.getElementById("closeCart"),
  mobileBtn: document.getElementById("mobileCartBtn"),
  mobileCount: document.getElementById("mobileCartCount"),
  checkoutRedirectBtn: document.getElementById("checkoutBtn")
};

// --- 3. FUNCȚII DE SALVARE ȘI ÎNCĂRCARE ---
function loadCart() {
  try {
    const stored = localStorage.getItem(STORAGE_CART_KEY);
    cartData = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(cartData)) cartData = [];
  } catch (e) {
    cartData = [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cartData));
}

// --- 4. LOGICA COȘULUI (ADĂUGARE/ȘTERGERE) ---

function addMovieToCart(movie) {
  // Generăm un cartId unic pentru a putea șterge exact acest item
  const itemToAdd = {
    ...movie,
    cartId: movie.cartId || `${movie.id}-${Date.now()}`
  };
  
  cartData.push(itemToAdd);
  refreshEverything();
  
  // Feedback vizual - tradus
  playBumpAnimation();
  const mesaj = window.WatchlyLang?.obtine?.("Filmul a fost adaugat in cos.", window.WatchlyLang?.ia?.()) || "Filmul a fost adaugat in cos.";
  showToast(mesaj);
}

function removeMovieFromCart(index) {
  cartData.splice(index, 1);
  refreshEverything();
}

function clearCart() {
  cartData = [];
  refreshEverything();
}

function refreshEverything() {
  saveCart();
  renderDropdownItems();
  updateCountsAndTotal();
  renderCheckoutPage(); // Dacă suntem pe pagina de cart.html
}

// --- 5. RENDER ȘI UI ---

function updateCountsAndTotal() {
  const count = cartData.length;
  const total = cartData.reduce((sum, item) => sum + Number(item.price || 0), 0);

  if (UI.countSpan) UI.countSpan.textContent = count;
  if (UI.mobileCount) UI.mobileCount.textContent = count;
  
  // Traducere dinamică pentru "item/items"
  const limba = window.WatchlyLang?.ia?.() || "EN";
  const itemWord = count !== 1 ? 
    window.WatchlyLang?.obtine?.("items", limba) || "items" : 
    window.WatchlyLang?.obtine?.("item", limba) || "item";
  
  if (UI.itemsCountText) UI.itemsCountText.textContent = `${count} ${itemWord}`;
  if (UI.subtotalText) UI.subtotalText.textContent = `$${total.toFixed(2)}`;

  // Aplicăm limba dacă există sistemul de traducere
  window.WatchlyLang?.aplica?.();
}

function renderDropdownItems() {
  if (!UI.itemsContainer) return;

  if (cartData.length === 0) {
    const mesajGol = window.WatchlyLang?.obtine?.("Your cart is empty.", window.WatchlyLang?.ia?.()) || "Your cart is empty.";
    UI.itemsContainer.innerHTML = `<div class="cart-empty">${mesajGol}</div>`;
    return;
  }

  UI.itemsContainer.innerHTML = cartData.map((item, index) => `
    <div class="product-1">
      <div class="product-1-group">
        <img src="${item.poster}" alt="${item.title}" class="product-1-icon">
        <div class="frame-parent">
          <div class="galactic-warriors-hd-parent">
            <div class="galactic-warriors-hd">${item.title}</div>
            <div class="rent-40">${item.subtitle || ""}${item.rentDate ? ` - ${item.rentDate}` : ""}</div>
          </div>
          <div class="galactic-warriors-hd">$${Number(item.price).toFixed(2)}</div>
        </div>
      </div>
      <img src="../img/icons/close.svg" alt="Remove" class="close-icon" data-cart-index="${index}">
    </div>
  `).join("");
}

// Afișează coșul pe pagina dedicată (cart.html)
function renderCheckoutPage() {
  const panel = document.getElementById("checkoutItems");
  if (!panel) return;

  const subtotal = cartData.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const fee = cartData.length > 0 ? 1 : 0; // Taxă de 1$ dacă avem produse

  // Update sumare (partea dreaptă a paginii)
  const limba = window.WatchlyLang?.ia?.() || "EN";
  const itemWord = cartData.length !== 1 ? 
    window.WatchlyLang?.obtine?.("items", limba) || "items" : 
    window.WatchlyLang?.obtine?.("item", limba) || "item";
  
  document.getElementById("checkoutItemCount") && (document.getElementById("checkoutItemCount").textContent = `${cartData.length} ${itemWord}`);
  document.getElementById("checkoutSubtotal") && (document.getElementById("checkoutSubtotal").textContent = `$${subtotal.toFixed(2)}`);
  document.getElementById("checkoutFee") && (document.getElementById("checkoutFee").textContent = `$${fee.toFixed(2)}`);
  document.getElementById("checkoutTotal") && (document.getElementById("checkoutTotal").textContent = `$${(subtotal + fee).toFixed(2)}`);

  if (cartData.length === 0) {
    panel.innerHTML = `
      <div class="checkout-empty">
        <h3>No movies selected</h3>
        <p>Add a movie from the store, then come back to checkout.</p>
        <a href="../html/movie.html">Browse movies</a>
      </div>
    `;
    return;
  }

  panel.innerHTML = cartData.map((item, index) => `
    <article class="cart-page-item">
      <img src="${item.poster}" alt="${item.title}">
      <div class="cart-page-item-info">
        <h3>${item.title}</h3>
        <p>${item.subtitle || ""}${item.rentDate ? ` - starts ${item.rentDate}` : ""}</p>
      </div>
      <strong>$${Number(item.price || 0).toFixed(2)}</strong>
      <button type="button" data-checkout-remove="${index}">
        <img src="../img/icons/close.svg" alt="Remove">
      </button>
    </article>
  `).join("");
}

// --- 6. POZIȚIONARE ȘI EFECTE ---

function positionDropdown() {
  if (!UI.icon || !UI.dropdown) return;
  const rect = UI.icon.getBoundingClientRect();
  const dropdownWidth = Math.min(420, window.innerWidth - 32);
  
  UI.dropdown.style.top = (rect.bottom + 10) + "px";
  UI.dropdown.style.right = "auto";
  UI.dropdown.style.left = (rect.right - dropdownWidth) + "px";
}

function toggleCart(e) {
  if (e) e.stopPropagation();
  const isOpen = UI.dropdown.classList.toggle("active");
  
  if (isOpen && window.innerWidth > 768) {
    positionDropdown();
  }
  
  UI.icon.setAttribute("aria-expanded", isOpen);
  if (UI.mobileBtn) UI.mobileBtn.setAttribute("aria-expanded", isOpen);

  // Efect click
  UI.icon.classList.add("is-pressed");
  setTimeout(() => UI.icon.classList.remove("is-pressed"), 160);
}

function playBumpAnimation() {
  if (!UI.icon) return;
  UI.icon.classList.remove("is-bump");
  void UI.icon.offsetWidth; // trigger reflow
  UI.icon.classList.add("is-bump");
}

function showToast(msg) {
  let toast = document.querySelector(".watchly-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "watchly-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("active");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toast.classList.remove("active"), 2200);
}

// --- 7. EVENIMENTE ---

// Click pe iconiță (Deschide/Închide)
UI.icon?.addEventListener("click", toggleCart);

// Închide la click în exterior
document.addEventListener("click", (e) => {
  if (!UI.dropdown?.classList.contains("active")) return;
  const isInside = UI.icon.contains(e.target) || UI.dropdown.contains(e.target) || UI.mobileBtn?.contains(e.target);
  if (!isInside) {
    UI.dropdown.classList.remove("active");
    UI.icon.setAttribute("aria-expanded", "false");
  }
});

// Ștergere item din dropdown
UI.itemsContainer?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cart-index]");
  if (btn) {
    removeMovieFromCart(parseInt(btn.dataset.cartIndex));
  }
});

// Ștergere item din pagina de checkout
document.getElementById("checkoutItems")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-checkout-remove]");
  if (btn) {
    removeMovieFromCart(parseInt(btn.dataset.checkoutRemove));
  }
});

// Buton "Buy" din dropdown (duce la pagina cart.html)
UI.checkoutRedirectBtn?.addEventListener("click", () => {
  window.location.href = "cart.html";
});

UI.closeBtn?.addEventListener("click", () => {
  UI.dropdown.classList.remove("active");
});

UI.mobileBtn?.addEventListener("click", toggleCart);

// Procesul final de Checkout (butonul de plată din cart.html)
const actionBtn = document.getElementById("checkoutAction");
if (actionBtn) {
  actionBtn.addEventListener("click", () => {
    if (cartData.length === 0) return alert("Your cart is empty.");

    const user = window.WatchlyAuth?.getCurrentUser();
    if (!user) {
      alert("Please login before checkout.");
      window.location.href = "../html/register.html";
      return;
    }

    const name = document.getElementById("checkoutName")?.value.trim();
    const email = document.getElementById("checkoutEmail")?.value.trim();
    const payment = document.getElementById("checkoutPayment")?.value;

    if (!name || !email || !payment) {
      const msgBox = document.getElementById("checkoutMessage");
      msgBox.textContent = "Completeaza toate campurile de livrare/plata.";
      msgBox.classList.add("active");
      return;
    }

    // Salvare comandă
    const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY) || "[]");
    const subtotal = cartData.reduce((sum, item) => sum + Number(item.price || 0), 0);
    
    orders.push({
      id: `order-${Date.now()}`,
      userId: user.id,
      userName: name,
      userEmail: email,
      payment: payment,
      createdAt: new Date().toISOString(),
      items: cartData,
      total: subtotal + 1,
      status: "paid"
    });

    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders, null, 2));
    
    // Curățăm coșul și mergem la pagina de succes/comenzi
    clearCart();
    const msgBox = document.getElementById("checkoutMessage");
    msgBox.textContent = "Comanda a fost confirmata!";
    msgBox.classList.add("active", "success");
    
    setTimeout(() => {
      window.location.href = "../html/orders.html";
    }, 1000);
  });
}

// Repoziționare dropdown la scroll sau resize
window.addEventListener("scroll", () => {
  if (UI.dropdown?.classList.contains("active")) positionDropdown();
});
window.addEventListener("resize", () => {
  if (UI.dropdown?.classList.contains("active")) positionDropdown();
});

// --- 8. INIT ȘI EXPORT ---
loadCart();
refreshEverything();

// Exportăm obiectul global pentru a fi folosit în alte pagini (ex: movie-detail.js)
window.WatchlyCart = {
  addItem: addMovieToCart,
  getItems: () => [...cartData],
  clear: clearCart,
  showMessage: showToast
};