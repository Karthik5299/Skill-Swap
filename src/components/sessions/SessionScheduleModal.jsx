import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FiCalendar, FiClock, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

const SessionScheduleModal = ({ session, onClose, onSubmit }) => {
  const { theme } = useTheme();
  const [date, setDate] = useState(session?.date || "");
  const [time, setTime] = useState(session?.time || "");
  const [duration, setDuration] = useState(session?.duration || "30");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!date || !time || !duration) {
      toast.error("Please fill all fields");
      return;
    }

    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    if (selectedDateTime < now) {
      toast.error("Please select a future date and time");
      return;
    }

    onSubmit({ date, time, duration });
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">

      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`w-full max-w-md rounded-2xl shadow-2xl ${
          theme.mode === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Schedule Session
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Date
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  theme.mode === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                required
              />
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Time
            </label>
            <div className="relative">
              <FiClock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  theme.mode === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Duration (minutes)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={`w-full py-2 px-3 rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                theme.mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                theme.mode === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-lg"
            >
              Schedule
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};

export default SessionScheduleModal;
