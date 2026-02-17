const BASE_URL = "https://fakestoreapi.com";

async function fetchAllProducts() {
  const response = await fetch(`${BASE_URL}/products`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
}

async function fetchCategories() {
  const response = await fetch(`${BASE_URL}/products/categories`);
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
}

async function fetchProductsByCategory(category) {
  const response = await fetch(
    `${BASE_URL}/products/category/${encodeURIComponent(category)}`
  );
  if (!response.ok) throw new Error(`Failed to fetch products for ${category}`);
  return response.json();
}

async function fetchProductById(id) {
  const response = await fetch(`${BASE_URL}/products/${id}`);
  if (!response.ok) throw new Error(`Failed to fetch product #${id}`);
  return response.json();
}

export {
  fetchAllProducts,
  fetchCategories,
  fetchProductsByCategory,
  fetchProductById,
};
