import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email.trim());
      formData.append("password", password);

      const response = await api.post("/users/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login context failed:", error);
      const errorMessage = error?.response?.data?.detail || "Invalid email or password. Please try again.";
      alert(errorMessage);
    } finally {
      
      setLoading(false);
    }
  };

  // 🌟 Google Redirect Handler
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/users/auth/google/login";
  };

  const handleForgotPassword = () => {
    alert("Password reset instructions have been sent to your email if the account exists.");
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Brand Identity Header */}
      <div className="flex flex-col items-center gap-3 mb-8 relative z-10 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-600/30">
          F
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Welcome back to FlowBoard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Enter your credentials to access your workspaces
          </p>
        </div>
      </div>

      {/* Glassmorphic Login Card */}
      <div className="w-full max-w-md bg-[#111827]/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-slate-700/80">
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          
          {/* Email Input */}
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
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              required
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          {/* 🌟 Visual Divider */}
          <div className="flex items-center my-1 text-xs text-slate-500 uppercase tracking-wider">
            <div className="flex-1 h-[1px] bg-slate-800"></div>
            <span className="px-3">or</span>
            <div className="flex-1 h-[1px] bg-slate-800"></div>
          </div>

          {/* 🌟 Google Identity Action Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-3 border border-slate-200 shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.357 2.673 1.386 6.577L5.266 9.765z"
              />
              <path
                fill="#4285F4"
                d="M23.523 12.273c0-.818-.073-1.609-.205-2.373H12v4.5H18.48c-.28 1.482-1.114 2.736-2.37 3.582l3.777 2.927c2.205-2.036 3.636-5.036 3.636-8.636z"
              />
              <path
                fill="#FBBC05"
                d="M1.386 6.577C.5 8.332 0 10.305 0 12s.5 3.668 1.386 5.423l3.88-3.188c-.227-.677-.357-1.405-.357-2.235s.13-1.558.357-2.235L1.386 6.577z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.973-1.077 7.964-2.927l-3.777-2.927c-1.045.7-2.382 1.118-4.187 1.118-3.223 0-5.955-2.182-6.932-5.114L1.186 17.29C3.157 21.195 7.13 24 12 24z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* New Register Bridge Navigation option */}
          <div className="text-center pt-2 border-t border-slate-800/60 mt-2">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors underline underline-offset-4"
            >
              Need an account? Sign Up
            </button>
          </div>
        </form>
      </div>

      <p className="text-xs text-slate-500 mt-8 relative z-10">
        Protected connection. FlowBoard uses encrypted access handling tokens.
      </p>
    </div>
  );
}

export default Login;