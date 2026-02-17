function truncateText(text, maxLength = 40) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  let html = "";
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fa-solid fa-star text-yellow-400"></i>';
  }
  if (halfStar) {
    html += '<i class="fa-solid fa-star-half-stroke text-yellow-400"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="fa-regular fa-star text-yellow-400"></i>';
  }
  return html;
}

function renderCategories(categories, container, activeCategory) {
  container.innerHTML = "";
  const allBtn = document.createElement("button");
  allBtn.className = `btn btn-sm md:btn-md ${
    activeCategory === "all"
      ? "btn-primary"
      : "btn-outline btn-primary"
  }`;
  allBtn.textContent = "All";
  allBtn.dataset.category = "all";
  container.appendChild(allBtn);

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm md:btn-md capitalize ${
      activeCategory === cat
        ? "btn-primary"
        : "btn-outline btn-primary"
    }`;
    btn.textContent = cat;
    btn.dataset.category = cat;
    container.appendChild(btn);
  });
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className =
    "card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300 border border-base-200";
  card.innerHTML = `
    <figure class="px-4 pt-4">
      <img
        src="${product.image}"
        alt="${product.title}"
        class="h-48 w-full object-contain rounded-lg"
        loading="lazy"
      />
    </figure>
    <div class="card-body p-4 gap-2">
      <span class="badge badge-outline badge-primary badge-sm capitalize">${product.category}</span>
      <h3 class="card-title text-sm font-semibold leading-tight">${truncateText(product.title)}</h3>
      <div class="flex items-center gap-1 text-sm">
        ${generateStars(product.rating.rate)}
        <span class="text-gray-500 text-xs">(${product.rating.count})</span>
      </div>
      <p class="text-lg font-bold text-primary">$${product.price.toFixed(2)}</p>
      <div class="card-actions justify-between mt-2">
        <button class="btn btn-sm btn-outline btn-secondary details-btn" data-id="${product.id}">
          <i class="fa-solid fa-eye"></i> Details
        </button>
        <button class="btn btn-sm btn-primary add-to-cart-btn" data-id="${product.id}">
          <i class="fa-solid fa-cart-plus"></i> Add
        </button>
      </div>
    </div>
  `;
  return card;
}

function renderProducts(products, container) {
  container.innerHTML = "";
  if (products.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500">
      <i class="fa-solid fa-box-open text-4xl mb-4"></i>
      <p class="text-lg">No products found.</p>
    </div>`;
    return;
  }
  products.forEach((product) => {
    container.appendChild(createProductCard(product));
  });
}

function renderProductModal(product) {
  const modal = document.getElementById("product-modal");
  const content = document.getElementById("modal-content");
  content.innerHTML = `
    <div class="flex flex-col md:flex-row gap-6">
      <div class="flex-shrink-0 flex items-center justify-center bg-base-200 rounded-lg p-4 md:w-1/3">
        <img src="${product.image}" alt="${product.title}" class="max-h-64 object-contain" />
      </div>
      <div class="flex-1 space-y-3">
        <h3 class="text-xl font-bold">${product.title}</h3>
        <span class="badge badge-primary capitalize">${product.category}</span>
        <p class="text-gray-600 text-sm leading-relaxed">${product.description}</p>
        <div class="flex items-center gap-2">
          ${generateStars(product.rating.rate)}
          <span class="text-sm text-gray-500">${product.rating.rate} / 5 (${product.rating.count} reviews)</span>
        </div>
        <p class="text-2xl font-bold text-primary">$${product.price.toFixed(2)}</p>
        <div class="flex gap-3 pt-2">
          <button class="btn btn-primary modal-add-cart-btn" data-id="${product.id}">
            <i class="fa-solid fa-cart-plus"></i> Add to Cart
          </button>
          <button class="btn btn-secondary modal-buy-now-btn" data-id="${product.id}">
            <i class="fa-solid fa-bag-shopping"></i> Buy Now
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderCartItems(cart, container) {
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-gray-400">
        <i class="fa-solid fa-cart-shopping text-5xl mb-4"></i>
        <p class="text-lg">Your cart is empty</p>
      </div>`;
    return;
  }
  container.innerHTML = cart
    .map(
      (item) => `
    <div class="flex gap-3 items-center border-b border-base-200 py-3" data-cart-id="${item.id}">
      <img src="${item.image}" alt="${item.title}" class="w-14 h-14 object-contain rounded bg-base-200 p-1" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">${item.title}</p>
        <p class="text-primary font-bold text-sm">$${item.price.toFixed(2)}</p>
        <div class="flex items-center gap-2 mt-1">
          <button class="btn btn-xs btn-outline qty-decrease" data-id="${item.id}">-</button>
          <span class="text-sm font-medium">${item.quantity}</span>
          <button class="btn btn-xs btn-outline qty-increase" data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="btn btn-xs btn-error btn-outline remove-cart-btn" data-id="${item.id}">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>`
    )
    .join("");
}

function updateCartCount(count) {
  const badge = document.getElementById("cart-count");
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle("hidden", count === 0);
  }
}

function updateCartTotal(total) {
  const el = document.getElementById("cart-total");
  if (el) {
    el.textContent = `$${total.toFixed(2)}`;
  }
}

function showLoading(container) {
  container.innerHTML = `
    <div class="col-span-full flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>`;
}

function hideLoading(container) {
  const spinner = container.querySelector(".loading");
  if (spinner) spinner.closest("div")?.remove();
}

function renderTopRated(products, container) {
  const sorted = [...products].sort((a, b) => b.rating.rate - a.rating.rate);
  const top3 = sorted.slice(0, 3);
  container.innerHTML = "";
  top3.forEach((product) => {
    container.appendChild(createProductCard(product));
  });
}

export {
  renderCategories,
  renderProducts,
  renderProductModal,
  renderCartItems,
  updateCartCount,
  updateCartTotal,
  showLoading,
  hideLoading,
  renderTopRated,
};
