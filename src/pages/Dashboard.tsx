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
  
  // 🌟 ADD THIS: Tells TypeScript about the nested owner object
  owner?: {
    id: number;
    name: string;
    email: string;
  };
}

interface DashboardStats {
  activeBoards: number;
  teamMembers: number;
}

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [stats, setStats] = useState<DashboardStats>({ activeBoards: 0, teamMembers: 0 });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // 🌟 State variables to track which workspace is currently being edited inline
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<number | null>(null);
  const [editNameValue, setEditNameValue] = useState("");

  const navigate = useNavigate();

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/users/me"); 
      setCurrentUserId(response.data.id);
    } catch (error) {
      console.error("Could not fetch user context profile", error);
    }
  };

  const fetchWorkspacesAndStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const response = await api.get("/workspaces/");
      const fetchedWorkspaces: Workspace[] = response.data;
      setWorkspaces(fetchedWorkspaces);

      let totalBoards = 0;
      let totalMembers = 0;

      await Promise.all(
        fetchedWorkspaces.map(async (ws) => {
          try {
            const statsRes = await api.get(`/workspaces/${ws.id}/stats`);
            totalBoards += statsRes.data.board_count || 0;
            const rawMemberCount = statsRes.data.member_count || 0;
            if (rawMemberCount > 0) {
              totalMembers += (rawMemberCount - 1);
            }
          } catch (err) {
            console.error(`Failed to pull statistics for workspace ${ws.id}`, err);
          }
        })
      );

      setStats({ activeBoards: totalBoards, teamMembers: totalMembers });
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async () => {
    try {
      if (!workspaceName.trim()) {
        alert("Please enter a workspace name");
        return;
      }
      await api.post("/workspaces/", { name: workspaceName.trim() });
      setWorkspaceName("");
      await fetchWorkspacesAndStats(true);
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to create workspace");
    }
  };

  // 🌟 NEW: Update Workspace API Call
  const handleUpdateWorkspace = async (workspaceId: number) => {
    if (!editNameValue.trim()) {
      alert("Workspace name cannot be empty");
      return;
    }
    try {
      await api.put(`/workspaces/${workspaceId}`, { name: editNameValue.trim() });
      setEditingWorkspaceId(null);
      await fetchWorkspacesAndStats(true); // refresh smoothly
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to update workspace name");
    }
  };

  const deleteWorkspace = async (workspaceId: number) => {
    if (!window.confirm("Delete this workspace? Everything inside will be removed permanently.")) return;
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      await fetchWorkspacesAndStats(true);
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to delete workspace");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchWorkspacesAndStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#020817] border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-xl font-bold">F</div>
            <div>
              <h1 className="text-3xl font-bold">FlowBoard</h1>
              <p className="text-slate-400 text-sm">Project Management Platform</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="bg-red-600/90 hover:bg-red-700 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-red-950/20"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-28 pb-10">
        {/* Create Workspace Panel */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create Workspace</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter workspace name... (Press Enter to create)"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") createWorkspace(); }}
              className="flex-1 bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button onClick={createWorkspace} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition">
              Create
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          <div className="bg-[#111827] border border-blue-900 rounded-2xl p-6">
            <p className="text-slate-400">Workspaces</p>
            <h3 className="text-4xl font-bold mt-2">{workspaces.length}</h3>
          </div>
          <div className="bg-[#111827] border border-green-900 rounded-2xl p-6">
            <p className="text-slate-400">Active Boards</p>
            <h3 className="text-4xl font-bold mt-2">{stats.activeBoards}</h3>
          </div>
          <div className="bg-[#111827] border border-red-900 rounded-2xl p-6">
            <p className="text-slate-400">Team Members</p>
            <h3 className="text-4xl font-bold mt-2">{stats.teamMembers}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800/60">
          <h2 className="text-2xl font-bold text-white tracking-tight">My Workspaces</h2>
        </div>

        {/* Workspace Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              onClick={() => {
                // Only navigate if we aren't currently editing this card
                if (editingWorkspaceId !== workspace.id) {
                  navigate(`/workspaces/${workspace.id}/boards`);
                }
              }}
              className="bg-[#111827] border border-slate-800 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-blue-500/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10 flex flex-col justify-between h-48 group"
            >
              <div className="flex justify-between items-start gap-3">
  {/* 🌟 INLINE EDIT LOGIC: Show text field if editing, show normal h3 name if not */}
  {editingWorkspaceId === workspace.id ? (
    <input
      type="text"
      value={editNameValue}
      onClick={(e) => e.stopPropagation()} // Stop it from opening workspace
      onChange={(e) => editNameValue !== null && setEditNameValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleUpdateWorkspace(workspace.id);
        if (e.key === "Escape") setEditingWorkspaceId(null);
      }}
      autoFocus
      className="bg-[#0F172A] border border-blue-500 rounded-lg px-2 py-1 text-white text-lg w-[70%] focus:outline-none"
    />
  ) : (
    <div className="flex flex-col gap-1 max-w-[70%]"> {/* 🌟 Added wrapper for layout separation */}
      <h3 className="text-xl font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
        {workspace.name}
      </h3>
      
      {/* 🌟 NEW: Clean Dynamic Owner Badge */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-slate-500 font-medium">Owner:</span>
        <span className="inline-flex items-center bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded text-[11px] font-semibold text-blue-400">
          {workspace.owner?.name || "Workspace Admin"}
        </span>
      </div>
    </div>
  )}
  
  <span className="bg-slate-800 text-slate-400 border border-slate-700/50 px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium shrink-0">
    #{workspace.id}
  </span>
</div>

<div className="flex justify-between items-center pt-4 border-t border-slate-800/40 mt-auto">
  {editingWorkspaceId === workspace.id ? (
    <p className="text-xs text-emerald-400 font-medium animate-pulse">
      Press Enter to save...
    </p>
  ) : (
    <p className="text-xs text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
      Open Workspace →
    </p>
  )}
  
  {/* Action Buttons Container */}
  <div className="flex items-center gap-2">
    {/* 🌟 ACTION BUTTONS: Only shown if current user matches owner_id */}
    {currentUserId === workspace.owner_id && (
      <>
        {editingWorkspaceId === workspace.id ? (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateWorkspace(workspace.id);
              }}
              className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
            >
              Save
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingWorkspaceId(null);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {/* EDIT BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Stop card navigation
                setEditingWorkspaceId(workspace.id);
                setEditNameValue(workspace.name);
              }}
              className="opacity-0 group-hover:opacity-100 bg-slate-900 hover:bg-blue-950/40 text-slate-400 hover:text-blue-400 border border-slate-800 hover:border-blue-900/40 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
            >
              Edit
            </button>
            {/* DELETE BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteWorkspace(workspace.id);
              }}
                            className="opacity-0 group-hover:opacity-100 bg-slate-900 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/40 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty Fallback State */}
        {workspaces.length === 0 && (
          <div className="text-slate-400 text-center py-16 bg-[#111827]/40 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-lg font-medium">No workspaces found.</p>
            <p className="text-sm text-slate-500 mt-1">Get started by creating your first workspace above.</p>
          </div>
        )}
      </div>
    </div>
  );
}