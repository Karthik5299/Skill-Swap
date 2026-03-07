import React, { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Menu, Transition } from "@headlessui/react";
import { FiMenu, FiUser, FiLogOut, FiSun, FiMoon } from "react-icons/fi";
import { motion } from "framer-motion";
import Logo from "../../assets/logo.svg";
import NotificationBell from "../notifications/NotificationBell";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showMenuButton, setShowMenuButton] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth <= 768;
      setShowMenuButton(currentUser && isMobile);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [currentUser]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? theme.mode === "dark"
            ? "bg-gray-900/95 border-b border-gray-700/50 shadow-xl"
            : "bg-white/95 border-b border-gray-200/50 shadow-xl"
          : theme.mode === "dark"
          ? "bg-gray-800/80 border-b border-gray-700"
          : "bg-white/80 border-b border-gray-200"
      } backdrop-blur-xl`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left section */}
          <div className="flex items-center">
            {showMenuButton && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className={`inline-flex items-center justify-center p-2 rounded-xl ${theme.mode === "dark" ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 mr-3 transition-all duration-200`}
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <FiMenu className="h-6 w-6" />
              </motion.button>
            )}

            <Link
              to="/"
              className="flex items-center group"
            >
              <motion.img
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="h-8 w-auto"
                src={Logo}
                alt="SkillSwap"
              />
              <span className={`ml-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-200`}>
                SkillSwap
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl ${theme.mode === "dark" ? "text-yellow-400 hover:text-yellow-300 hover:bg-gray-700" : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"} transition-all duration-200 shadow-sm`}
              aria-label={
                theme.mode === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme.mode === "dark" ? (
                <FiSun className="h-5 w-5" />
              ) : (
                <FiMoon className="h-5 w-5" />
              )}
            </motion.button>

            {currentUser && <NotificationBell theme={theme} />}

            {currentUser ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 focus:outline-none group">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || "Profile"}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = Logo;
                        }}
                        className="h-9 w-9 rounded-full object-cover shadow-lg ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/50 transition-all duration-200"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/50 transition-all duration-200">
                        {currentUser.displayName
                          ? currentUser.displayName.charAt(0).toUpperCase()
                          : currentUser.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
                  </motion.div>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items
                    className={`origin-top-right absolute right-0 mt-3 w-56 rounded-xl shadow-xl py-2 ${theme.mode === "dark" ? "bg-gray-800/95 border border-gray-700/50" : "bg-white/95 border border-gray-200/50"} ring-1 ring-black ring-opacity-5 focus:outline-none z-50 backdrop-blur-xl`}
                  >
                    <div className={`px-4 py-3 border-b ${theme.mode === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {currentUser.displayName || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`block px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                            active
                              ? theme.mode === "dark"
                                ? "bg-indigo-600/10 text-indigo-400"
                                : "bg-indigo-50 text-indigo-600"
                              : theme.mode === "dark"
                                ? "text-gray-300"
                                : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center">
                            <FiUser className="mr-3 h-4 w-4" />
                            My Profile
                          </div>
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                            active
                              ? theme.mode === "dark"
                                ? "bg-red-600/10 text-red-400"
                                : "bg-red-50 text-red-600"
                              : theme.mode === "dark"
                                ? "text-gray-300"
                                : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center">
                            <FiLogOut className="mr-3 h-4 w-4" />
                            Sign out
                          </div>
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-semibold rounded-xl ${theme.mode === "dark" ? "text-gray-300 hover:text-white hover:bg-gray-700" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"} transition-all duration-200`}
                >
                  Sign in
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Sign up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
