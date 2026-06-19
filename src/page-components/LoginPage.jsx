"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn, Mail, Eye, EyeOff, X, User, ArrowRight, Key } from "lucide-react";
import { authAPI } from "../lib/api";
import { useStore } from "../store/useStore";

export default function AuthPage({ isModal = false, onClose = null, onSuccess = null }) {
  const router = useRouter();
  const { setUser } = useStore();

  // States: 'login', 'register', 'forgot'
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({ identifier: "", password: "", username: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 1. Close on ESC
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape" && isModal && onClose) onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModal, onClose]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 2. Main Submit Logic (Login & Register)
 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        // STEP 1: Basic Login to get JWT
        const loginRes = await authAPI.login({
          identifier: formData.identifier,
          password: formData.password,
        });

        const { jwt, user: basicUser } = loginRes;

        if (!basicUser.confirmed) {
          setError("Please verify your email before logging in.");
          setLoading(false);
          return;
        }

        // STEP 2: Double Fetch - Get Full Profile with Role & Avatar
        // Hum native fetch use kar rahe hain taaki apiClient ka interceptor beech mein na aaye
       const baseUrl = process.env.STRAPI_BACKEND_URL || "https://admin.entertainindia.com/";
        
        // Yahan wahi URL use kiya hai jo Postman mein chal raha hai
        const fullProfileRes = await fetch(`${baseUrl}/api/users/me?populate[role]=true&populate[avatar][populate]=*`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwt}`, // Token yahan se ja raha hai
            'Content-Type': 'application/json'
          }
        });

        if (!fullProfileRes.ok) throw new Error("Profile fetch failed");

        const fullUser = await fullProfileRes.json();

        // STEP 3: Store updated user and JWT
        handleAuthSuccess(fullUser, jwt);
      }

      if (mode === "register") {
        await authAPI.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        alert("Verification email sent. Please check your inbox.");
        setMode("login");
      }
    // ... existing code inside handleSubmit ...
} catch (err) {
  console.error("Auth Error:", err);

  // Strapi standard error structure: err.response.data.error.message
  let errorMessage = "Action failed. Please try again.";

  if (err.response?.data?.error?.message) {
    errorMessage = err.response.data.error.message;
  } else if (err.message) {
    errorMessage = err.message;
  }


  if (errorMessage.toLowerCase().includes("email might be already taken") || 
      errorMessage.toLowerCase().includes("username already taken") ||
      errorMessage.toLowerCase().includes("this attribute must be unique")) {
    
    setError("This username or email is already registered. Please try a different one.");
  } else if (errorMessage === "Internal Server Error") {
setError("Invalid email or password. Please try again.");  } else {
    setError(errorMessage);
  }

} finally {
  setLoading(false);
}
  };

  // 3. Forgot Password Logic (Sending Email)
  const handleForgotPassword = async () => {
    const email = mode === "register" ? formData.email : formData.identifier;
    if (!email) return setError("Please enter your email address first.");

    setLoading(true);
    try {
      // Strapi endpoint: /api/auth/forgot-password
      await authAPI.resetPassword(email);
      alert("Password reset link sent! Please check your email inbox.");
      setMode("login");
    } catch (err) {
      setError("Could not send reset email. Make sure the email is correct.");
    } finally {
      setLoading(false);
    }
  };


  const login = useStore((state) => state.login);

  const handleAuthSuccess = (user, jwt) => {
    login(user, jwt); // Zustand store mein data save hoga

    // Check role name from populated data
    const userRole = user.role?.name;

    console.log("Logged in user role:", userRole);

    if (userRole === "Author") {
      router.push("/"); // Author ke liye
    } else {
      router.push("/profile"); // Normal user ke liye
    }

    if (onSuccess) onSuccess(user, jwt);
    if (isModal && onClose) onClose();
  };
  // Strapi Connect URL
  const STRAPI_URL = process.env.STRAPI_BACKEND_URL || "https://admin.entertainindia.com";

  const loginWithStrapiProvider = (provider) => {

    window.location.href = `${STRAPI_URL}/api/connect/${provider}`;
  };

  return (
    <div className={isModal ? "w-full" : "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 flex items-center justify-center p-4"}>
      <div className="max-w-md w-full bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600"></div>

        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-500/30">
                {mode === "login" ? <LogIn className="text-pink-400" /> : mode === "register" ? <User size={16} className="text-pink-400 " /> : <Key size={16} className="text-pink-400" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white capitalize">{mode === 'forgot' ? 'Reset Link' : mode}</h1>
                <p className="text-gray-400 text-sm">Welcome to our platform</p>
              </div>
            </div>
            {isModal && <X onClick={onClose} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />}
          </div>

          {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm flex gap-2"><X size={16} /> {error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            {mode === "register" && (
              <InputGroup label="Username" icon={<User size={18} />} name="username" type="text" placeholder="Your name" onChange={handleChange} />
            )}

            <InputGroup
              label="Email Address"
              icon={<Mail size={18} />}
              name={mode === "register" ? "email" : "identifier"}
              type="email"
              placeholder="you@example.com"
              onChange={handleChange}
            />

            {mode !== "forgot" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 text-pink-400"><Lock size={18} /></div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="passwaord"
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg focus:ring-2 focus:ring-pink-500/50 outline-none transition-all"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-white">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button type="button" onClick={() => setMode("forgot")} className="text-sm text-pink-400 hover:text-pink-300 transition-colors">Forgot Password?</button>
              </div>
            )}

            <button
              type={mode === "forgot" ? "button" : "submit"}
              onClick={mode === "forgot" ? handleForgotPassword : null}
              disabled={loading}
              className="w-full py-4 mb-4 mt-8 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg font-bold shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? "Processing..." : mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Send Reset Email"}
            </button>
          </form>
          <p className="mt-4 mb-4 text-sm text-center text-gray-400">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-pink-400 font-bold hover:underline ml-1">
              {mode === "login" ? "Register" : "Login"}
            </button>
          </p>
          {/* Social Logins */}
         


        </div>
      </div>
    </div>
  );
}


function InputGroup({ label, icon, ...props }) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="relative group">
        <div className="absolute left-3 top-3.5 text-pink-400">{icon}</div>
        <input {...props} className="w-full pl-12 pr-4 py-3.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg focus:ring-2 focus:ring-pink-500/50 outline-none transition-all placeholder:text-gray-500" required />
      </div>
    </div>
  );
}

function SocialIconBtn({ onClick, img, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3
                 py-3 px-4
                 bg-gray-800 border-1 text-white
                 rounded-lg
                 font-semibold
                 shadow-md
                 hover:bg-gray-850
                 transition-all duration-200"
    >
      {img ? (
        <img src={img} className="w-5 h-5" alt={label} />
      ) : (
        <div className="w-5 h-5 flex items-center justify-center">
          {icon}
        </div>
      )}
      <span>{label}</span>
    </button>
  );
}
