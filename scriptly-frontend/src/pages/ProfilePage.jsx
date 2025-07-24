import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify"; // Import toast

// FIX: Define API_URL here or import it from a central config file
const API_URL = "http://localhost:5000/api";

// Simple Loading Spinner Component (You can make this a shared component)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <p className="ml-4 text-xl text-gray-600">Loading profile data...</p>
  </div>
);

function ProfilePage() {
  const { user, loading, token, fetchUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [chapters, setChapters] = useState([]);
  const [editedName, setEditedName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Fetch chapters for the dropdown
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await axios.get(`${API_URL}/chapters`); // Uses API_URL
        setChapters(response.data);
      } catch (err) {
        console.error("Error fetching chapters:", err);
        toast.error("Failed to load chapters for profile."); // Using toast for error
      }
    };

    fetchChapters();
  }, []);

  // Initialize editedName and selectedChapterId when user data loads or changes
  useEffect(() => {
    if (user) {
      setSelectedChapterId(user.chapter?._id || "");
      setEditedName(user.name);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);

    if (!user) {
      toast.error("User data not available. Please log in.");
      setProfileSaving(false);
      return;
    }
    if (!editedName.trim()) {
      toast.error("Name cannot be empty.");
      setProfileSaving(false);
      return;
    }

    const updateData = {
      name: editedName,
      chapterId: selectedChapterId === "" ? null : selectedChapterId,
    };

    try {
      await axios.put(`${API_URL}/users/${user._id}/role`, updateData, {
        // Uses API_URL
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Profile updated successfully!");
      await fetchUser();
      setIsEditing(false);
    } catch (err) {
      console.error(
        "Error updating profile:",
        err.response?.data?.message || err.message
      );
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Show loading indicator if user data is still being fetched
  if (loading) {
    return <LoadingSpinner />;
  }

  // Fallback if user is not available (should be handled by PrivateRoute normally)
  if (!user) {
    return (
      <div className="py-10 text-center">
        <p className="text-xl text-red-600">
          User not logged in or profile not found.
        </p>
      </div>
    );
  }

  return (
    <div className="py-10 bg-gray-50 min-h-[calc(100vh-140px)]">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          <span className="text-blue-600">Your</span> Profile
        </h1>

        <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
          {!isEditing ? (
            // View Mode Display
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <span className="text-4xl text-blue-500">👤</span>{" "}
                {/* User icon */}
                <div>
                  <p className="font-semibold text-gray-700 text-lg">Name:</p>
                  <p className="text-gray-900 text-xl font-medium capitalize">
                    {user.name}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="font-semibold text-gray-700">Email:</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Role:</p>
                  <p className="text-gray-900 capitalize">{user.role}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Chapter:</p>
                  <p className="text-gray-900">
                    {user.chapter ? user.chapter.name : "Not assigned"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Vouches:</p>
                  <p className="text-gray-900">{user.vouchCount}</p>
                </div>
                <div className="md:col-span-2">
                  {" "}
                  {/* Span two columns */}
                  <p className="font-semibold text-gray-700">Member Since:</p>
                  <p className="text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode Form
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  <span className="mr-2">📝</span>Name:
                </label>
                <input
                  type="text"
                  id="name"
                  className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  required
                  disabled={profileSaving} // Disable input while saving
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  <span className="mr-2">📧</span>Email:
                </label>
                <input
                  type="email"
                  id="email"
                  className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                  value={user.email}
                  disabled // Email is not directly editable by user
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contact an admin to change your email.
                </p>
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  <span className="mr-2">🔑</span>Role:
                </label>
                <input
                  type="text"
                  id="role"
                  className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 capitalize"
                  value={user.role}
                  disabled // Role is not directly editable by user
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contact an admin to change your role.
                </p>
              </div>
              {/* Chapter Selection - only enabled for students (based on backend logic) */}
              <div>
                <label
                  htmlFor="chapter"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  <span className="mr-2">📍</span>Chapter:
                </label>
                <select
                  id="chapter"
                  className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  disabled={
                    profileSaving || // Disable while saving
                    user.role === "chapter-lead" || // Disable for Chapter Leads
                    user.role === "admin" // Disable for Admins
                  }
                >
                  <option value="">-- No Chapter / Select One --</option>
                  {chapters.map((chapter) => (
                    <option key={chapter._id} value={chapter._id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
                {(user.role === "chapter-lead" || user.role === "admin") && (
                  <p className="text-xs text-gray-500 mt-1">
                    Your chapter can only be managed by an Admin.
                  </p>
                )}
              </div>
              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false); // Exit editing mode
                    // Revert values on cancel
                    setEditedName(user.name);
                    setSelectedChapterId(user.chapter?._id || "");
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-lg transition-colors duration-200"
                  disabled={profileSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition-colors duration-200"
                  disabled={profileSaving}
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* Edit Profile & Change Password Buttons (visible only in view mode) */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-6.044 9.445a1.5 1.5 0 00-.432-.387L6 12.387V11h-.5a1.5 1.5 0 00-1.5 1.5V14h.5a1.5 1.5 0 001.5 1.5H7.5V14h.5a1.5 1.5 0 001.5-1.5V11h-1.5z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Edit Profile
                </button>
                <Link
                  to="/change-password"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2h2a2 2 0 012 2v5a2 2 0 01-2 2H3a2 2 0 01-2-2v-5a2 2 0 012-2h2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Change Password
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
