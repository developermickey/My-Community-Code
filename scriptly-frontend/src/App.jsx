import React from "react";
// REMOVED: BrowserRouter as Router import. It is now in main.jsx.
import {
  Routes,
  Route,
  useNavigate as useAppNavigate, // Correctly using useNavigate alias
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
// REMOVED: AuthProvider import. It is now in main.jsx.
// import { AuthProvider } from "./context/AuthContext.jsx";

// Import your page components
import HomePage from "./pages/HomePage";
import AboutUsPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import EventsPage from "./pages/EventsPage";
import ChaptersPage from "./pages/ChaptersPage";
import ChapterDetailPage from "./pages/ChapterDetailPage";
import EventDetailPage from "./pages/EventDetailPage";
import EventCreatePage from "./pages/EventCreatePage";
import PasswordChangePage from "./pages/PasswordChangePage";

// New Tutorial pages
import TutorialsPage from "./pages/TutorialsPage";
import TutorialDetailPage from "./pages/TutorialDetailPage";
import TutorialCreateEditPage from "./pages/TutorialCreateEditPage";
import AdminTutorialsPage from "./pages/AdminTutorialsPage";

// Admin specific pages
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminChaptersPage from "./pages/AdminChaptersPage";
import AdminEventsPage from "./pages/AdminEventsPage";

// Chapter Lead specific pages
import ChapterLeadEventsPage from "./pages/ChapterLeadEventsPage";

function App() {
  // This hook is now valid because App will be rendered inside <Router> in main.jsx
  const navigate = useAppNavigate();

  // Important: The `Maps` prop is now passed from `main.jsx` to `AuthProvider`.
  // `AuthProvider` is *no longer rendered here*. App is a child of AuthProvider.
  // This component itself does not need the `Maps` prop.

  return (
    // REMOVED: <Router> and <AuthProvider> tags here. They are now in src/main.jsx.
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto p-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Public Lists and Detail Routes */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/chapters" element={<ChaptersPage />} />
          <Route path="/chapters/:id" element={<ChapterDetailPage />} />

          {/* Tutorial Routes (Public list and detail) */}
          <Route path="/tutorials" element={<TutorialsPage />} />
          <Route path="/tutorials/:id" element={<TutorialDetailPage />} />

          {/* Protected Routes for all authenticated users */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <PasswordChangePage />
              </PrivateRoute>
            }
          />

          {/* Event Creation Route (Chapter Lead & Admin) */}
          <Route
            path="/events/create"
            element={
              <PrivateRoute roles={["chapter-lead", "admin"]}>
                <EventCreatePage />
              </PrivateRoute>
            }
          />

          {/* Chapter Lead Event Management */}
          <Route
            path="/chapter-lead/events"
            element={
              <PrivateRoute roles={["chapter-lead", "admin"]}>
                <ChapterLeadEventsPage />
              </PrivateRoute>
            }
          />

          {/* Tutorial Creation (Admin, CL, Student) */}
          <Route
            path="/tutorials/create"
            element={
              <PrivateRoute>
                <TutorialCreateEditPage />
              </PrivateRoute>
            } // Any authenticated user can create
          />
          {/* Tutorial Editing (Author or Admin) */}
          <Route
            path="/tutorials/:id/edit"
            element={
              <PrivateRoute>
                <TutorialCreateEditPage />
              </PrivateRoute>
            } // Any authenticated user can edit their own or Admin edits any
          />

          {/* Admin-specific routes */}
          <Route
            path="/admin/users"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminUsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/chapters"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminChaptersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminEventsPage />
              </PrivateRoute>
            }
          />
          {/* Admin Tutorial Management */}
          <Route
            path="/admin/tutorials"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminTutorialsPage />
              </PrivateRoute>
            }
          />

          {/* Catch-all route for 404 Not Found */}
          <Route
            path="*"
            element={
              <h1 className="text-center text-3xl font-bold py-10">
                404 - Page Not Found
              </h1>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
