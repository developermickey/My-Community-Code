// scriptly-frontend/src/pages/AdminUsersPage.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // To get token for authenticated requests

const API_URL = "http://localhost:5000/api"; // Base API URL

function AdminUsersPage() {
  const { token, user: currentUser } = useAuth(); // Get token and current logged-in user details
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // State for modal/editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [chapters, setChapters] = useState([]); // To populate chapter dropdown

  useEffect(() => {
    fetchUsers();
    fetchChaptersForDropdown(); // Fetch chapters to populate dropdown
  }, []); // Run once on component mount

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send token for protected admin route
        },
      });
      setUsers(response.data);
    } catch (err) {
      console.error(
        "Error fetching users for admin:",
        err.response?.data?.message || err.message
      );
      setError("Failed to load users. Are you logged in as an Admin?");
    } finally {
      setLoading(false);
    }
  };

  const fetchChaptersForDropdown = async () => {
    try {
      const response = await axios.get(`${API_URL}/chapters`); // Chapters are public to read
      setChapters(response.data);
    } catch (err) {
      console.error("Error fetching chapters for dropdown:", err);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setSelectedChapter(user.chapter?._id || ""); // Set current chapter or empty string
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true); // Indicate overall loading
    setSuccessMessage("");
    setError("");

    if (!editingUser) return;

    try {
      const updateData = {
        role: selectedRole,
        chapterId: selectedChapter === "" ? null : selectedChapter, // Send null if unassigned
      };

      // Ensure admin cannot demote themselves
      if (currentUser._id === editingUser._id && selectedRole !== "admin") {
        setError("You cannot demote yourself from Admin role.");
        setLoading(false);
        return;
      }

      await axios.put(`${API_URL}/users/${editingUser._id}/role`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage("User updated successfully!");
      setIsEditModalOpen(false);
      fetchUsers(); // Re-fetch users to update the list
    } catch (err) {
      console.error(
        "Error updating user:",
        err.response?.data?.message || err.message
      );
      setError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  const handleVouchUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to vouch for ${userName}?`)) {
      setLoading(true); // Indicate overall loading
      setSuccessMessage("");
      setError("");
      try {
        await axios.post(
          `${API_URL}/users/${userId}/vouch`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`, // Admin token for universal vouch
            },
          }
        );
        setSuccessMessage(`Successfully vouched for ${userName}!`);
        fetchUsers(); // Re-fetch users to update vouch count
      } catch (err) {
        console.error(
          "Error vouching user:",
          err.response?.data?.message || err.message
        );
        setError(err.response?.data?.message || "Failed to vouch for user.");
      } finally {
        setLoading(false);
      }
    }
  };

  // TODO: Implement Delete User if you add a backend endpoint for it.
  // const handleDeleteUser = async (userId, userName) => {
  //   if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
  //     setLoading(true);
  //     setSuccessMessage('');
  //     setError('');
  //     try {
  //       // Add a DELETE /api/users/:id endpoint in backend
  //       // await axios.delete(`${API_URL}/users/${userId}`, {
  //       //   headers: { Authorization: `Bearer ${token}` }
  //       // });
  //       setSuccessMessage(`${userName} deleted successfully.`);
  //       fetchUsers();
  //     } catch (err) {
  //       console.error('Error deleting user:', err.response?.data?.message || err.message);
  //       setError(err.response?.data?.message || 'Failed to delete user.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };

  if (loading && !users.length) {
    // Only show full loading if no data yet
    return (
      <div className="py-10 flex justify-center items-center">
        <p className="text-xl text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Admin: User Management
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

      {users.length === 0 ? (
        <p className="text-center text-lg text-gray-600">No users found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Chapter
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vouches
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap capitalize">
                      {user.name}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {user.email}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap capitalize">
                      {user.role}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {user.chapter ? user.chapter.name : "N/A"}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {user.vouchCount}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex space-x-2">
                      {/* Prevent Admin from editing or vouching for themselves for simplicity/safety */}
                      {currentUser._id !== user._id && (
                        <>
                          <button
                            onClick={() => handleEditClick(user)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleVouchUser(user._id, user.name)}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
                          >
                            Vouch
                          </button>
                          {/* Uncomment when backend DELETE /api/users/:id is added */}
                          {/* <button
                                    onClick={() => handleDeleteUser(user._id, user.name)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                                >
                                    Delete
                                </button> */}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">
              Edit User: {editingUser.name}
            </h2>
            <form onSubmit={handleUpdateUser}>
              <div className="mb-4">
                <label
                  htmlFor="editRole"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Role:
                </label>
                <select
                  id="editRole"
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  disabled={loading}
                >
                  <option value="student">Student</option>
                  <option value="chapter-lead">Chapter Lead</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="editChapter"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Chapter:
                </label>
                <select
                  id="editChapter"
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  disabled={loading}
                >
                  <option value="">-- No Chapter / Unassign --</option>
                  {chapters.map((chapter) => (
                    <option key={chapter._id} value={chapter._id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;
