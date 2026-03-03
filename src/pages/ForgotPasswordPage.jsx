import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await resetPassword(email);
      toast.success("Password reset email sent! Check your Gmail.");
    } catch (error) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        theme.mode === "dark"
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-indigo-50 to-gray-50"
      } px-4`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-md w-full p-8 rounded-2xl shadow-xl ${
          theme.mode === "dark"
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Forgot Password
        </h2>

        <form onSubmit={handleReset} className="space-y-6">
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;