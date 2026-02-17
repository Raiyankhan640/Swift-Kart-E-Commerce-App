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
}

function closeCart() {
  cartDrawer.classList.add("hidden");
  document.body.style.overflow = "";
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
    productsContainer.innerHTML = `<div class="col-span-full text-center py-12 text-error">
      <i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i>
      <p>Failed to load products. Please try again.</p>
    </div>`;
  }
}

async function loadTopRated() {
  try {
    const products = await fetchAllProducts();
    allProducts = products;
    renderTopRated(products, topRatedContainer);
  } catch (err) {
    topRatedContainer.innerHTML = `<p class="col-span-full text-center text-error">Failed to load top rated products.</p>`;
  }
}

categoryFilters.addEventListener("click", (e) => {
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

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !cartDrawer.classList.contains("hidden")) {
    closeCart();
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

async function init() {
  refreshCartUI();
  await Promise.all([loadCategories(), loadTopRated()]);
  await loadProducts("all");
}

init();
