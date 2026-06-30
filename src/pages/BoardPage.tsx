import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

interface Card {
  id: number;
  title: string;
  description: string;
  created_at?: string;
  due_date?: string;
  links: string[];
  created_by: number;
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

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const DARK = {
  pageBg:       "#050A14",
  navBg:        "rgba(5,10,20,.88)",
  navBorder:    "rgba(255,255,255,.06)",
  listBg:       "linear-gradient(160deg,#0D1830 0%,#0A1220 100%)",
  listBorder:   "rgba(99,102,241,.12)",
  taskBg:       "linear-gradient(145deg,#131f35,#0e1826)",
  taskBorder:   "rgba(255,255,255,.07)",
  inputBg:      "rgba(5,10,20,.7)",
  inputBorder:  "rgba(255,255,255,.08)",
  text:         "#E2E8F0",
  textMuted:    "#475569",
  textSub:      "#64748B",
  textHeading:  "#F1F5F9",
  tagBg:        "rgba(99,102,241,.12)",
  tagBorder:    "rgba(99,102,241,.25)",
  tagText:      "#A5B4FC",
  emptyBorder:  "rgba(99,102,241,.2)",
  emptyBg:      "rgba(99,102,241,.03)",
  emptyText:    "#475569",
  emptySub:     "#334155",
  toggleBg:     "rgba(255,255,255,.06)",
  toggleBorder: "rgba(255,255,255,.10)",
  toggleText:   "#94A3B8",
  dropdownBg:   "#0D1830",
  aurora: [
    "rgba(99,102,241,.14)",
    "rgba(34,211,238,.10)",
    "rgba(139,92,246,.08)",
  ],
};

const LIGHT = {
  pageBg:       "#F0F2F8",
  navBg:        "rgba(226,231,243,.88)",
  navBorder:    "rgba(99,102,241,.16)",
  listBg:       "linear-gradient(160deg, #E2E7F3 0%, #D4DBEC 100%)",
  listBorder:   "rgba(99, 102, 241, 0.2)",
  taskBg:       "linear-gradient(145deg, #E8ECF7, #DCE2F2)",
  taskBorder:   "rgba(99, 102, 241, 0.15)",
  inputBg:      "rgba(255,255,255,.85)",
  inputBorder:  "rgba(99,102,241,.25)",
  text:         "#0F172A",
  textMuted:    "#475569",
  textSub:      "#475569",
  textHeading:  "#0F172A",
  tagBg:        "rgba(99,102,241,.12)",
  tagBorder:    "rgba(99,102,241,.25)",
  tagText:      "#4F46E5",
  emptyBorder:  "rgba(99,102,241,.3)",
  emptyBg:      "rgba(99,102,241,.06)",
  emptyText:    "#334155",
  emptySub:     "#475569",
  toggleBg:     "rgba(99,102,241,.12)",
  toggleBorder: "rgba(99,102,241,.22)",
  toggleText:   "#4F46E5",
  dropdownBg:   "#FFFFFF",
  aurora: [
    "rgba(99,102,241,.12)",
    "rgba(34,211,238,.09)",
    "rgba(139,92,246,.09)",
  ],
};

const BOARD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; }
  body { font-family: 'Inter', sans-serif; overflow-x: hidden; }

  @keyframes aurora {
    0%   { transform: translate(0%, 0%)   scale(1);    opacity: .45; }
    33%  { transform: translate(4%, -6%)  scale(1.06); opacity: .35; }
    66%  { transform: translate(-3%, 5%)  scale(.97);  opacity: .50; }
    100% { transform: translate(0%, 0%)   scale(1);    opacity: .45; }
  }
  @keyframes fadeUp   { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn   { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn  { from { opacity: 0; transform: scale(.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  @keyframes spin     { to { transform: rotate(360deg); } }

  .board-scroll::-webkit-scrollbar { height: 6px; }
  .board-scroll::-webkit-scrollbar-track { background: transparent; }
  .board-scroll::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, .25); border-radius: 99px; }

  .list-scroll::-webkit-scrollbar { width: 4px; }
  .list-scroll::-webkit-scrollbar-track { background: transparent; }
  .list-scroll::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, .25); border-radius: 99px; }

  .board-navbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    height: 60px;
    display: flex; align-items: center;
    padding: 0 max(16px, env(safe-area-inset-left));
    animation: fadeIn .4s ease both;
    flex-shrink: 0;
    border-bottom-style: solid; border-bottom-width: 1px;
    transition: background .4s, border-color .4s;
  }
  @media (min-width: 640px) { .board-navbar { height: 64px; padding: 0 32px; } }

  .list-col {
    width: 300px;
    min-width: 280px;
    border-style: solid; border-width: 1px;
    border-radius: 20px;
    display: flex; flex-direction: column;
    max-height: calc(100vh - 100px);
    flex-shrink: 0;
    transition: border-color .2s, background .4s;
  }
  .list-col.drag-over {
    border-color: rgba(99, 102, 241, .5) !important;
    box-shadow: 0 0 0 1px rgba(99, 102, 241, .3), 0 8px 32px rgba(99, 102, 241, .1);
  }
  @media (min-width: 768px) { .list-col { width: 320px; } }

  .task-card {
    border-style: solid; border-width: 1px;
    border-radius: 14px;
    padding: 14px;
    display: flex; flex-direction: column; gap: 10px;
    transition: border-color .2s, box-shadow .2s, transform .15s, background .4s;
    cursor: grab;
    touch-action: none;
    text-align: left;
    position: relative;
  }
  .task-card:active { cursor: grabbing; }
  @media (hover: hover) {
    .task-card:hover {
      border-color: rgba(99, 102, 241, .4);
      box-shadow: 0 4px 20px rgba(0, 0, 0, .3);
      transform: translateY(-1px);
    }
  }
  .task-card.dragging {
    opacity: .35;
    border-style: dashed;
    border-color: rgba(99, 102, 241, .5);
  }

  .dropdown-menu {
    position: absolute; right: 8px; top: 34px; z-index: 50;
    border-radius: 12px;
    box-shadow: 0 16px 40px rgba(0,0,0,.35);
    border-style: solid; border-width: 1px;
    overflow: hidden;
    width: 160px;
    animation: scaleIn .15s ease both;
  }
  .dropdown-item {
    width: 100%; border: none; background: none;
    padding: 10px 14px; text-align: left;
    font-size: 12px; font-weight: 600; font-family: inherit;
    cursor: pointer;
    display: flex; align-items: center; gap: 8px;
    transition: background .15s;
  }
  .dropdown-item:disabled { cursor: not-allowed; opacity: .5; }

  .input-glow:focus {
    outline: none;
    border-color: rgba(99, 102, 241, .7) !important;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, .12);
  }

  .member-select {
    width: 100%;
    border-style: solid; border-width: 1px;
    border-radius: 10px;
    padding: 7px 10px;
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    transition: border-color .2s, background .4s, color .3s;
  }
  .member-select:focus { outline: none; border-color: rgba(99, 102, 241, .5); }

  .add-card-btn {
    width: 100%;
    background: rgba(99, 102, 241, .10);
    border: 1px dashed rgba(99, 102, 241, .25);
    color: #818CF8;
    border-radius: 12px;
    padding: 10px;
    font-size: 13px; font-weight: 600; font-family: inherit;
    cursor: pointer;
    transition: background .2s, border-color .2s, color .2s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    min-height: 40px;
  }
  @media (hover: hover) {
    .add-card-btn:hover {
      background: rgba(99, 102, 241, .2);
      border-color: rgba(99, 102, 241, .5);
      color: #A5B4FC;
    }
  }

  .tag {
    border-radius: 7px;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 7px;
    display: inline-flex;
    align-items: center;
    transition: background .4s, border-color .4s, color .3s;
  }
  .tag-amber { background: rgba(245, 158, 11, .10); border: 1px solid rgba(245, 158, 11, .25); color: #D97706; }
  .light .tag-amber, [data-theme="light"] .tag-amber {
    background: rgba(245, 158, 11, 0.12);
    border-color: rgba(245, 158, 11, 0.4);
    color: #b45309;
  }

  .link-chip {
    color: #6366F1; font-size: 11px; font-weight: 600;
    text-decoration: none;
    display: inline-flex; align-items: center; gap: 4px;
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.18);
    padding: 3px 9px; border-radius: 8px;
    transition: background .15s, border-color .15s;
  }
  @media (hover: hover) {
    .link-chip:hover { background: rgba(99,102,241,0.16); border-color: rgba(99,102,241,0.35); }
  }

  .logo-ring {
    border-radius: 12px;
    background: linear-gradient(135deg, #6366F1, #22D3EE);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; color: #fff;
    box-shadow: 0 4px 16px rgba(99, 102, 241, .4);
    flex-shrink: 0;
  }

  .breadcrumb {
    background: none; border: none; color: #6366F1; font-size: 12px;
    font-weight: 600; cursor: pointer; font-family: inherit; padding: 0;
    transition: color .2s; white-space: nowrap;
  }
  @media (hover: hover) { .breadcrumb:hover { color: #818CF8; } }

  .theme-toggle {
    border-radius: 12px; padding: 6px 12px;
    font-size: 12px; font-weight: 600;
    cursor: pointer; font-family: inherit;
    display: flex; align-items: center; gap: 6px;
    min-height: 36px; border-style: solid; border-width: 1px;
    transition: background .25s, color .25s, border-color .25s;
    white-space: nowrap;
  }

  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0, 0, 0, .75);
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: fadeIn .2s ease both;
  }
  .modal-box {
    border-style: solid; border-width: 1px;
    border-radius: 22px;
    width: 100%; max-width: 480px;
    padding: 26px;
    display: flex; flex-direction: column; gap: 18px;
    box-shadow: 0 32px 80px rgba(0, 0, 0, .6);
    animation: scaleIn .25s cubic-bezier(.22, .68, 0, 1.2) both;
    transition: background .4s, border-color .4s;
    max-height: calc(100vh - 64px);
    overflow-y: auto;
  }

  .field-label {
    font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: #6366F1;
    display: flex; align-items: center; justify-content: space-between;
  }
  .field-optional {
    font-size: 9px; font-weight: 600; letter-spacing: 0.04em;
    text-transform: none; color: inherit; opacity: .55;
  }

  .btn-primary {
    background: linear-gradient(135deg,#6366F1 0%,#4F46E5 100%);
    border: none; border-radius: 12px; color: #fff;
    font-weight: 700; font-size: 13px; padding: 12px 20px;
    cursor: pointer; transition: filter .2s, transform .15s, opacity .2s;
    font-family: inherit; flex: 1;
  }
  @media (hover: hover) { .btn-primary:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); } }
  .btn-primary:disabled { opacity: .5; cursor: not-allowed; }

  .btn-secondary {
    background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08);
    border-radius: 12px; padding: 12px 20px; font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit; flex: 1;
    transition: background .2s;
  }

  @media (prefers-reduced-motion: reduce) {
    .task-card, .add-card-btn { transition: none; }
    .aurora-blob { animation: none !important; }
  }
`;

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const workspaceId = location.state?.workspaceId;

  const [theme, setTheme] = useState<"dark" | "light">(() =>
    (localStorage.getItem("fb-theme") as "dark" | "light") || "dark"
  );
  const T = theme === "dark" ? DARK : LIGHT;

  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Record<number, Card[]>>({});
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [assignees, setAssignees] = useState<Record<number, CardAssignee[]>>({});
  const [loading, setLoading] = useState(true);

  // Access / permissions state
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [workspaceOwnerId, setWorkspaceOwnerId] = useState<number | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Dropdown UI tracking
  const [activeDropdownCardId, setActiveDropdownCardId] = useState<number | null>(null);

  // Inline editing state
  const [editingCard, setEditingCard] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLinks, setEditLinks] = useState<string[]>([]);

  // Create-card modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupDescription, setPopupDescription] = useState("");
  const [popupDueDate, setPopupDueDate] = useState("");
  const [popupLinks, setPopupLinks] = useState<string[]>([""]);

  const [draggedCardId, setDraggedCardId] = useState<number | null>(null);
  const [sourceListId, setSourceListId] = useState<number | null>(null);
  const [dragOverListId, setDragOverListId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("fb-theme", next);
  };

  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = BOARD_STYLES;
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, []);

  // Close any open card dropdown when clicking elsewhere on the page
  useEffect(() => {
    const closeDropdown = () => setActiveDropdownCardId(null);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

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
      const sanitizedCards = res.data.map((c: any) => ({
        ...c,
        description: c.description || "",
        links: c.links || [],
      }));
      setCards(prev => ({ ...prev, [listId]: sanitizedCards }));
      await Promise.all(sanitizedCards.map((card: Card) => fetchAssignees(card.id)));
    } catch (e) { console.error(e); }
  };

  const fetchCurrentUser = async (): Promise<number | null> => {
    try {
      const res = await api.get("/users/me");
      setCurrentUserId(res.data.id);
      return res.data.id;
    } catch (e) { console.error("Could not fetch user", e); return null; }
  };

  const fetchBoardAndAccessCheck = async (userId: number) => {
    try {
      const boardRes = await api.get(`/boards/${boardId}`);
      const creatorId: number = boardRes.data.created_by;

      const wsId = workspaceId || boardRes.data.workspace_id;
      if (wsId) {
        const wsRes = await api.get(`/workspaces/${wsId}`);
        const ownerId: number = wsRes.data.owner_id;
        setWorkspaceOwnerId(ownerId);

        const isOwner = userId === ownerId;
        const isCreator = userId === creatorId;
        const boardIsOwnerCreated = creatorId === ownerId;

        if (!isOwner && !isCreator && !boardIsOwnerCreated) {
          setAccessDenied(true);
        }
      }
    } catch (e) { console.error("Access verification failed", e); }
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
      setMounted(true);
    }
  };

  useEffect(() => {
    if (boardId) {
      (async () => {
        const userId = await fetchCurrentUser();
        if (userId !== null) await fetchBoardAndAccessCheck(userId);
        await fetchListsAndData();
        fetchWorkspaceMembers();
      })();
    }
  }, [boardId]);

  const isWorkspaceOwner = currentUserId !== null && currentUserId === workspaceOwnerId;

  const hasWritePermissions = (card: Card) => {
    return card.created_by === currentUserId || isWorkspaceOwner;
  };

  const openCreateModal = (listId: number) => {
    setActiveListId(listId);
    setPopupTitle("");
    setPopupDescription("");
    setPopupDueDate("");
    setPopupLinks([""]);
    setIsModalOpen(true);
  };

  const handleAddLinkField = () => setPopupLinks([...popupLinks, ""]);
  const handleRemoveLinkField = (index: number) => setPopupLinks(popupLinks.filter((_, i) => i !== index));
  const handleLinkChange = (index: number, val: string) => {
    const updated = [...popupLinks];
    updated[index] = val;
    setPopupLinks(updated);
  };

  // ── Card creation ──────────────────────────────────────────────────────────
  // Only the title is required. Description, due date, and links are all optional.
  const createCardFromModal = async () => {
    const cleanTitle = popupTitle.trim();
    const cleanDesc = popupDescription.trim();
    const filteredLinks = popupLinks.map(l => l.trim()).filter(Boolean);

    if (!cleanTitle || activeListId === null) {
      alert("Please give your card a title.");
      return;
    }

    if (popupDueDate) {
      const todayStr = new Date().toISOString().split("T")[0];
      if (popupDueDate < todayStr) {
        alert("Due date can't be earlier than today.");
        return;
      }
    }

    try {
      await api.post("/cards/", {
        list_id: activeListId,
        title: cleanTitle,
        description: cleanDesc || null,
        due_date: popupDueDate ? new Date(popupDueDate).toISOString() : null,
        links: filteredLinks,
      });
      setIsModalOpen(false);
      await fetchCards(activeListId);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Could not create card.");
    }
  };

  const initiateInlineEdit = (card: Card) => {
    if (!hasWritePermissions(card)) {
      alert("You don't have permission to edit this card.");
      return;
    }
    setEditingCard(card.id);
    setEditTitle(card.title);
    setEditDescription(card.description || "");
    setEditLinks(card.links && card.links.length > 0 ? card.links : [""]);
    setActiveDropdownCardId(null);
  };

  const handleEditLinkChange = (index: number, val: string) => {
    const updated = [...editLinks];
    updated[index] = val;
    setEditLinks(updated);
  };
  const handleAddEditLinkField = () => setEditLinks([...editLinks, ""]);
  const handleRemoveEditLinkField = (index: number) => setEditLinks(editLinks.filter((_, i) => i !== index));

  // ── Card update ────────────────────────────────────────────────────────────
  // Only the title is required here too — description and links can be left empty.
  const updateCard = async (cardId: number, listId: number) => {
    if (!editTitle.trim()) {
      alert("Card title can't be empty.");
      return;
    }
    try {
      await api.put(`/cards/${cardId}`, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        links: editLinks.map(l => l.trim()).filter(Boolean),
      });
      setEditingCard(null);
      await fetchCards(listId);
    } catch (e: any) { alert(e?.response?.data?.detail || "Failed to update card."); }
  };

  const deleteCard = async (cardId: number, listId: number, cardObj: Card) => {
    if (!hasWritePermissions(cardObj)) {
      alert("Only the card creator or workspace owner can delete this card.");
      return;
    }
    if (!window.confirm("Delete this card? This can't be undone.")) return;
    try {
      await api.delete(`/cards/${cardId}`);
      await fetchCards(listId);
    } catch (e) { console.error("Delete failed", e); }
  };

  const assignUser = async (cardId: number, userId: number) => {
    if (!userId) return;
    try {
      await api.post(`/cards/${cardId}/assign`, { user_id: userId });
      await fetchAssignees(cardId);
    } catch (e: any) { alert(e?.response?.data?.detail || "Assignment failed."); }
  };

  const unassignUser = async (cardId: number, userId: number) => {
    try {
      await api.delete(`/cards/${cardId}/unassign/${userId}`);
      await fetchAssignees(cardId);
    } catch (e) { console.error(e); }
  };

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

  if (loading) return (
    <div style={{ minHeight:"100vh", background: T.pageBg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif", transition: "background .4s" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{ width:44, height:44, borderRadius:"50%", border:"3px solid rgba(99,102,241,.2)", borderTopColor:"#6366F1", animation:"spin .8s linear infinite" }} />
        <p style={{ color: T.textSub, fontSize:14, fontWeight:500 }}>Loading Board…</p>
      </div>
    </div>
  );

  // ─── Access Denied Screen ───────────────────────────────────────────────────
  if (accessDenied) return (
    <div style={{ minHeight:"100vh", background: T.pageBg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif", padding:24, transition: "background .4s" }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
        <h2 style={{ fontSize:22, fontWeight:800, color: T.textHeading, marginBottom:8, letterSpacing:"-0.5px" }}>
          Access Restricted
        </h2>
        <p style={{ fontSize:14, color: T.textMuted, lineHeight:1.6, marginBottom:24 }}>
          This board was created by a team member and is only visible to them and the workspace owner.
        </p>
        <button
          onClick={() => navigate(workspaceId ? `/workspaces/${workspaceId}/boards` : "/")}
          style={{ background:"linear-gradient(135deg,#6366F1,#4F46E5)", border:"none", color:"#fff", borderRadius:14, padding:"12px 28px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 16px rgba(99,102,241,.35)" }}
        >
          ← Back to Boards
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background: T.pageBg, color: T.text, fontFamily:"Inter,sans-serif", display:"flex", flexDirection:"column", overflowX:"hidden", transition: "background .4s, color .3s" }}>

      {/* Aurora blobs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        {[
          { top:"-15%", left:"15%",  w:500, h:500, delay:"0s",  rev:false },
          { top:"55%",  right:"8%",  w:420, h:420, delay:"2s",  rev:true  },
          { top:"30%",  left:"45%",  w:350, h:350, delay:"5s",  rev:false },
        ].map((b, i) => (
          <div key={i} className="aurora-blob" style={{
            position:"absolute",
            top:b.top, left:(b as any).left, right:(b as any).right,
            width:b.w, height:b.h, borderRadius:"50%",
            background:`radial-gradient(ellipse,${T.aurora[i]} 0%,transparent 70%)`,
            animation:`aurora ${20 + i * 5}s ease-in-out infinite ${b.delay}${b.rev?" reverse":""}`,
            filter:"blur(50px)", transition: "background .6s",
          }} />
        ))}
      </div>

      {/* ── Navbar ── */}
      <nav className="board-navbar" style={{ background: T.navBg, borderBottomColor: T.navBorder }}>
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
              <div style={{ fontSize:15, fontWeight:800, color: T.textHeading, letterSpacing:"-0.4px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", transition: "color .3s" }}>
                Project Workflow
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <button className="theme-toggle" onClick={toggleTheme} style={{ background: T.toggleBg, borderColor: T.toggleBorder, color: T.toggleText }}>
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
            <span style={{ fontSize:12, color: T.textMuted, fontWeight:500, display:"flex", alignItems:"center", gap:6, transition: "color .3s" }}>
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
            style={{ background: T.listBg, borderColor: T.listBorder, ...(mounted ? { animation:`fadeUp .4s ${li*0.06}s ease both` } : { opacity: 0 }) }}
          >
            {/* List header */}
            <div style={{
              padding:"14px 16px",
              display:"flex", alignItems:"center", justifyContent:"space-between",
              borderBottom: theme === "dark" ? "1px solid rgba(255,255,255,.05)" : "1px solid rgba(99,102,241,.15)",
              flexShrink:0,
            }}>
              <span style={{ fontWeight:700, fontSize:13, color: T.textHeading, letterSpacing:"0.02em", transition: "color .3s" }}>
                {list.title}
              </span>
              <span style={{
                background:"rgba(99,102,241,.12)", border:"1px solid rgba(99,102,241,.2)",
                color: theme === "dark" ? "#818CF8" : "#4F46E5", borderRadius:20, fontSize:11, fontWeight:700, padding:"2px 9px",
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
                  style={{ background: T.taskBg, borderColor: T.taskBorder }}
                >
                  {editingCard === card.id ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }} onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        placeholder="Card title"
                        className="input-glow"
                        style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:10, padding:"8px 10px", color: T.text, fontSize:13, fontFamily:"inherit", transition:"border-color .2s,box-shadow .2s,background .4s" }}
                      />
                      <textarea
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="input-glow"
                        style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:10, padding:"8px 10px", color: T.text, fontSize:12, fontFamily:"inherit", minHeight:60, resize:"vertical", transition:"border-color .2s,box-shadow .2s,background .4s" }}
                      />
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        <span style={{ fontSize:10, fontWeight:700, color: T.textMuted, letterSpacing:"0.06em", textTransform:"uppercase" }}>
                          Links (optional)
                        </span>
                        {editLinks.map((link, idx) => (
                          <div key={idx} style={{ display:"flex", gap:6 }}>
                            <input
                              value={link}
                              onChange={e => handleEditLinkChange(idx, e.target.value)}
                              placeholder="https://…"
                              className="input-glow"
                              style={{ flex:1, background: T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:8, padding:"6px 8px", color: T.text, fontSize:11, fontFamily:"inherit" }}
                            />
                            {editLinks.length > 1 && (
                              <button onClick={() => handleRemoveEditLinkField(idx)} style={{ background:"rgba(239,68,68,.1)", border:"none", color:"#EF4444", borderRadius:8, padding:"0 8px", cursor:"pointer", fontFamily:"inherit" }}>×</button>
                            )}
                          </div>
                        ))}
                        <button onClick={handleAddEditLinkField} style={{ background:"none", border:"none", color:"#6366F1", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
                          + Add another link
                        </button>
                      </div>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => updateCard(card.id, list.id)} style={{ flex:1, background:"linear-gradient(135deg,#6366F1,#4F46E5)", border:"none", color:"#fff", borderRadius:9, padding:"7px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Save</button>
                        <button onClick={() => setEditingCard(null)} style={{ flex:1, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)", color: T.textSub, borderRadius:9, padding:"7px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                        <span style={{ fontSize:13, fontWeight:600, color: T.text, lineHeight:1.4, flex:1, transition: "color .3s" }}>
                          {card.title}
                        </span>

                        {/* Card actions dropdown */}
                        <div style={{ position:"relative", flexShrink:0 }} onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveDropdownCardId(activeDropdownCardId === card.id ? null : card.id)}
                            style={{ background:"none", border:"none", color: T.textMuted, fontSize:16, cursor:"pointer", padding:"0 4px", lineHeight:1, fontFamily:"inherit" }}
                          >
                            ⋮
                          </button>

                          {activeDropdownCardId === card.id && (
                            <div className="dropdown-menu" style={{ background: T.dropdownBg, borderColor: T.taskBorder }}>
                              <button className="dropdown-item" style={{ color: T.text }} onClick={() => initiateInlineEdit(card)}>
                                ✏️ Edit card
                              </button>
                              <button
                                className="dropdown-item"
                                style={{ color: hasWritePermissions(card) ? "#EF4444" : T.textMuted }}
                                disabled={!hasWritePermissions(card)}
                                onClick={() => deleteCard(card.id, list.id, card)}
                              >
                                🗑️ Delete card
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {card.description && (
                        <p style={{ fontSize:12, color: T.textSub, lineHeight:1.4, whiteSpace:"pre-wrap" }}>
                          {card.description}
                        </p>
                      )}

                      {card.links && card.links.length > 0 && (
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                          {card.links.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="link-chip">
                              🔗 Link {card.links.length > 1 ? idx + 1 : ""}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Dates */}
                      {(card.created_at || card.due_date) && (
                        <div style={{
                          display:"flex", flexDirection:"column", gap:4,
                          paddingBottom:10, borderBottom: theme === "dark" ? "1px solid rgba(255,255,255,.05)" : "1px solid rgba(99,102,241,.15)",
                          fontSize:11, color: T.textMuted, transition: "border-bottom .3s"
                        }}>
                          {card.created_at && (
                            <span>📅 <span style={{ color: T.textSub }}>Created:</span> {new Date(card.created_at).toLocaleDateString()}</span>
                          )}
                          {card.due_date && (
                            <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                              ⏰ <span style={{ color: T.textSub }}>Due:</span>
                              <span className="tag tag-amber">{new Date(card.due_date).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Assignees */}
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        <span style={{ fontSize:10, fontWeight:700, color: T.textMuted, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                          Assigned to
                        </span>
                        {(assignees[card.id] || []).length > 0 && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                            {(assignees[card.id] || []).map(user => (
                              <div
                                key={user.id}
                                style={{
                                  display:"flex", alignItems:"center", gap:5,
                                  background: T.tagBg, border: `1px solid ${T.tagBorder}`,
                                  borderRadius:8, padding:"3px 8px 3px 10px",
                                }}
                              >
                                <span style={{ fontSize:11, fontWeight:600, color: T.tagText, maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                  {user.name}
                                </span>
                                <button
                                  onClick={() => unassignUser(card.id, user.id)}
                                  style={{
                                    background:"none", border:"none", color: theme === "dark" ? "#6366F1" : "#4F46E5",
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
                          style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, color: T.textSub }}
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

                      <div style={{ fontSize:10, color: T.textMuted, textAlign:"right" }}>
                        #{card.id}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add card footer */}
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
            border: `1px dashed ${T.emptyBorder}`, borderRadius:24,
            background: T.emptyBg, padding:"60px 40px",
            animation:"fadeUp .5s ease both", transition: "border-color .4s, background .4s"
          }}>
            <div style={{ fontSize:36, marginBottom:14, opacity:.4 }}>⬡</div>
            <p style={{ fontSize:17, fontWeight:600, color: T.emptyText, marginBottom:6, transition: "color .3s" }}>No lists on this board</p>
            <p style={{ fontSize:13, color: T.emptySub, transition: "color .3s" }}>Add lists from the board settings to get started.</p>
          </div>
        )}
      </div>

      {/* ── Create Card Modal ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-box" style={{ background: T.listBg, borderColor: T.listBorder }}>
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom: theme === "dark" ? "1px solid rgba(255,255,255,.06)" : "1px solid rgba(99,102,241,.15)", paddingBottom:16 }}>
              <div>
                <p style={{ fontSize:11, color:"#6366F1", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>New Card</p>
                <h2 style={{ fontSize:18, fontWeight:800, color: T.textHeading }}>Create a task card</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)",
                  color: T.textSub, borderRadius:10, width:34, height:34,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:18, fontWeight:700, cursor:"pointer", fontFamily:"inherit", flexShrink:0,
                }}
              >
                ×
              </button>
            </div>

            {/* Title — required */}
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label className="field-label">Card Title *</label>
              <input
                type="text"
                placeholder="e.g. Implement OAuth"
                value={popupTitle}
                onChange={e => setPopupTitle(e.target.value)}
                autoFocus
                className="input-glow"
                style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:12, padding:"11px 14px", color: T.text, fontSize:13, fontFamily:"inherit", transition:"border-color .2s,box-shadow .2s, background .4s, color .3s" }}
              />
            </div>

            {/* Description — optional */}
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label className="field-label">
                Description <span className="field-optional">Optional</span>
              </label>
              <textarea
                placeholder="Add more detail…"
                value={popupDescription}
                onChange={e => setPopupDescription(e.target.value)}
                className="input-glow"
                style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:12, padding:"11px 14px", color: T.text, fontSize:13, fontFamily:"inherit", minHeight:80, resize:"vertical", transition:"border-color .2s,box-shadow .2s, background .4s, color .3s" }}
              />
            </div>

            {/* Due date — optional */}
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label className="field-label">
                Due Date <span className="field-optional">Optional</span>
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={popupDueDate}
                onChange={e => setPopupDueDate(e.target.value)}
                className="input-glow"
                style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:12, padding:"11px 14px", color: T.text, fontSize:13, fontFamily:"inherit", transition:"border-color .2s,box-shadow .2s, background .4s, color .3s", colorScheme: theme === "dark" ? "dark" : "light" }}
              />
            </div>

            {/* Links — optional */}
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label className="field-label">
                Links <span className="field-optional">Optional</span>
              </label>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {popupLinks.map((link, idx) => (
                  <div key={idx} style={{ display:"flex", gap:8 }}>
                    <input
                      type="url"
                      placeholder="https://…"
                      value={link}
                      onChange={e => handleLinkChange(idx, e.target.value)}
                      className="input-glow"
                      style={{ flex:1, background: T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:10, padding:"9px 12px", color: T.text, fontSize:12, fontFamily:"inherit" }}
                    />
                    {popupLinks.length > 1 && (
                      <button type="button" onClick={() => handleRemoveLinkField(idx)} style={{ background:"rgba(239,68,68,.1)", border:"none", color:"#EF4444", borderRadius:10, padding:"0 12px", cursor:"pointer", fontFamily:"inherit", fontSize:14 }}>×</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={handleAddLinkField} style={{ background:"none", border:"none", color:"#6366F1", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", textAlign:"left", padding:0 }}>
                + Add another link
              </button>
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:10, borderTop: theme === "dark" ? "1px solid rgba(255,255,255,.06)" : "1px solid rgba(99,102,241,.15)", paddingTop:16 }}>
              <button onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ color: T.text }}>
                Cancel
              </button>
              <button
                onClick={createCardFromModal}
                disabled={!popupTitle.trim()}
                className="btn-primary"
              >
                Create Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}