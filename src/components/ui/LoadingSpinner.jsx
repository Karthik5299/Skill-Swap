import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

const LoadingSpinner = ({ size = "medium", text = "" }) => {
  const { theme } = useTheme();

  const sizes = {
    small: "h-6 w-6 border-2",
    medium: "h-10 w-10 border-3",
    large: "h-16 w-16 border-4",
  };

  return (
    <div className="flex flex-col justify-center items-center gap-3">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`${sizes[size]} rounded-full border-t-transparent ${theme.mode === "dark" ? "border-indigo-400" : "border-indigo-600"}`}
        ></motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-0 ${sizes[size]} rounded-full border-transparent ${theme.mode === "dark" ? "border-r-purple-400" : "border-r-purple-600"}`}
        ></motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-sm`}
        ></motion.div>
      </div>
      {text && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-medium text-gray-600 dark:text-gray-400"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
