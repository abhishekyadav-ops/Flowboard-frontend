import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

interface Board {
  id: number;
  name: string;
}

function Boards() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [boards, setBoards] = useState<Board[]>([]);
  const [boardName, setBoardName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/boards/workspace/${workspaceId}`);
      setBoards(response.data);
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to load project boards");
    } finally {
      setLoading(false);
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
      await fetchBoards();
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to create board");
    }
  };

  useEffect(() => {
    if (workspaceId) {
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
                ← Workspaces
              </button>
            </div>
            <h1 className="text-4xl font-bold">Workspace Boards</h1>
            <p className="text-slate-400 mt-1">Create and manage project boards</p>
          </div>

          <div className="flex gap-3 items-center">
            {/* Styled Back Button replacing the old LogOut button */}
            <button
              onClick={() => navigate("/")}
              className="bg-red-800 hover:bg-slate-700 text-slate-200 px-5 py-3 rounded-xl font-semibold transition"
            >
              LogOut
            </button>
            <button
              onClick={() => navigate(`/workspaces/${workspaceId}/members`)}
              className="bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-xl font-semibold transition"
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              onClick={() =>
                navigate(`/boards/${board.id}`, {
                  state: { workspaceId },
                })
              }
              className="bg-[#111827] border border-slate-800 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-blue-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/30"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold truncate max-w-[75%]">{board.name}</h3>
                <span className="bg-blue-600 px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap">
                  #{board.id}
                </span>
              </div>
              <p className="text-slate-400 mt-4 text-sm font-medium">Open Board →</p>
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