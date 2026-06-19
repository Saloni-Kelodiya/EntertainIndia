"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import { Eye, EyeOff,  } from "lucide-react";
import Link from "next/link";
import { authAPI } from "../lib/api";
import { useStore } from "../store/useStore";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useStore();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await authAPI.register(formData);
      // setUser(data.user);
      alert("Please verify your email before logging in.");
      router.push("/login");
    } catch (err) {
      setError(
        "Registration failed. Please ensure the email/username is not already in use."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SEO Title */}
      <title>Register - EntertainIndia</title>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex items-center justify-center pt-20 pb-12">
        <div className="max-w-md w-full mx-auto bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 md:p-10 shadow-2xl border border-pink-700/50">
          <div className="text-center mb-8">
            <UserPlus className="w-10 h-10 mx-auto text-yellow-500 mb-3" />
            <h1 className="text-4xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
              Create Account
            </h1>
            <p className="text-gray-400 mt-1">
              Join us for the latest entertainment updates.
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 text-red-300 p-4 rounded-lg mb-6 border border-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                Username
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Your unique username"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                />
              </div>
            </div>

          {/* Password */}
<div>
  <label className="block text-sm font-semibold mb-2 text-gray-300">
    Password
  </label>
  <div className="relative">
    <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400" />
    <input
      type={showPassword ? "text" : "password"} // <-- toggle type
      name="password"
      value={formData.password}
      onChange={handleChange}
      required
      minLength="6"
      placeholder="Must be at least 6 characters"
      className="w-full pl-10 pr-10 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  </div>
</div>


            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 text-lg font-bold text-white rounded-lg shadow-lg 
              bg-gradient-to-r from-pink-600 to-purple-600 
              hover:from-pink-700 hover:to-purple-700 transition-all 
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "CREATING ACCOUNT..." : "REGISTER NOW"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-yellow-400 hover:text-pink-400 font-semibold transition-colors"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
