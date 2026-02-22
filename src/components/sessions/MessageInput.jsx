import React, { useState, useRef } from "react";
import {
  FiPaperclip,
  FiSend,
  FiChevronUp,
  FiChevronDown,
  FiBookOpen,
  FiStar,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

const MessageInput = ({
  onSendMessage,
  onSendResource,
  mySkillsToTeach = [],
  mySkillsToLearn = [],
}) => {
  const { theme } = useTheme();
  const [message, setMessage]       = useState("");
  const [showSkills, setShowSkills] = useState(false);
  const fileInputRef                = useRef(null);
  const inputRef                    = useRef(null);
  const dark                        = theme.mode === "dark";

  const hasSkills = mySkillsToTeach.length > 0 || mySkillsToLearn.length > 0;

  // ── Send typed message ───────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setMessage("");
    inputRef.current?.focus();
  };

  // ── Tap a skill chip → fill message box ─────────────────────────────────
  const handleSkillClick = (skill, type) => {
    const text =
      type === "teach"
        ? `I can teach you ${skill}! `
        : `I want to learn ${skill}. Can you help? `;
    setMessage(text);
    setShowSkills(false);
    inputRef.current?.focus();
  };

  // ── File attachment ──────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (onSendResource) {
      onSendResource({ url: URL.createObjectURL(file), title: file.name, type: file.type });
    }
    e.target.value = "";
  };

  return (
    <div
      className={`border-t ${
        dark ? "border-gray-700 bg-gray-800/80" : "border-gray-200 bg-white/80"
      } backdrop-blur-lg`}
    >
      {/* ── Skills panel ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSkills && (
          <motion.div
            key="skills-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`overflow-hidden border-b ${
              dark ? "border-gray-700" : "border-gray-100"
            }`}
          >
            <div className="px-4 pt-3 pb-3 space-y-3">

              {/* I Can Teach */}
              {mySkillsToTeach.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 mb-2 flex items-center gap-1">
                    <FiStar className="h-3 w-3" /> I Can Teach
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mySkillsToTeach.map((skill) => (
                      <motion.button
                        key={`teach-${skill}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => handleSkillClick(skill, "teach")}
                        className="px-3 py-1 rounded-full text-xs font-medium
                          bg-gradient-to-r from-indigo-100 to-purple-100
                          text-indigo-700
                          dark:from-indigo-900/60 dark:to-purple-900/60
                          dark:text-indigo-300
                          hover:from-indigo-200 hover:to-purple-200
                          dark:hover:from-indigo-800 dark:hover:to-purple-800
                          border border-indigo-200 dark:border-indigo-700
                          shadow-sm transition-all"
                      >
                        {skill}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* I Want to Learn */}
              {mySkillsToLearn.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-500 dark:text-green-400 mb-2 flex items-center gap-1">
                    <FiBookOpen className="h-3 w-3" /> I Want to Learn
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mySkillsToLearn.map((skill) => (
                      <motion.button
                        key={`learn-${skill}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => handleSkillClick(skill, "learn")}
                        className="px-3 py-1 rounded-full text-xs font-medium
                          bg-gradient-to-r from-green-100 to-teal-100
                          text-green-700
                          dark:from-green-900/60 dark:to-teal-900/60
                          dark:text-green-300
                          hover:from-green-200 hover:to-teal-200
                          dark:hover:from-green-800 dark:hover:to-teal-800
                          border border-green-200 dark:border-green-700
                          shadow-sm transition-all"
                      >
                        {skill}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* No skills yet */}
              {!hasSkills && (
                <p className="text-xs text-gray-400 dark:text-gray-500 py-1">
                  No skills added yet.{" "}
                  <a href="/profile" className="underline text-indigo-500">
                    Add them in your profile
                  </a>{" "}
                  to see them here.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input bar ─────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="p-3 flex items-center gap-2">

        {/* Attach */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 rounded-full flex-shrink-0 ${
            dark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"
          }`}
          title="Attach file"
        >
          <FiPaperclip className="h-5 w-5" />
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </motion.button>

        {/* Skills toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => setShowSkills(!showSkills)}
          title={showSkills ? "Hide skills" : "Show my skills"}
          className={`flex items-center gap-0.5 px-2 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-colors ${
            showSkills
              ? "bg-indigo-600 text-white"
              : dark
              ? "hover:bg-gray-700 text-gray-400 border border-gray-600"
              : "hover:bg-gray-100 text-gray-500 border border-gray-200"
          }`}
        >
          <FiStar className="h-3.5 w-3.5" />
          <span className="ml-1 hidden sm:inline">Skills</span>
          {showSkills ? (
            <FiChevronDown className="h-3 w-3 ml-0.5" />
          ) : (
            <FiChevronUp className="h-3 w-3 ml-0.5" />
          )}
        </motion.button>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            showSkills ? "Click a skill chip above…" : "Type a message…"
          }
          className={`flex-1 rounded-full px-4 py-2 focus:outline-none border focus:ring-2 focus:ring-indigo-500 text-sm ${
            dark
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          }`}
        />

        {/* Send */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!message.trim()}
          className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          <FiSend className="h-5 w-5" />
        </motion.button>
      </form>
    </div>
  );
};

export default MessageInput;
