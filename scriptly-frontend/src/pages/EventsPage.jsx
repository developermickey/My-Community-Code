import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// Reuse LoadingSpinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <p className="ml-4 text-xl text-gray-600">Loading events...</p>
  </div>
);

const API_URL = "http://localhost:5000/api";

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);

  // New state for sorting
  const [sortBy, setSortBy] = useState("dateAsc"); // 'dateAsc', 'dateDesc', 'nameAsc', 'nameDesc'
  // New state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(6); // Number of events per page

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/events`);
        setEvents(response.data); // Store raw events, sorting/filtering will be on this
        // No need to set filteredEvents here immediately, useEffect below handles it
      } catch (err) {
        console.error("Error fetching events:", err);
        toast.error("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Effect to filter AND sort events based on searchTerm and sortBy
  useEffect(() => {
    let results = events;

    // 1. Filter based on searchTerm
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      results = events.filter(
        (event) =>
          event.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          event.location.toLowerCase().includes(lowerCaseSearchTerm) ||
          event.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          (event.chapter?.name &&
            event.chapter.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (event.organizer?.name &&
            event.organizer.name.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    // 2. Sort the filtered results
    const sortedResults = [...results].sort((a, b) => {
      if (sortBy === "dateAsc") {
        return new Date(a.date) - new Date(b.date);
      } else if (sortBy === "dateDesc") {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === "nameAsc") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "nameDesc") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    setFilteredEvents(sortedResults);
    setCurrentPage(1); // Reset to first page when filters/sort change
  }, [searchTerm, sortBy, events]); // Re-filter and sort when these states change

  // Pagination Logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

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
              ? "bg-purple-600 text-white"
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
          <span className="text-purple-600">Upcoming</span> Events
        </h1>

        {/* Filters and Search Bar */}
        <div className="mb-10 flex flex-col md:flex-row justify-center items-center gap-6">
          <div className="relative w-full md:w-1/2 max-w-2xl">
            <input
              type="text"
              placeholder="Search events by title, location, chapter, or organizer..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 text-lg transition-all duration-200"
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
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="dateAsc">Date: Soonest First</option>
              <option value="dateDesc">Date: Latest First</option>
              <option value="nameAsc">Name: A-Z</option>
              <option value="nameDesc">Name: Z-A</option>
            </select>
          </div>
        </div>

        {currentEvents.length === 0 && searchTerm !== "" ? (
          <p className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-md">
            😔 No events found matching your search. Try a different keyword!
          </p>
        ) : currentEvents.length === 0 ? (
          <p className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-md">
            ✨ No events scheduled yet. Check back soon for exciting updates!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden transform hover:scale-105 transition-all duration-300 flex flex-col"
              >
                <div className="p-6 flex-grow">
                  <h2 className="text-2xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {event.name}
                  </h2>
                  <div className="text-gray-600 text-sm space-y-1">
                    <p className="flex items-center">
                      <span className="text-purple-500 mr-2">📅</span>
                      {new Date(event.date).toLocaleDateString()} at{" "}
                      {new Date(event.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="flex items-center">
                      <span className="text-purple-500 mr-2">📍</span>
                      {event.location}
                    </p>
                    {event.chapter && (
                      <p className="flex items-center">
                        <span className="text-purple-500 mr-2">🏘️</span>
                        Chapter: {event.chapter.name}
                      </p>
                    )}
                    {event.organizer && (
                      <p className="flex items-center">
                        <span className="text-purple-500 mr-2">🗣️</span>
                        Organizer: {event.organizer.name}
                      </p>
                    )}
                  </div>
                  <p className="text-gray-700 mt-5 line-clamp-3 text-base leading-relaxed">
                    {event.description}
                  </p>
                </div>
                <div className="p-6 pt-0">
                  <Link
                    to={`/events/${event._id}`}
                    className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                  >
                    View Details
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

export default EventsPage;
