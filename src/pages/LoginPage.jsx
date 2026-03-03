import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import AuthIllustration from "../assets/auth.svg";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await login(email, password);
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
      toast.success("Logged in with Google!");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        theme.mode === "dark"
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-indigo-50 to-gray-50"
      } py-12 px-4`}
    >
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-16">
        
        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex items-center justify-center"
        >
          <img
            src={AuthIllustration}
            alt="Authentication illustration"
            className="w-full max-w-lg"
          />
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`max-w-md w-full mx-auto p-8 rounded-2xl shadow-xl ${
            theme.mode === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Email Input */}
            <input
              type="email"
              required
              placeholder="Email address"
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                theme.mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  theme.mode === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Show/Hide Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-sm text-gray-500 hover:text-indigo-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t"></div>
            <span className="mx-4 text-sm text-gray-500">OR</span>
            <div className="flex-grow border-t"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;