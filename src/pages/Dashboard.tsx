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

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; }
  body { font-family: 'Inter', sans-serif; overflow-x: hidden; }

  @keyframes aurora {
    0%   { transform: translate(0%,0%)   scale(1);    opacity: .55; }
    33%  { transform: translate(4%,-6%)  scale(1.06); opacity: .45; }
    66%  { transform: translate(-3%,5%)  scale(.97);  opacity: .60; }
    100% { transform: translate(0%,0%)   scale(1);    opacity: .55; }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes pulse {
    0%,100% { opacity:1; }
    50%     { opacity:.5; }
  }

  .ws-card {
    background: linear-gradient(145deg,#0D1830 0%,#0A1220 100%);
    border: 1px solid rgba(99,102,241,.12);
    border-radius: 20px;
    padding: 22px;
    cursor: pointer;
    transition: transform .35s cubic-bezier(.22,.68,0,1.2),
                box-shadow .35s ease,
                border-color .35s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 190px;
    position: relative;
    overflow: hidden;
  }
  .ws-card::before {
    content:'';
    position:absolute; inset:0;
    background:radial-gradient(ellipse at 120% 0%,rgba(99,102,241,.07) 0%,transparent 60%);
    pointer-events:none;
    transition:opacity .35s;
    opacity:0;
  }

  @media (hover:hover) {
    .ws-card:hover::before { opacity:1; }
    .ws-card:hover {
      transform:translateY(-5px) scale(1.01);
      border-color:rgba(99,102,241,.45);
      box-shadow:0 20px 60px rgba(99,102,241,.12),0 4px 20px rgba(0,0,0,.4);
    }
    .ws-card:hover .action-btn { opacity:1; }
    .action-btn { opacity:0; transition:opacity .2s; }
  }
  @media (hover:none) {
    .action-btn { opacity:1 !important; }
  }

  .stat-card {
    background:linear-gradient(145deg,#0D1830,#090E1A);
    border:1px solid rgba(255,255,255,.06);
    border-radius:16px;
    padding:20px 22px;
    animation:fadeUp .5s ease both;
  }

  .input-glow:focus {
    outline:none;
    border-color:rgba(99,102,241,.7) !important;
    box-shadow:0 0 0 3px rgba(99,102,241,.12);
  }

  .btn-primary {
    background:linear-gradient(135deg,#6366F1 0%,#4F46E5 100%);
    border:none;
    border-radius:14px;
    color:#fff;
    font-weight:600;
    font-size:14px;
    padding:12px 22px;
    cursor:pointer;
    transition:filter .2s,transform .15s;
    white-space:nowrap;
    min-height:44px;
    font-family:inherit;
  }
  @media (hover:hover) {
    .btn-primary:hover { filter:brightness(1.15); transform:translateY(-1px); }
  }
  .btn-primary:active { transform:translateY(0); filter:brightness(.95); }

  .tag-indigo {
    background:rgba(99,102,241,.12);
    border:1px solid rgba(99,102,241,.25);
    color:#A5B4FC;
    border-radius:8px;
    font-size:11px;
    font-weight:600;
    padding:2px 8px;
    display:inline-flex;
    align-items:center;
  }

  .logo-ring {
    border-radius:14px;
    background:linear-gradient(135deg,#6366F1,#22D3EE);
    display:flex; align-items:center; justify-content:center;
    font-weight:800; color:#fff;
    box-shadow:0 4px 20px rgba(99,102,241,.4);
    flex-shrink:0;
  }

  .ws-grid {
    display:grid;
    gap:18px;
    grid-template-columns:1fr;
  }
  @media (min-width:560px) {
    .ws-grid { grid-template-columns:repeat(2,1fr); }
  }
  @media (min-width:1024px) {
    .ws-grid { grid-template-columns:repeat(3,1fr); }
  }

  .stats-grid {
    display:grid;
    gap:14px;
    grid-template-columns:repeat(3,1fr);
  }
  @media (max-width:400px) {
    .stats-grid { grid-template-columns:1fr; }
  }

  .create-row {
    display:flex;
    flex-direction:column;
    gap:12px;
  }
  @media (min-width:480px) {
    .create-row { flex-direction:row; }
  }
  .create-row .btn-primary { width:100%; }
  @media (min-width:480px) {
    .create-row .btn-primary { width:auto; }
  }

  .navbar {
    position:fixed; top:0; left:0; right:0;
    z-index:100;
    background:rgba(5,10,20,.85);
    backdrop-filter:blur(20px);
    -webkit-backdrop-filter:blur(20px);
    border-bottom:1px solid rgba(255,255,255,.06);
    height:64px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding-left: max(20px, env(safe-area-inset-left));
    padding-right: max(20px, env(safe-area-inset-right));
    animation:fadeIn .4s ease both;
  }
  @media (min-width:640px) {
    .navbar { padding:0 40px; height:68px; }
  }

  .page-content {
    max-width:1200px;
    margin:0 auto;
    padding:80px 16px 60px;
    padding-bottom: max(60px, env(safe-area-inset-bottom));
  }
  @media (min-width:640px) {
    .page-content { padding:96px 32px 60px; }
  }
  @media (min-width:1024px) {
    .page-content { padding:104px 40px 60px; }
  }

  @media (prefers-reduced-motion:reduce) {
    .ws-card, .btn-primary { transition:none; }
    .aurora-blob { animation:none !important; }
    .stat-card, .fade-up-item { animation:none !important; opacity:1 !important; }
  }
`;

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [stats, setStats] = useState<DashboardStats>({ activeBoards: 0, teamMembers: 0 });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<number | null>(null);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<number | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

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
    <div style={{ minHeight:"100vh", background:"#050A14", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{ width:44, height:44, borderRadius:"50%", border:"3px solid rgba(99,102,241,.2)", borderTopColor:"#6366F1", animation:"spin .8s linear infinite" }} />
        <p style={{ color:"#64748B", fontSize:14, fontWeight:500 }}>Loading FlowBoard…</p>
      </div>
    </div>
  );

  const fadeUp = (delay: string): React.CSSProperties =>
    mounted ? { animation: `fadeUp .5s ${delay} ease both` } : { opacity: 0 };

  return (
    <div style={{ minHeight:"100vh", background:"#050A14", color:"#E2E8F0", fontFamily:"Inter,sans-serif", position:"relative", overflowX:"hidden" }}>

      {/* Aurora blobs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        {[
          { top:"-20%", left:"10%",   width:600, height:600, color:"rgba(99,102,241,.18)", dur:"18s", delay:"0s",  reverse:false },
          { top:"60%",  right:"5%",   width:500, height:500, color:"rgba(34,211,238,.12)", dur:"22s", delay:"0s",  reverse:true  },
          { top:"40%",  left:"50%",   width:400, height:400, color:"rgba(139,92,246,.10)", dur:"28s", delay:"4s",  reverse:false },
        ].map((b, i) => (
          <div key={i} className="aurora-blob" style={{
            position:"absolute",
            top:b.top, left:b.left, right:(b as any).right,
            width:b.width, height:b.height,
            borderRadius:"50%",
            background:`radial-gradient(ellipse,${b.color} 0%,transparent 70%)`,
            animation:`aurora ${b.dur} ease-in-out infinite ${b.delay}${b.reverse ? " reverse" : ""}`,
            filter:"blur(45px)",
          }} />
        ))}
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div className="logo-ring" style={{ width:42, height:42, fontSize:19 }}>F</div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.5px", color:"#F1F5F9", lineHeight:1.1 }}>FlowBoard</div>
            <div style={{ fontSize:10, color:"#475569", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" as const }}>Project Management</div>
          </div>
        </div>
        <button
          onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
          style={{
            background:"rgba(239,68,68,.10)", border:"1px solid rgba(239,68,68,.25)", color:"#F87171",
            borderRadius:12, padding:"8px 16px", fontSize:13, fontWeight:600,
            cursor:"pointer", fontFamily:"inherit", minHeight:40, whiteSpace:"nowrap" as const,
          }}
        >
          Sign out
        </button>
      </nav>

      {/* Page content */}
      <div className="page-content" style={{ position:"relative", zIndex:1 }}>

        {/* Hero */}
        <div style={{ marginBottom:32, ...fadeUp("0s") }}>
          <p style={{ fontSize:12, color:"#6366F1", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" as const, marginBottom:8 }}>
            Welcome back
          </p>
          <h1 style={{ fontSize:"clamp(26px,5vw,36px)", fontWeight:800, letterSpacing:"-0.8px", color:"#F1F5F9", lineHeight:1.1, marginBottom:6 }}>
            Your Workspace Hub
          </h1>
          <p style={{ color:"#475569", fontSize:"clamp(13px,2vw,15px)" }}>
            Everything your team is working on, beautifully organized.
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom:32, ...fadeUp("0.08s") }}>
          {[
            { label:"Active Boards", value:stats.activeBoards, icon:"⬡", color:"#6366F1", delay:"0.10s" },
            { label:"Team Members",  value:stats.teamMembers,  icon:"◎", color:"#22D3EE", delay:"0.18s" },
            { label:"Workspaces",    value:workspaces.length,  icon:"◈", color:"#A78BFA", delay:"0.26s" },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ animationDelay:s.delay }}>
              <div style={{ fontSize:18, marginBottom:8, color:s.color }}>{s.icon}</div>
              <div style={{ fontSize:"clamp(24px,4vw,32px)", fontWeight:800, color:"#F1F5F9", letterSpacing:"-1px", lineHeight:1 }}>
                {s.value}
              </div>
              <div style={{ fontSize:11, color:"#475569", fontWeight:500, marginTop:6, letterSpacing:"0.03em" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Create workspace */}
        <div style={{
          background:"linear-gradient(145deg,#0D1830 0%,#0A1220 100%)",
          border:"1px solid rgba(99,102,241,.18)", borderRadius:20,
          padding:"22px", marginBottom:36, ...fadeUp("0.14s"),
        }}>
          <p style={{ fontSize:11, fontWeight:700, color:"#6366F1", letterSpacing:"0.1em", textTransform:"uppercase" as const, marginBottom:14 }}>
            New Workspace
          </p>
          <div className="create-row">
            <input
              type="text"
              placeholder="Give your workspace a name…"
              value={workspaceName}
              onChange={e => setWorkspaceName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") createWorkspace(); }}
              className="input-glow"
              style={{
                flex:1, background:"rgba(5,10,20,.60)", border:"1px solid rgba(255,255,255,.08)",
                borderRadius:14, padding:"12px 16px", color:"#E2E8F0", fontSize:14,
                fontFamily:"inherit", transition:"border-color .2s,box-shadow .2s", minHeight:44,
              }}
            />
            <button className="btn-primary" onClick={createWorkspace}>+ Create</button>
          </div>
        </div>

        {/* Section header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, ...fadeUp("0.2s") }}>
          <span style={{ fontSize:"clamp(18px,3vw,22px)", fontWeight:700, color:"#E2E8F0", letterSpacing:"-0.4px" }}>
            My Workspaces
          </span>
          <span style={{
            background:"rgba(99,102,241,.15)", border:"1px solid rgba(99,102,241,.25)",
            color:"#818CF8", borderRadius:20, fontSize:12, fontWeight:700, padding:"2px 10px",
          }}>
            {workspaces.length}
          </span>
        </div>

        {/* Workspace grid */}
        <div className="ws-grid">
          {workspaces.map((ws, i) => (
            <div
              key={ws.id}
              className="ws-card fade-up-item"
              onClick={() => { if (editingWorkspaceId !== ws.id) navigate(`/workspaces/${ws.id}/boards`); }}
              style={mounted ? { animation:`fadeUp .5s ${0.05*i+0.22}s ease both` } : { opacity:0 }}
            >
              {/* Top */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                {editingWorkspaceId === ws.id ? (
                  <input
                    type="text"
                    value={editNameValue}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setEditNameValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleUpdateWorkspace(ws.id);
                      if (e.key === "Escape") setEditingWorkspaceId(null);
                    }}
                    autoFocus
                    className="input-glow"
                    style={{
                      background:"rgba(5,10,20,.80)", border:"1px solid rgba(99,102,241,.5)",
                      borderRadius:10, padding:"6px 12px", color:"#E2E8F0",
                      fontSize:15, fontWeight:600, width:"68%", fontFamily:"inherit", minHeight:36,
                    }}
                  />
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:5, minWidth:0, flex:1 }}>
                    <span style={{
                      fontSize:"clamp(14px,2.5vw,17px)", fontWeight:700, color:"#E2E8F0",
                      letterSpacing:"-0.3px", whiteSpace:"nowrap" as const, overflow:"hidden", textOverflow:"ellipsis",
                    }}>
                      {ws.name}
                    </span>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ fontSize:10, color:"#475569", fontWeight:500 }}>Owner</span>
                      <span className="tag-indigo">{ws.owner?.name || "Workspace Admin"}</span>
                    </div>
                  </div>
                )}
                <span style={{
                  background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)",
                  color:"#475569", borderRadius:8, fontSize:10, fontWeight:600,
                  fontFamily:"monospace", padding:"3px 8px", flexShrink:0,
                }}>
                  #{ws.id}
                </span>
              </div>

              {/* Bottom */}
              <div style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                paddingTop:14, borderTop:"1px solid rgba(255,255,255,.05)", marginTop:"auto",
                flexWrap:"wrap" as const, gap:8,
              }}>
                {editingWorkspaceId === ws.id ? (
                  <span style={{ fontSize:11, color:"#34D399", fontWeight:600, animation:"pulse 1.5s ease-in-out infinite" }}>
                    Enter to save · Esc to cancel
                  </span>
                ) : (
                  <span style={{ fontSize:12, color:"#6366F1", fontWeight:600 }}>Open workspace →</span>
                )}

                {currentUserId === ws.owner_id && (
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    {editingWorkspaceId === ws.id ? (
                      <>
                        <ActionBtn label="Save"   color="#34D399" bg="rgba(52,211,153,.12)"  hoverBg="rgba(52,211,153,.25)"  border="rgba(52,211,153,.3)"   alwaysVisible onClick={e => { e.stopPropagation(); handleUpdateWorkspace(ws.id); }} />
                        <ActionBtn label="Cancel" color="#94A3B8" bg="rgba(148,163,184,.08)" hoverBg="rgba(148,163,184,.15)" border="rgba(148,163,184,.15)" alwaysVisible onClick={e => { e.stopPropagation(); setEditingWorkspaceId(null); }} />
                      </>
                    ) : (
                      <>
                        <ActionBtn label="Edit"   color="#818CF8" bg="rgba(99,102,241,.08)"  hoverBg="rgba(99,102,241,.18)"  border="rgba(99,102,241,.18)"  onClick={e => { e.stopPropagation(); setEditingWorkspaceId(ws.id); setEditNameValue(ws.name); }} />
                        <ActionBtn label="Delete" color="#F87171" bg="rgba(239,68,68,.08)"   hoverBg="rgba(239,68,68,.18)"   border="rgba(239,68,68,.18)"   onClick={e => { e.stopPropagation(); deleteWorkspace(ws.id); }} />
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
          <div style={{
            textAlign:"center", padding:"56px 24px",
            border:"1px dashed rgba(99,102,241,.2)", borderRadius:24,
            background:"rgba(99,102,241,.03)", animation:"fadeUp .5s ease both",
          }}>
            <div style={{ fontSize:36, marginBottom:14, opacity:.4 }}>◈</div>
            <p style={{ fontSize:17, fontWeight:600, color:"#475569", marginBottom:6 }}>No workspaces yet</p>
            <p style={{ fontSize:13, color:"#334155" }}>Create your first workspace above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionBtn({
  label, color, bg, hoverBg, border, onClick, alwaysVisible = false,
}: {
  label: string; color: string; bg: string; hoverBg: string; border: string;
  onClick: (e: React.MouseEvent) => void; alwaysVisible?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      className={alwaysVisible ? "" : "action-btn"}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? hoverBg : bg,
        border:`1px solid ${border}`, color,
        borderRadius:10, padding:"6px 12px", fontSize:12, fontWeight:600,
        cursor:"pointer", fontFamily:"inherit", transition:"background .2s",
        minHeight:34, minWidth:44,
      }}
    >
      {label}
    </button>
  );
}