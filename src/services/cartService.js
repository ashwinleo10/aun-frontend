const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

async function handleResponse(response) {
  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        data?.error ||
        `Cart request failed (${response.status}).`
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

// Add product to cart
export async function addProductToCart({
  productId,
  quantity,
  selectedSize,
  selectedColor,
}) {
  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      productId,
      quantity,
      selectedSize,
      selectedColor,
    }),
  });

  return handleResponse(response);
}

// Get customer cart
export async function getCart() {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: "GET",
    credentials: "include",
  });

  /*
   * A new customer may not have a cart yet.
   *
   * Backend returns 404 "Cart not found" in that case.
   * Treat that as an empty cart instead of an error.
   *
   * Once the customer adds a product, the backend
   * creates the cart normally.
   */
  if (response.status === 404) {
    return {
      items: [],
      totalItems: 0,
      totalAmount: 0,
    };
  }

  return handleResponse(response);
}

// Update cart item quantity
export async function updateCartItem(itemId, quantity) {
  const response = await fetch(
    `${API_BASE_URL}/cart/items/${itemId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ quantity }),
    }
  );

  return handleResponse(response);
}

// Remove individual cart item
export async function removeCartItem(itemId) {
  const response = await fetch(
    `${API_BASE_URL}/cart/items/${itemId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

// Clear entire cart
export async function clearCart() {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse(response);
}