import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Workspace {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  created_at: string;
  updated_at?: string;
  owner?: { id: number; name: string; email: string };
}

interface DashboardStats {
  activeBoards: number;
  teamMembers: number;
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const DARK = {
  pageBg:       "#050A14",
  navBg:        "rgba(5,10,20,.85)",
  navBorder:    "rgba(255,255,255,.06)",
  cardBg:       "linear-gradient(145deg,#0D1830 0%,#0A1220 100%)",
  cardBorder:   "rgba(99,102,241,.12)",
  cardHover:    "rgba(99,102,241,.45)",
  statBg:       "linear-gradient(145deg,#0D1830,#090E1A)",
  statBorder:   "rgba(255,255,255,.06)",
  createBg:     "linear-gradient(145deg,#0D1830 0%,#0A1220 100%)",
  createBorder: "rgba(99,102,241,.18)",
  inputBg:      "rgba(5,10,20,.60)",
  inputBorder:  "rgba(255,255,255,.08)",
  text:         "#E2E8F0",
  textMuted:    "#475569",
  textSub:      "#64748B",
  textLabel:    "#6366F1",
  accent:       "#6366F1",
  accentSoft:   "rgba(99,102,241,.15)",
  accentBorder: "rgba(99,102,241,.25)",
  accentText:   "#818CF8",
  tagBg:        "rgba(99,102,241,.12)",
  tagBorder:    "rgba(99,102,241,.25)",
  tagText:      "#A5B4FC",
  idBg:         "rgba(255,255,255,.04)",
  idBorder:     "rgba(255,255,255,.07)",
  idText:       "#475569",
  divider:      "rgba(255,255,255,.05)",
  openText:     "#6366F1",
  emptyBorder:  "rgba(99,102,241,.2)",
  emptyBg:      "rgba(99,102,241,.03)",
  emptyText:    "#475569",
  emptySub:     "#334155",
  modalBg:      "linear-gradient(160deg,#0D1830 0%,#0A1220 100%)",
  modalBorder:  "rgba(239,68,68,.2)",
  toggleBg:     "rgba(255,255,255,.06)",
  toggleBorder: "rgba(255,255,255,.10)",
  toggleText:   "#94A3B8",
  shadow:       "0 20px 60px rgba(99,102,241,.12),0 4px 20px rgba(0,0,0,.4)",
  aurora: [
    "rgba(99,102,241,.18)",
    "rgba(34,211,238,.12)",
    "rgba(139,92,246,.10)",
  ],
};

const LIGHT = {
  pageBg:       "#F0F2F8",
  navBg:        "rgba(226,231,243,.85)", // Light bluish tinted glass navbar
  navBorder:    "rgba(99,102,241,.16)",
  
  // Workspace Cards
  cardBg:       "linear-gradient(145deg, #E2E7F3 0%, #D4DBEC 100%)",
  cardBorder:   "rgba(99, 102, 241, 0.3)",
  cardHover:    "rgba(99, 102, 241, 0.55)",
  
  // Stat Cards (Now updated to match your solid darker style)
  statBg:       "linear-gradient(145deg, #E2E7F3, #D4DBEC)",
  statBorder:   "rgba(99, 102, 241, 0.25)",
  
  // Create Panel (Now updated to match your solid darker style)
  createBg:     "linear-gradient(145deg, #E2E7F3 0%, #D4DBEC 100%)",
  createBorder: "rgba(99, 102, 241, 0.35)",
  
  inputBg:      "rgba(255,255,255,.85)",
  inputBorder:  "rgba(99,102,241,.25)",
  
  // Perfect deep slate contrast typography applied globally
  text:         "#0F172A", 
  textMuted:    "#334155", 
  textSub:      "#475569", 
  textLabel:    "#4F46E5",
  accent:       "#4F46E5",
  accentSoft:   "rgba(99,102,241,.12)",
  accentBorder: "rgba(99,102,241,.25)",
  accentText:   "#4F46E5",
  tagBg:        "rgba(99,102,241,.12)",
  tagBorder:    "rgba(99,102,241,.25)",
  tagText:      "#4F46E5",
  idBg:         "rgba(99,102,241,.10)",
  idBorder:     "rgba(99,102,241,.20)",
  idText:       "#475569",
  divider:      "rgba(99,102,241,.25)", // Crisper card inner dividers
  openText:     "#4F46E5",
  emptyBorder:  "rgba(99,102,241,.3)",
  emptyBg:      "rgba(99,102,241,.06)",
  emptyText:    "#334155",
  emptySub:     "#475569",
  modalBg:      "linear-gradient(160deg,#E2E7F3 0%,#D4DBEC 100%)",
  modalBorder:  "rgba(239,68,68,.3)",
  toggleBg:     "rgba(99,102,241,.12)",
  toggleBorder: "rgba(99,102,241,.22)",
  toggleText:   "#4F46E5",
  shadow:       "0 20px 50px rgba(15,23,42,.15),0 4px 12px rgba(15,23,42,.06)",
  aurora: [
    "rgba(99,102,241,.12)",
    "rgba(34,211,238,.09)",
    "rgba(139,92,246,.09)",
  ],
};

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { -webkit-text-size-adjust:100%; }
  body { font-family:'Inter',sans-serif; overflow-x:hidden; }

  @keyframes aurora {
    0%   { transform:translate(0%,0%)   scale(1);    opacity:.55; }
    33%  { transform:translate(4%,-6%)  scale(1.06); opacity:.45; }
    66%  { transform:translate(-3%,5%)  scale(.97);  opacity:.60; }
    100% { transform:translate(0%,0%)   scale(1);    opacity:.55; }
  }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn  { from{opacity:0;} to{opacity:1;} }
  @keyframes scaleIn { from{opacity:0;transform:scale(.96);} to{opacity:1;transform:scale(1);} }
  @keyframes spin    { to{transform:rotate(360deg);} }
  @keyframes pulse   { 0%,100%{opacity:1;} 50%{opacity:.5;} }

  /* ── Workspace card ── */
  .ws-card {
    border-radius:20px; padding:22px; cursor:pointer;
    transition:transform .35s cubic-bezier(.22,.68,0,1.2), box-shadow .35s ease, border-color .35s ease;
    display:flex; flex-direction:column; justify-content:space-between;
    min-height:180px; position:relative; overflow:hidden;
    border-style:solid; border-width:1px;
  }
  .ws-card::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse at 120% 0%,rgba(99,102,241,.08) 0%,transparent 60%);
    pointer-events:none; transition:opacity .35s; opacity:0;
  }
  @media (hover:hover) {
    .ws-card:hover::before { opacity:1; }
    .ws-card:hover .hover-actions { opacity:1; }
    .hover-actions { opacity:0; transition:opacity .2s; }
  }
  @media (hover:none) { .hover-actions { opacity:1 !important; } }

  /* ── Stat card ── */
  .stat-card {
    border-radius:16px; padding:20px 22px;
    animation:fadeUp .5s ease both;
    border-style:solid; border-width:1px;
  }

  /* ── Input focus ── */
  .input-glow:focus {
    outline:none;
    border-color:rgba(99,102,241,.7) !important;
    box-shadow:0 0 0 3px rgba(99,102,241,.12);
  }

  /* ── Buttons ── */
  .btn-primary {
    background:linear-gradient(135deg,#6366F1 0%,#4F46E5 100%);
    border:none; border-radius:14px; color:#fff;
    font-weight:600; font-size:14px; padding:12px 22px;
    cursor:pointer; transition:filter .2s,transform .15s;
    white-space:nowrap; min-height:44px; font-family:inherit;
  }
  @media (hover:hover) { .btn-primary:hover { filter:brightness(1.12); transform:translateY(-1px); } }
  .btn-primary:active  { transform:translateY(0); filter:brightness(.95); }

  /* ── Grids ── */
  .ws-grid { display:grid; gap:18px; grid-template-columns:1fr; }
  @media (min-width:560px)  { .ws-grid { grid-template-columns:repeat(2,1fr); } }
  @media (min-width:1024px) { .ws-grid { grid-template-columns:repeat(3,1fr); } }

  .stats-grid { display:grid; gap:14px; grid-template-columns:repeat(3,1fr); }
  @media (max-width:400px) { .stats-grid { grid-template-columns:1fr; } }

  .create-row { display:flex; flex-direction:column; gap:12px; }
  @media (min-width:480px) { .create-row { flex-direction:row; } }
  .create-row .btn-primary { width:100%; }
  @media (min-width:480px) { .create-row .btn-primary { width:auto; } }

  /* ── Navbar ── */
  .dashboard-navbar {
    position:fixed; top:0; left:0; right:0; z-index:100;
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    height:64px; display:flex; align-items:center;
    padding-left:max(16px,env(safe-area-inset-left));
    padding-right:max(16px,env(safe-area-inset-right));
    animation:fadeIn .4s ease both;
    border-bottom-style:solid; border-bottom-width:1px;
    transition:background .4s, border-color .4s;
  }
  @media (min-width:640px) { .dashboard-navbar { padding:0 40px; height:68px; } }

  .nav-inner {
    width:100%; max-width:1200px; margin:0 auto;
    display:flex; align-items:center; justify-content:space-between; gap:12px;
  }
  .nav-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:flex-end; }

  /* ── Page content ── */
  .dashboard-content {
    max-width:1200px; margin:0 auto;
    padding:80px 16px 60px;
    padding-bottom:max(60px,env(safe-area-inset-bottom));
    position:relative; z-index:1;
    transition:color .3s;
  }
  @media (min-width:640px)  { .dashboard-content { padding:96px 32px 60px; } }
  @media (min-width:1024px) { .dashboard-content { padding:104px 40px 60px; } }

  /* ── Logo ── */
  .logo-ring {
    border-radius:14px;
    background:linear-gradient(135deg,#6366F1,#22D3EE);
    display:flex; align-items:center; justify-content:center;
    font-weight:800; color:#fff;
    box-shadow:0 4px 20px rgba(99,102,241,.4);
    flex-shrink:0;
  }

  /* ── Theme toggle ── */
  .theme-toggle {
    border-radius:12px; padding:8px 14px;
    font-size:13px; font-weight:600;
    cursor:pointer; font-family:inherit;
    display:flex; align-items:center; gap:6px;
    min-height:40px; border-style:solid; border-width:1px;
    transition:background .25s, color .25s, border-color .25s;
    white-space:nowrap;
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion:reduce) {
    .ws-card, .btn-primary { transition:none; }
    .aurora-blob { animation:none !important; }
    .stat-card { animation:none !important; opacity:1 !important; }
  }
`;

export default function Dashboard() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState<"dark" | "light">(() =>
    (localStorage.getItem("fb-theme") as "dark" | "light") || "dark"
  );
  const T = theme === "dark" ? DARK : LIGHT;

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [stats, setStats] = useState<DashboardStats>({ activeBoards: 0, teamMembers: 0 });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<number | null>(null);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<number | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("fb-theme", next);
  };

  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = GLOBAL_STYLES;
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/users/me");
      setCurrentUserId(res.data.id);
    } catch (e) { console.error("Could not fetch user", e); }
  };

  const fetchActiveWorkspaceStats = async (wsId: number) => {
    try {
      const res = await api.get(`/workspaces/${wsId}/stats`);
      setStats({ activeBoards: res.data.activeBoards || 0, teamMembers: res.data.teamMembers || 0 });
    } catch (e) { console.error("Stats fetch failed", e); }
  };

  const fetchWorkspacesAndStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get("/workspaces/");
      const list: Workspace[] = res.data;
      setWorkspaces(list);
      if (list.length > 0) {
        const targetId = activeWorkspaceId || list[0].id;
        setActiveWorkspaceId(targetId);
        await fetchActiveWorkspaceStats(targetId);
      } else {
        setStats({ activeBoards: 0, teamMembers: 0 });
      }
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setMounted(true);
    }
  };

  useEffect(() => {
    if (activeWorkspaceId) fetchActiveWorkspaceStats(activeWorkspaceId);
  }, [activeWorkspaceId]);

  useEffect(() => {
    fetchCurrentUser();
    fetchWorkspacesAndStats();
  }, []);

  const createWorkspace = async () => {
    if (!workspaceName.trim()) { alert("Please enter a workspace name"); return; }
    try {
      await api.post("/workspaces/", { name: workspaceName.trim() });
      setWorkspaceName("");
      await fetchWorkspacesAndStats(true);
    } catch (e: any) { alert(e?.response?.data?.detail || "Failed to create workspace"); }
  };

  const handleUpdateWorkspace = async (id: number) => {
    if (!editNameValue.trim()) { alert("Name cannot be empty"); return; }
    try {
      await api.put(`/workspaces/${id}`, { name: editNameValue.trim() });
      setEditingWorkspaceId(null);
      await fetchWorkspacesAndStats(true);
    } catch (e: any) { alert(e?.response?.data?.detail || "Failed to update workspace"); }
  };

  const deleteWorkspace = async (id: number) => {
    if (!window.confirm("Delete this workspace? Everything inside will be removed permanently.")) return;
    try {
      await api.delete(`/workspaces/${id}`);
      await fetchWorkspacesAndStats(true);
    } catch (e: any) { alert(e?.response?.data?.detail || "Failed to delete workspace"); }
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:T.pageBg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif", transition:"background .4s" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{ width:44, height:44, borderRadius:"50%", border:"3px solid rgba(99,102,241,.2)", borderTopColor:"#6366F1", animation:"spin .8s linear infinite" }} />
        <p style={{ color:T.textSub, fontSize:14, fontWeight:500 }}>Loading FlowBoard…</p>
      </div>
    </div>
  );

  const fadeUp = (delay: string): React.CSSProperties =>
    mounted ? { animation:`fadeUp .5s ${delay} ease both` } : { opacity:0 };

  return (
    <div style={{ minHeight:"100vh", background:T.pageBg, color:T.text, fontFamily:"Inter,sans-serif", position:"relative", overflowX:"hidden", transition:"background .4s, color .3s" }}>

      {/* Aurora blobs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        {[
          { top:"-20%", left:"10%",  w:600, h:600, delay:"0s",  rev:false },
          { top:"60%",  right:"5%", w:500, h:500, delay:"0s",  rev:true  },
          { top:"35%",  left:"55%", w:380, h:380, delay:"4s",  rev:false },
        ].map((b, i) => (
          <div key={i} className="aurora-blob" style={{
            position:"absolute",
            top:b.top, left:(b as any).left, right:(b as any).right,
            width:b.w, height:b.h, borderRadius:"50%",
            background:`radial-gradient(ellipse,${T.aurora[i]} 0%,transparent 70%)`,
            animation:`aurora ${18 + i*5}s ease-in-out infinite ${b.delay}${b.rev?" reverse":""}`,
            filter:"blur(45px)", transition:"background 0.6s",
          }} />
        ))}
      </div>

      {/* ── Navbar ── */}
      <nav className="dashboard-navbar" style={{ background:T.navBg, borderBottomColor:T.navBorder }}>
        <div className="nav-inner">
          <div style={{ display:"flex", alignItems:"center", gap:14, minWidth:0 }}>
            <div className="logo-ring" style={{ width:40, height:40, fontSize:18 }}>F</div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:T.text, letterSpacing:"-0.4px", lineHeight:1.1, transition:"color .3s" }}>FlowBoard</div>
              <div style={{ fontSize:10, color:T.textMuted, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", transition:"color .3s" }}>Workspace Manager</div>
            </div>
          </div>

          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme} style={{ background: T.toggleBg, borderColor: T.toggleBorder, color: T.toggleText }}>
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button onClick={() => setShowLogoutConfirm(true)} style={{ background:"rgba(239,68,68,.10)", border:"1px solid rgba(239,68,68,.25)", color:"#F87171", borderRadius:12, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", minHeight:40, whiteSpace:"nowrap", transition:"background .2s" }}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page content ── */}
      <div className="dashboard-content">

        {/* Hero */}
        <div style={{ marginBottom:32, ...fadeUp("0s") }}>
          <p style={{ fontSize:12, color:T.textLabel, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8, transition:"color .3s" }}>
            Welcome Back
          </p>
          <h1 style={{ fontSize:"clamp(24px,5vw,34px)", fontWeight:800, letterSpacing:"-0.8px", color:T.text, lineHeight:1.1, marginBottom:6, transition:"color .3s" }}>
            Your Workspace Hub
          </h1>
          <p style={{ color:T.textMuted, fontSize:"clamp(13px,2vw,15px)", transition:"color .3s" }}>
            Select or create spaces to stay in total control of your projects.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{ marginBottom:32, ...fadeUp("0.08s") }}>
          {[
            { label:"Active Boards", value:stats.activeBoards, icon:"⬡", color:"#6366F1", delay:"0.10s" },
            { label:"Team Members",  value:stats.teamMembers,  icon:"◎", color:"#22D3EE", delay:"0.18s" },
            { label:"Workspaces",    value:workspaces.length,  icon:"◈", color:"#A78BFA", delay:"0.26s" },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ background:T.statBg, borderColor:T.statBorder, animationDelay:s.delay, transition:"background .4s, border-color .4s" }}>
              <div style={{ fontSize:18, marginBottom:8, color:s.color }}>{s.icon}</div>
              <div style={{ fontSize:"clamp(24px,4vw,32px)", fontWeight:800, color:T.text, letterSpacing:"-1px", lineHeight:1, transition:"color .3s" }}>
                {s.value}
              </div>
              <div style={{ fontSize:11, color:T.textMuted, fontWeight:500, marginTop:6, letterSpacing:"0.03em", transition:"color .3s" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Create workspace Panel */}
        <div style={{ background:T.createBg, border:`1px solid ${T.createBorder}`, borderRadius:20, padding:"22px", marginBottom:36, transition:"background .4s, border-color .4s", ...fadeUp("0.12s") }}>
          <p style={{ fontSize:11, fontWeight:700, color:T.textLabel, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14, transition:"color .3s" }}>
            New Workspace
          </p>
          <div className="create-row">
            <input type="text" placeholder="Give your workspace a name…" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") createWorkspace(); }} className="input-glow" style={{ flex:1, background:T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:14, padding:"12px 16px", color:T.text, fontSize:14, fontFamily:"inherit", transition:"border-color .2s,box-shadow .2s,background .4s", minHeight:44 }} />
            <button className="btn-primary" onClick={createWorkspace}>+ Create</button>
          </div>
        </div>

        {/* Section header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, ...fadeUp("0.18s") }}>
          <span style={{ fontSize:"clamp(17px,3vw,21px)", fontWeight:700, color:T.text, letterSpacing:"-0.4px", transition:"color .3s" }}>
            All Workspaces
          </span>
          <span style={{ background:T.accentSoft, border:`1px solid ${T.accentBorder}`, color:T.accentText, borderRadius:20, fontSize:12, fontWeight:700, padding:"2px 10px", transition:"background .4s, border-color .4s, color .3s" }}>
            {workspaces.length}
          </span>
        </div>

        {/* Workspaces grid */}
        <div className="ws-grid">
          {workspaces.map((ws, i) => (
            <div key={ws.id} className="ws-card" onClick={() => { if (editingWorkspaceId !== ws.id) navigate(`/workspaces/${ws.id}/boards`); }} style={{ background:T.cardBg, borderColor:T.cardBorder, boxShadow: "none", transition:"transform .35s cubic-bezier(.22,.68,0,1.2), box-shadow .35s ease, border-color .35s ease, background .4s", ...(mounted ? { animation:`fadeUp .5s ${0.05*i+0.22}s ease both` } : { opacity:0 }) }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.cardHover; (e.currentTarget as HTMLElement).style.boxShadow = T.shadow; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.cardBorder; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
              
              {/* Top */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                {editingWorkspaceId === ws.id ? (
                  <input type="text" value={editNameValue} onClick={e => e.stopPropagation()} onChange={e => setEditNameValue(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleUpdateWorkspace(ws.id); if (e.key === "Escape") setEditingWorkspaceId(null); }} autoFocus className="input-glow" style={{ background:T.inputBg, border:`1px solid rgba(99,102,241,.5)`, borderRadius:10, padding:"6px 12px", color:T.text, fontSize:15, fontWeight:600, width:"68%", fontFamily:"inherit", minHeight:36, transition:"background .4s" }} />
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:5, minWidth:0, flex:1 }}>
                    <span style={{ fontSize:"clamp(14px,2.5vw,17px)", fontWeight:700, color:T.text, letterSpacing:"-0.3px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", transition:"color .3s" }}>
                      {ws.name}
                    </span>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ fontSize:10, color:T.textMuted, fontWeight:500, transition:"color .3s" }}>Owner</span>
                      <span style={{ background:T.tagBg, border:`1px solid ${T.tagBorder}`, color:T.tagText, borderRadius:8, fontSize:11, fontWeight:600, padding:"2px 8px", display:"inline-flex", alignItems:"center", transition:"background .4s, border-color .4s, color .3s" }}>
                        {ws.owner?.name || "Workspace Admin"}
                      </span>
                    </div>
                  </div>
                )}
                <span style={{ background:T.idBg, border:`1px solid ${T.idBorder}`, color:T.idText, borderRadius:8, fontSize:10, fontWeight:600, fontFamily:"monospace", padding:"3px 8px", flexShrink:0, transition:"background .4s, border-color .4s, color .3s" }}>
                  #{ws.id}
                </span>
              </div>

              {/* Bottom */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:14, borderTop:`1px solid ${T.divider}`, marginTop:"auto", flexWrap:"wrap", gap:8, transition:"border-color .4s" }}>
                {editingWorkspaceId === ws.id ? (
                  <span style={{ fontSize:11, color:"#34D399", fontWeight:600, animation:"pulse 1.5s ease-in-out infinite" }}>
                    Enter to save · Esc to cancel
                  </span>
                ) : (
                  <span style={{ fontSize:12, color:T.openText, fontWeight:600, transition:"color .3s" }}>
                    Open Workspace →
                  </span>
                )}

                {currentUserId === ws.owner_id && (
                  <div className="hover-actions" style={{ display:"flex", gap:8 }}>
                    {editingWorkspaceId === ws.id ? (
                      <>
                        <ActionBtn label="Save"   color="#34D399" bg="rgba(52,211,153,.12)"  hoverBg="rgba(52,211,153,.25)"  border="rgba(52,211,153,.3)"   onClick={e => { e.stopPropagation(); handleUpdateWorkspace(ws.id); }} />
                        <ActionBtn label="Cancel" color="#94A3B8" bg="rgba(148,163,184,.08)" hoverBg="rgba(148,163,184,.18)" border="rgba(148,163,184,.15)" onClick={e => { e.stopPropagation(); setEditingWorkspaceId(null); }} />
                      </>
                    ) : (
                      <>
                        <ActionBtn label="Edit"   color="#4F46E5" bg="rgba(99,102,241,.08)"  hoverBg="rgba(99,102,241,.2)"   border="rgba(99,102,241,.2)"   onClick={e => { e.stopPropagation(); setEditingWorkspaceId(ws.id); setEditNameValue(ws.name); }} />
                        <ActionBtn label="Delete" color="#F87171" bg="rgba(239,68,68,.08)"   hoverBg="rgba(239,68,68,.2)"    border="rgba(239,68,68,.2)"    onClick={e => { e.stopPropagation(); deleteWorkspace(ws.id); }} />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {workspaces.length === 0 && (
          <div style={{ textAlign:"center", padding:"56px 24px", border:`1px dashed ${T.emptyBorder}`, borderRadius:24, background:T.emptyBg, animation:"fadeUp .5s ease both", transition:"background .4s, border-color .4s" }}>
            <div style={{ fontSize:36, marginBottom:14, opacity:.4 }}>◈</div>
            <p style={{ fontSize:17, fontWeight:600, color:T.emptyText, marginBottom:6, transition:"color .3s" }}>No workspaces yet</p>
            <p style={{ fontSize:13, color:T.emptySub, transition:"color .3s" }}>Create your first workspace above to get started.</p>
          </div>
        )}
      </div>

      {/* ── Logout confirm modal ── */}
      {showLogoutConfirm && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(5,10,20,.75)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", animation:"fadeIn .2s ease both", padding:16 }}>
          <div style={{ background:T.modalBg, border:`1px solid ${T.modalBorder}`, borderRadius:20, padding:24, maxWidth:360, width:"100%", textAlign:"center", boxShadow:"0 24px 48px rgba(0,0,0,.4)", animation:"scaleIn .25s cubic-bezier(.16,1,.3,1) both", transition:"background .4s" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🚪</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:T.text, letterSpacing:"-0.4px", transition:"color .3s" }}>Sign Out?</h3>
            <p style={{ fontSize:13, color:T.textSub, marginTop:6, lineHeight:1.6, transition:"color .3s" }}>
              You'll need to sign back in to access your workspaces.
            </p>
            <div style={{ display:"flex", gap:12, marginTop:20 }}>
              <button onClick={() => setShowLogoutConfirm(false)} style={{ flex:1, background: T.toggleBg, border:`1px solid ${T.toggleBorder}`, color:T.text, borderRadius:12, padding:"10px 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"background .4s, color .3s" }}>
                Cancel
              </button>
              <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }} style={{ flex:1, background:"linear-gradient(135deg,#EF4444,#DC2626)", border:"none", color:"#fff", borderRadius:12, padding:"10px 16px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 12px rgba(239,68,68,.25)" }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, color, bg, hoverBg, border, onClick }: { label: string; color: string; bg: string; hoverBg: string; border: string; onClick: (e: React.MouseEvent) => void; }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: hovered ? hoverBg : bg, border:`1px solid ${border}`, color, borderRadius:10, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"background .2s", minHeight:34, minWidth:44 }}>
      {label}
    </button>
  );
}