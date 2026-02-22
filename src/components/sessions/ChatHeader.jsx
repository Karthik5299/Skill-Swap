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

const ChatHeader = ({
  session,
  currentUser,
  onScheduleSession,
  onClearChat,
}) => {
  const { theme } = useTheme();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dark = theme.mode === "dark";

  // ── Get other user's data from session.otherUser (always fresh from Firestore)
  const otherUserId = session.participants?.find((id) => id !== currentUser.uid);
  const isRequester = otherUserId === session.requesterId;

  // Name: prefer otherUser profile, fallback to exchange doc fields
  const name =
    session.otherUser?.displayName ||
    (isRequester ? session.requesterName : session.recipientName) ||
    "Unknown User";

  // Photo: FIXED - read from otherUser.photoURL (latest, includes base64)
  // Old code read from session.requesterPhoto which is stale and never updated
  const photo =
    session.otherUser?.photoURL ||
    (isRequester ? session.requesterPhoto : session.recipientPhoto) ||
    "";

  // Skills: enriched by SessionsPage from both users' profiles
  const teachLabel = session.skillToTeach || session.mySkillsToTeach?.[0] || "";
  const learnLabel = session.skillToLearn || session.mySkillsToLearn?.[0] || "";

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear all messages in this chat?")) {
      onClearChat();
    }
  };

  return (
    <div
      className={`border-b ${
        dark ? "border-gray-700 bg-gray-800/80" : "border-gray-200 bg-white/80"
      } p-4 flex justify-between items-center backdrop-blur-lg`}
    >
      {/* ── Left: Avatar + Name + Skills ──────────────────────────────────── */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            key={photo}
            className="h-10 w-10 rounded-full object-cover border-2 border-white/20"
            src={photo || ProfilePlaceholder}
            alt={name}
            onError={(e) => { e.target.src = ProfilePlaceholder; }}
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
            <div className="h-2 w-2 rounded-full bg-white"></div>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {name}
          </h2>

          {/* Skill exchange line */}
          {(teachLabel || learnLabel) ? (
            <p className="text-sm">
              {teachLabel && (
                <span className="text-indigo-500 dark:text-indigo-400">
                  {teachLabel}
                </span>
              )}
              {teachLabel && learnLabel && (
                <span className="text-gray-400 dark:text-gray-500"> ⇄ </span>
              )}
              {learnLabel && (
                <span className="text-green-500 dark:text-green-400">
                  {learnLabel}
                </span>
              )}
            </p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Skill Exchange
            </p>
          )}
        </div>
      </div>

      {/* ── Right: Menu ───────────────────────────────────────────────────── */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full ${
              dark ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <FiMoreVertical className="text-gray-600 dark:text-gray-300" />
          </motion.button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 z-10 border ${
                  dark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                } backdrop-blur-lg`}
              >
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsScheduleModalOpen(true);
                  }}
                  className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                    dark
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <FiCalendar className="mr-2" /> Schedule Call
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleClearChat();
                  }}
                  className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                    dark
                      ? "hover:bg-gray-700 text-red-400"
                      : "hover:bg-gray-100 text-red-600"
                  }`}
                >
                  <FiTrash2 className="mr-2" /> Clear Chat
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Schedule Modal ─────────────────────────────────────────────────── */}
      {isScheduleModalOpen && (
        <SessionScheduleModal
          session={session}
          onClose={() => setIsScheduleModalOpen(false)}
          onSubmit={onScheduleSession}
        />
      )}
    </div>
  );
};

export default ChatHeader;
