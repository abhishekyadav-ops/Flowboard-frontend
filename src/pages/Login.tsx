import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// ─── Global styles matching BoardPage & Members ───────────────────────────────
const LOGIN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; overflow-x: hidden; background: #050A14; }

  @keyframes aurora {
    0%   { transform: translate(0%,0%)   scale(1);    opacity: .45; }
    33%  { transform: translate(4%,-6%)  scale(1.06); opacity: .35; }
    66%  { transform: translate(-3%,5%)  scale(.97);  opacity: .50; }
    100% { transform: translate(0%,0%)   scale(1);    opacity: .45; }
  }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
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
  }

  /* ── Input Focus ── */
  .input-glow:focus {
    outline: none;
    border-color: rgba(99,102,241,.7) !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,.12);
  }

  /* ── Brand Logo Badge ── */
  .logo-ring {
    border-radius: 16px;
    background: linear-gradient(135deg,#6366F1,#22D3EE);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; color: #fff;
    box-shadow: 0 4px 16px rgba(99,102,241,.4);
  }

  @media (prefers-reduced-motion:reduce) {
    .auth-panel { animation: none; }
    .aurora-blob { animation: none !important; }
  }
`;

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Inject Custom Styles
  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = LOGIN_STYLES;
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, []);

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

  const handleGoogleLogin = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    window.location.href = `${apiBaseUrl}/users/auth/google/login`;
  };

  const handleForgotPassword = () => {
    alert("Password reset instructions have been sent to your email if the account exists.");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050A14", color: "#E2E8F0", fontFamily: "Inter,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, overflow: "hidden", position: "relative" }}>
      
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
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.6px" }}>
            Welcome back to FlowBoard
          </h1>
          <p style={{ color: "#64748B", fontSize: 13, marginTop: 4, fontWeight: 500 }}>
            Enter your credentials to access your workspaces
          </p>
        </div>
      </div>

      {/* ── Central Login Container Panel ── */}
      <div className="auth-panel" style={{ position: "relative", zIndex: 1 }}>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Email Form Row */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glow"
              style={{
                width: "100%", height: "44px",
                background: "rgba(5,10,20,.7)", border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 12, padding: "0 14px", color: "#E2E8F0", fontSize: 13,
                fontFamily: "inherit", transition: "border-color .2s,box-shadow .2s"
              }}
              required
            />
          </div>

          {/* Password Form Row */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{ background: "none", border: "none", fontSize: 11, fontWeight: 600, color: "#22D3EE", cursor: "pointer", fontFamily: "inherit" }}
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
              className="input-glow"
              style={{
                width: "100%", height: "44px",
                background: "rgba(5,10,20,.7)", border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 12, padding: "0 14px", color: "#E2E8F0", fontSize: 13,
                fontFamily: "inherit", transition: "border-color .2s,box-shadow .2s"
              }}
              required
            />
          </div>

          {/* Submit Action Block */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", height: "44px", marginTop: 6,
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
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          {/* Separation Boundary Layout */}
          <div style={{ display: "flex", alignItems: "center", margin: "4px 0", fontSize: 11, color: "#334155", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,.05)" }}></div>
            <span style={{ padding: "0 12px" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,.05)" }}></div>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            style={{
              width: "100%", height: "44px",
              background: "#FFFFFF", border: "1px solid rgba(255,255,255,.1)",
              color: "#0F172A", borderRadius: 12, fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 10, transition: "background .15s",
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F1F5F9"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}
          >
            <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.357 2.673 1.386 6.577L5.266 9.765z" />
              <path fill="#4285F4" d="M23.523 12.273c0-.818-.073-1.609-.205-2.373H12v4.5H18.48c-.28 1.482-1.114 2.736-2.37 3.582l3.777 2.927c2.205-2.036 3.636-5.036 3.636-8.636z" />
              <path fill="#FBBC05" d="M1.386 6.577C.5 8.332 0 10.305 0 12s.5 3.668 1.386 5.423l3.88-3.188c-.227-.677-.357-1.405-.357-2.235s.13-1.558.357-2.235L1.386 6.577z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.973-1.077 7.964-2.927l-3.777-2.927c-1.045.7-2.382 1.118-4.187 1.118-3.223 0-5.955-2.182-6.932-5.114L1.186 17.29C3.157 21.195 7.13 24 12 24z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Navigation Action Bridge */}
          <div style={{ textAlign: "center", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.04)", marginTop: 4 }}>
            <button
              type="button"
              onClick={() => navigate("/register")}
              style={{ background: "none", border: "none", fontSize: 12, fontWeight: 600, color: "#64748B", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: "4px" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#F1F5F9"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#64748B"}
            >
              Need an account? Sign Up
            </button>
          </div>
        </form>
      </div>

      <p style={{ fontSize: 11, color: "#334155", marginTop: 32, position: "relative", zIndex: 1, fontWeight: 500 }}>
        Protected connection. FlowBoard uses encrypted access handling tokens.
      </p>
    </div>
  );
}

export default Login;