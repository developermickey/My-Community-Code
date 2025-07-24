// scriptly-frontend/src/pages/AdminEventsPage.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // To get token

const API_URL = "http://localhost:5000/api"; // Base API URL

function AdminEventsPage() {
  const { token, user } = useAuth(); // Get token and current user to identify chapter lead organizer
  const [events, setEvents] = useState([]);
  const [chapters, setChapters] = useState([]); // For chapter dropdown in form
  const [organizers, setOrganizers] = useState([]); // For organizer dropdown in form (Chapter Leads/Admins)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // State for Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null); // For editing existing event
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventChapterId, setEventChapterId] = useState("");
  const [eventOrganizerId, setEventOrganizerId] = useState(""); // Admin can assign organizer

  useEffect(() => {
    fetchEvents();
    fetchChaptersAndOrganizers(); // Fetch data for dropdowns
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/events`);
      // Sort events by date, upcoming first
      const sortedEvents = response.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setEvents(sortedEvents);
    } catch (err) {
      console.error(
        "Error fetching events for admin:",
        err.response?.data?.message || err.message
      );
      setError("Failed to load events. Are you logged in as an Admin?");
    } finally {
      setLoading(false);
    }
  };

  const fetchChaptersAndOrganizers = async () => {
    try {
      const chaptersRes = await axios.get(`${API_URL}/chapters`);
      setChapters(chaptersRes.data);

      const usersRes = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Admins can be organizers, or chapter leads.
      const potentialOrganizers = usersRes.data.filter(
        (u) => u.role === "admin" || u.role === "chapter-lead"
      );
      setOrganizers(potentialOrganizers);
    } catch (err) {
      console.error("Error fetching chapters/organizers for dropdowns:", err);
    }
  };

  const handleOpenCreateModal = () => {
    setIsModalOpen(true);
    setIsEditing(false);
    setCurrentEvent(null);
    setEventName("");
    setEventDescription("");
    setEventDate("");
    setEventLocation("");
    setEventChapterId(""); // Reset for new creation
    setEventOrganizerId(""); // Reset for new creation
    // Optionally pre-select current admin as organizer if no other selected
    if (user.role === "admin") {
      setEventOrganizerId(user._id);
    }
  };

  const handleOpenEditModal = (event) => {
    setIsModalOpen(true);
    setIsEditing(true);
    setCurrentEvent(event);
    setEventName(event.name);
    setEventDescription(event.description);
    // Format date for datetime-local input
    setEventDate(new Date(event.date).toISOString().slice(0, 16));
    setEventLocation(event.location);
    setEventChapterId(event.chapter?._id || "");
    setEventOrganizerId(event.organizer?._id || "");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentEvent(null);
    setEventName("");
    setEventDescription("");
    setEventDate("");
    setEventLocation("");
    setEventChapterId("");
    setEventOrganizerId("");
    setError("");
    setSuccessMessage("");
  };

  const handleCreateUpdateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setError("");

    if (
      !eventName ||
      !eventDescription ||
      !eventDate ||
      !eventLocation ||
      !eventChapterId ||
      !eventOrganizerId
    ) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const eventData = {
        name: eventName,
        description: eventDescription,
        date: eventDate, // ISO string is fine for backend
        location: eventLocation,
        chapterId: eventChapterId,
        organizer: eventOrganizerId, // Admin can explicitly set organizer
      };

      if (isEditing && currentEvent) {
        // Update Event
        await axios.put(`${API_URL}/events/${currentEvent._id}`, eventData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage("Event updated successfully!");
      } else {
        // Create Event
        await axios.post(`${API_URL}/events`, eventData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage("Event created successfully!");
      }
      handleCloseModal();
      fetchEvents(); // Re-fetch events to update the list
    } catch (err) {
      console.error(
        "Error creating/updating event:",
        err.response?.data?.message || err.message
      );
      setError(err.response?.data?.message || "Failed to save event.");
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
        fetchEvents(); // Re-fetch events
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

  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Admin: Event Management
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
          Create New Event
        </button>
      </div>

      {loading && !events.length ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-xl text-gray-600">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <p className="text-center text-lg text-gray-600">
          No events found yet. Click "Create New Event" to add one.
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
                  Organizer
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
                      {event.organizer ? event.organizer.name : "N/A"}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(event)}
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id, event.name)}
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

      {/* Create/Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">
              {isEditing
                ? `Edit Event: ${currentEvent?.name}`
                : "Create New Event"}
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
            <form onSubmit={handleCreateUpdateEvent}>
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
                  onChange={(e) => setEventDescription(e.target.value)}
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
              <div className="mb-4">
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
                  disabled={loading}
                >
                  <option value="">-- Select Chapter --</option>
                  {chapters.map((chapter) => (
                    <option key={chapter._id} value={chapter._id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="eventOrganizer"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Organizer:
                </label>
                <select
                  id="eventOrganizer"
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={eventOrganizerId}
                  onChange={(e) => setEventOrganizerId(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">-- Select Organizer --</option>
                  {organizers.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name} ({org.role})
                    </option>
                  ))}
                </select>
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
                  {loading ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEventsPage;
