import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // To get token and user info
import { toast } from "react-toastify"; // Import toast

// Simple Loading Spinner Component (You can reuse from DashboardPage or create a dedicated one)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <p className="ml-3 text-lg text-gray-600">Loading...</p>
  </div>
);

const API_URL = "http://localhost:5000/api"; // Base API URL

function EventCreatePage() {
  const { user, token } = useAuth(); // Get logged-in user and token
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [chapterId, setChapterId] = useState(""); // For selecting the chapter
  const [chapters, setChapters] = useState([]); // List of chapters for dropdown

  const [loading, setLoading] = useState(false); // For form submission loading
  const [chaptersLoading, setChaptersLoading] = useState(true); // For initial chapters fetch loading
  // Removed: const [error, setError] = useState(""); // Replaced by toast
  // Removed: const [successMessage, setSuccessMessage] = useState(""); // Replaced by toast

  // Fetch chapters for the dropdown
  useEffect(() => {
    const fetchChapters = async () => {
      setChaptersLoading(true);
      try {
        const response = await axios.get(`${API_URL}/chapters`);
        setChapters(response.data);

        // If user is a chapter lead, pre-select their chapter
        if (user && user.role === "chapter-lead" && user.chapter) {
          setChapterId(user.chapter);
        } else if (response.data.length > 0 && !chapterId) {
          // Only set default if no chapterId is already set
          // Otherwise, set the first chapter as default if available
          setChapterId(response.data[0]._id);
        }
      } catch (err) {
        console.error("Error fetching chapters:", err);
        toast.error("Failed to load chapters for selection."); // Using toast for error
      } finally {
        setChaptersLoading(false);
      }
    };
    fetchChapters();
  }, [user, chapterId]); // Re-run if user changes or chapterId is explicitly cleared

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Removed: setError(""); setSuccessMessage(""); // Replaced by toast

    // Client-side validation: Check for empty fields
    if (
      !name.trim() ||
      !description.trim() ||
      !date.trim() ||
      !location.trim() ||
      !chapterId
    ) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const eventData = {
        name,
        description,
        date,
        location,
        chapterId,
      };

      const response = await axios.post(`${API_URL}/events`, eventData, {
        headers: {
          Authorization: `Bearer ${token}`, // Send the user's token
        },
      });

      toast.success(
        `Event "${response.data.event.name}" created successfully!`
      );
      // Clear form after successful creation
      setName("");
      setDescription("");
      setDate("");
      setLocation("");
      // Keep chapter selected if they might create another for the same chapter
      // setChapterId(''); // Uncomment if you want chapter to reset as well

      setTimeout(() => {
        navigate(`/events/${response.data.event._id}`); // Redirect to the new event's detail page
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      console.error(
        "Error creating event:",
        err.response?.data?.message || err.message
      );
      toast.error(
        err.response?.data?.message ||
          "Failed to create event. Check console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  if (chaptersLoading) {
    return <LoadingSpinner />; // Show loading spinner while chapters are fetched
  }

  // Disable button if loading or chapter lead not assigned to chapter
  const isFormDisabled =
    loading || (user?.role === "chapter-lead" && !user?.chapter);

  return (
    <div className="py-10 bg-gray-50 min-h-[calc(100vh-140px)] flex justify-center items-start">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          <span className="text-purple-600">Create</span> New Event
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              <span className="mr-2">📝</span>Event Name:
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Tech Meetup"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              <span className="mr-2">📚</span>Description:
            </label>
            <textarea
              id="description"
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the event..."
              required
              disabled={loading}
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="date"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                <span className="mr-2">⏰</span>Date & Time:
              </label>
              <input
                type="datetime-local" // HTML5 input type for date and time
                id="date"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                <span className="mr-2">📍</span>Location:
              </label>
              <input
                type="text"
                id="location"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Online (Zoom), Community Hall"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="chapter"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              <span className="mr-2">🏘️</span>Chapter:
            </label>
            <select
              id="chapter"
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              required
              disabled={
                isFormDisabled ||
                (user?.role === "chapter-lead" && user?.chapter)
              } // Disable if CL has fixed chapter
            >
              {user?.role === "chapter-lead" && user?.chapter ? (
                <option value={user.chapter}>{user.chapter.name}</option>
              ) : (
                <>
                  <option value="">-- Select Chapter --</option>
                  {chapters.map((chap) => (
                    <option key={chap._id} value={chap._id}>
                      {chap.name}
                    </option>
                  ))}
                </>
              )}
            </select>
            {user?.role === "chapter-lead" && !user?.chapter && (
              <p className="text-sm text-red-500 mt-2">
                Chapter Lead must be assigned to a chapter to create events.
                Please contact an Admin.
              </p>
            )}
          </div>

          <div className="flex items-center justify-center pt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors duration-200 inline-flex items-center"
              disabled={isFormDisabled} // Disable if loading or conditions met
            >
              {loading && (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
              )}
              {loading ? "Creating Event..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventCreatePage;
