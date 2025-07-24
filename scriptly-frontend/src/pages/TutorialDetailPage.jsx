// scriptly-frontend/src/pages/TutorialDetailPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext"; // To check user role and ID for authorization

// Simple Loading Spinner Component (reuse if available in shared component)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <p className="ml-4 text-xl text-gray-600">Loading tutorial...</p>
  </div>
);

const API_URL = "http://localhost:5000/api";

function TutorialDetailPage() {
  const { id } = useParams(); // Current tutorial ID from URL
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); // Get logged-in user info

  const [tutorial, setTutorial] = useState(null);
  const [allTutorials, setAllTutorials] = useState([]); // To populate the sidebar
  const [categories, setCategories] = useState([]); // For sidebar categories
  const [loading, setLoading] = useState(true); // Overall loading for page
  const [accessDenied, setAccessDenied] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({}); // State for sidebar collapse/expand

  // Fetch current tutorial, all tutorials for sidebar, and categories
  useEffect(() => {
    const fetchTutorialData = async () => {
      if (authLoading) return; // Wait for auth context to load user data

      setLoading(true);
      setAccessDenied(false);

      try {
        // 1. Fetch the specific tutorial details
        const tutorialRes = await axios.get(`${API_URL}/tutorials/${id}`, {
          headers: user
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {},
        });
        setTutorial(tutorialRes.data);

        // 2. Fetch ALL tutorials for the sidebar (only approved for non-admins)
        // Admin can fetch all statuses for the sidebar, others only approved
        const allTutorialsParams = {};
        if (!user || user.role !== "admin") {
          // If not admin, only get approved for sidebar
          allTutorialsParams.status = "approved";
        }
        const allTutorialsRes = await axios.get(`${API_URL}/tutorials`, {
          params: allTutorialsParams,
          headers: user
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}, // Send token for better authorization handling
        });
        const sortedAllTutorials = allTutorialsRes.data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        ); // Sort by creation date for consistent order
        setAllTutorials(sortedAllTutorials);

        // 3. Fetch all categories for the sidebar
        const categoriesRes = await axios.get(
          `${API_URL}/tutorials/categories`
        );
        setCategories(categoriesRes.data);

        // Auto-expand the current tutorial's category
        if (tutorialRes.data.category) {
          setExpandedCategories((prev) => ({
            ...prev,
            [tutorialRes.data.category._id]: true,
          }));
        }
      } catch (err) {
        console.error("Error fetching tutorial data:", err);
        if (err.response?.status === 403) {
          setAccessDenied(true);
          toast.error("You are not authorized to view this tutorial.");
        } else if (err.response?.status === 404) {
          toast.error("Tutorial not found.");
          navigate("/tutorials"); // Redirect to list if not found
        } else {
          toast.error("Failed to load tutorial. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      // Only fetch if an ID is present
      fetchTutorialData();
    }
  }, [id, user, authLoading, navigate]); // Re-fetch if ID, user, or auth loading changes

  // Group tutorials by category for sidebar rendering
  const tutorialsByCategory = allTutorials.reduce((acc, tutorialItem) => {
    const categoryName = tutorialItem.category?.name || "Uncategorized";
    const categoryId = tutorialItem.category?._id || "uncategorized";
    if (!acc[categoryId]) {
      acc[categoryId] = { name: categoryName, id: categoryId, tutorials: [] };
    }
    acc[categoryId].tutorials.push(tutorialItem);
    return acc;
  }, {});

  // Convert to array and sort categories alphabetically
  const sortedCategories = Object.values(tutorialsByCategory).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Toggle sidebar category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  if (accessDenied) {
    return (
      <div className="py-10 text-center bg-white p-8 rounded-lg shadow-md border border-red-200">
        <h2 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-lg text-gray-700">
          You do not have permission to view this tutorial. It might be pending
          review or rejected, and only the author or an Admin can view it.
        </p>
        <Link
          to="/tutorials"
          className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md"
        >
          Back to Tutorials
        </Link>
      </div>
    );
  }

  if (!tutorial) {
    // Fallback if tutorial data is unexpectedly empty after loading
    return (
      <div className="py-10 text-center">
        <p className="text-xl text-gray-600">Tutorial data not available.</p>
        <Link
          to="/tutorials"
          className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md"
        >
          Back to Tutorials
        </Link>
      </div>
    );
  }

  // Determine breadcrumbs
  const breadcrumbs = [
    { name: "Tutorials", path: "/tutorials" },
    {
      name: tutorial.category?.name || "Uncategorized",
      path: `/tutorials?category=${tutorial.category?._id || ""}`,
    },
    { name: tutorial.title, path: `/tutorials/${tutorial._id}` },
  ];

  return (
    <div className="py-10 bg-gray-50 min-h-[calc(100vh-140px)]">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-1/4 bg-white rounded-lg shadow-xl border border-gray-200 p-6 lg:sticky lg:top-8 self-start">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-blue-500 mr-2">📚</span> All Topics
          </h2>
          <nav className="space-y-2">
            {sortedCategories.map((cat) => (
              <div
                key={cat.id}
                className="border-b border-gray-100 pb-2 last:border-b-0"
              >
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="flex justify-between items-center w-full py-2 px-3 text-lg font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                >
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                  <span>
                    {expandedCategories[cat.id] ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                </button>
                {expandedCategories[cat.id] && (
                  <ul className="pl-4 mt-2 space-y-1">
                    {cat.tutorials.map((item) => (
                      <li key={item._id}>
                        <Link
                          to={`/tutorials/${item._id}`}
                          className={`block py-1 px-3 text-md rounded-lg transition-colors duration-150 ${
                            item._id === tutorial._id
                              ? "bg-blue-100 text-blue-800 font-semibold"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
          {/* Back to all tutorials link */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center">
            <Link
              to="/tutorials"
              className="inline-block text-blue-600 hover:underline text-sm font-semibold"
            >
              <span className="mr-1">&larr;</span> Back to All Tutorials List
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <article className="w-full lg:w-3/4 bg-white p-8 rounded-lg shadow-xl border border-blue-100">
          {/* Breadcrumbs */}
          <nav className="text-sm text-gray-600 mb-6">
            {breadcrumbs.map((crumb, index) => (
              <span key={index}>
                {index > 0 && <span className="mx-2">/</span>}
                {index < breadcrumbs.length - 1 ? (
                  <Link
                    to={crumb.path}
                    className="hover:underline text-blue-600"
                  >
                    {crumb.name}
                  </Link>
                ) : (
                  <span className="font-semibold text-gray-800">
                    {crumb.name}
                  </span>
                )}
              </span>
            ))}
          </nav>

          {/* Tutorial Header */}
          <div className="mb-8 pb-4 border-b border-gray-200">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-4 py-1 rounded-full font-semibold mb-3">
              {tutorial.category?.name
                ? tutorial.category.name.charAt(0).toUpperCase() +
                  tutorial.category.name.slice(1)
                : "Uncategorized"}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-3 leading-tight">
              {tutorial.title}
            </h1>
            <p className="text-md text-gray-600">
              By{" "}
              <span className="font-semibold">
                {tutorial.author?.name || "Unknown Author"}
              </span>{" "}
              | Published: {new Date(tutorial.createdAt).toLocaleDateString()}
              {tutorial.status === "pending" &&
                user &&
                (user._id === tutorial.author._id || user.role === "admin") && (
                  <span className="ml-3 text-yellow-600 font-semibold">
                    {" "}
                    (Pending Review)
                  </span>
                )}
              {tutorial.status === "rejected" &&
                user &&
                (user._id === tutorial.author._id || user.role === "admin") && (
                  <span className="ml-3 text-red-600 font-semibold">
                    {" "}
                    (Rejected)
                  </span>
                )}
            </p>
          </div>

          {/* Tutorial Content - Render HTML directly */}
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-8">
            <div dangerouslySetInnerHTML={{ __html: tutorial.content }} />
          </div>

          {/* Tags/Keywords (if available) */}
          {tutorial.keywords && tutorial.keywords.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <span className="font-semibold text-gray-700 mr-2">
                Keywords:
              </span>
              {tutorial.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mr-2 mb-2"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons for author/admin */}
          {user &&
            (user._id === tutorial.author._id.toString() ||
              user.role === "admin") && (
              <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap justify-center gap-4">
                <Link
                  to={`/tutorials/${tutorial._id}/edit`}
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
                  Edit Tutorial
                </Link>
                {user.role === "admin" && tutorial.status === "pending" && (
                  <button
                    onClick={() =>
                      toast.success("Approve tutorial logic here")
                    } /* Replace with actual approve call */
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                  >
                    <span className="mr-2">✔️</span> Approve
                  </button>
                )}
                {user.role === "admin" && tutorial.status === "pending" && (
                  <button
                    onClick={() =>
                      toast.error("Reject tutorial logic here")
                    } /* Replace with actual reject call */
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                  >
                    <span className="mr-2">❌</span> Reject
                  </button>
                )}
              </div>
            )}
        </article>
      </div>
    </div>
  );
}

export default TutorialDetailPage;
