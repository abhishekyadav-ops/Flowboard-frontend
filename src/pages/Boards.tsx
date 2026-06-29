import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

interface Board {
  id: number;
  name: string;
  created_by: number;
  owner?: { id: number; name: string; email: string };
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const DARK = {
  pageBg:       "#050A14",
  navBg:        "rgba(5,10,20,.85)",
  navBorder:    "rgba(255,255,255,.06)",
  cardBg:       "linear-gradient(145deg,#0D1830 0%,#0A1220 100%)",
  cardBorder:   "rgba(99,102,241,.12)",
  cardHover:    "rgba(99,102,241,.45)",
  createBg:     "linear-gradient(145deg,#0D1830 0%,#0A1220 100%)",
  createBorder: "rgba(99,102,241,.18)",
  inputBg:      "rgba(5,10,20,.60)",
  inputBorder:  "rgba(255,255,255,.08)",
  text:         "#E2E8F0",
  textMuted:    "#475569",
  textSub:      "#64748B",
  textLabel:    "#6366F1",
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
  navBg:        "rgba(226,231,243,.85)",
  navBorder:    "rgba(99,102,241,.16)",
  cardBg:       "linear-gradient(145deg, #E2E7F3 0%, #D4DBEC 100%)",
  cardBorder:   "rgba(99, 102, 241, 0.3)",
  cardHover:    "rgba(99, 102, 241, 0.55)",
  createBg:     "linear-gradient(145deg, #E2E7F3 0%, #D4DBEC 100%)",
  createBorder: "rgba(99, 102, 241, 0.35)",
  inputBg:      "rgba(255,255,255,.85)",
  inputBorder:  "rgba(99,102,241,.25)",
  text:         "#0F172A",
  textMuted:    "#334155",
  textSub:      "#475569",
  textLabel:    "#4F46E5",
  accentText:   "#4F46E5",
  tagBg:        "rgba(99,102,241,.12)",
  tagBorder:    "rgba(99,102,241,.25)",
  tagText:      "#4F46E5",
  idBg:         "rgba(99,102,241,.10)",
  idBorder:     "rgba(99,102,241,.20)",
  idText:       "#475569",
  divider:      "rgba(99,102,241,.25)",
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

// ─── Global styles ────────────────────────────────────────────────────────────
const BOARDS_STYLES = `
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
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes spin    { to { transform:rotate(360deg); } }

  .board-card {
    border-radius: 20px;
    padding: 22px;
    cursor: pointer;
    transition: transform .35s cubic-bezier(.22,.68,0,1.2),
                box-shadow .35s ease, border-color .35s ease, background .4s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 180px;
    position: relative;
    overflow: hidden;
    border-style: solid;
    border-width: 1px;
  }
  .board-card::before {
    content:'';
    position:absolute; inset:0;
    background:radial-gradient(ellipse at 120% 0%,rgba(99,102,241,.08) 0%,transparent 60%);
    pointer-events:none;
    transition:opacity .35s;
    opacity:0;
  }
  @media (hover:hover) {
    .board-card:hover::before { opacity:1; }
    .board-card:hover { transform:translateY(-5px) scale(1.01); }
    .board-card:hover .hover-actions { opacity:1; }
    .hover-actions { opacity:0; transition:opacity .2s; }
  }
  @media (hover:none) {
    .hover-actions { opacity:1 !important; }
  }

  .input-glow:focus {
    outline:none;
    border-color:rgba(99,102,241,.7) !important;
    box-shadow:0 0 0 3px rgba(99,102,241,.12);
  }

  .btn-primary {
    background:linear-gradient(135deg,#6366F1 0%,#4F46E5 100%);
    border:none; border-radius:14px; color:#fff;
    font-weight:600; font-size:14px; padding:12px 22px;
    cursor:pointer; transition:filter .2s,transform .15s;
    white-space:nowrap; min-height:44px; font-family:inherit;
  }
  @media (hover:hover) { .btn-primary:hover { filter:brightness(1.15); transform:translateY(-1px); } }
  .btn-primary:active { transform:translateY(0); filter:brightness(.95); }

  .btn-ghost {
    border-radius:12px;
    font-weight:600; font-size:13px; padding:9px 16px;
    cursor:pointer; transition:background .2s,color .2s,border-color .2s;
    white-space:nowrap; min-height:40px; font-family:inherit;
    border-style: solid; border-width: 1px;
  }

  .logo-ring {
    border-radius:14px;
    background:linear-gradient(135deg,#6366F1,#22D3EE);
    display:flex; align-items:center; justify-content:center;
    font-weight:800; color:#fff;
    box-shadow:0 4px 20px rgba(99,102,241,.4);
    flex-shrink:0;
  }

  .boards-grid { display:grid; gap:18px; grid-template-columns:1fr; }
  @media (min-width:560px)  { .boards-grid { grid-template-columns:repeat(2,1fr); } }
  @media (min-width:1024px) { .boards-grid { grid-template-columns:repeat(3,1fr); } }

  .create-row { display:flex; flex-direction:column; gap:12px; }
  @media (min-width:480px) { .create-row { flex-direction:row; } }
  .create-row .btn-primary { width:100%; }
  @media (min-width:480px) { .create-row .btn-primary { width:auto; } }

  .boards-navbar {
    position:fixed; top:0; left:0; right:0; z-index:100;
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    height:64px; display:flex; align-items:center;
    padding-left:max(16px, env(safe-area-inset-left));
    padding-right:max(16px, env(safe-area-inset-right));
    animation:fadeIn .4s ease both;
    border-bottom-style: solid; border-bottom-width: 1px;
    transition: background .4s, border-color .4s;
  }
  @media (min-width:640px) { .boards-navbar { padding:0 40px; height:68px; } }

  .nav-inner { width:100%; max-width:1200px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .nav-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
  .breadcrumb { font-size:12px; font-weight:600; background:none; border:none; cursor:pointer; font-family:inherit; padding:0; transition:color .2s; }

  .boards-content {
    max-width:1200px; margin:0 auto;
    padding:80px 16px 60px;
    padding-bottom:max(60px, env(safe-area-inset-bottom));
    position:relative; z-index:1;
    transition: color .3s;
  }
  @media (min-width:640px)  { .boards-content { padding:96px 32px 60px; } }
  @media (min-width:1024px) { .boards-content { padding:104px 40px 60px; } }

  @media (prefers-reduced-motion:reduce) {
    .board-card, .btn-primary { transition:none; }
    .aurora-blob { animation:none !important; }
  }
`;

function Boards() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<"dark" | "light">(() =>
    (localStorage.getItem("fb-theme") as "dark" | "light") || "dark"
  );
  const T = theme === "dark" ? DARK : LIGHT;

  const [boards, setBoards] = useState<Board[]>([]);
  const [boardName, setBoardName] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("fb-theme", next);
  };

  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = BOARDS_STYLES;
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, []);

  const fetchBoards = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get(`/boards/workspace/${workspaceId}`);
      setBoards(res.data);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Failed to load project boards");
    } finally {
      setLoading(false);
      setMounted(true);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/users/me");
      setCurrentUserId(res.data.id);
    } catch (e) { console.error("Could not fetch user", e); }
  };

  const createBoard = async () => {
    if (!boardName.trim()) { alert("Please enter a board name"); return; }
    try {
      await api.post("/boards/", { workspace_id: Number(workspaceId), name: boardName.trim(), description: "" });
      setBoardName("");
      await fetchBoards(true);
    } catch (e: any) { alert(e?.response?.data?.detail || "Failed to create board"); }
  };

  const handleUpdateBoard = async (boardId: number, updatedName: string) => {
    try {
      await api.put(`/boards/${boardId}`, { name: updatedName });
      await fetchBoards(true);
    } catch (e: any) { alert(e?.response?.data?.detail || "Failed to update board"); }
  };

  const handleDeleteBoard = async (boardId: number) => {
    try {
      await api.delete(`/boards/${boardId}`);
      await fetchBoards(true);
    } catch (e: any) { alert(e?.response?.data?.detail || "Failed to delete board"); }
  };

  useEffect(() => {
    if (workspaceId) { fetchCurrentUser(); fetchBoards(); }
  }, [workspaceId]);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:T.pageBg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif", transition:"background .4s" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{ width:44, height:44, borderRadius:"50%", border:"3px solid rgba(99,102,241,.2)", borderTopColor:"#6366F1", animation:"spin .8s linear infinite" }} />
        <p style={{ color:T.textSub, fontSize:14, fontWeight:500 }}>Loading Boards…</p>
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
            animation:`aurora ${18 + i*4}s ease-in-out infinite ${b.delay}${b.rev ? " reverse" : ""}`,
            filter:"blur(45px)", transition:"background 0.6s",
          }} />
        ))}
      </div>

      {/* ── Navbar ── */}
      <nav className="boards-navbar" style={{ background:T.navBg, borderBottomColor:T.navBorder }}>
        <div className="nav-inner">
          <div style={{ display:"flex", alignItems:"center", gap:14, minWidth:0 }}>
            <div className="logo-ring" style={{ width:40, height:40, fontSize:18 }}>F</div>
            <div style={{ minWidth:0 }}>
              <button className="breadcrumb" onClick={() => navigate("/dashboard")} style={{ color:T.accentText }}>
                ← Workspaces
              </button>
              <div style={{ fontSize:16, fontWeight:800, color:T.text, letterSpacing:"-0.4px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", transition:"color .3s" }}>
                Workspace Boards
              </div>
            </div>
          </div>

          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme} style={{ background: T.toggleBg, borderColor: T.toggleBorder, color: T.toggleText, borderStyle:"solid", borderWidth:1, borderRadius:12, padding:"8px 14px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", minHeight:40, whiteSpace:"nowrap", transition:"background .25s, color .25s, border-color .25s" }}>
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button className="btn-ghost" onClick={() => navigate(`/workspaces/${workspaceId}/members`)} style={{ background:theme === 'dark' ? "rgba(255,255,255,.04)":"rgba(99,102,241,.08)", borderColor:theme === 'dark' ? "rgba(255,255,255,.08)":"rgba(99,102,241,.18)", color:theme === 'dark' ? "#94A3B8":T.text }}>
              Members
            </button>
            <button onClick={() => setShowLogoutConfirm(true)} style={{ background: "rgba(239,68,68,.10)", border: "1px solid rgba(239,68,68,.25)", color: "#F87171", borderRadius: 12, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", minHeight: 40, whiteSpace: "nowrap" }}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="boards-content">

        {/* Hero */}
        <div style={{ marginBottom:32, ...fadeUp("0s") }}>
          <p style={{ fontSize:12, color:T.textLabel, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8, transition:"color .3s" }}>
            Project Boards
          </p>
          <h1 style={{ fontSize:"clamp(24px,5vw,34px)", fontWeight:800, letterSpacing:"-0.8px", color:T.text, lineHeight:1.1, marginBottom:6, transition:"color .3s" }}>
            Build your workflow
          </h1>
          <p style={{ color:T.textMuted, fontSize:"clamp(13px,2vw,15px)", transition:"color .3s" }}>
            Create and manage boards to track every piece of work.
          </p>
        </div>

        {/* Create board */}
        <div style={{ background:T.createBg, border:`1px solid ${T.createBorder}`, borderRadius:20, padding:"22px", marginBottom:36, transition:"background .4s, border-color .4s", ...fadeUp("0.1s") }}>
          <p style={{ fontSize:11, fontWeight:700, color:T.textLabel, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14, transition:"color .3s" }}>
            New Board
          </p>
          <div className="create-row">
            <input type="text" placeholder="Give your board a name…" value={boardName} onChange={e => setBoardName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") createBoard(); }} className="input-glow" style={{ flex:1, background:T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:14, padding:"12px 16px", color:T.text, fontSize:14, fontFamily:"inherit", transition:"border-color .2s,box-shadow .2s,background .4s", minHeight:44 }} />
            <button className="btn-primary" onClick={createBoard}>+ Create</button>
          </div>
        </div>

        {/* Section header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, ...fadeUp("0.16s") }}>
          <span style={{ fontSize:"clamp(17px,3vw,21px)", fontWeight:700, color:T.text, letterSpacing:"-0.4px", transition:"color .3s" }}>
            All Boards
          </span>
          <span style={{ background:T.tagBg, border:`1px solid ${T.tagBorder}`, color:T.accentText, borderRadius:20, fontSize:12, fontWeight:700, padding:"2px 10px", transition:"background .4s, border-color .4s" }}>
            {boards.length}
          </span>
        </div>

        {/* Boards grid */}
        <div className="boards-grid">
          {boards.map((board, i) => (
            <div key={board.id} className="board-card" onClick={() => navigate(`/boards/${board.id}`, { state:{ workspaceId } })} style={{ background:T.cardBg, borderColor:T.cardBorder, boxShadow: "none", ...(mounted ? { animation:`fadeUp .5s ${0.05*i+0.22}s ease both` } : { opacity:0 }) }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.cardHover; (e.currentTarget as HTMLElement).style.boxShadow = T.shadow; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.cardBorder; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
              
              {/* Top */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:5, minWidth:0, flex:1 }}>
                  <span style={{ fontSize:"clamp(14px,2.5vw,17px)", fontWeight:700, color:T.text, letterSpacing:"-0.3px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", transition:"color .3s" }}>
                    {board.name}
                  </span>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontSize:10, color:T.textMuted, fontWeight:500, transition:"color .3s" }}>Created by</span>
                    
                    {/* Fixed inline border radius here */}
                    <span style={{ background:T.tagBg, border:`1px solid ${T.tagBorder}`, color:T.tagText, borderRadius:8, fontSize:11, fontWeight:600, padding:"2px 8px", display:"inline-flex", alignItems:"center", transition:"background .4s, border-color .4s, color .3s" }}>
                      {board.owner?.name || "Board Creator"}
                    </span>

                  </div>
                </div>
                <span style={{ background:T.idBg, border:`1px solid ${T.idBorder}`, color:T.idText, borderRadius:8, fontSize:10, fontWeight:600, fontFamily:"monospace", padding:"3px 8px", flexShrink:0, transition:"background .4s, border-color .4s, color .3s" }}>
                  #{board.id}
                </span>
              </div>

              {/* Bottom */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:14, borderTop:`1px solid ${T.divider}`, marginTop:"auto", flexWrap:"wrap", gap:8, transition:"border-color .4s" }}>
                <span style={{ fontSize:12, color:T.openText, fontWeight:600, transition:"color .3s" }}>Open Board →</span>

                {currentUserId === board.created_by && (
                  <div className="hover-actions" style={{ display:"flex", gap:8 }}>
                    <BoardActionBtn label="Edit" color={theme === 'dark' ? "#818CF8":"#4F46E5"} bg={T.tagBg} hoverBg={T.tagBorder} border={T.tagBorder} onClick={e => { e.stopPropagation(); const newName = window.prompt("Enter new board name:", board.name); if (newName && newName.trim() && newName !== board.name) { handleUpdateBoard(board.id, newName.trim()); } }} />
                    <BoardActionBtn label="Delete" color="#F87171" bg="rgba(239,68,68,.08)" hoverBg="rgba(239,68,68,.2)" border="rgba(239,68,68,.2)" onClick={e => { e.stopPropagation(); if (window.confirm(`Delete "${board.name}"? This cannot be undone.`)) { handleDeleteBoard(board.id); } }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {boards.length === 0 && (
          <div style={{ textAlign:"center", padding:"56px 24px", border:`1px dashed ${T.emptyBorder}`, borderRadius:24, background:T.emptyBg, animation:"fadeUp .5s ease both", transition:"background .4s, border-color .4s" }}>
            <div style={{ fontSize:36, marginBottom:14, opacity:.4 }}>⬡</div>
            <p style={{ fontSize:17, fontWeight:600, color:T.emptyText, marginBottom:6, transition:"color .3s" }}>No boards yet</p>
            <p style={{ fontSize:13, color:T.emptySub, transition:"color .3s" }}>Create your first board above to start tracking work.</p>
          </div>
        )}
      </div>

      {/* ── Logout confirmation Modal ── */}
      {showLogoutConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(5, 10, 20, 0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease both" }}>
          <div style={{ background: T.modalBg, border: `1px solid ${T.modalBorder}`, borderRadius: 20, padding: 24, maxWidth: 360, width: "90%", textAlign: "center", boxShadow: "0 24px 48px rgba(0, 0, 0, 0.6)", animation: "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both", transition:"background .4s" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🚪</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: "-0.4px", transition:"color .3s" }}>Sign Out?</h3>
            <p style={{ fontSize: 13, color: T.textSub, marginTop: 6, lineHeight: 1.5, transition:"color .3s" }}>
              Are you sure you want to log out of your workspace session? You will need to sign back in.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, background: T.toggleBg, border: `1px solid ${T.toggleBorder}`, color: T.text, borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition:"background .4s, color .3s" }}>
                Cancel
              </button>
              <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} style={{ flex: 1, background: "linear-gradient(135deg, #EF4444, #DC2626)", border: "none", color: "#FFF", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)" }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BoardActionBtn({ label, color, bg, hoverBg, border, onClick }: { label: string; color: string; bg: string; hoverBg: string; border: string; onClick: (e: React.MouseEvent) => void; }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: hovered ? hoverBg : bg, border:`1px solid ${border}`, color, borderRadius:10, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"background .2s", minHeight:34, minWidth:44 }}>
      {label}
    </button>
  );
}

export default Boards;