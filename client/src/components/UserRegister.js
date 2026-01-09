import React, { useState } from "react";

import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import { API_BASE_URL as URL } from "../utils/api.js";

function calculatePasswordStrength(password) {
  if(!password) return 0;

  let score = 0;

  if(password.length >= 6) score += 1;
  if(password.length >= 11) score += 1;
  if(password.length >= 16) score += 1;

  // has uppercase
  if(/[A-Z]/.test(password)) score += 1;

  // has lowercase
  if(/[a-z]/.test(password)) score += 1;

  // has number
  if(/[0-9]/.test(password)) score += 1;

  // has special character
  if(/[^A-Za-z0-9]/.test(password)) score += 1;

  if(score <= 1) return { strength : "Weak", score};
  if(score <= 3) return { strength : "Medium", score};
  return { strength : "Strong", score};
}

export default function UserRegister() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: "", score: 0 });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      password: value,
    }));

    const strengthInfo = calculatePasswordStrength(value);
    setPasswordStrength(strengthInfo);
  };

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      confirmPassword: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Check username
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 5) {
      newErrors.username = "Username must be at least 5 characters";
    } else if (formData.username.length > 20) {
      newErrors.username = "Username must be less than 20 characters";
    } else if (!/^[a-zA-Z0-9_!?]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and _, ! and ? characters";
    }

    if (formData.email.trim().length === 0) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (formData.password.length === 0) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.confirmPassword.length === 0) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Stop if validation failed
    }

    setLoading(true);

    try {
      const response = await fetch(`${URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Registration failed");
        return;
      }

      toast.success("Account created! Redirecting to login...");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email Field */}
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
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
            {formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && !errors.email && (
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                ✓ Valid email
              </p>
            )}
          </div>

          {/* Password Field */}
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
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
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
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.strength === "Weak"
                        ? "w-1/3 bg-red-500"
                        : passwordStrength.strength === "Medium"
                        ? "w-2/3 bg-yellow-500"
                        : "w-full bg-green-500"
                    }`}
                  />
                </div>
                <p
                  className={`text-xs mt-2 font-semibold ${
                    passwordStrength.strength === "Weak"
                      ? "text-red-600"
                      : passwordStrength.strength === "Medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  Password Strength: {passwordStrength.strength}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Confirm your password"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
            {formData.confirmPassword && formData.confirmPassword === formData.password && !errors.confirmPassword && (
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                ✓ Passwords match
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg font-medium text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 active:bg-green-700"
            }`}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-500 font-medium hover:text-green-700 transition"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
