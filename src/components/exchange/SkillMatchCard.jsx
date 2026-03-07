import React from "react";
import { motion } from "framer-motion";
import { FiStar, FiAward, FiBook, FiZap, FiArrowRight } from "react-icons/fi";
import ProfilePlaceholder from "../../assets/profile-placeholder.svg";
import { useTheme } from "../../contexts/ThemeContext";

const SkillMatchCard = ({ user, score, onClick }) => {
  const { theme } = useTheme();

  const getMatchColor = (score) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-indigo-500 to-purple-600";
    return "from-blue-500 to-cyan-600";
  };

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group relative glass rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl border-2 ${theme.mode === "dark" ? "border-indigo-700/50 hover:border-indigo-500" : "border-indigo-300 hover:border-indigo-400"} backdrop-blur-sm cursor-pointer transition-all duration-300`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${getMatchColor(score)} opacity-10 rounded-bl-[100px]`}></div>

      <div className="relative p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="relative">
              <motion.img
                whileHover={{ scale: 1.15, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="h-16 w-16 rounded-full object-cover border-4 border-white/30 shadow-lg"
                src={user.photoURL || ProfilePlaceholder}
                alt={user.displayName}
              />
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-1.5 shadow-lg"
              >
                <FiStar className="h-3.5 w-3.5 text-white" />
              </motion.div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {user.displayName || "Anonymous"}
              </h3>
              <div className="flex items-center mt-1.5 gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`bg-gradient-to-r ${getMatchColor(score)} text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1`}
                >
                  <FiZap className="h-3 w-3" />
                  <span>{score}% Match</span>
                </motion.div>
              </div>
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

        <div className={`mt-4 p-3 rounded-xl ${theme.mode === "dark" ? "bg-indigo-900/20" : "bg-indigo-50"} border ${theme.mode === "dark" ? "border-indigo-700/30" : "border-indigo-200"}`}>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <FiZap className="h-3 w-3" />
            <span>Perfect Skill Match!</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            You both have complementary skills for exchange
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="flex items-center mb-2.5">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-2">
                <FiAward className="text-indigo-600 dark:text-indigo-400 h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                You can learn from them
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.skillsToTeach?.slice(0, 3).map((skill) => (
                <motion.span
                  key={skill}
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 dark:from-indigo-900/50 dark:to-purple-900/50 dark:text-indigo-200 shadow-sm"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-2.5">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg mr-2">
                <FiBook className="text-green-600 dark:text-green-400 h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                They want to learn from you
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.skillsToLearn?.slice(0, 3).map((skill) => (
                <motion.span
                  key={skill}
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/50 dark:to-emerald-900/50 dark:text-green-200 shadow-sm"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SkillMatchCard;
