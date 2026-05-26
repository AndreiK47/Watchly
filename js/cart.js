/**
 * Watchly Cart Logic
 * Gestionează coșul de cumpărături, dropdown-ul și procesul de checkout.
 */

function ensureCartShell() {
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

ensureCartShell();

const STORAGE_CART_KEY = "watchly.cart";
const STORAGE_ORDERS_KEY = "watchly.orders";

let cartData = [];

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

function addMovieToCart(movie) {
  const itemToAdd = {
    ...movie,
    cartId: movie.cartId || `${movie.id}-${Date.now()}`
  };
  
  cartData.push(itemToAdd);
  refreshEverything();
  
  playBumpAnimation();
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
  renderCheckoutPage();
}

function updateCountsAndTotal() {
  const count = cartData.length;
  const total = cartData.reduce((sum, item) => sum + Number(item.price || 0), 0);

  if (UI.countSpan) UI.countSpan.textContent = count;
  if (UI.mobileCount) UI.mobileCount.textContent = count;
  
  const limba = window.WatchlyLang?.ia?.() || "EN";
  const itemWord = count !== 1 ? 
    window.WatchlyLang?.obtine?.("items", limba) || "items" : 
    window.WatchlyLang?.obtine?.("item", limba) || "item";
  
  if (UI.itemsCountText) UI.itemsCountText.textContent = `${count} ${itemWord}`;
  if (UI.subtotalText) UI.subtotalText.textContent = `$${total.toFixed(2)}`;

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
  void UI.icon.offsetWidth;
  UI.icon.classList.add("is-bump");
}


UI.icon?.addEventListener("click", toggleCart);

document.addEventListener("click", (e) => {
  if (!UI.dropdown?.classList.contains("active")) return;
  const isInside = UI.icon.contains(e.target) || UI.dropdown.contains(e.target) || UI.mobileBtn?.contains(e.target);
  if (!isInside) {
    UI.dropdown.classList.remove("active");
    UI.icon.setAttribute("aria-expanded", "false");
  }
});

UI.itemsContainer?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cart-index]");
  if (btn) {
    removeMovieFromCart(parseInt(btn.dataset.cartIndex));
  }
});

document.getElementById("checkoutItems")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-checkout-remove]");
  if (btn) {
    removeMovieFromCart(parseInt(btn.dataset.checkoutRemove));
  }
});

UI.checkoutRedirectBtn?.addEventListener("click", () => {
  window.location.href = "cart.html";
});

UI.closeBtn?.addEventListener("click", () => {
  UI.dropdown.classList.remove("active");
});

UI.mobileBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (window.innerWidth <= 768) {
    window.location.href = "cart.html";
  } else {
    toggleCart(e);
  }
});



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
    
    clearCart();
    const msgBox = document.getElementById("checkoutMessage");
    msgBox.textContent = "Comanda a fost confirmata!";
    msgBox.classList.add("active", "success");
    
    setTimeout(() => {
      window.location.href = "../html/orders.html";
    }, 1000);
  });
}

window.addEventListener("scroll", () => {
  if (UI.dropdown?.classList.contains("active")) positionDropdown();
});
window.addEventListener("resize", () => {
  if (UI.dropdown?.classList.contains("active")) positionDropdown();
});

loadCart();
refreshEverything();

window.WatchlyCart = {
  addItem: addMovieToCart,
  getItems: () => [...cartData],
  clear: clearCart
};