import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

// Corrected: LoadingSpinner component definition added here
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <p className="ml-4 text-xl text-gray-600">Loading tutorials...</p>
  </div>
);

const API_URL = "http://localhost:5000/api";

function AdminTutorialsPage() {
  const { token, user } = useAuth(); // Need 'user' to check role for permissions in UI
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  // State for Category Management
  const [categories, setCategories] = useState([]); // List of categories
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null); // For editing existing category
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categorySaving, setCategorySaving] = useState(false); // For category form submission loading

  useEffect(() => {
    fetchTutorials();
    fetchCategories(); // Fetch categories for display and dropdowns
  }, [filterStatus]);

  const fetchTutorials = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }
      const response = await axios.get(`${API_URL}/tutorials`, {
        headers: { Authorization: `Bearer ${token}` },
        params: params,
      });
      const sortedTutorials = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTutorials(sortedTutorials);
    } catch (err) {
      console.error(
        "Error fetching tutorials for admin:",
        err.response?.data?.message || err.message
      );
      toast.error("Failed to load tutorials. Are you logged in as an Admin?");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/tutorials/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to load categories for display.");
    }
  };

  // --- Category Modal Handlers ---
  const handleOpenCreateCategoryModal = () => {
    setIsCategoryModalOpen(true);
    setIsEditingCategory(false);
    setCurrentCategory(null);
    setCategoryName("");
    setCategoryDescription("");
  };

  const handleOpenEditCategoryModal = (category) => {
    setIsCategoryModalOpen(true);
    setIsEditingCategory(true);
    setCurrentCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setIsEditingCategory(false);
    setCurrentCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategorySaving(false); // Reset saving state
  };

  const handleCreateUpdateCategory = async (e) => {
    e.preventDefault();
    setCategorySaving(true);
    if (!categoryName.trim()) {
      toast.error("Category name cannot be empty.");
      setCategorySaving(false);
      return;
    }
    try {
      const categoryData = {
        name: categoryName,
        description: categoryDescription,
      };
      if (isEditingCategory && currentCategory) {
        await axios.put(
          `${API_URL}/tutorials/categories/${currentCategory._id}`,
          categoryData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success(`Category "${categoryName}" updated successfully!`);
      } else {
        await axios.post(`${API_URL}/tutorials/categories`, categoryData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`Category "${categoryName}" created successfully!`);
      }
      handleCloseCategoryModal();
      fetchCategories(); // Re-fetch categories to update list
    } catch (err) {
      console.error(
        "Error creating/updating category:",
        err.response?.data?.message || err.message
      );
      toast.error(err.response?.data?.message || "Failed to save category.");
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete category "${name}"? This cannot be undone if tutorials are linked.`
      )
    ) {
      return;
    }
    setCategorySaving(true); // Use this for action loading feedback too
    try {
      await axios.delete(`${API_URL}/tutorials/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Category "${name}" deleted successfully!`);
      fetchCategories(); // Re-fetch categories
    } catch (err) {
      console.error(
        "Error deleting category:",
        err.response?.data?.message || err.message
      );
      toast.error(err.response?.data?.message || "Failed to delete category.");
    } finally {
      setCategorySaving(false);
    }
  };
  // --- End Category Modal Handlers ---

  const handleChangeStatus = async (tutorialId, newStatus, tutorialTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to ${newStatus} tutorial "${tutorialTitle}"?`
      )
    ) {
      return;
    }
    setLoading(true); // Indicate action is happening
    try {
      await axios.put(
        `${API_URL}/tutorials/${tutorialId}/${newStatus}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Tutorial "${tutorialTitle}" ${newStatus} successfully!`);
      fetchTutorials(); // Re-fetch to update list
    } catch (err) {
      console.error(
        `Error changing tutorial status to ${newStatus}:`,
        err.response?.data?.message || err.message
      );
      toast.error(
        `Failed to ${newStatus} tutorial. ${err.response?.data?.message || ""}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTutorial = async (tutorialId, tutorialTitle) => {
    if (
      window.confirm(
        `Are you sure you want to delete tutorial "${tutorialTitle}"? This action cannot be undone.`
      )
    ) {
      setLoading(true); // Indicate action is happening
      try {
        await axios.delete(`${API_URL}/tutorials/${tutorialId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`Tutorial "${tutorialTitle}" deleted successfully!`);
        fetchTutorials(); // Re-fetch to update list
      } catch (err) {
        console.error(
          "Error deleting tutorial:",
          err.response?.data?.message || err.message
        );
        toast.error(
          `Failed to delete tutorial. ${err.response?.data?.message || ""}`
        );
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !tutorials.length && !categories.length) {
    // Initial loading check
    return <LoadingSpinner />;
  }

  return (
    <div className="py-10 bg-gray-50 min-h-[calc(100vh-140px)]">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
          Admin:{" "}
          <span className="text-blue-600">Tutorial & Category Management</span>
        </h1>

        {/* Category Management Section */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-10 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-green-500 mr-2">🏷️</span> Category Management
          </h2>
          <div className="mb-6 text-right">
            <button
              onClick={handleOpenCreateCategoryModal}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md"
            >
              Create New Category
            </button>
          </div>

          {categories.length === 0 ? (
            <p className="text-center text-lg text-gray-600 p-4">
              No categories created yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-gray-50">
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap capitalize">
                          {cat.name}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-normal line-clamp-2">
                          {cat.description || "N/A"}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenEditCategoryModal(cat)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                            disabled={categorySaving}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCategory(cat._id, cat.name)
                            }
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                            disabled={categorySaving}
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
        </section>

        {/* Tutorial Management Section */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-blue-500 mr-2">📚</span> Tutorial Management
          </h2>
          {/* Action Buttons & Filters */}
          <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <Link
              to="/tutorials/create"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              <span className="mr-2">➕</span> Create New Tutorial
            </Link>

            <div className="flex items-center gap-3">
              <label
                htmlFor="statusFilter"
                className="text-gray-700 font-semibold"
              >
                Filter by Status:
              </label>
              <select
                id="statusFilter"
                className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={loading}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Tutorials Table */}
          {tutorials.length === 0 ? (
            <p className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-md">
              No tutorials found for the selected filter.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tutorials.map((tutorial) => (
                    <tr key={tutorial._id} className="hover:bg-gray-50">
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {tutorial.title}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {tutorial.author?.name || "N/A"}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {tutorial.category?.name
                            ? tutorial.category.name.charAt(0).toUpperCase() +
                              tutorial.category.name.slice(1)
                            : "N/A"}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <span
                          className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${
                            tutorial.status === "approved"
                              ? "bg-green-200 text-green-900"
                              : tutorial.status === "pending"
                              ? "bg-yellow-200 text-yellow-900"
                              : "bg-red-200 text-red-900"
                          }`}
                        >
                          {tutorial.status.charAt(0).toUpperCase() +
                            tutorial.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/tutorials/${tutorial._id}/edit`}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                            disabled={loading}
                          >
                            Edit
                          </Link>
                          {tutorial.status !== "approved" && (
                            <button
                              onClick={() =>
                                handleChangeStatus(
                                  tutorial._id,
                                  "approve",
                                  tutorial.title
                                )
                              }
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
                              disabled={loading}
                            >
                              Approve
                            </button>
                          )}
                          {tutorial.status !== "rejected" && (
                            <button
                              onClick={() =>
                                handleChangeStatus(
                                  tutorial._id,
                                  "reject",
                                  tutorial.title
                                )
                              }
                              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-1 px-2 rounded text-xs"
                              disabled={loading}
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteTutorial(tutorial._id, tutorial.title)
                            }
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                            disabled={loading}
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
        </section>

        {/* Create/Edit Category Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-4">
                {isEditingCategory
                  ? `Edit Category: ${currentCategory?.name}`
                  : "Create New Category"}
              </h2>
              <form onSubmit={handleCreateUpdateCategory} className="space-y-4">
                <div>
                  <label
                    htmlFor="categoryName"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Name:
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                    disabled={categorySaving}
                  />
                </div>
                <div>
                  <label
                    htmlFor="categoryDescription"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Description (Optional):
                  </label>
                  <textarea
                    id="categoryDescription"
                    className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="3"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    disabled={categorySaving}
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCloseCategoryModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    disabled={categorySaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                    disabled={categorySaving}
                  >
                    {categorySaving && (
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    )}
                    {categorySaving ? "Saving..." : "Save Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminTutorialsPage;
