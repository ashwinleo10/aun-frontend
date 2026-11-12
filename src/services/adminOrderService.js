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

export async function getAdminOrders() {
  const response = await fetch(
    `${API_BASE_URL}/admin/orders`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function getAdminOrderById(orderId) {
  const response = await fetch(
    `${API_BASE_URL}/admin/orders/${orderId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function updateAdminOrderStatus(
  orderId,
  orderStatus
) {
  const response = await fetch(
    `${API_BASE_URL}/admin/orders/${orderId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        orderStatus,
      }),
    }
  );

  return handleResponse(response);
}

export async function confirmCodPayment(orderId) {
  const response = await fetch(
    `${API_BASE_URL}/admin/orders/${orderId}/confirm-payment`,
    {
      method: "PUT",
      credentials: "include",
    }
  );

  return handleResponse(response);
}