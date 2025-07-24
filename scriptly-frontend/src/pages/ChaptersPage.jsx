import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// Reuse LoadingSpinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <p className="ml-4 text-xl text-gray-600">Loading chapters...</p>
  </div>
);

const API_URL = "http://localhost:5000/api";

function ChaptersPage() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChapters, setFilteredChapters] = useState([]);

  // New state for sorting
  const [sortBy, setSortBy] = useState("nameAsc"); // 'nameAsc', 'nameDesc', 'dateAsc', 'dateDesc' (date of creation)
  // New state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [chaptersPerPage] = useState(6); // Number of chapters per page

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/chapters`);
        setChapters(response.data);
      } catch (err) {
        console.error("Error fetching chapters:", err);
        toast.error("Failed to load chapters. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  // Effect to filter AND sort chapters based on searchTerm and sortBy
  useEffect(() => {
    let results = chapters;

    // 1. Filter based on searchTerm
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      results = chapters.filter(
        (chapter) =>
          chapter.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          (chapter.description &&
            chapter.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (chapter.chapterLead?.name &&
            chapter.chapterLead.name
              .toLowerCase()
              .includes(lowerCaseSearchTerm)) ||
          (chapter.chapterLead?.email &&
            chapter.chapterLead.email
              .toLowerCase()
              .includes(lowerCaseSearchTerm))
      );
    }

    // 2. Sort the filtered results
    const sortedResults = [...results].sort((a, b) => {
      if (sortBy === "nameAsc") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "nameDesc") {
        return b.name.localeCompare(a.name);
      } else if (sortBy === "dateAsc") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "dateDesc") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    setFilteredChapters(sortedResults);
    setCurrentPage(1); // Reset to first page when filters/sort change
  }, [searchTerm, sortBy, chapters]);

  // Pagination Logic
  const indexOfLastChapter = currentPage * chaptersPerPage;
  const indexOfFirstChapter = indexOfLastChapter - chaptersPerPage;
  const currentChapters = filteredChapters.slice(
    indexOfFirstChapter,
    indexOfLastChapter
  );

  const totalPages = Math.ceil(filteredChapters.length / chaptersPerPage);

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
              ? "bg-teal-600 text-white"
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
          <span className="text-teal-600">Our</span> Chapters
        </h1>

        {/* Filters and Search Bar */}
        <div className="mb-10 flex flex-col md:flex-row justify-center items-center gap-6">
          <div className="relative w-full md:w-1/2 max-w-2xl">
            <input
              type="text"
              placeholder="Search chapters by name, description, or lead..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-lg transition-all duration-200"
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
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="nameAsc">Name: A-Z</option>
              <option value="nameDesc">Name: Z-A</option>
              <option value="dateAsc">Date Created: Oldest First</option>
              <option value="dateDesc">Date Created: Newest First</option>
            </select>
          </div>
        </div>

        {currentChapters.length === 0 && searchTerm !== "" ? (
          <p className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-md">
            😔 No chapters found matching your search. Try a different keyword!
          </p>
        ) : currentChapters.length === 0 ? (
          <p className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-md">
            ✨ No chapters created yet. Be the first to start one!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentChapters.map((chapter) => (
              <div
                key={chapter._id}
                className="bg-white rounded-xl shadow-lg border border-teal-100 overflow-hidden transform hover:scale-105 transition-all duration-300 flex flex-col"
              >
                <div className="p-6 flex-grow">
                  <h2 className="text-2xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {chapter.name}
                  </h2>
                  {chapter.chapterLead ? (
                    <p className="text-gray-600 text-sm mt-2 flex items-center">
                      <span className="text-teal-500 mr-2">👑</span>Lead:{" "}
                      {chapter.chapterLead.name}
                    </p>
                  ) : (
                    <p className="text-gray-600 text-sm mt-2 flex items-center">
                      <span className="text-teal-500 mr-2">🤷</span>Lead: Not
                      assigned
                    </p>
                  )}
                  <p className="text-gray-700 mt-5 line-clamp-3 text-base leading-relaxed">
                    {chapter.description || "No description available."}
                  </p>
                </div>
                <div className="p-6 pt-0">
                  <Link
                    to={`/chapters/${chapter._id}`}
                    className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-200"
                  >
                    View Chapter
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

export default ChaptersPage;
