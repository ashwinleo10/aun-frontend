const API_BASE_URL = "http://localhost:8080/api";

async function handleResponse(response) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    // Response may not contain JSON.
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export async function getAdminProducts() {
  const response = await fetch(
    `${API_BASE_URL}/products/admin/all`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function getAdminProductById(productId) {
  const response = await fetch(
    `${API_BASE_URL}/products/${productId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function createProduct(productData) {
  const response = await fetch(
    `${API_BASE_URL}/products`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(productData),
    }
  );

  return handleResponse(response);
}

export async function updateProduct(productId, productData) {
  const response = await fetch(
    `${API_BASE_URL}/products/${productId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(productData),
    }
  );

  return handleResponse(response);
}

export async function deactivateProduct(productId) {
  const response = await fetch(
    `${API_BASE_URL}/products/${productId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function activateProduct(productId) {
  const response = await fetch(
    `${API_BASE_URL}/products/${productId}/activate`,
    {
      method: "PATCH",
      credentials: "include",
    }
  );

  return handleResponse(response);
}