const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

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
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

export async function getAllCategories() {
  const response = await fetch(
    `${API_BASE_URL}/categories`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleResponse(response);
}