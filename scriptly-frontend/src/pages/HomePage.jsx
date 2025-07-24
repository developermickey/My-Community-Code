import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // Import toast for errors

// Reuse the LoadingSpinner from other pages or define it here if not shared
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <p className="ml-4 text-xl text-gray-600">Loading content...</p>
  </div>
);

const API_URL = "http://localhost:5000/api";

function HomePage() {
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentChapters, setRecentChapters] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(true);

  // Fetch a limited number of recent events
  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        const response = await axios.get(`${API_URL}/events`);
        // Sort by date to get upcoming, then take top 3
        const sortedEvents = response.data.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setRecentEvents(sortedEvents.slice(0, 3)); // Get top 3 upcoming events
      } catch (err) {
        console.error("Error fetching recent events:", err);
        toast.error("Failed to load recent events.");
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchRecentEvents();
  }, []);

  // Fetch a limited number of chapters (e.g., the first 3)
  useEffect(() => {
    const fetchRecentChapters = async () => {
      try {
        const response = await axios.get(`${API_URL}/chapters`);
        setRecentChapters(response.data.slice(0, 3)); // Get first 3 chapters
      } catch (err) {
        console.error("Error fetching recent chapters:", err);
        toast.error("Failed to load recent chapters.");
      } finally {
        setLoadingChapters(false);
      }
    };
    fetchRecentChapters();
  }, []);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-140px)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4 text-center overflow-hidden">
        {/* Background blobs/shapes for visual interest */}
        <div className="absolute inset-0 z-0 opacity-20">
          <svg
            className="h-full w-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,192L80,186.7C160,181,320,171,480,181.3C640,192,800,224,960,218.7C1120,213,1280,171,1360,150.7L1440,128L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
            ></path>
          </svg>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Ignite Your Coding Journey with{" "}
            <span className="block md:inline text-yellow-300">
              Scriptly Community
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Connect with passionate developers, discover engaging events, find
            your local chapter, and build the future, one line of code at a
            time.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full shadow-lg text-blue-700 bg-white hover:bg-gray-100 transform hover:scale-105 transition-all duration-300"
          >
            Join Our Community
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 ml-3"
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
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* About Us Section */}
        <section className="mb-16 bg-white p-8 md:p-12 rounded-xl shadow-xl border border-gray-200">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Who is <span className="text-blue-600">Scriptly</span>?
            </h2>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
              Scriptly is a vibrant and inclusive community dedicated to
              fostering learning and collaboration among aspiring and
              experienced developers. We believe in the power of shared
              knowledge and collective growth to drive innovation in the tech
              world.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 bg-white font-semibold rounded-lg shadow-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
            >
              Learn More About Us
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Link>
          </div>
        </section>

        {/* Featured Events Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Upcoming <span className="text-purple-600">Events</span>
          </h2>
          {loadingEvents ? (
            <LoadingSpinner />
          ) : recentEvents.length === 0 ? (
            <p className="text-center text-lg text-gray-600 p-8 bg-white rounded-lg shadow-md">
              No upcoming events to display. Check back soon!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden transform hover:scale-105 transition-all duration-300 flex flex-col"
                >
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                      {event.name}
                    </h3>
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
          <div className="text-center mt-10">
            <Link
              to="/events"
              className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-bold rounded-lg shadow-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
            >
              View All Events
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </section>

        {/* Featured Chapters Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Explore Our <span className="text-teal-600">Chapters</span>
          </h2>
          {loadingChapters ? (
            <LoadingSpinner />
          ) : recentChapters.length === 0 ? (
            <p className="text-center text-lg text-gray-600 p-8 bg-white rounded-lg shadow-md">
              No chapters available yet. Be the first to start one!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentChapters.map((chapter) => (
                <div
                  key={chapter._id}
                  className="bg-white rounded-xl shadow-lg border border-teal-100 overflow-hidden transform hover:scale-105 transition-all duration-300 flex flex-col"
                >
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                      {chapter.name}
                    </h3>
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
          <div className="text-center mt-10">
            <Link
              to="/chapters"
              className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-bold rounded-lg shadow-md text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-200"
            >
              View All Chapters
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </section>

        {/* Call to Action (Join Our Community) Section */}
        <section className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-12 rounded-xl shadow-xl text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Ready to Code the Future?
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Join our vibrant community.{" "}
            <span className="font-bold block md:inline">
              "Scripters build the future!"
            </span>
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-xl font-bold rounded-full shadow-lg text-orange-700 bg-white hover:bg-gray-100 transform hover:scale-105 transition-all duration-300"
          >
            Become a Scripter!
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 ml-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </Link>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
