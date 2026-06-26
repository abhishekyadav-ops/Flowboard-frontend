import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// ─── Global styles matching BoardPage & Members ───────────────────────────────
const LOGIN_SUCCESS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; overflow: hidden; background: #050A14; }

  @keyframes aurora {
    0%   { transform: translate(0%,0%)   scale(1);    opacity: .45; }
    33%  { transform: translate(4%,-6%)  scale(1.06); opacity: .35; }
    66%  { transform: translate(-3%,5%)  scale(.97);  opacity: .50; }
    100% { transform: translate(0%,0%)   scale(1);    opacity: .45; }
  }
  @keyframes scaleIn  { from { opacity:0; transform:scale(.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes pulse    { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }

  /* ── Center Container Card ── */
  .auth-card {
    background: linear-gradient(160deg,#0D1830 0%,#0A1220 100%);
    border: 1px solid rgba(99,102,241,.15);
    border-radius: 24px;
    padding: 40px;
    width: 100%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 32px 64px rgba(0,0,0,.6);
    animation: scaleIn .3s cubic-bezier(.22,.68,0,1.2) both;
  }

  .spinner-ring {
    width: 44px; height: 44px;
    border-radius: 50%;
    border: 3px solid rgba(99,102,241,.15);
    border-top-color: #6366F1;
    animation: spin .8s linear infinite;
    margin: 0 auto 20px;
  }

  @media (prefers-reduced-motion:reduce) {
    .aurora-blob { animation:none !important; }
  }
`;

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Inject CSS once
  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = LOGIN_SUCCESS_STYLES;
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // 1. Flush and explicitly set the token down into storage
      localStorage.setItem("token", token);
      
      // 2. Use replace: true to clear out the oauth parameters from the history stack
      navigate("/workspaces", { replace: true });
    } else {
      alert("Authentication token not found. Redirecting to login.");
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "#050A14", color: "#E2E8F0", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflow: "hidden", position: "relative" }}>
      
      {/* Aurora background blobs */}
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

      {/* ── Central Loader Card ── */}
      <div className="auth-card" style={{ position: "relative", zIndex: 1 }}>
        <div className="spinner-ring" />
        
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.4px", marginBottom: 6 }}>
          Verifying Google Session...
        </h2>
        
        <p style={{ fontSize: 13, color: "#64748B", fontWeight: 500, animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
          Syncing user profile logs with FlowBoard servers
        </p>
      </div>

    </div>
  );
}