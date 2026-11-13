const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

async function handleResponse(response) {
  const contentType = response.headers.get("content-type");

  let data = null;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || "Something went wrong";

    throw new Error(message);
  }

  return data;
}

// Place COD order
export async function placeOrder(addressId, paymentMethod) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      addressId,
      paymentMethod,
    }),
  });

  return handleResponse(response);
}

// Create Razorpay online payment order
export async function createOnlinePayment(addressId) {
  const response = await fetch(
    `${API_BASE_URL}/orders/online-payment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        addressId,
        paymentMethod: "ONLINE",
      }),
    }
  );

  return handleResponse(response);
}

// Verify Razorpay payment
export async function verifyOnlinePayment(paymentData) {
  const response = await fetch(
    `${API_BASE_URL}/orders/verify-payment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(paymentData),
    }
  );

  return handleResponse(response);
}

// Get all customer orders
export async function getMyOrders() {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

// Get one customer order
export async function getOrderById(orderId) {
  const response = await fetch(
    `${API_BASE_URL}/orders/${orderId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

// Cancel customer order
export async function cancelOrder(orderId) {
  const response = await fetch(
    `${API_BASE_URL}/orders/${orderId}/cancel`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  return handleResponse(response);
}