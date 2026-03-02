import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Check if we're on the sessions/chat page
  const isSessionsPage = location.pathname.startsWith('/sessions');

  return (
    <div
      className={`min-h-screen flex flex-col ${theme.mode === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-1 relative">
        {currentUser && (
          <>
            {/* Spacer for fixed sidebar */}
            <div className="hidden md:block w-56 flex-shrink-0"></div>
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          </>
        )}

        {isSessionsPage ? (
          // For SessionsPage: no wrapper, no padding, full control
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        ) : (
          // For other pages: normal layout with padding
          <main className="flex-1 pb-20 md:pb-0 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default Layout;