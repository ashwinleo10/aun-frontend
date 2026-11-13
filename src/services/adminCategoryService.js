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
      data?.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

// ==========================================================
// GET ALL CATEGORIES
// Includes active and inactive categories
// ==========================================================

export async function getAdminCategories() {
  const response = await fetch(
    `${API_BASE_URL}/categories/admin/all`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

// ==========================================================
// ADD CATEGORY
// ==========================================================

export async function createCategory(categoryData) {
  const response = await fetch(
    `${API_BASE_URL}/categories`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(categoryData),
    }
  );

  return handleResponse(response);
}

// ==========================================================
// UPDATE CATEGORY
// ==========================================================

export async function updateCategory(
  categoryId,
  categoryData
) {
  const response = await fetch(
    `${API_BASE_URL}/categories/${categoryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(categoryData),
    }
  );

  return handleResponse(response);
}

// ==========================================================
// DEACTIVATE CATEGORY
// ==========================================================

export async function deactivateCategory(categoryId) {
  const response = await fetch(
    `${API_BASE_URL}/categories/${categoryId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

// ==========================================================
// ACTIVATE CATEGORY
// ==========================================================

export async function activateCategory(categoryId) {
  const response = await fetch(
    `${API_BASE_URL}/categories/${categoryId}/activate`,
    {
      method: "PATCH",
      credentials: "include",
    }
  );

  return handleResponse(response);
}