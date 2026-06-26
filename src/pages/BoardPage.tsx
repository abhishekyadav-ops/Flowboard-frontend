import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

interface Card {
  id: number;
  title: string;
  description: string;
  created_at?: string;
  due_date?: string;
  important_link?: string;
}

interface List {
  id: number;
  title: string;
}

interface WorkspaceMember {
  user_id: number;
  name: string;
  email: string;
}

interface CardAssignee {
  id: number;
  name: string;
  email: string;
}

// ─── Global styles ────────────────────────────────────────────────────────────
const BOARD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; }
  body { font-family: 'Inter', sans-serif; overflow-x: hidden; }

  @keyframes aurora {
    0%   { transform: translate(0%,0%)   scale(1);    opacity: .45; }
    33%  { transform: translate(4%,-6%)  scale(1.06); opacity: .35; }
    66%  { transform: translate(-3%,5%)  scale(.97);  opacity: .50; }
    100% { transform: translate(0%,0%)   scale(1);    opacity: .45; }
  }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes spin      { to { transform:rotate(360deg); } }

  /* ── Scrollbar ── */
  .board-scroll::-webkit-scrollbar { height: 6px; }
  .board-scroll::-webkit-scrollbar-track { background: transparent; }
  .board-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,.25); border-radius: 99px; }

  .list-scroll::-webkit-scrollbar { width: 4px; }
  .list-scroll::-webkit-scrollbar-track { background: transparent; }
  .list-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 99px; }

  /* ── Navbar ── */
  .board-navbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(5,10,20,.88);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,.06);
    height: 60px;
    display: flex; align-items: center;
    padding: 0 max(16px, env(safe-area-inset-left));
    animation: fadeIn .4s ease both;
    flex-shrink: 0;
  }
  @media (min-width: 640px) { .board-navbar { height: 64px; padding: 0 32px; } }

  /* ── List column ── */
  .list-col {
    width: 300px;
    min-width: 280px;
    background: linear-gradient(160deg,#0D1830 0%,#0A1220 100%);
    border: 1px solid rgba(99,102,241,.12);
    border-radius: 20px;
    display: flex; flex-direction: column;
    max-height: calc(100vh - 100px);
    flex-shrink: 0;
    transition: border-color .2s;
  }
  .list-col.drag-over {
    border-color: rgba(99,102,241,.5);
    box-shadow: 0 0 0 1px rgba(99,102,241,.3), 0 8px 32px rgba(99,102,241,.1);
  }
  @media (min-width: 768px) { .list-col { width: 320px; } }

  /* ── Card ── */
  .task-card {
    background: linear-gradient(145deg,#131f35,#0e1826);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 14px;
    padding: 14px;
    display: flex; flex-direction: column; gap: 10px;
    transition: border-color .2s, box-shadow .2s, transform .15s;
    cursor: grab;
    touch-action: none;
  }
  .task-card:active { cursor: grabbing; }
  @media (hover:hover) {
    .task-card:hover {
      border-color: rgba(99,102,241,.3);
      box-shadow: 0 4px 20px rgba(0,0,0,.3);
      transform: translateY(-1px);
    }
  }
  .task-card.dragging {
    opacity: .35;
    border-style: dashed;
    border-color: rgba(99,102,241,.5);
  }

  /* ── Input focus ── */
  .input-glow:focus {
    outline: none;
    border-color: rgba(99,102,241,.7) !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,.12);
  }

  /* ── Select ── */
  .member-select {
    width: 100%;
    background: rgba(5,10,20,.7);
    border: 1px solid rgba(255,255,255,.08);
    color: #94A3B8;
    border-radius: 10px;
    padding: 7px 10px;
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    transition: border-color .2s;
  }
  .member-select:focus { outline:none; border-color: rgba(99,102,241,.5); }

  /* ── Add card button ── */
  .add-card-btn {
    width: 100%;
    background: rgba(99,102,241,.10);
    border: 1px dashed rgba(99,102,241,.25);
    color: #818CF8;
    border-radius: 12px;
    padding: 10px;
    font-size: 13px; font-weight: 600; font-family: inherit;
    cursor: pointer;
    transition: background .2s, border-color .2s, color .2s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    min-height: 40px;
  }
  @media (hover:hover) {
    .add-card-btn:hover {
      background: rgba(99,102,241,.2);
      border-color: rgba(99,102,241,.5);
      color: #A5B4FC;
    }
  }

  /* ── Tag ── */
  .tag { border-radius: 7px; font-size: 11px; font-weight: 600; padding: 2px 7px; display:inline-flex; align-items:center; }
  .tag-indigo { background:rgba(99,102,241,.12); border:1px solid rgba(99,102,241,.25); color:#A5B4FC; }
  .tag-amber  { background:rgba(245,158,11,.10); border:1px solid rgba(245,158,11,.25); color:#FCD34D; }

  /* ── Logo ── */
  .logo-ring {
    border-radius:12px;
    background:linear-gradient(135deg,#6366F1,#22D3EE);
    display:flex; align-items:center; justify-content:center;
    font-weight:800; color:#fff;
    box-shadow:0 4px 16px rgba(99,102,241,.4);
    flex-shrink:0;
  }

  /* ── Breadcrumb ── */
  .breadcrumb {
    background:none; border:none; color:#6366F1; font-size:12px;
    font-weight:600; cursor:pointer; font-family:inherit; padding:0;
    transition:color .2s; white-space:nowrap;
  }
  @media (hover:hover) { .breadcrumb:hover { color:#818CF8; } }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,.75);
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: fadeIn .2s ease both;
  }
  .modal-box {
    background: linear-gradient(145deg,#0D1830,#0A1220);
    border: 1px solid rgba(99,102,241,.2);
    border-radius: 22px;
    width: 100%; max-width: 440px;
    padding: 26px;
    display: flex; flex-direction: column; gap: 20px;
    box-shadow: 0 32px 80px rgba(0,0,0,.6);
    animation: scaleIn .25s cubic-bezier(.22,.68,0,1.2) both;
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion:reduce) {
    .task-card, .add-card-btn { transition:none; }
    .aurora-blob { animation:none !important; }
  }
`;

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const workspaceId = location.state?.workspaceId;

  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Record<number, Card[]>>({});
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [assignees, setAssignees] = useState<Record<number, CardAssignee[]>>({});
  const [loading, setLoading] = useState(true);

  const [editingCard, setEditingCard] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLink, setEditLink] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupDueDate, setPopupDueDate] = useState("");
  const [popupLink, setPopupLink] = useState("");

  const [draggedCardId, setDraggedCardId] = useState<number | null>(null);
  const [sourceListId, setSourceListId] = useState<number | null>(null);
  const [dragOverListId, setDragOverListId] = useState<number | null>(null);

  // Inject styles once
  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = BOARD_STYLES;
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, []);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchWorkspaceMembers = async () => {
    if (!workspaceId) return;
    try {
      const res = await api.get(`/workspaces/${workspaceId}/members`);
      setWorkspaceMembers(res.data.map((item: any) => ({
        user_id: item.user_id,
        name: item.user?.name || item.name || `User #${item.user_id}`,
        email: item.user?.email || item.email || "",
      })));
    } catch (e) { console.error("Failed to load members", e); }
  };

  const fetchAssignees = async (cardId: number) => {
    try {
      const res = await api.get(`/cards/${cardId}/assignees`);
      setAssignees(prev => ({ ...prev, [cardId]: res.data.assignees || res.data }));
    } catch (e) { console.error(e); }
  };

  const fetchCards = async (listId: number) => {
    try {
      const res = await api.get(`/lists/${listId}/cards`);
      setCards(prev => ({ ...prev, [listId]: res.data }));
      await Promise.all(res.data.map((card: Card) => fetchAssignees(card.id)));
    } catch (e) { console.error(e); }
  };

  const fetchListsAndData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/boards/${boardId}/lists`);
      setLists(res.data);
      await Promise.all(res.data.map((list: List) => fetchCards(list.id)));
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Failed to load board");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardId) { fetchListsAndData(); fetchWorkspaceMembers(); }
  }, [boardId]);

  // ── Card actions ──────────────────────────────────────────────────────────
  const openCreateModal = (listId: number) => {
    setActiveListId(listId);
    setPopupTitle(""); setPopupDueDate(""); setPopupLink("");
    setIsModalOpen(true);
  };

  const createCardFromModal = async () => {
    const cardTitle = popupTitle.trim();
    if (!cardTitle || activeListId === null) return;
    try {
      await api.post("/cards/", {
        list_id: activeListId, title: cardTitle, description: "",
        due_date: popupDueDate ? new Date(popupDueDate).toISOString() : null,
        important_link: popupLink.trim() || null,
      });
      setIsModalOpen(false);
      await fetchCards(activeListId);
    } catch (e: any) { alert(e?.response?.data?.detail || "Could not create card"); }
  };

  const updateCard = async (cardId: number, listId: number) => {
    if (!editTitle.trim()) return;
    try {
      await api.put(`/cards/${cardId}`, { title: editTitle.trim(), description: "", important_link: editLink.trim() || null });
      setEditingCard(null); setEditTitle(""); setEditLink("");
      await fetchCards(listId);
    } catch (e: any) { alert(e?.response?.data?.detail || "Failed to update card"); }
  };

  const deleteCard = async (cardId: number, listId: number) => {
    if (!window.confirm("Delete this card?")) return;
    try {
      await api.delete(`/cards/${cardId}`);
      await fetchCards(listId);
    } catch (e) { console.error(e); }
  };

  const assignUser = async (cardId: number, userId: number) => {
    if (!userId) return;
    try {
      await api.post(`/cards/${cardId}/assign`, { user_id: userId });
      await fetchAssignees(cardId);
    } catch (e: any) { alert(e?.response?.data?.detail || "Assignment failed"); }
  };

  const unassignUser = async (cardId: number, userId: number) => {
    try {
      await api.delete(`/cards/${cardId}/unassign/${userId}`);
      await fetchAssignees(cardId);
    } catch (e) { console.error(e); }
  };

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const handleDragStart = (cardId: number, listId: number) => {
    setDraggedCardId(cardId); setSourceListId(listId);
  };
  const handleDragOver = (e: React.DragEvent, listId: number) => {
    e.preventDefault(); setDragOverListId(listId);
  };
  const handleDragLeave = () => setDragOverListId(null);
  const handleDropOnList = async (targetListId: number) => {
    setDragOverListId(null);
    if (draggedCardId === null || sourceListId === null || sourceListId === targetListId) return;
    const movingCard = cards[sourceListId]?.find(c => c.id === draggedCardId);
    if (!movingCard) return;
    const updatedSource = cards[sourceListId].filter(c => c.id !== draggedCardId);
    const updatedTarget = [...(cards[targetListId] || []), movingCard];
    setCards(prev => ({ ...prev, [sourceListId]: updatedSource, [targetListId]: updatedTarget }));
    try {
      await api.put(`/cards/${draggedCardId}/move`, { list_id: targetListId, position: updatedTarget.length - 1 });
    } catch (e) {
      console.error("Move failed", e);
      fetchCards(sourceListId!); fetchCards(targetListId);
    } finally {
      setDraggedCardId(null); setSourceListId(null);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#050A14", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{ width:44, height:44, borderRadius:"50%", border:"3px solid rgba(99,102,241,.2)", borderTopColor:"#6366F1", animation:"spin .8s linear infinite" }} />
        <p style={{ color:"#64748B", fontSize:14, fontWeight:500 }}>Loading Board…</p>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#050A14", color:"#E2E8F0", fontFamily:"Inter,sans-serif", display:"flex", flexDirection:"column", overflowX:"hidden" }}>

      {/* Aurora blobs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        {[
          { top:"-15%", left:"15%",  w:500, h:500, color:"rgba(99,102,241,.14)", dur:"20s", delay:"0s",  rev:false },
          { top:"55%",  right:"8%",  w:420, h:420, color:"rgba(34,211,238,.10)", dur:"25s", delay:"2s",  rev:true  },
          { top:"30%",  left:"45%",  w:350, h:350, color:"rgba(139,92,246,.08)", dur:"30s", delay:"5s",  rev:false },
        ].map((b, i) => (
          <div key={i} className="aurora-blob" style={{
            position:"absolute",
            top:b.top, left:(b as any).left, right:(b as any).right,
            width:b.w, height:b.h, borderRadius:"50%",
            background:`radial-gradient(ellipse,${b.color} 0%,transparent 70%)`,
            animation:`aurora ${b.dur} ease-in-out infinite ${b.delay}${b.rev?" reverse":""}`,
            filter:"blur(50px)",
          }} />
        ))}
      </div>

      {/* ── Navbar ── */}
      <nav className="board-navbar">
        <div style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
            <div className="logo-ring" style={{ width:38, height:38, fontSize:17 }}>F</div>
            <div style={{ minWidth:0 }}>
              <button
                className="breadcrumb"
                onClick={() => navigate(workspaceId ? `/workspaces/${workspaceId}/boards` : "/")}
              >
                ← Boards
              </button>
              <div style={{ fontSize:15, fontWeight:800, color:"#F1F5F9", letterSpacing:"-0.4px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                Project Workflow
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <span style={{ fontSize:12, color:"#475569", fontWeight:500, display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#22D3EE", display:"inline-block", boxShadow:"0 0 8px rgba(34,211,238,.6)" }} />
              {lists.length} lists
            </span>
          </div>
        </div>
      </nav>

      {/* ── Board canvas ── */}
      <div
        className="board-scroll"
        style={{
          flex:1,
          marginTop:60,
          padding:"24px 20px 40px",
          overflowX:"auto",
          overflowY:"hidden",
          display:"flex",
          alignItems:"flex-start",
          gap:18,
          userSelect:"none",
          position:"relative",
          zIndex:1,
        }}
      >
        {lists.map((list, li) => (
          <div
            key={list.id}
            className={`list-col${dragOverListId === list.id ? " drag-over" : ""}`}
            onDragOver={e => handleDragOver(e, list.id)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDropOnList(list.id)}
            style={{ animation:`fadeUp .4s ${li*0.06}s ease both` }}
          >
            {/* List header */}
            <div style={{
              padding:"14px 16px",
              display:"flex", alignItems:"center", justifyContent:"space-between",
              borderBottom:"1px solid rgba(255,255,255,.05)",
              flexShrink:0,
            }}>
              <span style={{ fontWeight:700, fontSize:13, color:"#CBD5E1", letterSpacing:"0.02em" }}>
                {list.title}
              </span>
              <span style={{
                background:"rgba(99,102,241,.12)", border:"1px solid rgba(99,102,241,.2)",
                color:"#818CF8", borderRadius:20, fontSize:11, fontWeight:700, padding:"2px 9px",
              }}>
                {cards[list.id]?.length || 0}
              </span>
            </div>

            {/* Cards */}
            <div
              className="list-scroll"
              style={{ padding:"12px 12px 4px", overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:10 }}
            >
              {cards[list.id]?.map((card) => (
                <div
                  key={card.id}
                  draggable={editingCard !== card.id}
                  onDragStart={() => handleDragStart(card.id, list.id)}
                  className={`task-card${draggedCardId === card.id ? " dragging" : ""}`}
                >
                  {editingCard === card.id ? (
                    /* Edit mode */
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      <label style={{ fontSize:10, fontWeight:700, color:"#6366F1", letterSpacing:"0.1em", textTransform:"uppercase" }}>Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="input-glow"
                        autoFocus
                        style={{
                          background:"rgba(5,10,20,.8)", border:"1px solid rgba(255,255,255,.1)",
                          borderRadius:10, padding:"8px 12px", color:"#E2E8F0", fontSize:13,
                          fontFamily:"inherit", width:"100%",
                        }}
                      />
                      <label style={{ fontSize:10, fontWeight:700, color:"#6366F1", letterSpacing:"0.1em", textTransform:"uppercase" }}>Link URL</label>
                      <input
                        type="text"
                        placeholder="https://…"
                        value={editLink}
                        onChange={e => setEditLink(e.target.value)}
                        className="input-glow"
                        style={{
                          background:"rgba(5,10,20,.8)", border:"1px solid rgba(255,255,255,.1)",
                          borderRadius:10, padding:"8px 12px", color:"#E2E8F0", fontSize:12,
                          fontFamily:"inherit", width:"100%",
                        }}
                      />
                      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
                        <button
                          onClick={() => setEditingCard(null)}
                          style={{
                            background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)",
                            color:"#94A3B8", borderRadius:9, padding:"6px 14px", fontSize:12,
                            fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => updateCard(card.id, list.id)}
                          style={{
                            background:"linear-gradient(135deg,#6366F1,#4F46E5)", border:"none",
                            color:"#fff", borderRadius:9, padding:"6px 14px", fontSize:12,
                            fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <>
                      {/* Card title row */}
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                        <span style={{ fontWeight:700, fontSize:13, color:"#E2E8F0", lineHeight:1.4, wordBreak:"break-word", flex:1 }}>
                          {card.title}
                        </span>
                        <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                          {card.important_link && (
                            <a
                              href={card.important_link.startsWith("http") ? card.important_link : `https://${card.important_link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{
                                fontSize:11, color:"#60A5FA",
                                background:"rgba(99,162,241,.10)", border:"1px solid rgba(99,162,241,.2)",
                                padding:"3px 8px", borderRadius:7, fontWeight:600, textDecoration:"none",
                                display:"inline-flex", alignItems:"center", gap:3,
                              }}
                            >
                              🔗
                            </a>
                          )}
                          <button
                            onClick={() => { setEditingCard(card.id); setEditTitle(card.title); setEditLink(card.important_link || ""); }}
                            style={{
                              fontSize:11, color:"#818CF8", background:"rgba(99,102,241,.1)",
                              border:"1px solid rgba(99,102,241,.2)", padding:"3px 8px", borderRadius:7,
                              fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCard(card.id, list.id)}
                            style={{
                              fontSize:13, color:"#F87171", background:"rgba(239,68,68,.08)",
                              border:"1px solid rgba(239,68,68,.2)", padding:"2px 7px", borderRadius:7,
                              fontWeight:700, cursor:"pointer", fontFamily:"inherit", lineHeight:1.4,
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {/* Dates */}
                      {(card.created_at || card.due_date) && (
                        <div style={{
                          display:"flex", flexDirection:"column", gap:4,
                          paddingBottom:10, borderBottom:"1px solid rgba(255,255,255,.05)",
                          fontSize:11, color:"#475569",
                        }}>
                          {card.created_at && (
                            <span>📅 <span style={{ color:"#64748B" }}>Created:</span> {new Date(card.created_at).toLocaleDateString()}</span>
                          )}
                          {card.due_date && (
                            <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                              ⏰ <span style={{ color:"#64748B" }}>Due:</span>
                              <span className="tag tag-amber">{new Date(card.due_date).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Assignees */}
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        <span style={{ fontSize:10, fontWeight:700, color:"#475569", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                          Assigned to
                        </span>
                        {(assignees[card.id] || []).length > 0 && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                            {(assignees[card.id] || []).map(user => (
                              <div
                                key={user.id}
                                style={{
                                  display:"flex", alignItems:"center", gap:5,
                                  background:"rgba(99,102,241,.10)", border:"1px solid rgba(99,102,241,.2)",
                                  borderRadius:8, padding:"3px 8px 3px 10px",
                                }}
                              >
                                <span style={{ fontSize:11, fontWeight:600, color:"#A5B4FC", maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                  {user.name}
                                </span>
                                <button
                                  onClick={() => unassignUser(card.id, user.id)}
                                  style={{
                                    background:"none", border:"none", color:"#6366F1",
                                    fontWeight:700, fontSize:13, cursor:"pointer",
                                    padding:"0 2px", lineHeight:1, fontFamily:"inherit",
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <select
                          className="member-select"
                          value=""
                          onChange={e => assignUser(card.id, Number(e.target.value))}
                        >
                          <option value="" disabled hidden>+ Assign member…</option>
                          {workspaceMembers
                            .filter(m => !(assignees[card.id] || []).some(a => a.id === m.user_id))
                            .map(member => (
                              <option key={member.user_id} value={member.user_id}>
                                {member.name} ({member.email})
                              </option>
                            ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add card */}
            <div style={{ padding:"10px 12px 14px", flexShrink:0 }}>
              <button className="add-card-btn" onClick={() => openCreateModal(list.id)}>
                <span style={{ fontSize:16, lineHeight:1 }}>+</span> Add Card
              </button>
            </div>
          </div>
        ))}

        {/* Empty board state */}
        {lists.length === 0 && (
          <div style={{
            margin:"60px auto", textAlign:"center",
            border:"1px dashed rgba(99,102,241,.2)", borderRadius:24,
            background:"rgba(99,102,241,.03)", padding:"60px 40px",
            animation:"fadeUp .5s ease both",
          }}>
            <div style={{ fontSize:36, marginBottom:14, opacity:.4 }}>⬡</div>
            <p style={{ fontSize:17, fontWeight:600, color:"#475569", marginBottom:6 }}>No lists on this board</p>
            <p style={{ fontSize:13, color:"#334155" }}>Add lists from the board settings to get started.</p>
          </div>
        )}
      </div>

      {/* ── Create Card Modal ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-box">
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid rgba(255,255,255,.06)", paddingBottom:16 }}>
              <div>
                <p style={{ fontSize:11, color:"#6366F1", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>New Card</p>
                <h2 style={{ fontSize:18, fontWeight:800, color:"#F1F5F9", letterSpacing:"-0.4px" }}>Create a task card</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)",
                  color:"#94A3B8", borderRadius:10, width:34, height:34,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:18, fontWeight:700, cursor:"pointer", fontFamily:"inherit", flexShrink:0,
                }}
              >
                ×
              </button>
            </div>

            {/* Fields */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                { label:"Card Title *", type:"text", placeholder:"e.g. Implement OAuth", value:popupTitle, onChange:(v:string)=>setPopupTitle(v) },
                { label:"Due Date",     type:"date", placeholder:"",                     value:popupDueDate, onChange:(v:string)=>setPopupDueDate(v) },
                { label:"Link (URL)",   type:"text", placeholder:"https://…",            value:popupLink, onChange:(v:string)=>setPopupLink(v) },
              ].map(f => (
                <div key={f.label} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <label style={{ fontSize:10, fontWeight:700, color:"#6366F1", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={f.value}
                    onChange={e => f.onChange(e.target.value)}
                    autoFocus={f.label.startsWith("Card")}
                    className="input-glow"
                    style={{
                      background:"rgba(5,10,20,.7)", border:"1px solid rgba(255,255,255,.08)",
                      borderRadius:12, padding:"11px 14px", color:"#E2E8F0", fontSize:13,
                      fontFamily:"inherit", transition:"border-color .2s,box-shadow .2s",
                      colorScheme:"dark",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:16 }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)",
                  color:"#94A3B8", borderRadius:10, padding:"8px 16px", fontSize:13,
                  fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={createCardFromModal}
                style={{
                  background:"linear-gradient(135deg,#6366F1,#4F46E5)", border:"none",
                  color:"#fff", borderRadius:10, padding:"8px 20px", fontSize:13,
                  fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                  boxShadow:"0 4px 12px rgba(99,102,241,.3)",
                }}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}