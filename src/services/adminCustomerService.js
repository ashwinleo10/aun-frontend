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
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

export async function getAdminCustomers() {
  const response = await fetch(
    `${API_BASE_URL}/admin/customers`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function getAdminCustomerById(userId) {
  const response = await fetch(
    `${API_BASE_URL}/admin/customers/${userId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function deactivateAdminCustomer(userId) {
  const response = await fetch(
    `${API_BASE_URL}/admin/customers/${userId}/deactivate`,
    {
      method: "PATCH",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function activateAdminCustomer(userId) {
  const response = await fetch(
    `${API_BASE_URL}/admin/customers/${userId}/activate`,
    {
      method: "PATCH",
      credentials: "include",
    }
  );

  return handleResponse(response);
}