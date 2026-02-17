import {
  fetchAllProducts,
  fetchCategories,
  fetchProductsByCategory,
  fetchProductById,
} from "./api.js";

import {
  renderCategories,
  renderProducts,
  renderProductModal,
  renderCartItems,
  updateCartCount,
  updateCartTotal,
  showLoading,
  renderTopRated,
} from "./ui.js";

import {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  getCartCount,
  getCartTotal,
} from "./cart.js";

const productsContainer = document.getElementById("products-container");
const categoryFilters = document.getElementById("category-filters");
const topRatedContainer = document.getElementById("top-rated-container");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartDrawer = document.getElementById("cart-drawer");
const cartBtn = document.getElementById("cart-btn");
const closeCartBtn = document.getElementById("close-cart");
const cartOverlay = document.getElementById("cart-overlay");
const newsletterForm = document.getElementById("newsletter-form");

let allProducts = [];
let activeCategory = "all";

function refreshCartUI() {
  const cart = getCart();
  updateCartCount(getCartCount());
  updateCartTotal(getCartTotal());
  renderCartItems(cart, cartItemsContainer);
}

function openCart() {
  cartDrawer.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  refreshCartUI();
  closeCartBtn.focus();
}

function closeCart() {
  cartDrawer.classList.add("hidden");
  document.body.style.overflow = "";
  cartBtn.focus();
}

async function handleAddToCart(productId) {
  let product = allProducts.find((p) => p.id === productId);
  if (!product) {
    product = await fetchProductById(productId);
  }
  addToCart(product);
  refreshCartUI();

  const toast = document.createElement("div");
  toast.className = "toast toast-end toast-top z-[200]";
  toast.innerHTML = `<div class="alert alert-success shadow-lg"><i class="fa-solid fa-check-circle"></i><span>Added to cart!</span></div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

async function handleDetailsClick(productId) {
  const modal = document.getElementById("product-modal");
  const content = document.getElementById("modal-content");
  content.innerHTML = `<div class="flex justify-center py-12"><span class="loading loading-spinner loading-lg text-primary"></span></div>`;
  modal.showModal();

  let product = allProducts.find((p) => p.id === productId);
  if (!product) {
    product = await fetchProductById(productId);
  }
  renderProductModal(product);
}

async function loadCategories() {
  try {
    const categories = await fetchCategories();
    renderCategories(categories, categoryFilters, activeCategory);
  } catch (err) {
    categoryFilters.innerHTML = `<p class="text-error text-sm">Failed to load categories.</p>`;
  }
}

async function loadProducts(category = "all") {
  showLoading(productsContainer);
  activeCategory = category;

  try {
    let products;
    if (category === "all") {
      products = await fetchAllProducts();
    } else {
      products = await fetchProductsByCategory(category);
    }
    allProducts =
      category === "all" ? products : [...new Map([...allProducts, ...products].map((p) => [p.id, p])).values()];
    renderProducts(products, productsContainer);
  } catch (err) {
    productsContainer.innerHTML = `<div class="col-span-full text-center py-12 text-error space-y-4">
      <i class="fa-solid fa-triangle-exclamation text-4xl mb-2"></i>
      <p class="text-lg">Failed to load products. Please check your connection.</p>
      <button class="btn btn-primary retry-products-btn">
        <i class="fa-solid fa-rotate-right"></i> Retry
      </button>
    </div>`;
    
    const retryBtn = productsContainer.querySelector(".retry-products-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => loadProducts(activeCategory));
    }
  }
}

async function loadTopRated() {
  try {
    const products = await fetchAllProducts();
    allProducts = products;
    renderTopRated(products, topRatedContainer);
  } catch (err) {
    topRatedContainer.innerHTML = `<div class="col-span-full text-center text-error space-y-3">
      <i class="fa-solid fa-triangle-exclamation text-3xl"></i>
      <p>Failed to load top rated products.</p>
      <button class="btn btn-sm btn-primary retry-top-rated-btn">
        <i class="fa-solid fa-rotate-right"></i> Retry
      </button>
    </div>`;
    
    const retryBtn = topRatedContainer.querySelector(".retry-top-rated-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", loadTopRated);
    }
  }
}

categoryFilters.addEventListener("click", (e) =>
 {
  const btn = e.target.closest("button[data-category]");
  if (!btn) return;
  const category = btn.dataset.category;
  loadProducts(category);

  categoryFilters.querySelectorAll("button").forEach((b) => {
    b.className = b.className
      .replace("btn-primary", "btn-outline btn-primary")
      .replace("btn-outline btn-outline", "btn-outline");
  });
  btn.className = btn.className.replace("btn-outline btn-primary", "btn-primary");
  btn.classList.remove("btn-outline");
  btn.classList.add("btn-primary");
});

productsContainer.addEventListener("click", (e) => {
  const detailsBtn = e.target.closest(".details-btn");
  if (detailsBtn) {
    handleDetailsClick(Number(detailsBtn.dataset.id));
    return;
  }
  const addBtn = e.target.closest(".add-to-cart-btn");
  if (addBtn) {
    handleAddToCart(Number(addBtn.dataset.id));
  }
});

topRatedContainer.addEventListener("click", (e) => {
  const detailsBtn = e.target.closest(".details-btn");
  if (detailsBtn) {
    handleDetailsClick(Number(detailsBtn.dataset.id));
    return;
  }
  const addBtn = e.target.closest(".add-to-cart-btn");
  if (addBtn) {
    handleAddToCart(Number(addBtn.dataset.id));
  }
});

document.getElementById("product-modal").addEventListener("click", (e) => {
  const addBtn = e.target.closest(".modal-add-cart-btn");
  if (addBtn) {
    handleAddToCart(Number(addBtn.dataset.id));
    return;
  }
  const buyBtn = e.target.closest(".modal-buy-now-btn");
  if (buyBtn) {
    handleAddToCart(Number(buyBtn.dataset.id));
    openCart();
    document.getElementById("product-modal").close();
  }
});

cartItemsContainer.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".remove-cart-btn");
  if (removeBtn) {
    removeFromCart(Number(removeBtn.dataset.id));
    refreshCartUI();
    return;
  }
  const decreaseBtn = e.target.closest(".qty-decrease");
  if (decreaseBtn) {
    const id = Number(decreaseBtn.dataset.id);
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (item) {
      updateQuantity(id, item.quantity - 1);
      refreshCartUI();
    }
    return;
  }
  const increaseBtn = e.target.closest(".qty-increase");
  if (increaseBtn) {
    const id = Number(increaseBtn.dataset.id);
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
      refreshCartUI();
    }
  }
});

cartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

cartBtn.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openCart();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !cartDrawer.classList.contains("hidden")) {
    closeCart();
  }
  
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    if (cartDrawer.classList.contains("hidden")) {
      openCart();
    } else {
      closeCart();
    }
  }
});

newsletterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = document.getElementById("newsletter-msg");
  msg.textContent = "Thank you for subscribing!";
  msg.classList.remove("hidden");
  newsletterForm.reset();
  setTimeout(() => msg.classList.add("hidden"), 3000);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    const mobileMenu = document.querySelector(".dropdown-content");
    if (mobileMenu) mobileMenu.blur();
  });
});

document.getElementById("checkout-btn").addEventListener("click", () => {
  const cart = getCart();
  if (cart.length === 0) {
    const toast = document.createElement("div");
    toast.className = "toast toast-end toast-top z-[200]";
    toast.innerHTML = `<div class="alert alert-warning shadow-lg"><i class="fa-solid fa-exclamation-triangle"></i><span>Your cart is empty!</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
    return;
  }

  const total = getCartTotal();
  const itemCount = getCartCount();
  
  const confirmMsg = `Order Details:\n\nItems: ${itemCount}\nTotal: $${total.toFixed(2)}\n\nConfirm your order?`;
  
  if (confirm(confirmMsg)) {
    import("./cart.js").then(({ clearCart }) => {
      clearCart();
      refreshCartUI();
      closeCart();
      
      const toast = document.createElement("div");
      toast.className = "toast toast-end toast-top z-[200]";
      toast.innerHTML = `<div class="alert alert-success shadow-lg"><i class="fa-solid fa-check-circle"></i><span>Order placed successfully! Total: $${total.toFixed(2)}</span></div>`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    });
  }
});

const scrollTopBtn = document.getElementById("scroll-top-btn");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollTopBtn.classList.remove("opacity-0", "pointer-events-none");
    scrollTopBtn.classList.add("opacity-100");
  } else {
    scrollTopBtn.classList.add("opacity-0", "pointer-events-none");
    scrollTopBtn.classList.remove("opacity-100");
  }
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

async function init() {
  refreshCartUI();
  await Promise.all([loadCategories(), loadTopRated()]);
  await loadProducts("all");
}

init();
