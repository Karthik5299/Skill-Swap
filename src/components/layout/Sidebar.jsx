import React from "react";
import { Link, useLocation } from "react-router-dom";
import { RiExchangeBoxLine } from "react-icons/ri";
import { BsPersonVideo } from "react-icons/bs";
import { IoIosPeople } from "react-icons/io";
import { TiHome } from "react-icons/ti";
import { SiGoogledocs } from "react-icons/si";
import { IoSettingsSharp } from "react-icons/io5";
import { useTheme } from "../../contexts/ThemeContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { theme } = useTheme();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: TiHome },
    { name: "Skill Exchange", path: "/exchange", icon: RiExchangeBoxLine },
    { name: "Learning Hub", path: "/sessions", icon: BsPersonVideo },
    { name: "Community", path: "/community", icon: IoIosPeople },
    { name: "Resources", path: "/resources", icon: SiGoogledocs },
    { name: "Profile", path: "/profile", icon: IoSettingsSharp },
  ];

  // 🎯 Improved Theme Styling
  const sidebarStyle =
    theme.mode === "dark"
      ? {
          background:
            "linear-gradient(160deg, rgba(31,41,55,0.95) 0%, rgba(17,24,39,0.95) 100%)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 20px rgba(79, 70, 229, 0.15)",
          borderRight: "1px solid rgba(55, 65, 81, 0.4)",
        }
      : {
          background: "#ffffff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          borderRight: "1px solid #e5e7eb",
        };

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-40 w-56 transform transition-all duration-300 ease-in-out md:hidden`}
        style={sidebarStyle}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200/30">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            SkillSwap
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`p-1.5 rounded-lg transition ${
              theme.mode === "dark"
                ? "text-gray-400 hover:bg-gray-700/50"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            ✕
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2.5 mb-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? theme.mode === "dark"
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-400/30"
                      : "bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm"
                    : theme.mode === "dark"
                    ? "text-gray-300 hover:bg-gray-700/30 hover:text-indigo-300"
                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div
          className="flex flex-col w-56 fixed left-0 top-16 bottom-0 z-40"
          style={sidebarStyle}
        >
          <div className="flex items-center h-16 px-6 border-b border-gray-200/30">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              SkillSwap
            </span>
          </div>

          <nav className="flex-1 px-3 py-6 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 mb-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? theme.mode === "dark"
                        ? "bg-indigo-600/20 text-indigo-400 border border-indigo-400/30"
                        : "bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm"
                      : theme.mode === "dark"
                      ? "text-gray-300 hover:bg-gray-700/30 hover:text-indigo-300"
                      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          <div
            className={`px-4 py-4 border-t ${
              theme.mode === "dark"
                ? "border-gray-700/50 text-gray-400"
                : "border-gray-200 text-gray-500"
            } text-xs font-medium`}
          >
            By jami karthikeya
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;