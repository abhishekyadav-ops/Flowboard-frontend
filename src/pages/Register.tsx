import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("Password must contain at least one special character");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/users/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
      });

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error: any) {
      const detail = error?.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || "Registration failed");
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Brand Identity Header */}
      <div className="flex flex-col items-center gap-3 mb-8 relative z-10 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-600/30">
          F
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Create Your Account
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Get started with FlowBoard project optimization management today
          </p>
        </div>
      </div>

      {/* Glassmorphic Register Card Container */}
      <div className="w-full max-w-md bg-[#111827]/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-slate-700/80">
        
        {/* Inline Feedback Error and Success banners */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Full Name Input Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              disabled={loading}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm disabled:opacity-50"
              required
            />
          </div>

          {/* Email Input Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm disabled:opacity-50"
              required
            />
          </div>

          {/* Password Input Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm disabled:opacity-50"
              required
            />
          </div>

          {/* Confirm Password Input Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              disabled={loading}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm disabled:opacity-50"
              required
            />
          </div>

          {/* Submit Action trigger button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 pt-3"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Get Started</span>
            )}
          </button>

          {/* Direct Redirection back to sign-in interface */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors underline underline-offset-4"
            >
              Already have an account? Sign In
            </button>
          </div>

        </form>
      </div>

      <p className="text-xs text-slate-500 mt-6 relative z-10">
        By registering, you agree to access guidelines.
      </p>
    </div>
  );
}

export default Register;