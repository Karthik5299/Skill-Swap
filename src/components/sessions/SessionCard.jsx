import React from "react";
import { format } from "date-fns";
import { FiMessageSquare, FiClock, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import ProfilePlaceholder from "../../assets/profile-placeholder.svg";

const SessionCard = ({ session, isActive, onClick }) => {
  const { theme } = useTheme();
  const dark = theme.mode === "dark";

  const lastMessage     = session.lastMessage || {};
  const lastMessageText = lastMessage.text || "No messages yet";
  const lastMessageTime = lastMessage.timestamp?.toDate
    ? format(lastMessage.timestamp.toDate(), "MMM d, h:mm a")
    : session.date && session.time
    ? format(new Date(`${session.date}T${session.time}`), "MMM d, h:mm a")
    : "";

  // ── Resolve skill labels ─────────────────────────────────────────────────
  // These are enriched by SessionsPage from both users' profiles
  const teachSkill = session.skillToTeach || "";
  const learnSkill = session.skillToLearn || "";

  // Fallback: try to pick first skill from the arrays
  const teachLabel =
    teachSkill ||
    session.mySkillsToTeach?.[0] ||
    session.requesterSkillsToTeach?.[0] ||
    "";

  const learnLabel =
    learnSkill ||
    session.mySkillsToLearn?.[0] ||
    session.recipientSkillsToLearn?.[0] ||
    "";

  const showSkillLine = teachLabel || learnLabel;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`p-4 cursor-pointer transition-colors ${
        isActive
          ? dark ? "bg-gray-700/50" : "bg-indigo-50"
          : dark ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            className="h-11 w-11 rounded-full object-cover border-2 border-white/20"
            src={session.otherUser?.photoURL || ProfilePlaceholder}
            alt={session.otherUser?.displayName || "User"}
            onError={(e) => { e.target.src = ProfilePlaceholder; }}
          />
          {session.status === "accepted" && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
              <FiCheckCircle className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name + time */}
          <div className="flex justify-between items-center mb-0.5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {session.otherUser?.displayName || "Unknown User"}
            </h3>
            {lastMessageTime && (
              <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-1">
                {lastMessageTime}
              </span>
            )}
          </div>

          {/* Skill exchange line */}
          {showSkillLine ? (
            <p className="text-xs mb-1 truncate">
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
          ) : null}

          {/* Last message */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 truncate">
            <FiMessageSquare className="mr-1 flex-shrink-0 h-3 w-3" />
            <span className="truncate">{lastMessageText}</span>
          </div>

          {/* Scheduled time */}
          {session.date && session.time && (
            <div className="flex items-center mt-1 text-xs text-gray-400 dark:text-gray-500">
              <FiClock className="mr-1 flex-shrink-0 h-3 w-3" />
              <span>
                {format(
                  new Date(`${session.date}T${session.time}`),
                  "MMM d, h:mm a"
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SessionCard;
