// scriptly-frontend/src/pages/EventDetailPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // To get authenticated user and token

const API_URL = "http://localhost:5000/api";

function EventDetailPage() {
  const { id } = useParams(); // Get the event ID from the URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationMessage, setRegistrationMessage] = useState("");

  const { user, isAuthenticated, fetchUser } = useAuth(); // Get user and isAuthenticated from context
  const navigate = useNavigate();

  // Helper to check if the current user is an attendee
  const isUserAttending = event?.attendees?.some(
    (attendee) => attendee._id === user?.id
  );

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/events/${id}`);
      setEvent(response.data);
      setError(null);
      setRegistrationMessage(""); // Clear message on re-fetch
    } catch (err) {
      console.error("Error fetching event details:", err);
      if (err.response && err.response.status === 404) {
        setError("Event not found.");
      } else {
        setError("Failed to load event details. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id, user]); // Re-run if ID or user (e.g., after login/logout) changes

  const handleRegistration = async () => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect to login if not authenticated
      return;
    }

    setRegistrationMessage(""); // Clear previous messages
    try {
      if (isUserAttending) {
        await axios.post(`${API_URL}/events/${id}/deregister`);
        setRegistrationMessage("Successfully deregistered!");
      } else {
        await axios.post(`${API_URL}/events/${id}/register`);
        setRegistrationMessage("Successfully registered!");
      }
      // Re-fetch event and user data to update UI
      fetchEventDetails();
      fetchUser(); // To ensure user's profile attendance list is up-to-date (if we add one)
    } catch (err) {
      console.error(
        "Registration error:",
        err.response?.data?.message || err.message
      );
      setError(err.response?.data?.message || "Failed to update registration.");
    }
  };

  if (loading) {
    return (
      <div className="py-10 flex justify-center items-center">
        <p className="text-xl text-gray-600">Loading event details...</p>
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

  if (!event) {
    return (
      <div className="py-10 text-center">
        <p className="text-xl text-gray-600">No event data available.</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">
          {event.name}
        </h1>
        <p className="text-lg text-gray-700 mb-4">{event.description}</p>
        <p className="text-md text-gray-600">
          **Date:** {new Date(event.date).toLocaleDateString()} at{" "}
          {new Date(event.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-md text-gray-600">**Location:** {event.location}</p>
        {event.chapter && (
          <p className="text-md text-gray-600">
            **Chapter:**{" "}
            <Link
              to={`/chapters/${event.chapter._id}`}
              className="text-blue-500 hover:underline"
            >
              {event.chapter.name}
            </Link>
          </p>
        )}
        {event.organizer && (
          <p className="text-md text-gray-600">
            **Organizer:** {event.organizer.name} ({event.organizer.email})
          </p>
        )}

        <div className="mt-6 flex items-center space-x-4">
          <button
            onClick={handleRegistration}
            className={`font-bold py-2 px-4 rounded transition-colors duration-200 ${
              isUserAttending
                ? "bg-red-500 hover:bg-red-700 text-white"
                : "bg-green-500 hover:bg-green-700 text-white"
            }`}
            disabled={!isAuthenticated && !isUserAttending} // Disable if not logged in and not attending
          >
            {isAuthenticated
              ? isUserAttending
                ? "Deregister"
                : "Register"
              : "Login to Register"}
          </button>
          {registrationMessage && (
            <p className="text-sm text-green-700">{registrationMessage}</p>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Attendees ({event.attendees.length})
        </h2>
        {event.attendees.length === 0 ? (
          <p className="text-lg text-gray-600">
            No one has registered for this event yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.attendees.map((attendee) => (
              <div
                key={attendee._id}
                className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  {attendee.name}
                </h3>
                <p className="text-gray-600 text-sm">{attendee.email}</p>
                <p className="text-gray-600 text-sm">Role: {attendee.role}</p>
                <p className="text-gray-600 text-sm">
                  Vouches: {attendee.vouchCount}
                </p>
                {attendee.vouchCount >= 3 && (
                  <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full mt-2 font-semibold">
                    ⭐ Highlighted Member
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetailPage;
