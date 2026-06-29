import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

interface Board {
  id: number;
  name: string;
  created_by: number;
  owner?: { id: number; name: string; email: string };
}

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

  /* ── Board cards ── */
  .board-card {
    background: linear-gradient(145deg,#0D1830 0%,#0A1220 100%);
    border: 1px solid rgba(99,102,241,.12);
    border-radius: 20px;
    padding: 22px;
    cursor: pointer;
    transition: transform .35s cubic-bezier(.22,.68,0,1.2),
                box-shadow .35s ease, border-color .35s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 180px;
    position: relative;
    overflow: hidden;
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
    .board-card:hover {
      transform:translateY(-5px) scale(1.01);
      border-color:rgba(99,102,241,.45);
      box-shadow:0 20px 60px rgba(99,102,241,.12),0 4px 20px rgba(0,0,0,.4);
    }
    .board-card:hover .hover-actions { opacity:1; }
    .hover-actions { opacity:0; transition:opacity .2s; }
  }
  @media (hover:none) {
    .hover-actions { opacity:1 !important; }
  }

  /* ── Input focus ── */
  .input-glow:focus {
    outline:none;
    border-color:rgba(99,102,241,.7) !important;
    box-shadow:0 0 0 3px rgba(99,102,241,.12);
  }

  /* ── Primary button ── */
  .btn-primary {
    background:linear-gradient(135deg,#6366F1 0%,#4F46E5 100%);
    border:none; border-radius:14px; color:#fff;
    font-weight:600; font-size:14px; padding:12px 22px;
    cursor:pointer; transition:filter .2s,transform .15s;
    white-space:nowrap; min-height:44px; font-family:inherit;
  }
  @media (hover:hover) {
    .btn-primary:hover { filter:brightness(1.15); transform:translateY(-1px); }
  }
  .btn-primary:active { transform:translateY(0); filter:brightness(.95); }

  /* ── Ghost button ── */
  .btn-ghost {
    background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.08);
    color:#94A3B8; border-radius:12px;
    font-weight:600; font-size:13px; padding:9px 16px;
    cursor:pointer; transition:background .2s,color .2s,border-color .2s;
    white-space:nowrap; min-height:40px; font-family:inherit;
  }
  @media (hover:hover) {
    .btn-ghost:hover { background:rgba(99,102,241,.12); color:#A5B4FC; border-color:rgba(99,102,241,.3); }
  }

  /* ── Danger button ── */
  .btn-danger {
    background:rgba(239,68,68,.10);
    border:1px solid rgba(239,68,68,.25);
    color:#F87171; border-radius:12px;
    font-weight:600; font-size:13px; padding:9px 16px;
    cursor:pointer; transition:background .2s; white-space:nowrap;
    min-height:40px; font-family:inherit;
  }
  @media (hover:hover) {
    .btn-danger:hover { background:rgba(239,68,68,.2); }
  }

  /* ── Tag ── */
  .tag-indigo {
    background:rgba(99,102,241,.12); border:1px solid rgba(99,102,241,.25);
    color:#A5B4FC; border-radius:8px; font-size:11px; font-weight:600;
    padding:2px 8px; display:inline-flex; align-items:center;
  }

  /* ── Logo ── */
  .logo-ring {
    border-radius:14px;
    background:linear-gradient(135deg,#6366F1,#22D3EE);
    display:flex; align-items:center; justify-content:center;
    font-weight:800; color:#fff;
    box-shadow:0 4px 20px rgba(99,102,241,.4);
    flex-shrink:0;
  }

  /* ── Grids ── */
  .boards-grid {
    display:grid; gap:18px; grid-template-columns:1fr;
  }
  @media (min-width:560px)  { .boards-grid { grid-template-columns:repeat(2,1fr); } }
  @media (min-width:1024px) { .boards-grid { grid-template-columns:repeat(3,1fr); } }

  /* ── Create row ── */
  .create-row { display:flex; flex-direction:column; gap:12px; }
  @media (min-width:480px) { .create-row { flex-direction:row; } }
  .create-row .btn-primary { width:100%; }
  @media (min-width:480px) { .create-row .btn-primary { width:auto; } }

  /* ── Navbar ── */
  .boards-navbar {
    position:fixed; top:0; left:0; right:0; z-index:100;
    background:rgba(5,10,20,.85);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    border-bottom:1px solid rgba(255,255,255,.06);
    height:64px; display:flex; align-items:center;
    padding-left:max(16px, env(safe-area-inset-left));
    padding-right:max(16px, env(safe-area-inset-right));
    animation:fadeIn .4s ease both;
  }
  @media (min-width:640px) { .boards-navbar { padding:0 40px; height:68px; } }

  /* ── Nav inner ── */
  .nav-inner {
    width:100%; max-width:1200px; margin:0 auto;
    display:flex; align-items:center; justify-content:space-between; gap:12px;
  }

  /* ── Nav actions: stack on tiny screens ── */
  .nav-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:flex-end; }

  /* ── Breadcrumb ── */
  .breadcrumb {
    font-size:12px; color:#6366F1; font-weight:600;
    background:none; border:none; cursor:pointer;
    font-family:inherit; padding:0; transition:color .2s;
  }
  @media (hover:hover) { .breadcrumb:hover { color:#818CF8; } }

  /* ── Page content ── */
  .boards-content {
    max-width:1200px; margin:0 auto;
    padding:80px 16px 60px;
    padding-bottom:max(60px, env(safe-area-inset-bottom));
    position:relative; z-index:1;
  }
  @media (min-width:640px)  { .boards-content { padding:96px 32px 60px; } }
  @media (min-width:1024px) { .boards-content { padding:104px 40px 60px; } }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion:reduce) {
    .board-card, .btn-primary { transition:none; }
    .aurora-blob { animation:none !important; }
  }
`;

function Boards() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [boards, setBoards] = useState<Board[]>([]);
  const [boardName, setBoardName] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Inject styles once
  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = BOARDS_STYLES;
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, []);

  // ── Data fetching ─────────────────────────────────────────────────────────
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

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#050A14", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{ width:44, height:44, borderRadius:"50%", border:"3px solid rgba(99,102,241,.2)", borderTopColor:"#6366F1", animation:"spin .8s linear infinite" }} />
        <p style={{ color:"#64748B", fontSize:14, fontWeight:500 }}>Loading Boards…</p>
      </div>
    </div>
  );

  const fadeUp = (delay: string): React.CSSProperties =>
    mounted ? { animation:`fadeUp .5s ${delay} ease both` } : { opacity:0 };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#050A14", color:"#E2E8F0", fontFamily:"Inter,sans-serif", position:"relative", overflowX:"hidden" }}>

      {/* Aurora blobs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        {[
          { top:"-20%", left:"10%",  w:600, h:600, color:"rgba(99,102,241,.18)", dur:"18s", delay:"0s",  rev:false },
          { top:"60%",  right:"5%", w:500, h:500, color:"rgba(34,211,238,.12)", dur:"22s", delay:"0s",  rev:true  },
          { top:"35%",  left:"55%", w:380, h:380, color:"rgba(139,92,246,.10)", dur:"28s", delay:"4s",  rev:false },
        ].map((b, i) => (
          <div key={i} className="aurora-blob" style={{
            position:"absolute",
            top:b.top, left:(b as any).left, right:(b as any).right,
            width:b.w, height:b.h, borderRadius:"50%",
            background:`radial-gradient(ellipse,${b.color} 0%,transparent 70%)`,
            animation:`aurora ${b.dur} ease-in-out infinite ${b.delay}${b.rev ? " reverse" : ""}`,
            filter:"blur(45px)",
          }} />
        ))}
      </div>

      {/* ── Navbar ── */}
      <nav className="boards-navbar">
        <div className="nav-inner">
          {/* Left: logo + breadcrumb */}
          <div style={{ display:"flex", alignItems:"center", gap:14, minWidth:0 }}>
            <div className="logo-ring" style={{ width:40, height:40, fontSize:18 }}>F</div>
            <div style={{ minWidth:0 }}>
              <button className="breadcrumb" onClick={() => navigate("/dashboard")}>
                ← Workspaces
              </button>
              <div style={{ fontSize:16, fontWeight:800, color:"#F1F5F9", letterSpacing:"-0.4px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                Workspace Boards
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="nav-actions">
            <button
              className="btn-ghost"
              onClick={() => navigate(`/workspaces/${workspaceId}/members`)}
            >
              Members
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                background: "rgba(239,68,68,.10)", border: "1px solid rgba(239,68,68,.25)", color: "#F87171",
                borderRadius: 12, padding: "8px 16px", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", minHeight: 40, whiteSpace: "nowrap"
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="boards-content">

        {/* Hero */}
        <div style={{ marginBottom:32, ...fadeUp("0s") }}>
          <p style={{ fontSize:12, color:"#6366F1", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>
            Project Boards
          </p>
          <h1 style={{ fontSize:"clamp(24px,5vw,34px)", fontWeight:800, letterSpacing:"-0.8px", color:"#F1F5F9", lineHeight:1.1, marginBottom:6 }}>
            Build your workflow
          </h1>
          <p style={{ color:"#475569", fontSize:"clamp(13px,2vw,15px)" }}>
            Create and manage boards to track every piece of work.
          </p>
        </div>

        {/* Create board */}
        <div style={{
          background:"linear-gradient(145deg,#0D1830 0%,#0A1220 100%)",
          border:"1px solid rgba(99,102,241,.18)", borderRadius:20,
          padding:"22px", marginBottom:36, ...fadeUp("0.1s"),
        }}>
          <p style={{ fontSize:11, fontWeight:700, color:"#6366F1", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14 }}>
            New Board
          </p>
          <div className="create-row">
            <input
              type="text"
              placeholder="Give your board a name…"
              value={boardName}
              onChange={e => setBoardName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") createBoard(); }}
              className="input-glow"
              style={{
                flex:1, background:"rgba(5,10,20,.60)", border:"1px solid rgba(255,255,255,.08)",
                borderRadius:14, padding:"12px 16px", color:"#E2E8F0", fontSize:14,
                fontFamily:"inherit", transition:"border-color .2s,box-shadow .2s", minHeight:44,
              }}
            />
            <button className="btn-primary" onClick={createBoard}>+ Create</button>
          </div>
        </div>

        {/* Section header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, ...fadeUp("0.16s") }}>
          <span style={{ fontSize:"clamp(17px,3vw,21px)", fontWeight:700, color:"#E2E8F0", letterSpacing:"-0.4px" }}>
            All Boards
          </span>
          <span style={{
            background:"rgba(99,102,241,.15)", border:"1px solid rgba(99,102,241,.25)",
            color:"#818CF8", borderRadius:20, fontSize:12, fontWeight:700, padding:"2px 10px",
          }}>
            {boards.length}
          </span>
        </div>

        {/* Boards grid */}
        <div className="boards-grid">
          {boards.map((board, i) => (
            <div
              key={board.id}
              className="board-card"
              onClick={() => navigate(`/boards/${board.id}`, { state:{ workspaceId } })}
              style={mounted ? { animation:`fadeUp .5s ${0.05*i+0.22}s ease both` } : { opacity:0 }}
            >
              {/* Top */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:5, minWidth:0, flex:1 }}>
                  <span style={{
                    fontSize:"clamp(14px,2.5vw,17px)", fontWeight:700, color:"#E2E8F0",
                    letterSpacing:"-0.3px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                  }}>
                    {board.name}
                  </span>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontSize:10, color:"#475569", fontWeight:500 }}>Created by</span>
                    <span className="tag-indigo">{board.owner?.name || "Board Creator"}</span>
                  </div>
                </div>
                <span style={{
                  background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)",
                  color:"#475569", borderRadius:8, fontSize:10, fontWeight:600,
                  fontFamily:"monospace", padding:"3px 8px", flexShrink:0,
                }}>
                  #{board.id}
                </span>
              </div>

              {/* Bottom */}
              <div style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                paddingTop:14, borderTop:"1px solid rgba(255,255,255,.05)", marginTop:"auto",
                flexWrap:"wrap", gap:8,
              }}>
                <span style={{ fontSize:12, color:"#6366F1", fontWeight:600 }}>Open Board →</span>

                {currentUserId === board.created_by && (
                  <div className="hover-actions" style={{ display:"flex", gap:8 }}>
                    <BoardActionBtn
                      label="Edit"
                      color="#818CF8"
                      bg="rgba(99,102,241,.08)"
                      hoverBg="rgba(99,102,241,.2)"
                      border="rgba(99,102,241,.2)"
                      onClick={e => {
                        e.stopPropagation();
                        const newName = window.prompt("Enter new board name:", board.name);
                        if (newName && newName.trim() && newName !== board.name) {
                          handleUpdateBoard(board.id, newName.trim());
                        }
                      }}
                    />
                    <BoardActionBtn
                      label="Delete"
                      color="#F87171"
                      bg="rgba(239,68,68,.08)"
                      hoverBg="rgba(239,68,68,.2)"
                      border="rgba(239,68,68,.2)"
                      onClick={e => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${board.name}"? This cannot be undone.`)) {
                          handleDeleteBoard(board.id);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {boards.length === 0 && (
          <div style={{
            textAlign:"center", padding:"56px 24px",
            border:"1px dashed rgba(99,102,241,.2)", borderRadius:24,
            background:"rgba(99,102,241,.03)", animation:"fadeUp .5s ease both",
          }}>
            <div style={{ fontSize:36, marginBottom:14, opacity:.4 }}>⬡</div>
            <p style={{ fontSize:17, fontWeight:600, color:"#475569", marginBottom:6 }}>No boards yet</p>
            <p style={{ fontSize:13, color:"#334155" }}>Create your first board above to start tracking work.</p>
          </div>
        )}
      </div>

      {/* ── Custom Dark Theme Logout Confirmation Modal ── */}
      {showLogoutConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(5, 10, 20, 0.75)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.2s ease both"
        }}>
          <div style={{
            background: "linear-gradient(160deg, #0D1830 0%, #0A1220 100%)",
            border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 20,
            padding: 24, maxWidth: 360, width: "90%", textAlign: "center",
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.6)",
            animation: "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both"
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🚪</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.4px" }}>
              Sign Out?
            </h3>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 6, lineHeight: 1.5 }}>
              Are you sure you want to log out of your workspace session? You will need to sign back in.
            </p>
            
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#94A3B8", borderRadius: 12, padding: "10px 16px", fontSize: 13,
                  fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                style={{
                  flex: 1, background: "linear-gradient(135deg, #EF4444, #DC2626)", border: "none",
                  color: "#FFF", borderRadius: 12, padding: "10px 16px", fontSize: 13,
                  fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)"
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Small action button ──────────────────────────────────────────────────────
function BoardActionBtn({
  label, color, bg, hoverBg, border, onClick,
}: {
  label: string; color: string; bg: string; hoverBg: string; border: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
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

export default Boards;