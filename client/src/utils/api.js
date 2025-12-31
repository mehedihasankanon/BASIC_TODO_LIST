import {
  getJwtToken,
  getRefreshToken,
  removeTokens,
  setJwtToken,
} from "./JWTHandler.js";

export async function fetchWithAuth(url, options = {}) {
  const logout = () => {
    removeTokens();
    window.location.href = "/login";
  };

  const token = getJwtToken();

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      logout();
      return response;
    }

    const refreshResponse = await fetch("http://localhost:4500/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();

      setJwtToken(data.accessToken);

      // retry original request with new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${data.accessToken}`,
          "Content-Type": "application/json",
        },
      });
    } else {
      logout();
      return refreshResponse;
    }
  }

  return response;
}
