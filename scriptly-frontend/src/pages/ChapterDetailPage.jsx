// scriptly-frontend/src/pages/ChapterDetailPage.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Hook to get URL parameters
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function ChapterDetailPage() {
  const { id } = useParams(); // Get the chapter ID from the URL
  const [chapter, setChapter] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChapterDetails = async () => {
      try {
        setLoading(true);
        // Backend endpoint for single chapter also returns members
        const response = await axios.get(`${API_URL}/chapters/${id}`);
        setChapter(response.data.chapter);
        setMembers(response.data.members);
        setError(null);
      } catch (err) {
        console.error("Error fetching chapter details:", err);
        if (err.response && err.response.status === 404) {
          setError("Chapter not found.");
        } else {
          setError("Failed to load chapter details. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChapterDetails();
    }
  }, [id]); // Re-run effect if ID changes

  if (loading) {
    return (
      <div className="py-10 flex justify-center items-center">
        <p className="text-xl text-gray-600">Loading chapter details...</p>
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

  if (!chapter) {
    return (
      <div className="py-10 text-center">
        <p className="text-xl text-gray-600">No chapter data available.</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">
          {chapter.name}
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          {chapter.description || "No description available."}
        </p>
        <p className="text-md text-gray-600">
          **Chapter Lead:**{" "}
          {chapter.chapterLead
            ? `${chapter.chapterLead.name} (${chapter.chapterLead.email})`
            : "Not assigned"}
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Chapter Members ({members.length})
        </h2>
        {members.length === 0 ? (
          <p className="text-lg text-gray-600">
            No members found in this chapter yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div
                key={member._id}
                className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  {member.name}
                </h3>
                <p className="text-gray-600 text-sm">{member.email}</p>
                <p className="text-gray-600 text-sm">Role: {member.role}</p>
                <p className="text-gray-600 text-sm">
                  Vouches: {member.vouchCount}
                </p>
                {member.vouchCount >= 3 && (
                  <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full mt-2 font-semibold">
                    ⭐ Highlighted Member
                  </span>
                )}
                {/* Could add a link to user's profile here */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChapterDetailPage;
