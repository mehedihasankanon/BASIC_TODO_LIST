import {
  getJwtToken,
  setJwtToken,
  getRefreshToken,
  setRefreshToken,
} from "./JWTHandler.js";

import { API_BASE_URL as API_URL } from "./api.js";

export function isUserLoggedIn() {
  const token = getJwtToken();
  return token !== null;
}

export async function registerUser({ username, email, password }) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();

    // response.ok checks if the status code is in the range 200-299
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function userLogin({ email, password }) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    setJwtToken(data.token);
    setRefreshToken(data.refreshToken);
    return data;
  } catch (error) {
    throw error;
  }
}

