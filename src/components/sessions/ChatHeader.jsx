import React, { useState } from "react";
import {
  FiMoreVertical,
  FiTrash2,
  FiCalendar,
} from "react-icons/fi";
import SessionScheduleModal from "./SessionScheduleModal";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import ProfilePlaceholder from "../../assets/profile-placeholder.svg";

const ChatHeader = ({ session, currentUser, onScheduleSession, onClearChat }) => {
  const { theme } = useTheme();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dark = theme.mode === "dark";

  // ── Get the other user's display data ─────────────────────────────────────
  // FIXED: use session.otherUser (fetched fresh from Firestore in SessionsPage)
  // which always has the latest photoURL (including base64 uploaded photos).
  // Fall back to the exchange document fields only as a last resort.
  const otherUserId = session.participants?.find((id) => id !== currentUser.uid);
  const isRequester = otherUserId === session.requesterId;

  const name =
    session.otherUser?.displayName ||
    (isRequester ? session.requesterName : session.recipientName) ||
    "Unknown User";

  const photo =
    session.otherUser?.photoURL ||                          // ✅ latest (base64 or URL)
    (isRequester ? session.requesterPhoto : session.recipientPhoto) || // exchange doc fallback
    "";                                                     // will show placeholder

  // ── Skill labels (already enriched by SessionsPage) ───────────────────────
  const teachLabel = session.skillToTeach || session.mySkillsToTeach?.[0] || "";
  const learnLabel = session.skillToLearn || session.mySkillsToLearn?.[0]  || "";

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear all messages in this chat?")) {
      onClearChat();
    }
  };

  return (
    <div
      className={`border-b ${
        dark ? "border-gray-700 bg-gray-800/80" : "border-gray-200 bg-white/80"
      } px-4 py-3 flex justify-between items-center backdrop-blur-lg h-20`}
    >
      {/* ── Left: avatar + name + skills ──────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img
            key={photo}
            className="h-10 w-10 rounded-full object-cover border-2 border-white/20 shadow"
            src={photo || ProfilePlaceholder}
            alt={name}
            onError={(e) => { e.target.src = ProfilePlaceholder; }}
          />
          {/* Online indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800" />
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900 dark:text-white leading-tight truncate">
            {name}
          </h2>

          {/* Skill exchange line */}
          {(teachLabel || learnLabel) ? (
            <p className="text-xs truncate mt-0.5">
              {teachLabel && (
                <span className="text-indigo-500 dark:text-indigo-400 font-medium">
                  {teachLabel}
                </span>
              )}
              {teachLabel && learnLabel && (
                <span className="text-gray-400 dark:text-gray-500"> ⇄ </span>
              )}
              {learnLabel && (
                <span className="text-green-500 dark:text-green-400 font-medium">
                  {learnLabel}
                </span>
              )}
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Skill Exchange
            </p>
          )}
        </div>
      </div>

      {/* ── Right: schedule button + menu ──────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Schedule Call Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsScheduleModalOpen(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            dark
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-indigo-500 hover:bg-indigo-600 text-white"
          }`}
        >
          <FiCalendar className="h-4 w-4" />
          <span className="hidden sm:inline">Schedule</span>
        </motion.button>

        {/* Three dots menu */}
        <div className="relative flex-shrink-0">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full ${
              dark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <FiMoreVertical className="h-5 w-5" />
          </motion.button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl py-1 z-20 border ${
                  dark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <button
                  onClick={() => { setIsMenuOpen(false); handleClearChat(); }}
                  className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${
                    dark ? "hover:bg-gray-700 text-red-400" : "hover:bg-gray-100 text-red-500"
                  }`}
                >
                  <FiTrash2 className="h-4 w-4" /> Clear Chat
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Schedule modal ──────────────────────────────────────────────────── */}
      {isScheduleModalOpen && (
        <SessionScheduleModal
          session={session}
          onClose={() => setIsScheduleModalOpen(false)}
          onSubmit={(data) => { onScheduleSession(data); setIsScheduleModalOpen(false); }}
        />
      )}
    </div>
  );
};

export default ChatHeader;
