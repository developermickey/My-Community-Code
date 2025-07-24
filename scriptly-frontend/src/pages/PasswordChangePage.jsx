// scriptly-frontend/src/pages/PasswordChangePage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // To get user ID and token

const API_URL = "http://localhost:5000/api";

function PasswordChangePage() {
  const { user, token, logout } = useAuth(); // Get user (for ID), token, and logout function
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      // Client-side check, matches backend
      setError("New password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      await axios.put(
        `${API_URL}/users/${user._id}/password`, // Use logged-in user's ID
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the user's token
          },
        }
      );

      setSuccessMessage(
        "Password updated successfully! You will be logged out to re-login with your new password."
      );
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      // Automatically log out user after a short delay for security
      setTimeout(() => {
        logout(); // Log out from context
        navigate("/login"); // Redirect to login page
      }, 3000); // Wait 3 seconds to show success message
    } catch (err) {
      console.error(
        "Password change error:",
        err.response?.data?.message || err.message
      );
      setError(
        err.response?.data?.message ||
          "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    // Should be caught by PrivateRoute, but good fallback
    return (
      <div className="py-10 text-center">
        <p className="text-xl text-red-600">User not logged in.</p>
      </div>
    );
  }

  return (
    <div className="py-10 flex justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Change Password
        </h1>

        {successMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="oldPassword"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Current Password:
            </label>
            <input
              type="password"
              id="oldPassword"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              New Password:
            </label>
            <input
              type="password"
              id="newPassword"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="confirmNewPassword"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Confirm New Password:
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PasswordChangePage;
