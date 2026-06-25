import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

interface Board {
  id: number;
  name: string;
  created_by?: number;  
}

function Boards() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [boards, setBoards] = useState<Board[]>([]);
  const [boardName, setBoardName] = useState("");
  const [loading, setLoading] = useState(true);
  
  // 🌟 Added: Track current user local state so permissions check functions cleanly
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Core data fetcher with an optional 'silent' parameter to refresh background listings smoothly
  const fetchBoards = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get(`/boards/workspace/${workspaceId}`);
      setBoards(response.data);
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to load project boards");
    } finally {
      setLoading(false);
    }
  };

  // 🌟 Added: Extract user info from local token state to verify permissions matching
  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/users/me"); // Adjust path if your profile endpoint differs
      setCurrentUserId(response.data.id);
    } catch (error) {
      console.error("Could not fetch user context profile", error);
    }
  };

  const createBoard = async () => {
    try {
      if (!boardName.trim()) {
        alert("Please enter a board name");
        return;
      }

      await api.post("/boards/", {
        workspace_id: Number(workspaceId),
        name: boardName.trim(),
        description: ""
      });

      setBoardName("");
      await fetchBoards(true); // Silent reload after creating
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to create board");
    }
  };

  // Handler to update board names
  const handleUpdateBoard = async (boardId: number, updatedName: string) => {
    try {
      await api.put(`/boards/${boardId}`, { name: updatedName });
      await fetchBoards(true); // Silent reload after updating
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to update board");
    }
  };

  // Handler to delete boards
  const handleDeleteBoard = async (boardId: number) => {
    try {
      await api.delete(`/boards/${boardId}`);
      await fetchBoards(true); // Silent reload after deletion
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to delete board");
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchCurrentUser();
      fetchBoards();
    }
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Loading Boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-[#020817]">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button 
                onClick={() => navigate("/dashboard")}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                &larr; Workspaces
              </button>
            </div>
            <h1 className="text-4xl font-bold">Workspace Boards</h1>
            <p className="text-slate-400 mt-1">Create and manage project boards</p>
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="bg-red-600/90 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-red-950/20"
            >
              Logout
            </button>
            <button
              onClick={() => navigate(`/workspaces/${workspaceId}/members`)}
              className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              Manage Members
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Create Board */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Board</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter board name... (Press Enter to create)"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createBoard();
                }
              }}
              className="flex-1 bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={createBoard}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition"
            >
              Create Board
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          <div className="bg-[#111827] border border-blue-900 rounded-2xl p-6">
            <p className="text-slate-400">Total Boards</p>
            <h3 className="text-4xl font-bold mt-2">{boards.length}</h3>
          </div>
          <div className="bg-[#111827] border border-green-900 rounded-2xl p-6">
            <p className="text-slate-400">Active Projects</p>
            <h3 className="text-4xl font-bold mt-2">{boards.length}</h3>
          </div>
          <div className="bg-[#111827] border border-purple-900 rounded-2xl p-6">
            <p className="text-slate-400">Workspace ID</p>
            <h3 className="text-4xl font-bold mt-2">#{workspaceId}</h3>
          </div>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              onClick={() =>
                navigate(`/boards/${board.id}`, {
                  state: { workspaceId },
                })
              }
              className="bg-[#111827] border border-slate-800 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-blue-500/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10 flex flex-col justify-between h-44 group"
            >
              <div className="flex justify-between items-start gap-3">
                <h3 className="text-xl font-semibold text-slate-200 group-hover:text-white transition-colors truncate max-w-[70%]">
                  {board.name}
                </h3>
                <span className="bg-slate-800 text-slate-400 border border-slate-700/50 px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium shrink-0">
                  #{board.id}
                </span>
              </div>

              {/* Card Footer Actions Row */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800/40 mt-auto">
                <p className="text-xs text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                  Open Board &rarr;
                </p>

                {/* Actions Button Container (Revealed smoothly on item hover) */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  
                  {/* 🌟 EDIT BUTTON: Now secure. Only visible to the owner/creator */}
                  {currentUserId === board.created_by && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Stops routing navigation event
                        const newName = window.prompt("Enter new board name:", board.name);
                        if (newName && newName.trim() && newName !== board.name) {
                          handleUpdateBoard(board.id, newName.trim());
                        }
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    >
                      Edit
                    </button>
                  )}

                  {/* 🌟 DELETE BUTTON: Secure. Only visible to the owner/creator */}
                  {currentUserId === board.created_by && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Stops routing navigation event
                        if (window.confirm(`Are you sure you want to delete "${board.name}"?`)) {
                          handleDeleteBoard(board.id);
                        }
                      }}
                      className="bg-slate-900 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/40 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    >
                      Delete
                    </button>
                  )}
                  
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state placeholder */}
        {boards.length === 0 && (
          <div className="text-slate-400 text-center py-16 bg-[#111827]/40 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-lg font-medium">No project boards created yet.</p>
            <p className="text-sm text-slate-500 mt-1">Initialize your workflow by spinning up a new tracking board above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Boards;