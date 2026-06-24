import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

interface Card {
  id: number;
  title: string;
  description: string;
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
  const [newCards, setNewCards] = useState<Record<number, string>>({});
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  
  const [editingCard, setEditingCard] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [assignees, setAssignees] = useState<Record<number, CardAssignee[]>>({});
  const [loading, setLoading] = useState(true);

  // Drag and drop tracking state
  const [draggedCardId, setDraggedCardId] = useState<number | null>(null);
  const [sourceListId, setSourceListId] = useState<number | null>(null);

  const fetchWorkspaceMembers = async () => {
  if (!workspaceId) return;
  try {
    const response = await api.get(`/workspaces/${workspaceId}/members`);
    
    // 🌟 This maps over the data to handle whatever structure the backend is sending
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

  const createCard = async (listId: number) => {
    const cardTitle = newCards[listId]?.trim();
    if (!cardTitle) return;

    try {
      await api.post("/cards/", {
        list_id: listId,
        title: cardTitle,
        description: "",
      });
      setNewCards((prev) => ({ ...prev, [listId]: "" }));
      await fetchCards(listId);
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
      });
      setEditingCard(null);
      setEditTitle("");
      await fetchCards(listId);
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to modify card title");
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

  // --- Native HTML5 Drag and Drop Handlers ---
  const handleDragStart = (cardId: number, listId: number) => {
    setDraggedCardId(cardId);
    setSourceListId(listId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Crucial to allow a drop event to trigger
  };

  const handleDropOnList = async (targetListId: number) => {
    if (draggedCardId === null || sourceListId === null) return;
    if (sourceListId === targetListId) return; // Dropped in the same container

    // 1. Locate the card object reference
    const movingCard = cards[sourceListId]?.find((c) => c.id === draggedCardId);
    if (!movingCard) return;

    // 2. Optimistic UI update: Instantly move the card layout locally
    const updatedSourceCards = cards[sourceListId].filter((c) => c.id !== draggedCardId);
    const updatedTargetCards = [...(cards[targetListId] || []), movingCard];

    setCards((prev) => ({
      ...prev,
      [sourceListId]: updatedSourceCards,
      [targetListId]: updatedTargetCards,
    }));

    // Calculate dynamic position (tacking onto the tail index of the target swimlane list)
    const newPosition = updatedTargetCards.length - 1;

    // 3. Persist the change upstream to your FastAPI backend route
    try {
      await api.put(`/cards/${draggedCardId}/move`, {
        list_id: targetListId,
        position: newPosition,
      });
    } catch (error) {
      console.error("Failed to persist card move on backend", error);
      // Rollback on network failure
      fetchCards(sourceListId);
      fetchCards(targetListId);
    } finally {
      // Clear tracking state flags
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
                  draggable={editingCard !== card.id} // Disable drag if user is typing an edit
                  onDragStart={() => handleDragStart(card.id, list.id)}
                  className={`bg-[#1f2937] border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3 shadow-md hover:border-slate-600 transition-colors ${
                    draggedCardId === card.id ? "opacity-40 border-dashed border-blue-500" : "cursor-grab active:cursor-grabbing"
                  }`}
                >
                  {editingCard === card.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && updateCard(card.id, list.id)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
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
                        <span className="font-semibold text-sm text-white break-words max-w-[70%]">
                          {card.title}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingCard(card.id);
                              setEditTitle(card.title);
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

                      <div className="pt-2 border-t border-slate-700/50 flex flex-col gap-2">
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
              <input
                type="text"
                placeholder="Write card title..."
                value={newCards[list.id] || ""}
                onChange={(e) =>
                  setNewCards((prev) => ({
                    ...prev,
                    [list.id]: e.target.value,
                  }))
                }
                onKeyDown={(e) => e.key === "Enter" && createCard(list.id)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={() => createCard(list.id)}
                className="w-full mt-2 bg-blue-600/90 hover:bg-blue-600 text-white text-xs py-2 rounded-xl font-semibold transition"
              >
                + Add Card
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BoardPage;