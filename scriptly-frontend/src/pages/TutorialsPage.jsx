import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// Reuse LoadingSpinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <p className="ml-4 text-xl text-gray-600">Loading tutorials...</p>
  </div>
);

const API_URL = "http://localhost:5000/api";

function TutorialsPage() {
  const [tutorials, setTutorials] = useState([]);
  const [filteredTutorials, setFilteredTutorials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // New state for sorting
  const [sortBy, setSortBy] = useState("dateDesc"); // 'dateDesc', 'dateAsc', 'titleAsc', 'titleDesc'
  // New state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [tutorialsPerPage] = useState(6); // Number of tutorials per page

  useEffect(() => {
    const fetchTutorialsAndCategories = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const categoriesRes = await axios.get(
          `${API_URL}/tutorials/categories`
        );
        setCategories(categoriesRes.data);

        // Fetch tutorials (public endpoint only shows approved by default)
        const tutorialsRes = await axios.get(`${API_URL}/tutorials`);
        setTutorials(tutorialsRes.data); // Store raw tutorials
      } catch (err) {
        console.error("Error fetching tutorials or categories:", err);
        toast.error(
          "Failed to load tutorials or categories. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTutorialsAndCategories();
  }, []);

  // Effect for filtering, searching, and sorting
  useEffect(() => {
    let results = tutorials;

    // 1. Filter by category
    if (currentCategory) {
      results = results.filter(
        (tutorial) => tutorial.category._id === currentCategory
      );
    }

    // 2. Filter by search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      results = results.filter(
        (tutorial) =>
          tutorial.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          tutorial.content.toLowerCase().includes(lowerCaseSearchTerm) ||
          tutorial.author.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          tutorial.category.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          tutorial.keywords.some((keyword) =>
            keyword.toLowerCase().includes(lowerCaseSearchTerm)
          )
      );
    }

    // 3. Sort the filtered results
    const sortedResults = [...results].sort((a, b) => {
      if (sortBy === "dateDesc") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "dateAsc") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "titleAsc") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "titleDesc") {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    setFilteredTutorials(sortedResults);
    setCurrentPage(1); // Reset to first page when filters/sort change
  }, [currentCategory, searchTerm, sortBy, tutorials]);

  // Pagination Logic
  const indexOfLastTutorial = currentPage * tutorialsPerPage;
  const indexOfFirstTutorial = indexOfLastTutorial - tutorialsPerPage;
  const currentTutorials = filteredTutorials.slice(
    indexOfFirstTutorial,
    indexOfLastTutorial
  );

  const totalPages = Math.ceil(filteredTutorials.length / tutorialsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`mx-1 px-3 py-1 rounded-lg font-semibold ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="py-10 bg-gray-50 min-h-[calc(100vh-140px)]">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
          Explore Our <span className="text-blue-600">Tutorials</span>
        </h1>

        {/* Filters and Search Bar */}
        <div className="mb-10 flex flex-col md:flex-row justify-center items-center gap-6">
          <div className="relative w-full md:w-1/2 max-w-lg">
            <input
              type="text"
              placeholder="Search tutorials..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="w-full md:w-1/3 max-w-xs">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={currentCategory}
              onChange={(e) => setCurrentCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name.charAt(0).toUpperCase() +
                    category.name.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-1/3 max-w-xs">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="dateDesc">Date: Newest First</option>
              <option value="dateAsc">Date: Oldest First</option>
              <option value="titleAsc">Title: A-Z</option>
              <option value="titleDesc">Title: Z-A</option>
            </select>
          </div>
        </div>

        {/* Tutorials List */}
        {currentTutorials.length === 0 &&
        (searchTerm !== "" || currentCategory !== "") ? (
          <p className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-md">
            😔 No tutorials found matching your filters.
          </p>
        ) : currentTutorials.length === 0 ? (
          <p className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-md">
            ✨ No tutorials available yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentTutorials.map((tutorial) => (
              <div
                key={tutorial._id}
                className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden transform hover:scale-105 transition-all duration-300 flex flex-col"
              >
                <div className="p-6 flex-grow">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold mb-3">
                    {tutorial.category?.name
                      ? tutorial.category.name.charAt(0).toUpperCase() +
                        tutorial.category.name.slice(1)
                      : "Uncategorized"}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {tutorial.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    By {tutorial.author?.name || "Unknown Author"} | Published:{" "}
                    {new Date(tutorial.createdAt).toLocaleDateString()}
                  </p>
                  <div className="text-gray-700 text-base leading-relaxed line-clamp-4">
                    {/* Display a snippet of content - be careful with raw HTML if content stores it */}
                    {/* The editor outputs HTML, so dangerouslySetInnerHTML is needed here */}
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          tutorial.content.substring(0, 150) +
                          (tutorial.content.length > 150 ? "..." : ""),
                      }}
                    />
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Link
                    to={`/tutorials/${tutorial._id}`}
                    className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    Read Tutorial
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10 space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TutorialsPage;
