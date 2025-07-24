import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = "http://localhost:5000/api";

// Simple Loading Spinner Component (You can replace with a more complex one)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <p className="ml-4 text-xl text-gray-600">Loading dashboard data...</p>
  </div>
);

function DashboardPage() {
  const { user, loading, isAuthenticated, token, fetchUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false); // For role-specific data fetching

  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [registeredEventsLoading, setRegisteredEventsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !user) {
        setDataLoading(false); // Ensure loading is off if not authenticated/no user
        return;
      }

      setDataLoading(true);

      try {
        let data = {};
        if (user.role === "student") {
          // Check if user.chapter exists before trying to access its _id
          if (user.chapter) {
            const chapterRes = await axios.get(
              `${API_URL}/chapters/${user.chapter._id}` // FIX: Access ._id here
            );
            data.chapterMembers = chapterRes.data.members;
          } else {
            data.chapterMembers = []; // No chapter assigned, no members
          }
        } else if (user.role === "chapter-lead") {
          // Check if user.chapter exists before trying to access its _id
          if (user.chapter) {
            const chapterRes = await axios.get(
              `${API_URL}/chapters/${user.chapter._id}` // FIX: Access ._id here
            );
            data.chapterMembers = chapterRes.data.members;
          } else {
            data.chapterMembers = []; // No chapter assigned, no members
          }

          // Fetch all events, then client-side filter for organized events
          const allEventsRes = await axios.get(`${API_URL}/events`);
          // Ensure event.organizer is an object with _id
          data.organizedEvents = allEventsRes.data.filter(
            (event) => event.organizer && event.organizer._id === user._id
          );
        } else if (user.role === "admin") {
          // Admin calls require the token
          const usersRes = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const chaptersRes = await axios.get(`${API_URL}/chapters`); // Public route
          const eventsRes = await axios.get(`${API_URL}/events`); // Public route

          data.totalUsers = usersRes.data.length;
          data.totalChapters = chaptersRes.data.length;
          data.totalEvents = eventsRes.data.length;
        }
        setDashboardData(data);
      } catch (err) {
        console.error(
          "Error fetching dashboard data:",
          err.response?.data?.message || err.message
        );
        toast.error("Failed to load dashboard data."); // Using toast for error
      } finally {
        setDataLoading(false);
      }
    };

    // This useEffect hook runs when `user`, `isAuthenticated`, or `token` changes.
    // It's important to have user and token available before making API calls.
    // The `loading` state from AuthContext ensures initial user data is ready.
    if (!loading) {
      // Only attempt to fetch if initial auth loading is complete
      fetchDashboardData();
    }
  }, [user, isAuthenticated, token, loading]); // Add `loading` to dependency array

  useEffect(() => {
    const fetchStudentRegisteredEvents = async () => {
      if (user && user.role === "student" && isAuthenticated) {
        setRegisteredEventsLoading(true);
        try {
          const response = await axios.get(
            `${API_URL}/users/${user._id}/registered-events`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const sorted = response.data.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
          setRegisteredEvents(sorted);
        } catch (err) {
          console.error(
            "Error fetching student registered events:",
            err.response?.data?.message || err.message
          );
          toast.error("Failed to load your registered events."); // Using toast for error
        } finally {
          setRegisteredEventsLoading(false);
        }
      } else if (user && user.role !== "student") {
        setRegisteredEventsLoading(false); // Not a student, so no registered events to load
      }
    };

    if (!loading) {
      // Only attempt to fetch if initial auth loading is complete
      fetchStudentRegisteredEvents();
    }
  }, [user, isAuthenticated, token, loading]); // Add `loading` to dependency array

  const handleVouchUser = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to vouch for ${memberName}?`)) {
      return;
    }

    setDataLoading(true); // Indicate action loading
    try {
      await axios.post(
        `${API_URL}/users/${memberId}/vouch`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Successfully vouched for ${memberName}!`);
      // Re-fetch chapter members to update vouch count
      // FIX: Access user.chapter._id here
      const chapterRes = await axios.get(
        `${API_URL}/chapters/${user.chapter._id}`
      );
      setDashboardData((prevData) => ({
        ...prevData,
        chapterMembers: chapterRes.data.members,
      }));
      fetchUser(); // To ensure user's vouching status is updated if relevant
    } catch (err) {
      console.error(
        "Error vouching user:",
        err.response?.data?.message || err.message
      );
      toast.error(err.response?.data?.message || "Failed to vouch for user.");
    } finally {
      setDataLoading(false);
    }
  };

  // Centralized loading state check
  // `loading` is from AuthContext and ensures initial user data is fetched.
  // `dataLoading` is for role-specific dashboard data.
  // `registeredEventsLoading` is for student-specific events.
  if (loading || dataLoading || registeredEventsLoading) {
    return <LoadingSpinner />;
  }

  // Handle case where user is not logged in (should be caught by PrivateRoute, but good for explicit feedback)
  if (!user) {
    return (
      <div className="py-10 text-center">
        <p className="text-xl text-red-600">
          Please log in to view your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="py-10 bg-gray-50 min-h-[calc(100vh-140px)]">
      {" "}
      {/* Adjusted min-height for footer */}
      {/* Welcome Section (Hero-like) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 md:p-12 rounded-xl shadow-lg mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
          Welcome, <span className="capitalize">{user.name}!</span>
        </h1>
        <p className="text-lg md:text-xl opacity-90">
          This is your personalized{" "}
          <span className="font-semibold capitalize">{user.role}</span>{" "}
          Dashboard.
        </p>
        <div className="mt-6">
          <Link
            to="/profile"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-blue-700 bg-white hover:bg-gray-100 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            View Full Profile
          </Link>
        </div>
      </div>
      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4">
        {/* Admin Overview */}
        {user.role === "admin" && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-blue-500 mr-2">📊</span> Admin Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-5 bg-blue-50 rounded-lg shadow-sm border border-blue-200 transform hover:scale-105 transition-transform duration-200">
                <p className="text-lg font-medium text-blue-700">Total Users</p>
                <p className="text-4xl font-extrabold text-blue-600 mt-2">
                  {dashboardData?.totalUsers}
                </p>
              </div>
              <div className="p-5 bg-green-50 rounded-lg shadow-sm border border-green-200 transform hover:scale-105 transition-transform duration-200">
                <p className="text-lg font-medium text-green-700">
                  Total Chapters
                </p>
                <p className="text-4xl font-extrabold text-green-600 mt-2">
                  {dashboardData?.totalChapters}
                </p>
              </div>
              <div className="p-5 bg-purple-50 rounded-lg shadow-sm border border-purple-200 transform hover:scale-105 transition-transform duration-200">
                <p className="text-lg font-medium text-purple-700">
                  Total Events
                </p>
                <p className="text-4xl font-extrabold text-purple-600 mt-2">
                  {dashboardData?.totalEvents}
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-center flex-wrap gap-4">
              <Link
                to="/admin/users"
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
              >
                <span className="mr-2">🧑‍💻</span> Manage Users
              </Link>
              <Link
                to="/admin/chapters"
                className="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
              >
                <span className="mr-2">🏘️</span> Manage Chapters
              </Link>
              <Link
                to="/admin/events"
                className="inline-flex items-center px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
              >
                <span className="mr-2">🗓️</span> Manage Events
              </Link>
            </div>
          </section>
        )}

        {/* Chapter Lead Overview */}
        {user.role === "chapter-lead" && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-indigo-500 mr-2">👑</span> Chapter Lead
              Overview
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              You are the lead of:{" "}
              <span className="font-bold text-indigo-600">
                {user.chapter ? user.chapter.name : "No Chapter Assigned"}
              </span>
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-purple-500 mr-2">📅</span> Your Organized
              Events ({dashboardData?.organizedEvents?.length || 0})
            </h3>
            {dashboardData?.organizedEvents &&
            dashboardData.organizedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.organizedEvents.map((event) => (
                  <div
                    key={event._id}
                    className="p-4 bg-purple-50 rounded-lg shadow-sm border border-purple-200 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-bold text-lg text-purple-800">
                      {event.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                    <Link
                      to={`/events/${event._id}`}
                      className="text-blue-500 hover:underline text-sm mt-2 inline-block"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No events organized yet.</p>
            )}

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4 flex items-center">
              <span className="text-green-500 mr-2">👥</span> Members in Your
              Chapter ({dashboardData?.chapterMembers?.length || 0})
            </h3>
            {dashboardData?.chapterMembers &&
            dashboardData.chapterMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.chapterMembers.map((member) => (
                  <div
                    key={member._id}
                    className="p-4 bg-green-50 rounded-lg shadow-sm border border-green-200 flex justify-between items-center hover:shadow-md transition-shadow"
                  >
                    <div>
                      <h4 className="font-bold text-lg capitalize text-green-800">
                        {member.name}
                      </h4>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-sm text-gray-600">
                        Vouches: {member.vouchCount}
                      </p>
                      {member.vouchCount >= 3 && (
                        <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full mt-2 font-semibold">
                          ⭐ Highlighted Member
                        </span>
                      )}
                    </div>
                    {user._id !== member._id && (
                      <button
                        onClick={() => handleVouchUser(member._id, member.name)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-sm transition-colors duration-200"
                        disabled={dataLoading}
                      >
                        Vouch
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No members in your chapter yet.</p>
            )}

            <div className="mt-8 flex justify-center flex-wrap gap-4">
              <Link
                to="/events/create"
                className="inline-flex items-center px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
              >
                <span className="mr-2">➕</span> Create New Event
              </Link>
              <Link
                to="/chapter-lead/events"
                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
              >
                <span className="mr-2">📝</span> Manage Your Events
              </Link>
            </div>
          </section>
        )}

        {/* Student Overview */}
        {user.role === "student" && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-blue-500 mr-2">📚</span> Student Overview
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Your Chapter:{" "}
              <span className="font-bold text-blue-600">
                {user.chapter ? user.chapter.name : "No Chapter Assigned"}
              </span>
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4 flex items-center">
              <span className="text-purple-500 mr-2">🎟️</span> Your Registered
              Events ({registeredEvents.length})
            </h3>
            {registeredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {registeredEvents.map((event) => (
                  <div
                    key={event._id}
                    className="p-4 bg-purple-50 rounded-lg shadow-sm border border-purple-200 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-bold text-lg text-purple-800">
                      {event.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Location: {event.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      Chapter: {event.chapter?.name || "N/A"}
                    </p>
                    <Link
                      to={`/events/${event._id}`}
                      className="text-blue-500 hover:underline text-sm mt-2 block"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                You are not registered for any events yet. Check out the{" "}
                <Link
                  to="/events"
                  className="text-blue-500 hover:underline font-medium"
                >
                  Events page
                </Link>
                !
              </p>
            )}

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4 flex items-center">
              <span className="text-teal-500 mr-2">🤝</span> Members in Your
              Chapter ({dashboardData?.chapterMembers?.length || 0})
            </h3>
            {dashboardData?.chapterMembers &&
            dashboardData.chapterMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.chapterMembers.map((member) => (
                  <div
                    key={member._id}
                    className="p-4 bg-blue-50 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-bold text-lg capitalize text-blue-800">
                      {member.name}
                    </h4>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <p className="text-sm text-gray-600">
                      Vouches: {member.vouchCount}
                    </p>
                    {member.vouchCount >= 3 && (
                      <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full mt-2 font-semibold">
                        ⭐ Highlighted Member
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No members in your chapter yet.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
