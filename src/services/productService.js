const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export async function getAllProducts() {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch products (${response.status})`);
  }

  return await response.json();
}

export async function getProductById(productId) {
  const response = await fetch(
    `${API_BASE_URL}/products/${productId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product not found.");
    }

    throw new Error(`Unable to fetch product (${response.status})`);
  }

  return await response.json();
}