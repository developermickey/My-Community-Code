import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

const API_URL = "http://localhost:5000/api/auth";

export const AuthProvider = ({ children, navigate: appNavigate }) => {
  // Correctly receives navigate prop
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Function to perform logout actions including redirection
  const performLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    toast.info("Your session has expired. Please log in again.");

    if (appNavigate) {
      // Use the passed navigate function to redirect
      appNavigate("/login");
    }
  };

  // Axios Interceptor for global error handling
  useEffect(() => {
    // Request interceptor: Attach token before sending request
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem("token");
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: Handle 401 Unauthorized globally
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // If error is 401 Unauthorized (and specifically if it's due to expired token)
        if (error.response && error.response.status === 401) {
          // Check if it's a token expiration error message
          if (
            error.response.data.message &&
            (error.response.data.message.includes("jwt expired") ||
              error.response.data.message.includes("token failed"))
          ) {
            performLogout(); // Perform logout actions and redirect
          } else {
            // For other 401s (e.g., "Invalid credentials" on initial login), just reject
            // The specific login/register functions will handle their own toasts for these.
            return Promise.reject(error);
          }
        }
        return Promise.reject(error); // Reject other errors as well
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [appNavigate]); // appNavigate is a dependency here because it's used in the effect

  // Initial user fetch on component mount or token change
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false); // No token, stop initial loading
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/profile`);
      setUser(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Initial user fetch failed:", err);
      // The 401 logic is handled by the interceptor. This catch is for other errors.
      if (err.response && err.response.status !== 401) {
        toast.error(
          "Failed to load user session. Please try logging in again."
        );
      }
      // performLogout() will be called by the interceptor if it's a 401,
      // or as a fallback for other errors.
      performLogout();
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const { token: receivedToken, user: userData } = res.data;

      localStorage.setItem("token", receivedToken);
      setToken(receivedToken); // This will trigger the useEffect to fetch user
      setUser(userData); // Update user state immediately for faster UI update
      toast.success("Login successful!");
      setLoading(false);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed.";
      console.error("Login error:", message);
      toast.error(message);
      setLoading(false);
      return { success: false, message };
    }
  };

  const register = async (name, email, password, role = "student") => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
        role,
      });
      setLoading(false);
      toast.success("Registration successful! Please login.");
      return { success: true, user: res.data.user };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed.";
      console.error("Registration error:", message);
      toast.error(message);
      setLoading(false);
      return { success: false, message };
    }
  };

  const logout = () => {
    performLogout();
  };

  const authContextValue = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    fetchUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading ? (
        children
      ) : (
        <div className="flex justify-center items-center min-h-screen text-lg text-gray-700">
          Loading application...
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
