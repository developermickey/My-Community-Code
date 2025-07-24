import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Removed: const [error, setError] = useState(""); // No longer needed, toast handles errors
  const [loading, setLoading] = useState(false); // Local loading state for the form

  const { login } = useAuth(); // Get the login function from AuthContext
  const navigate = useNavigate(); // Hook to programmatically navigate

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    // Removed: setError(""); // No longer needed
    setLoading(true); // Set loading state

    // The login function in AuthContext now handles showing toast messages
    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard"); // Redirect to dashboard on successful login
    }
    // No 'else' block here because the login function in AuthContext already
    // handles displaying error toasts if the login fails.

    setLoading(false); // Reset loading state
  };

  return (
    <div className="py-10 flex justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Login
        </h1>
        {/* Removed: Error display JSX block, as toasts will handle error messages */}
        {/* {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )} */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading} // Disable button when loading
            >
              {loading ? "Logging In..." : "Sign In"}
            </button>
            <a
              href="#"
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
