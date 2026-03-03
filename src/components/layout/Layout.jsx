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

  const isSessionsPage = location.pathname.startsWith("/sessions");

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme.mode === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Navbar */}
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-1 relative">
        {currentUser && (
          <>
            {/* Desktop Sidebar Spacer */}
            <div className="hidden md:block w-56 flex-shrink-0"></div>

            <Sidebar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </>
        )}

        {isSessionsPage ? (
          // Sessions page full control
          <main className="flex-1 overflow-hidden transition-all duration-300">
            {children}
          </main>
        ) : (
          // Normal pages
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