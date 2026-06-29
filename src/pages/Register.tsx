import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// ─── Global styles matching BoardPage, Members & Login (With Complete Light Theme Support) ───
const REGISTER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; overflow-x: hidden; background: #050A14; transition: background .4s; }

  /* ── Fix: Target root/body selectors correctly for global background shift ── */
  body.light, [data-theme="light"] body, html[data-theme="light"] body {
    background: #F8FAFC !important;
  }

  @keyframes aurora {
    0%   { transform: translate(0%,0%)   scale(1);    opacity: .45; }
    33%  { transform: translate(4%,-6%)  scale(1.06); opacity: .35; }
    66%  { transform: translate(-3%,5%)  scale(.97);  opacity: .50; }
    100% { transform: translate(0%,0%)   scale(1);    opacity: .45; }
  }
  @keyframes shake    { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-4px); } 40%, 80% { transform: translateX(4px); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes spin     { to { transform:rotate(360deg); } }

  /* ── Auth Card Panel ── */
  .auth-panel {
    background: linear-gradient(160deg,#0D1830 0%,#0A1220 100%);
    border: 1px solid rgba(99,102,241,.12);
    border-radius: 24px;
    padding: 32px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 24px 64px rgba(0,0,0,.5);
    animation: scaleIn .35s cubic-bezier(.22,.68,0,1.2) both;
    transition: background .4s, border-color .4s, box-shadow .4s;
  }
  .light .auth-panel, [data-theme="light"] .auth-panel, body.light .auth-panel {
    background: #FFFFFF !important;
    border: 1px solid rgba(99,102,241,.15) !important;
    box-shadow: 0 20px 40px rgba(99,102,241,.05) !important;
  }

  /* ── Input Glow & Focus ── */
  .input-glow {
    transition: border-color .2s, box-shadow .2s, background .4s, color .3s;
  }
  .light .input-glow, [data-theme="light"] .input-glow, body.light .input-glow {
    background: #F1F5F9 !important;
    border: 1px solid rgba(0, 0, 0, .08) !important;
    color: #0F172A !important;
  }
  .input-glow:focus {
    outline: none;
    border-color: rgba(99,102,241,.7) !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,.12) !important;
  }

  /* ── Brand Logo Badge ── */
  .logo-ring {
    border-radius: 16px;
    background: linear-gradient(135deg,#6366F1,#22D3EE);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; color: #fff;
    box-shadow: 0 4px 16px rgba(99,102,241,.4);
  }

  .shake-banner {
    animation: shake 0.4s ease both;
  }

  /* ── Light Mode Form Dynamic Typographies ── */
  .light .main-heading, [data-theme="light"] .main-heading, body.light .main-heading { color: #0F172A !important; }
  .light .sub-heading, [data-theme="light"] .sub-heading, body.light .sub-heading { color: #64748B !important; }
  .light .footer-notice, [data-theme="light"] .footer-notice, body.light .footer-notice { color: #94A3B8 !important; }

  @media (prefers-reduced-motion:reduce) {
    .auth-panel, .shake-banner { animation: none; }
    .aurora-blob { animation: none !important; }
  }
`;

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Track theme changes directly in local state
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem("theme") === "light";
  });

  // Sync state changes directly to the page document structure
  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light");
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    }
  }, [isLightMode]);

  // Inject Dynamic Custom Stylesheet
  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = REGISTER_STYLES;
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, []);

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
    <div style={{ minHeight: "100vh", color: isLightMode ? "#0F172A" : "#E2E8F0", fontFamily: "Inter,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflowX: "hidden", position: "relative" }}>
      
      {/* ── Theme Switching Control Button ── */}
      <button
        type="button"
        onClick={() => setIsLightMode(!isLightMode)}
        style={{
          position: "absolute", top: 24, right: 24, zIndex: 10,
          background: isLightMode ? "#FFFFFF" : "#0D1830",
          color: isLightMode ? "#0F172A" : "#E2E8F0",
          border: `1px solid ${isLightMode ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 12, padding: "8px 16px", fontSize: 12, fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all .3s"
        }}
      >
        {isLightMode ? (
          <>
            <span>🌙</span> Dark Mode
          </>
        ) : (
          <>
            <span>☀️</span> Light Mode
          </>
        )}
      </button>

      {/* Aurora Ambient blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {[
          { top: "-15%", left: "15%",  w: 500, h: 500, color: "rgba(99,102,241,.14)", dur: "20s", delay: "0s",  rev: false },
          { top: "55%",  right: "8%",  w: 420, h: 420, color: "rgba(34,211,238,.10)", dur: "25s", delay: "2s",  rev: true  },
        ].map((b, i) => (
          <div key={i} className="aurora-blob" style={{
            position: "absolute",
            top: b.top, left: (b as any).left, right: (b as any).right,
            width: b.w, height: b.h, borderRadius: "50%",
            background: `radial-gradient(ellipse,${b.color} 0%,transparent 70%)`,
            animation: `aurora ${b.dur} ease-in-out infinite ${b.delay}${b.rev ? " reverse" : ""}`,
            filter: "blur(50px)",
          }} />
        ))}
      </div>

      {/* ── Brand Header ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 32, position: "relative", zIndex: 1, textAlign: "center", animation: "fadeIn .5s ease both" }}>
        <div className="logo-ring" style={{ width: 52, height: 52, fontSize: 22 }}>F</div>
        <div>
          <h1 className="main-heading" style={{ fontSize: 28, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.6px", transition: "color .3s" }}>
            Create Your Account
          </h1>
          <p className="sub-heading" style={{ color: "#64748B", fontSize: 13, marginTop: 4, fontWeight: 500, transition: "color .3s" }}>
            Get started with FlowBoard project optimization management today
          </p>
        </div>
      </div>

      {/* ── Central Registration Container Panel ── */}
      <div className="auth-panel" style={{ position: "relative", zIndex: 1 }}>
        
        {/* Feedback Banners */}
        {error && (
          <div className="shake-banner" style={{
            marginBottom: 16, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)",
            color: "#F87171", padding: "12px 14px", borderRadius: 12, fontSize: 13, fontWeight: 500, textAlign: "left"
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            marginBottom: 16, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.25)",
            color: "#4ADE80", padding: "12px 14px", borderRadius: 12, fontSize: 13, fontWeight: 500, textAlign: "left"
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Full Name Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="name" style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              autoComplete="name"
              placeholder="John Doe"
              value={name}
              disabled={loading}
              onChange={(e) => setName(e.target.value)}
              className="input-glow"
              style={{
                width: "100%", height: "44px",
                background: "rgba(5,10,20,.7)", border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 12, padding: "0 14px", color: "#E2E8F0", fontSize: 13,
                fontFamily: "inherit", opacity: loading ? 0.5 : 1
              }}
              required
            />
          </div>

          {/* Email Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="email" style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="username"
              placeholder="name@company.com"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glow"
              style={{
                width: "100%", height: "44px",
                background: "rgba(5,10,20,.7)", border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 12, padding: "0 14px", color: "#E2E8F0", fontSize: 13,
                fontFamily: "inherit", opacity: loading ? 0.5 : 1
              }}
              required
            />
          </div>

          {/* Password Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="password" style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className="input-glow"
              style={{
                width: "100%", height: "44px",
                background: "rgba(5,10,20,.7)", border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 12, padding: "0 14px", color: "#E2E8F0", fontSize: 13,
                fontFamily: "inherit", opacity: loading ? 0.5 : 1
              }}
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="confirmPassword" style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              disabled={loading}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-glow"
              style={{
                width: "100%", height: "44px",
                background: "rgba(5,10,20,.7)", border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 12, padding: "0 14px", color: "#E2E8F0", fontSize: 13,
                fontFamily: "inherit", opacity: loading ? 0.5 : 1
              }}
              required
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", height: "44px", marginTop: 8,
              background: "linear-gradient(135deg,#6366F1,#4F46E5)", border: "none",
              color: "#fff", borderRadius: 12, fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(99,102,241,.3)",
              opacity: loading ? 0.6 : 1, transition: "opacity .2s"
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,.2)", borderTopColor: "#fff", animation: "spin .8s linear infinite" }} />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Get Started</span>
            )}
          </button>

          {/* Account Redirection Bridge */}
          <div style={{ textAlign: "center", paddingTop: 10 }}>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{ background: "none", border: "none", fontSize: 12, fontWeight: 600, color: "#64748B", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: "4px" }}
              onMouseEnter={(e) => e.currentTarget.style.color = isLightMode ? "#0F172A" : "#F1F5F9"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#64748B"}
            >
              Already have an account? Sign In
            </button>
          </div>

        </form>
      </div>

      <p className="footer-notice" style={{ fontSize: 11, color: "#334155", marginTop: 24, position: "relative", zIndex: 1, fontWeight: 500, transition: "color .3s" }}>
        By registering, you agree to access guidelines.
      </p>
    </div>
  );
}

export default Register;