import React from "react";
import { motion } from "framer-motion";
import { FiUser, FiAward, FiBook, FiArrowRight } from "react-icons/fi";
import ProfilePlaceholder from "../../assets/profile-placeholder.svg";
import { useTheme } from "../../contexts/ThemeContext";

const UserCard = ({ user, onClick }) => {
  const { theme } = useTheme();

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group relative glass rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border ${theme.mode === "dark" ? "border-gray-700 hover:border-indigo-500/50" : "border-gray-200 hover:border-indigo-300"} backdrop-blur-sm cursor-pointer transition-all duration-300`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="relative">
              {/* Perfect circular container for profile picture */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-14 w-14 rounded-full overflow-hidden border-2 border-white/20 shadow-md bg-gray-200 dark:bg-gray-700"
              >
                <img
                  className="h-full w-full object-cover"
                  src={user.photoURL || ProfilePlaceholder}
                  alt={user.displayName}
                  onError={(e) => {
                    e.target.src = ProfilePlaceholder;
                  }}
                />
              </motion.div>
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-1.5 shadow-lg">
                <FiUser className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {user.displayName || "Anonymous"}
              </h3>
              {user.bio && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="text-indigo-500 dark:text-indigo-400"
          >
            <FiArrowRight className="h-5 w-5" />
          </motion.div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center mb-2.5">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-2">
                <FiAward className="text-indigo-600 dark:text-indigo-400 h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Can Teach
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.skillsToTeach?.slice(0, 3).map((skill) => (
                <motion.span
                  key={skill}
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 dark:from-indigo-900/50 dark:to-purple-900/50 dark:text-indigo-200 shadow-sm"
                >
                  {skill}
                </motion.span>
              ))}
              {user.skillsToTeach?.length > 3 && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 shadow-sm">
                  +{user.skillsToTeach.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-2.5">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg mr-2">
                <FiBook className="text-green-600 dark:text-green-400 h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Wants to Learn
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.skillsToLearn?.slice(0, 3).map((skill) => (
                <motion.span
                  key={skill}
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-green-100 to-teal-100 text-green-800 dark:from-green-900/50 dark:to-teal-900/50 dark:text-green-200 shadow-sm"
                >
                  {skill}
                </motion.span>
              ))}
              {user.skillsToLearn?.length > 3 && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 shadow-sm">
                  +{user.skillsToLearn.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserCard;
