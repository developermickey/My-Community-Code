// scriptly-frontend/src/components/Header.jsx

import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center flex-wrap">
        <Link to="/" className="text-2xl font-bold mb-2 md:mb-0">
          Scriptly
        </Link>
        <ul className="flex space-x-4 md:space-x-6 flex-wrap justify-center md:justify-start">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-300 font-semibold"
                  : "hover:text-gray-200"
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-300 font-semibold"
                  : "hover:text-gray-200"
              }
            >
              Events
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/chapters"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-300 font-semibold"
                  : "hover:text-gray-200"
              }
            >
              Chapters
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/tutorials"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-300 font-semibold"
                  : "hover:text-gray-200"
              }
            >
              Tutorials
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-300 font-semibold"
                  : "hover:text-gray-200"
              }
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-300 font-semibold"
                  : "hover:text-gray-200"
              }
            >
              Contact
            </NavLink>
          </li>

          {!isAuthenticated ? (
            <>
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive
                      ? "text-yellow-300 font-semibold"
                      : "hover:text-gray-200"
                  }
                >
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    isActive
                      ? "text-yellow-300 font-semibold"
                      : "hover:text-gray-200"
                  }
                >
                  Register
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    isActive
                      ? "text-yellow-300 font-semibold"
                      : "hover:text-gray-200"
                  }
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    isActive
                      ? "text-yellow-300 font-semibold"
                      : "hover:text-gray-200"
                  }
                >
                  Profile
                </NavLink>
              </li>
              {/* Conditional Create Event link */}
              {(user?.role === "chapter-lead" || user?.role === "admin") && (
                <li>
                  <NavLink
                    to="/events/create"
                    className={({ isActive }) =>
                      isActive
                        ? "text-yellow-300 font-semibold"
                        : "hover:text-gray-200"
                    }
                  >
                    Create Event
                  </NavLink>
                </li>
              )}
              {/* New: Create Tutorial Link (for all authenticated users) */}
              <li>
                <NavLink
                  to="/tutorials/create"
                  className={({ isActive }) =>
                    isActive
                      ? "text-yellow-300 font-semibold"
                      : "hover:text-gray-200"
                  }
                >
                  Create Tutorial
                </NavLink>
              </li>
              {/* Admin specific links */}
              {user && user.role === "admin" && (
                <>
                  <li>
                    <NavLink
                      to="/admin/users"
                      className={({ isActive }) =>
                        isActive
                          ? "text-yellow-300 font-semibold"
                          : "hover:text-gray-200"
                      }
                    >
                      Admin Users
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/chapters"
                      className={({ isActive }) =>
                        isActive
                          ? "text-yellow-300 font-semibold"
                          : "hover:text-gray-200"
                      }
                    >
                      Admin Chapters
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/events"
                      className={({ isActive }) =>
                        isActive
                          ? "text-yellow-300 font-semibold"
                          : "hover:text-gray-200"
                      }
                    >
                      Admin Events
                    </NavLink>
                  </li>
                  {/* New: Admin Tutorials management link */}
                  <li>
                    <NavLink
                      to="/admin/tutorials"
                      className={({ isActive }) =>
                        isActive
                          ? "text-yellow-300 font-semibold"
                          : "hover:text-gray-200"
                      }
                    >
                      Admin Tutorials
                    </NavLink>
                  </li>
                </>
              )}
              {/* Chapter Lead specific links */}
              {user && user.role === "chapter-lead" && (
                <li>
                  <NavLink
                    to="/chapter-lead/events"
                    className={({ isActive }) =>
                      isActive
                        ? "text-yellow-300 font-semibold"
                        : "hover:text-gray-200"
                    }
                  >
                    Manage My Events
                  </NavLink>
                </li>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Logout ({user?.name || user?.email})
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
