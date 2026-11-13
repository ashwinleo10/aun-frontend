
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

async function handleResponse(response) {
  const responseText = await response.text();

  let responseData = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }
  }

  if (!response.ok) {
    const error = new Error(
      responseData?.message ||
        responseData?.error ||
        `Address request failed (${response.status}).`
    );

    error.status = response.status;
    throw error;
  }

  return responseData;
}

// Get all saved addresses
export async function getAddresses() {
  const response = await fetch(`${API_BASE_URL}/addresses`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

// Add a new address
export async function addAddress(addressData) {
  const response = await fetch(`${API_BASE_URL}/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(addressData),
  });

  return handleResponse(response);
}

// Update an existing address
export async function updateAddress(addressId, addressData) {
  const response = await fetch(
    `${API_BASE_URL}/addresses/${addressId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(addressData),
    }
  );

  return handleResponse(response);
}

// Delete an address
export async function deleteAddress(addressId) {
  const response = await fetch(
    `${API_BASE_URL}/addresses/${addressId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

// Set an address as default
export async function setDefaultAddress(addressId) {
  const response = await fetch(
    `${API_BASE_URL}/addresses/${addressId}/default`,
    {
      method: "PUT",
      credentials: "include",
    }
  );

  return handleResponse(response);
}
