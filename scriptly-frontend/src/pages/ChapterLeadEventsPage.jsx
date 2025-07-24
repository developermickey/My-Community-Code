// scriptly-frontend/src/pages/ChapterLeadEventsPage.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // To get token and user info (organizer ID)
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api"; // Base API URL

function ChapterLeadEventsPage() {
  const { user, token } = useAuth(); // Get logged-in user and token
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [chapters, setChapters] = useState([]); // For chapter dropdown in edit form
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // State for Edit Event Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null); // For editing existing event
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventChapterId, setEventChapterId] = useState(""); // Chapter for the event

  useEffect(() => {
    if (user && user._id) {
      // Ensure user is available before fetching
      fetchOrganizedEvents();
      fetchChaptersForDropdown();
    }
  }, [user]); // Re-fetch when user object changes (e.g., on login)

  const fetchOrganizedEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all events, then filter by organizer on client-side
      // Ideally, backend should support filtering by organizerId for efficiency
      const response = await axios.get(`${API_URL}/events`);
      const organized = response.data.filter(
        (event) => event.organizer._id === user._id
      );
      const sortedEvents = organized.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setEvents(sortedEvents);
    } catch (err) {
      console.error(
        "Error fetching organized events:",
        err.response?.data?.message || err.message
      );
      setError("Failed to load your organized events.");
    } finally {
      setLoading(false);
    }
  };

  const fetchChaptersForDropdown = async () => {
    try {
      const chaptersRes = await axios.get(`${API_URL}/chapters`);
      setChapters(chaptersRes.data);
    } catch (err) {
      console.error("Error fetching chapters for dropdown:", err);
    }
  };

  const handleOpenEditModal = (event) => {
    setIsEditModalOpen(true);
    setCurrentEvent(event);
    setEventName(event.name);
    setEventDescription(event.description);
    setEventDate(new Date(event.date).toISOString().slice(0, 16)); // Format for datetime-local
    setEventLocation(event.location);
    setEventChapterId(event.chapter?._id || "");
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentEvent(null);
    setEventName("");
    setEventDescription("");
    setEventDate("");
    setEventLocation("");
    setEventChapterId("");
    setError("");
    setSuccessMessage("");
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setLoading(true); // Indicate saving process
    setSuccessMessage("");
    setError("");

    if (
      !eventName ||
      !eventDescription ||
      !eventDate ||
      !eventLocation ||
      !eventChapterId
    ) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const eventData = {
        name: eventName,
        description: eventDescription,
        date: eventDate,
        location: eventLocation,
        chapterId: eventChapterId,
        organizer: user._id, // Organizer remains the current Chapter Lead
      };

      await axios.put(`${API_URL}/events/${currentEvent._id}`, eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("Event updated successfully!");
      handleCloseEditModal();
      fetchOrganizedEvents(); // Re-fetch events to update the list
    } catch (err) {
      console.error(
        "Error updating event:",
        err.response?.data?.message || err.message
      );
      setError(err.response?.data?.message || "Failed to update event.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventName) => {
    if (
      window.confirm(
        `Are you sure you want to delete event "${eventName}"? This action cannot be undone.`
      )
    ) {
      setLoading(true);
      setSuccessMessage("");
      setError("");
      try {
        await axios.delete(`${API_URL}/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage(`Event "${eventName}" deleted successfully.`);
        fetchOrganizedEvents(); // Re-fetch events
      } catch (err) {
        console.error(
          "Error deleting event:",
          err.response?.data?.message || err.message
        );
        setError(err.response?.data?.message || "Failed to delete event.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !events.length) {
    // Only show full loading if no data yet
    return (
      <div className="py-10 flex justify-center items-center">
        <p className="text-xl text-gray-600">Loading your events...</p>
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
        Manage Your Events
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
        <Link
          to="/events/create"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md"
        >
          Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-center text-lg text-gray-600">
          You haven't organized any events yet. Click "Create New Event" to get
          started!
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
                  Date
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Chapter
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Attendees
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {event.name}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 text-xs whitespace-no-wrap">
                      {new Date(event.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {event.location}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {event.chapter ? event.chapter.name : "N/A"}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {event.attendees.length}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(event)}
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded text-xs"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id, event.name)}
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

      {/* Edit Event Modal */}
      {isEditModalOpen && currentEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">
              Edit Event: {currentEvent.name}
            </h2>
            {(successMessage || error) && (
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
            <form onSubmit={handleUpdateEvent}>
              <div className="mb-4">
                <label
                  htmlFor="eventName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Event Name:
                </label>
                <input
                  type="text"
                  id="eventName"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g., Monthly Tech Meetup"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="eventDescription"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Description:
                </label>
                <textarea
                  id="eventDescription"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  value={eventDescription}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of the event."
                  required
                  disabled={loading}
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="eventDate"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Date & Time:
                  </label>
                  <input
                    type="datetime-local"
                    id="eventDate"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="eventLocation"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Location:
                  </label>
                  <input
                    type="text"
                    id="eventLocation"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g., Online (Zoom), Community Hall"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="eventChapter"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Chapter:
                </label>
                <select
                  id="eventChapter"
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={eventChapterId}
                  onChange={(e) => setEventChapterId(e.target.value)}
                  required
                  disabled={
                    loading || (user?.role === "chapter-lead" && user?.chapter)
                  } // Disable if Chapter Lead and has a chapter
                >
                  {user?.role === "chapter-lead" && user?.chapter ? (
                    <option value={user.chapter}>{user.chapter.name}</option>
                  ) : (
                    <>
                      <option value="">-- Select Chapter --</option>
                      {chapters.map((chapter) => (
                        <option key={chapter._id} value={chapter._id}>
                          {chapter.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
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
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChapterLeadEventsPage;
