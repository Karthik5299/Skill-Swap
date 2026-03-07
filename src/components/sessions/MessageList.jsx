import React, { useMemo, useRef, useEffect } from "react";
import { format } from "date-fns";
import { FiVideo, FiLink, FiFile, FiCheck, FiCheckCircle, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

const MessageList = ({ messages = [], currentUserId, session }) => {
  const { theme } = useTheme();
  const messagesEndRef = useRef(null);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- SESSION TIME VALIDATION ----------------
  const isSessionTimeValid = useMemo(() => {
    if (!session?.date || !session?.time || !session?.duration) return false;

    try {
      const sessionDateTime = new Date(`${session.date}T${session.time}`);
      const now = new Date();

      const tenMinutesBefore = new Date(
        sessionDateTime.getTime() - 10 * 60000
      );

      const durationMinutes =
        parseInt(session.duration || 0, 10) || 0;

      const thirtyMinutesAfter = new Date(
        sessionDateTime.getTime() +
          (durationMinutes + 30) * 60000
      );

      return now >= tenMinutesBefore && now <= thirtyMinutesAfter;
    } catch {
      return false;
    }
  }, [session]);

  // ---------------- FORMAT TIMESTAMP ----------------
  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return "Just now";

      if (timestamp?.toDate) {
        return format(timestamp.toDate(), "h:mm a");
      }

      if (timestamp instanceof Date) {
        return format(timestamp, "h:mm a");
      }

      return "Just now";
    } catch {
      return "Just now";
    }
  };

  // ---------------- MESSAGE STATUS ICON (WhatsApp-like) ----------------
  const getStatusIcon = (message) => {
    const isCurrentUser = message.senderId === currentUserId;
    if (!isCurrentUser) return null;

    const otherParticipant = session?.participants?.find(id => id !== currentUserId);
    const isRead = message.status === "read" || message.readBy?.includes(otherParticipant);

    if (isRead) {
      // Double blue checkmarks (read)
      return (
        <div className="flex items-center -space-x-1">
          <FiCheck className="text-xs text-blue-400" />
          <FiCheck className="text-xs text-blue-400" />
        </div>
      );
    } else if (message.status === "delivered") {
      // Double gray checkmarks (delivered)
      return (
        <div className="flex items-center -space-x-1">
          <FiCheck className="text-xs opacity-70" />
          <FiCheck className="text-xs opacity-70" />
        </div>
      );
    } else if (message.status === "sent") {
      // Single checkmark (sent)
      return <FiCheck className="text-xs opacity-70" />;
    } else {
      // Clock icon (sending)
      return <FiClock className="text-xs opacity-50" />;
    }
  };

  // ---------------- RENDER MESSAGE ----------------
  const renderMessageContent = (message) => {
    const isCurrentUser = message.senderId === currentUserId;
    const isSystem = message.type === "system";

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${
          isCurrentUser
            ? "justify-end"
            : isSystem
            ? "justify-center"
            : "justify-start"
        }`}
      >
        <div
          className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-2 ${
            isCurrentUser
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              : isSystem
              ? "bg-transparent text-gray-500 dark:text-gray-400 text-center"
              : `${
                  theme.mode === "dark"
                    ? "bg-gray-700"
                    : "bg-white"
                } text-gray-800 dark:text-gray-200`
          } shadow-sm`}
        >
          {/* ---------------- VIDEO MESSAGE ---------------- */}
          {message.type === "video" ? (
            <div className="space-y-2">
              <p>{message.text}</p>

              <div className="text-sm opacity-80">
                <p>Date: {message.date}</p>
                <p>Time: {message.time}</p>
                <p>Duration: {message.duration} minutes</p>
              </div>

              {isSessionTimeValid && message.meetingLink && (
                <a
                  href={message.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-white text-indigo-600 rounded-full hover:bg-gray-100 mt-2 text-sm"
                >
                  <FiVideo className="mr-2" />
                  Join Video Call
                </a>
              )}

              <div className="flex items-center justify-end mt-1 space-x-1">
                <span className="text-xs opacity-70">
                  {formatTimestamp(message.timestamp)}
                </span>
                {getStatusIcon(message)}
              </div>
            </div>

          ) : message.type === "resource" ? (

            /* ---------------- RESOURCE MESSAGE ---------------- */
            <div className="space-y-1">
              <div className="font-medium flex items-center">
                <FiFile className="mr-2" />
                {message.resourceTitle}
              </div>

              {message.resourceUrl && (
                <a
                  href={message.resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm ${
                    isCurrentUser
                      ? "text-indigo-200 hover:text-white"
                      : "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  } flex items-center mt-1`}
                >
                  <FiLink className="mr-1" />
                  View Resource
                </a>
              )}

              <div className="flex items-center justify-end mt-1 space-x-1">
                <span className="text-xs opacity-70">
                  {formatTimestamp(message.timestamp)}
                </span>
                {getStatusIcon(message)}
              </div>
            </div>

          ) : isSystem ? (

            /* ---------------- SYSTEM MESSAGE ---------------- */
            <div className="text-xs italic">
              {message.text}
            </div>

          ) : (

            /* ---------------- NORMAL TEXT MESSAGE ---------------- */
            <div className="space-y-1">
              <p className="break-words">{message.text}</p>
              <div className="flex items-center justify-end space-x-1">
                <span className="text-xs opacity-70">
                  {formatTimestamp(message.timestamp)}
                </span>
                {getStatusIcon(message)}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // ---------------- RETURN UI ----------------
  return (
    <div
      className={`flex-1 overflow-y-auto p-4 ${
        theme.mode === "dark"
          ? "bg-gray-900/50"
          : "bg-gray-50"
      }`}
      style={{ 
        height: '100%',
        overflowY: 'auto',
        scrollBehavior: 'smooth' 
      }}
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">
            No messages yet. Start the conversation!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {renderMessageContent(message)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;