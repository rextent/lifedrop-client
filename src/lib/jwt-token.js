const TOKEN_KEY = "lifedrop_access_token";

export const saveAccessToken = (token) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAccessToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) || "";
};

export const removeAccessToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
};

export const getAuthHeaders = () => {
  const token = getAccessToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const createJwtToken = async (email) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  // New login/signup শুরু হওয়ার আগে পুরোনো token অবশ্যই clear হবে
  removeAccessToken();

  const response = await fetch(`${baseUrl}/api/jwt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data?.success || !data?.token) {
    removeAccessToken();
    throw new Error(data?.message || "Failed to create JWT token.");
  }

  saveAccessToken(data.token);

  return data;
};