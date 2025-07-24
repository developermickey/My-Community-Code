import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

// NEW IMPORTS FOR REACT-DRAFT-WYSIWYG
import { EditorState, convertToRaw, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"; // Essential CSS for the editor
import draftToHtml from "draftjs-to-html"; // Converts Draft.js state to HTML
import htmlToDraft from "html-to-draftjs"; // Converts HTML to Draft.js state

// Simple Loading Spinner Component (reuse from other pages)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <p className="ml-4 text-xl text-gray-600">Loading...</p>
  </div>
);

const API_URL = "http://localhost:5000/api"; // Assuming your API runs on this URL

function TutorialCreateEditPage() {
  const { id } = useParams(); // Get tutorial ID if in edit mode (from URL)
  const navigate = useNavigate(); // For programmatic navigation
  const { user, token, loading: authLoading } = useAuth(); // Get user and token from AuthContext

  // State variables for form fields
  const [title, setTitle] = useState("");
  // EditorState for react-draft-wysiwyg, initialized as empty
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [category, setCategory] = useState("");
  const [chapters, setChapters] = useState([]); // List of available chapters
  const [selectedChapterId, setSelectedChapterId] = useState(""); // Selected chapter ID
  const [keywords, setKeywords] = useState(""); // Comma-separated string of keywords
  const [categories, setCategories] = useState([]); // List of available categories for dropdown

  const [isEditing, setIsEditing] = useState(false); // Flag to determine if in edit or create mode
  const [loading, setLoading] = useState(true); // For initial data fetch (categories, chapters, existing tutorial)
  const [formSaving, setFormSaving] = useState(false); // For form submission loading indicator

  // Effect to fetch initial form data (categories and chapters)
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        // Fetch categories from the API
        const categoriesRes = await axios.get(
          `${API_URL}/tutorials/categories`
        );
        setCategories(categoriesRes.data);

        // Fetch chapters (assuming chapters are publicly accessible or handled by backend auth)
        const chaptersRes = await axios.get(`${API_URL}/chapters`);
        setChapters(chaptersRes.data);

        // Pre-select user's chapter if they are a chapter-lead and have one assigned
        if (user && user.role === "chapter-lead" && user.chapter) {
          setSelectedChapterId(user.chapter._id);
        }
      } catch (err) {
        console.error("Error fetching form data:", err);
        toast.error("Failed to load categories or chapters for the form.");
      } finally {
        setLoading(false); // Mark initial form data loading as complete
      }
    };

    // Only fetch form data once user authentication context is loaded
    if (!authLoading) {
      fetchFormData();
    }
  }, [user, authLoading]); // Dependencies: re-run if user or authLoading changes

  // Effect to fetch tutorial data if in edit mode (when 'id' is present in URL)
  useEffect(() => {
    if (id) {
      setIsEditing(true); // Set editing mode to true
      // Ensure user context is loaded and user exists before making authorized call
      if (!authLoading && user) {
        const fetchTutorial = async () => {
          setLoading(true); // Set loading state for tutorial data
          try {
            const response = await axios.get(`${API_URL}/tutorials/${id}`, {
              headers: { Authorization: `Bearer ${token}` }, // Send auth token
            });

            // Frontend Authorization check: Redirect if not authorized to edit
            if (
              response.data.author._id !== user._id &&
              user.role !== "admin"
            ) {
              toast.error("You are not authorized to edit this tutorial.");
              navigate("/tutorials"); // Redirect if not authorized
              return;
            }
            // Inform user if editing an approved tutorial (status will revert to pending)
            if (
              response.data.status === "approved" &&
              response.data.author._id === user._id &&
              user.role !== "admin"
            ) {
              toast.info(
                "Heads up! Editing an approved tutorial will set its status back to pending for re-approval."
              );
            }

            // Populate form fields with fetched data
            setTitle(response.data.title);
            setCategory(response.data.category._id);
            setSelectedChapterId(response.data.chapter?._id || ""); // Handle optional chapter
            setKeywords(response.data.keywords.join(", ")); // Convert array to comma-separated string

            // Convert HTML content from backend to EditorState for React-Draft-WYSIWYG
            if (response.data.content) {
              const blocksFromHtml = htmlToDraft(response.data.content);
              if (blocksFromHtml) {
                const { contentBlocks, entityMap } = blocksFromHtml;
                const contentState = ContentState.createFromBlockArray(
                  contentBlocks,
                  entityMap
                );
                setEditorState(EditorState.createWithContent(contentState));
              } else {
                setEditorState(EditorState.createEmpty()); // Fallback for invalid HTML
              }
            } else {
              setEditorState(EditorState.createEmpty()); // No content, start with empty editor
            }
          } catch (err) {
            console.error("Error fetching tutorial for edit:", err);
            toast.error(
              err.response?.data?.message ||
                "Failed to load tutorial for editing."
            );
            navigate("/tutorials"); // Redirect on error (e.g., tutorial not found)
          } finally {
            setLoading(false); // Loading complete for tutorial data
          }
        };
        fetchTutorial();
      }
    } else {
      // If no ID is present (create mode)
      setIsEditing(false);
      setLoading(false); // No tutorial to fetch, initial loading is done.
      // Clear form fields when navigating from edit to create mode
      setTitle("");
      setEditorState(EditorState.createEmpty()); // Reset editor content
      setKeywords("");
      // Reset chapter selection if it was pre-filled for a chapter lead
      if (user?.role === "chapter-lead" && user?.chapter) {
        setSelectedChapterId(user.chapter._id);
      } else {
        setSelectedChapterId(""); // This handles students and CLs without a chapter
      }
    }
  }, [id, user, authLoading, navigate, token]); // Dependencies for edit mode effect

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission
    setFormSaving(true); // Activate saving state

    // Convert EditorState to raw Draft.js format, then to HTML string
    const currentContentHtml = draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    );

    // Client-side validation: Check for empty fields
    // Chapter field is now optional, so it's removed from this validation check.
    if (
      !title.trim() || // Title must not be empty or just whitespace
      !category || // Category must be selected
      !currentContentHtml.trim() || // Content must not be empty or just whitespace
      currentContentHtml.trim() === "<p></p>" || // Specific check for empty editor HTML
      currentContentHtml.trim() === "<p><br></p>" // Specific check for empty editor HTML with line break
    ) {
      toast.error(
        "Please fill in all required fields: Title, Category, and Tutorial Content."
      );
      setFormSaving(false); // Deactivate saving state
      return; // Stop submission
    }

    // Prepare tutorial data for API call
    const tutorialData = {
      title,
      content: currentContentHtml, // HTML content from editor
      category, // Category ID
      chapter: selectedChapterId || null, // Chapter ID (optional, send null if not selected)
      keywords: keywords // Convert comma-separated string to array for backend
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k !== ""), // Remove empty strings from keywords array
    };

    try {
      if (isEditing) {
        // If in edit mode, send PUT request
        await axios.put(`${API_URL}/tutorials/${id}`, tutorialData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Tutorial updated successfully!");
      } else {
        // If in create mode, send POST request
        const response = await axios.post(
          `${API_URL}/tutorials`,
          tutorialData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success(
          "Tutorial created successfully! It is pending admin review."
        );
        // Clear form after successful creation
        setTitle("");
        setEditorState(EditorState.createEmpty()); // Clear editor content
        setKeywords("");
        // Reset chapter selection if it was pre-filled for a chapter lead
        if (user?.role === "chapter-lead" && user?.chapter) {
          setSelectedChapterId(user.chapter._id);
        } else {
          setSelectedChapterId("");
        }
      }
      navigate("/tutorials"); // Redirect to tutorials list after save
    } catch (err) {
      console.error(
        "Error saving tutorial:",
        err.response?.data?.message || err.message
      );
      toast.error(err.response?.data?.message || "Failed to save tutorial.");
    } finally {
      setFormSaving(false); // Deactivate saving state regardless of success or failure
    }
  };

  // Logic to disable chapter select:
  // - If form is currently saving
  // - If user is a 'chapter-lead' and has an assigned chapter, they can only select their own chapter.
  const isChapterSelectDisabled =
    formSaving || (user?.role === "chapter-lead" && user?.chapter);

  // Display loading spinner while data is being fetched
  if (loading) {
    return <LoadingSpinner />;
  }

  // Display "Not Found" message if in edit mode and tutorial data is empty after loading
  // This handles cases where the tutorial ID is invalid or user lacks permission
  if (
    isEditing &&
    !editorState.getCurrentContent().hasText() && // Check if editor content is truly empty
    !loading && // Ensure loading is complete
    !formSaving // Ensure not currently saving
  ) {
    return (
      <div className="py-10 text-center bg-white p-8 rounded-lg shadow-md border border-red-200">
        <h2 className="text-3xl font-bold text-red-600 mb-4">
          Tutorial Not Found or Access Denied
        </h2>
        <p className="text-lg text-gray-700">
          The tutorial you are trying to edit does not exist or you do not have
          permission to access it.
        </p>
        <Link
          to="/tutorials"
          className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md"
        >
          Back to Tutorials
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 bg-gray-50 min-h-[calc(100vh-140px)] flex justify-center items-start">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          <span className="text-blue-600">{isEditing ? "Edit" : "Create"}</span>{" "}
          Tutorial
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div>
            <label
              htmlFor="title"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              <span className="mr-2">📚</span>Title:
            </label>
            <input
              type="text"
              id="title"
              className="shadow appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to React Hooks"
              required // HTML5 required attribute
              disabled={formSaving} // Disable input while saving
            />
          </div>

          {/* Content Field (Rich Text Editor) */}
          <div>
            <label
              htmlFor="content"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              <span className="mr-2">✍️</span>Content:
            </label>
            <div className="relative">
              {/* Wrapper for styling the editor border */}
              <Editor
                editorState={editorState}
                onEditorStateChange={setEditorState}
                wrapperClassName="w-full" // Ensure wrapper takes full width
                editorClassName="bg-white border border-gray-300 rounded-b-lg p-3 min-h-[300px] focus:outline-none focus:border-blue-500" // Custom editor area styling
                toolbarClassName="bg-gray-100 border border-gray-300 rounded-t-lg p-2" // Toolbar styling
                readOnly={formSaving} // Disable editor while saving
                toolbar={{
                  // Define your toolbar options here
                  options: [
                    "inline",
                    "blockType",
                    "fontSize",
                    "fontFamily",
                    "list",
                    "textAlign",
                    "colorPicker",
                    "link",
                    "image",
                    "history",
                  ],
                  inline: {
                    inDropdown: true,
                    options: ["bold", "italic", "underline", "strikethrough"],
                  },
                  list: { inDropdown: true },
                  textAlign: { inDropdown: true },
                  link: { inDropdown: true },
                  history: { inDropdown: false },
                }}
              />
            </div>
            {/* Simple client-side validation message for empty content */}
            {(!editorState.getCurrentContent().hasText() ||
              draftToHtml(
                convertToRaw(editorState.getCurrentContent())
              ).trim() === "<p></p>" ||
              draftToHtml(
                convertToRaw(editorState.getCurrentContent())
              ).trim() === "<p><br></p>") && (
              <p className="text-xs text-red-500 mt-1">
                Tutorial content cannot be empty.
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Use the rich text editor to format your tutorial content.
            </p>
          </div>

          {/* Category Dropdown */}
          <div>
            <label
              htmlFor="category"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              <span className="mr-2">🏷️</span>Category:
            </label>
            <select
              id="category"
              className="shadow appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required // Category is a required field
              disabled={formSaving}
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                </option>
              ))}
            </select>
            {categories.length === 0 && !loading && (
              <p className="text-sm text-red-500 mt-2">
                No categories available. Please ask an Admin to create some.
              </p>
            )}
          </div>

          {/* Chapter Dropdown (Optional) */}
          <div>
            <label
              htmlFor="chapter"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              <span className="mr-2">🏘️</span>Chapter (Optional):
            </label>
            <select
              id="chapter"
              className="shadow appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              disabled={isChapterSelectDisabled} // Disable based on role/saving state
            >
              <option value="">-- No Specific Chapter --</option>
              {/* If user is a chapter-lead and has a chapter, only show their chapter */}
              {user?.role === "chapter-lead" && user?.chapter ? (
                <option value={user.chapter._id}>{user.chapter.name}</option>
              ) : (
                // Otherwise, show all chapters
                chapters.map((chap) => (
                  <option key={chap._id} value={chap._id}>
                    {chap.name}
                  </option>
                ))
              )}
            </select>
            {user?.role === "chapter-lead" && !user?.chapter && (
              <p className="text-sm text-red-500 mt-2">
                As a Chapter Lead, your tutorials will be associated with your
                assigned chapter. Please contact an Admin to be assigned one.
              </p>
            )}
            {user?.role === "student" && (
              <p className="text-xs text-gray-500 mt-1">
                Students can optionally assign their tutorial to a chapter.
              </p>
            )}
          </div>

          {/* Keywords Field */}
          <div>
            <label
              htmlFor="keywords"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              <span className="mr-2">🏷️</span>Keywords (comma-separated):
            </label>
            <input
              type="text"
              id="keywords"
              className="shadow appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., react, javascript, frontend"
              disabled={formSaving}
            />
            <p className="text-xs text-gray-500 mt-1">
              Help users find your tutorial by adding relevant keywords.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-center pt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors duration-200 inline-flex items-center"
              disabled={formSaving} // Only disable if form is saving
            >
              {formSaving && (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
              )}
              {formSaving
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Create Tutorial"}
            </button>
          </div>

          {/* Note about approval workflow for students/chapter leads */}
          {!isEditing &&
            (user?.role === "student" || user?.role === "chapter-lead") && (
              <p className="text-sm text-gray-600 text-center mt-6">
                Your tutorial will be marked as **pending** and require Admin
                approval before it's publicly visible.
              </p>
            )}
        </form>
      </div>
    </div>
  );
}

export default TutorialCreateEditPage;
