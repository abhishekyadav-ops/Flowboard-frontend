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

function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const workspaceId = location.state?.workspaceId;

  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Record<number, Card[]>>({});
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  
  const [editingCard, setEditingCard] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLink, setEditLink] = useState(""); 
  
  const [assignees, setAssignees] = useState<Record<number, CardAssignee[]>>({});
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupDueDate, setPopupDueDate] = useState("");
  const [popupLink, setPopupLink] = useState(""); 

  const [draggedCardId, setDraggedCardId] = useState<number | null>(null);
  const [sourceListId, setSourceListId] = useState<number | null>(null);

  const fetchWorkspaceMembers = async () => {
    if (!workspaceId) return;
    try {
      const response = await api.get(`/workspaces/${workspaceId}/members`);
      const formattedMembers = response.data.map((item: any) => ({
        user_id: item.user_id,
        name: item.user?.name || item.name || `User #${item.user_id}`,
        email: item.user?.email || item.email || ""
      }));
      setWorkspaceMembers(formattedMembers);
    } catch (error) {
      console.error("Failed to load team context roles", error);
    }
  };

  const fetchAssignees = async (cardId: number) => {
    try {
      const response = await api.get(`/cards/${cardId}/assignees`);
      setAssignees((prev) => ({
        ...prev,
        [cardId]: response.data.assignees || response.data,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCards = async (listId: number) => {
    try {
      const response = await api.get(`/lists/${listId}/cards`);
      setCards((prev) => ({
        ...prev,
        [listId]: response.data,
      }));
      await Promise.all(response.data.map((card: Card) => fetchAssignees(card.id)));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchListsAndData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/boards/${boardId}/lists`);
      setLists(response.data);
      await Promise.all(response.data.map((list: List) => fetchCards(list.id)));
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to sync board layouts");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (listId: number) => {
    setActiveListId(listId);
    setPopupTitle("");
    setPopupDueDate("");
    setPopupLink(""); 
    setIsModalOpen(true);
  };

  const createCardFromModal = async () => {
    const cardTitle = popupTitle.trim();
    if (!cardTitle || activeListId === null) return;

    try {
      await api.post("/cards/", {
        list_id: activeListId,
        title: cardTitle,
        description: "",
        due_date: popupDueDate ? new Date(popupDueDate).toISOString() : null,
        important_link: popupLink.trim() || null, 
      });
      
      setIsModalOpen(false);
      await fetchCards(activeListId);
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Could not write card metadata");
    }
  };

  const updateCard = async (cardId: number, listId: number) => {
    if (!editTitle.trim()) return;
    try {
      await api.put(`/cards/${cardId}`, {
        title: editTitle.trim(),
        description: "",
        important_link: editLink.trim() || null, 
      });
      setEditingCard(null);
      setEditTitle("");
      setEditLink("");
      await fetchCards(listId);
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to modify card info");
    }
  };

  const deleteCard = async (cardId: number, listId: number) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;
    try {
      await api.delete(`/cards/${cardId}`);
      await fetchCards(listId);
    } catch (error) {
      console.error(error);
    }
  };

  const assignUser = async (cardId: number, userId: number) => {
    if (!userId) return;
    try {
      await api.post(`/cards/${cardId}/assign`, { user_id: userId });
      await fetchAssignees(cardId);
    } catch (error: any) {
      alert(error?.response?.data?.detail || "User assignment failed");
    }
  };

  const unassignUser = async (cardId: number, userId: number) => {
    try {
      await api.delete(`/cards/${cardId}/unassign/${userId}`);
      await fetchAssignees(cardId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDragStart = (cardId: number, listId: number) => {
    setDraggedCardId(cardId);
    setSourceListId(listId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnList = async (targetListId: number) => {
    if (draggedCardId === null || sourceListId === null) return;
    if (sourceListId === targetListId) return;

    const movingCard = cards[sourceListId]?.find((c) => c.id === draggedCardId);
    if (!movingCard) return;

    const updatedSourceCards = cards[sourceListId].filter((c) => c.id !== draggedCardId);
    const updatedTargetCards = [...(cards[targetListId] || []), movingCard];

    setCards((prev) => ({
      ...prev,
      [sourceListId]: updatedSourceCards,
      [targetListId]: updatedTargetCards,
    }));

    const newPosition = updatedTargetCards.length - 1;

    try {
      await api.put(`/cards/${draggedCardId}/move`, {
        list_id: targetListId,
        position: newPosition,
      });
    } catch (error) {
      console.error("Failed to persist card move on backend", error);
      fetchCards(sourceListId);
      fetchCards(targetListId);
    } finally {
      setDraggedCardId(null);
      setSourceListId(null);
    }
  };

  useEffect(() => {
    if (boardId) {
      fetchListsAndData();
      fetchWorkspaceMembers();
    }
  }, [boardId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Loading Tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col">
      <div className="border-b border-slate-800 bg-[#020817] px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(workspaceId ? `/workspaces/${workspaceId}/boards` : "/")}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Boards
          </button>
          <h1 className="text-2xl font-bold border-l border-slate-700 pl-4">Project Workflow Board</h1>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-x-auto flex items-start gap-6 select-none">
        {lists.map((list) => (
          <div
            key={list.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDropOnList(list.id)}
            className="w-80 bg-[#111827] border border-slate-800 rounded-2xl flex flex-col max-h-[calc(100vh-180px)] shrink-0 shadow-lg"
          >
            <div className="p-4 flex justify-between items-center border-b border-slate-800/60">
              <h3 className="font-bold text-slate-200 tracking-wide">{list.title}</h3>
              <span className="bg-slate-800 text-xs px-2.5 py-0.5 rounded-full font-semibold text-slate-400">
                {cards[list.id]?.length || 0}
              </span>
            </div>

            <div className="p-3 overflow-y-auto flex flex-col gap-3 flex-1 custom-scrollbar">
              {cards[list.id]?.map((card) => (
                <div
                  key={card.id}
                  draggable={editingCard !== card.id}
                  onDragStart={() => handleDragStart(card.id, list.id)}
                  className={`bg-[#1f2937] border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3 shadow-md hover:border-slate-600 transition-colors ${
                    draggedCardId === card.id ? "opacity-40 border-dashed border-blue-500" : "cursor-grab active:cursor-grabbing"
                  }`}
                >
                  {editingCard === card.id ? (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Important Link URL</label>
                      <input
                        type="text"
                        placeholder="https://example.com"
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />

                      <div className="flex gap-2 justify-end mt-2">
                        <button
                          onClick={() => setEditingCard(null)}
                          className="bg-slate-700 text-xs px-3 py-1.5 rounded-md font-medium hover:bg-slate-600 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => updateCard(card.id, list.id)}
                          className="bg-blue-600 text-xs px-3 py-1.5 rounded-md font-medium hover:bg-blue-700 transition"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-sm text-white break-words max-w-[50%]">
                          {card.title}
                        </span>
                        
                        {/* 🌟 Repositioned Action Controls cluster */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Link Button dynamically displays right next to 'Edit' if data exists */}
                          {card.important_link && (
                            <a
                              href={card.important_link.startsWith("http") ? card.important_link : `https://${card.important_link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 p-1 px-2 rounded font-medium transition cursor-pointer"
                            >
                              🔗 Link
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setEditingCard(card.id);
                              setEditTitle(card.title);
                              setEditLink(card.important_link || ""); 
                            }}
                            className="text-xs text-slate-400 hover:text-blue-400 bg-slate-800 p-1 px-2 rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCard(card.id, list.id)}
                            className="text-xs text-slate-400 hover:text-red-400 bg-slate-800 p-1 px-2 rounded transition"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 text-[11px] text-slate-400 border-b border-slate-700/40 pb-2">
                        {card.created_at && (
                          <div>
                            📅 <span className="font-medium text-slate-500">Created:</span> {new Date(card.created_at).toLocaleDateString()}
                          </div>
                        )}
                        {card.due_date && (
                          <div className="flex items-center gap-1 mt-0.5">
                            ⏰ <span className="font-medium text-slate-500">Due:</span> 
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded font-medium">
                              {new Date(card.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>


                      <div className="pt-1 flex flex-col gap-2">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block w-full mb-0.5">
                            Assigned To:
                          </span>
                          {(assignees[card.id] || []).map((user) => (
                            <div
                              key={user.id}
                              className="bg-slate-800 border border-slate-700 rounded-md py-0.5 pl-2 pr-1 flex items-center justify-between gap-1.5 text-xs text-slate-300 group"
                            >
                              <span className="truncate max-w-[90px]">{user.name}</span>
                              <button
                                onClick={() => unassignUser(card.id, user.id)}
                                className="text-slate-500 hover:text-red-400 font-bold transition-colors px-0.5"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>

                        <select
                          value=""
                          onChange={(e) => assignUser(card.id, Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-md p-1.5 focus:outline-none focus:border-slate-500 cursor-pointer"
                        >
                          <option value="" disabled hidden>
                            + Assign Team Member...
                          </option>
                          {workspaceMembers
                            .filter(
                              (m) => !(assignees[card.id] || []).some((a) => a.id === m.user_id)
                            )
                            .map((member) => (
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

            <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 rounded-b-2xl">
              <button
                onClick={() => openCreateModal(list.id)}
                className="w-full bg-blue-600/90 hover:bg-blue-600 text-white text-sm py-2.5 rounded-xl font-semibold transition shadow-md flex items-center justify-center gap-2"
              >
                <span>+</span> Add Card
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Popup Creation Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-100">Create New Project Card</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-medium transition"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Card Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Implement OAuth Endpoints"
                  value={popupTitle}
                  onChange={(e) => setPopupTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Due Date</label>
                <input
                  type="date"
                  value={popupDueDate}
                  onChange={(e) => setPopupDueDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Important Link Resource (URL)</label>
                <input
                  type="text"
                  placeholder="e.g., https://github.com/pulls/12"
                  value={popupLink}
                  onChange={(e) => setPopupLink(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2.5 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={createCardFromModal}
                disabled={!popupTitle.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs px-5 py-2.5 rounded-xl font-semibold transition shadow-md"
              >
                Confirm & Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardPage;