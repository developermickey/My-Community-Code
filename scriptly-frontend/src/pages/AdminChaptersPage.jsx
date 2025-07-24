// scriptly-frontend/src/pages/AdminChaptersPage.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // To get token

const API_URL = "http://localhost:5000/api"; // Base API URL

function AdminChaptersPage() {
  const { token } = useAuth(); // Get token for authenticated requests
  const [chapters, setChapters] = useState([]);
  const [users, setUsers] = useState([]); // For chapter lead dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // State for Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(null); // For editing existing chapter
  const [chapterName, setChapterName] = useState("");
  const [chapterDescription, setChapterDescription] = useState("");
  const [chapterLeadId, setChapterLeadId] = useState(""); // Selected chapter lead for creation/update

  useEffect(() => {
    fetchChapters();
    fetchUsersForLeads(); // Fetch users to select as chapter leads
  }, []);

  const fetchChapters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/chapters`);
      setChapters(response.data);
    } catch (err) {
      console.error(
        "Error fetching chapters for admin:",
        err.response?.data?.message || err.message
      );
      setError("Failed to load chapters. Are you logged in as an Admin?");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersForLeads = async () => {
    try {
      // Fetch all users, but filter for chapter-lead role on the client-side for now
      // A more robust solution might involve a backend endpoint to fetch users by role
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter users who are chapter-leads or students (potential leads) and not already assigned to a chapter
      const potentialLeads = response.data.filter(
        (user) =>
          (user.role === "chapter-lead" || user.role === "student") &&
          !user.chapter
      );
      setUsers(response.data); // Keep all users for potential re-assignment via AdminUsersPage
    } catch (err) {
      console.error("Error fetching users for leads dropdown:", err);
    }
  };

  const handleOpenCreateModal = () => {
    setIsModalOpen(true);
    setIsEditing(false);
    setCurrentChapter(null);
    setChapterName("");
    setChapterDescription("");
    setChapterLeadId("");
    fetchUsersForLeads(); // Refresh potential leads
  };

  const handleOpenEditModal = (chapter) => {
    setIsModalOpen(true);
    setIsEditing(true);
    setCurrentChapter(chapter);
    setChapterName(chapter.name);
    setChapterDescription(chapter.description || "");
    setChapterLeadId(chapter.chapterLead?._id || ""); // Pre-select current lead
    fetchUsersForLeads(); // Refresh potential leads
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentChapter(null);
    setChapterName("");
    setChapterDescription("");
    setChapterLeadId("");
    setError("");
    setSuccessMessage("");
  };

  const handleCreateUpdateChapter = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setError("");

    const chapterData = {
      name: chapterName,
      description: chapterDescription,
      chapterLeadId: chapterLeadId || null, // Send null if no lead selected
    };

    try {
      if (isEditing && currentChapter) {
        // Update Chapter
        await axios.put(
          `${API_URL}/chapters/${currentChapter._id}`,
          chapterData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccessMessage("Chapter updated successfully!");
      } else {
        // Create Chapter
        await axios.post(`${API_URL}/chapters`, chapterData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage("Chapter created successfully!");
      }
      handleCloseModal();
      fetchChapters(); // Re-fetch chapters to update the list
      fetchUsersForLeads(); // Re-fetch users to update lead availability
    } catch (err) {
      console.error(
        "Error creating/updating chapter:",
        err.response?.data?.message || err.message
      );
      setError(err.response?.data?.message || "Failed to save chapter.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async (chapterId, chapterName) => {
    if (
      window.confirm(
        `Are you sure you want to delete chapter "${chapterName}"? This will also unassign users and delete associated events.`
      )
    ) {
      setLoading(true);
      setSuccessMessage("");
      setError("");
      try {
        await axios.delete(`${API_URL}/chapters/${chapterId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage(`Chapter "${chapterName}" deleted successfully.`);
        fetchChapters(); // Re-fetch chapters
        fetchUsersForLeads(); // Re-fetch users to update lead availability
      } catch (err) {
        console.error(
          "Error deleting chapter:",
          err.response?.data?.message || err.message
        );
        setError(err.response?.data?.message || "Failed to delete chapter.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter users that are currently Chapter Leads (to exclude from "potential leads" dropdown)
  // Or rather, we need to show users not currently assigned to ANY chapter as potential leads
  const unassignedChapterLeadsAndStudents = users.filter(
    (user) =>
      (user.role === "chapter-lead" || user.role === "student") &&
      (!user.chapter ||
        (isEditing &&
          currentChapter &&
          user.chapter._id === currentChapter._id)) // Include current lead for editing
  );

  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Admin: Chapter Management
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

      <div className="mb-6 text-right">
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md"
        >
          Create New Chapter
        </button>
      </div>

      {loading && !chapters.length ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-xl text-gray-600">Loading chapters...</p>
        </div>
      ) : chapters.length === 0 ? (
        <p className="text-center text-lg text-gray-600">
          No chapters found yet. Click "Create New Chapter" to add one.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Chapter Lead
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((chapter) => (
                <tr key={chapter._id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {chapter.name}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-normal line-clamp-2 max-w-xs">
                      {chapter.description || "N/A"}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {chapter.chapterLead
                        ? `${chapter.chapterLead.name} (${chapter.chapterLead.email})`
                        : "Unassigned"}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(chapter)}
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteChapter(chapter._id, chapter.name)
                        }
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Chapter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">
              {isEditing
                ? `Edit Chapter: ${currentChapter?.name}`
                : "Create New Chapter"}
            </h2>
            {(successMessage || error) && ( // Show messages within modal if operation affects modal context
              <div
                className={`px-4 py-3 rounded relative mb-4 ${
                  successMessage
                    ? "bg-green-100 border-green-400 text-green-700"
                    : "bg-red-100 border-red-400 text-red-700"
                }`}
                role="alert"
              >
                <span className="block sm:inline">
                  {successMessage || error}
                </span>
              </div>
            )}
            <form onSubmit={handleCreateUpdateChapter}>
              <div className="mb-4">
                <label
                  htmlFor="chapterName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Chapter Name:
                </label>
                <input
                  type="text"
                  id="chapterName"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  placeholder="e.g., Silicon Valley Chapter"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="chapterDescription"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Description:
                </label>
                <textarea
                  id="chapterDescription"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  value={chapterDescription}
                  onChange={(e) => setChapterDescription(e.target.value)}
                  placeholder="A brief description of the chapter."
                  disabled={loading}
                ></textarea>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="chapterLead"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Assign Chapter Lead:
                </label>
                <select
                  id="chapterLead"
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={chapterLeadId}
                  onChange={(e) => setChapterLeadId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">-- Select Chapter Lead / Unassign --</option>
                  {unassignedChapterLeadsAndStudents.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email}) - {user.role}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Only users who are students or chapter leads and currently
                  unassigned to a chapter will appear here.
                </p>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                  {loading ? "Saving..." : "Save Chapter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminChaptersPage;
