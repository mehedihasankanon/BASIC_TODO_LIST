import { useState } from "react";

import { setJwtToken, setRefreshToken } from "../utils/JWTHandler";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import { API_BASE_URL as URL } from "../utils/api.js";

export default function UserLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      password: value,
    }));

    // const strengthInfo = calculatePasswordStrength(value);
    // setPasswordStrength(strengthInfo);
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Check email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Check password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Don't refresh page

    if (!validateForm()) {
      return; // Stop if validation failed
    }

    setLoading(true); // Show loading state

    try {
      const response = await fetch(`${URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      // Success! Store tokens
      setJwtToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      toast.success("Logged in successfully!");

      // Go to dashboard
      navigate("/");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
            {formData.email &&
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
              !errors.email && (
                <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                  ✓ Valid email
                </p>
              )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}

            {formData.password && !errors.password && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full transition-all duration-300 bg-green-500" />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg font-medium text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 font-medium hover:text-blue-700 transition"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
