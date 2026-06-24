import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

interface Member {
  id: number;
  workspace_id: number;
  user_id: number;
  role: string;
  joined_at: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface UserSearchResult {
  id: number;
  name: string;
  email: string;
}

export default function Members() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const response = await api.get(`/workspaces/${workspaceId}/search-users?q=${searchQuery}`);
          setSearchResults(response.data);
        } catch (error) {
          console.error("User search failed", error);
        }
      } else {
        if (searchResults.length > 0) setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, workspaceId, searchResults.length]);

  const addMember = async () => {
    try {
      if (!selectedUser) {
        alert("Please select a user from the search list");
        return;
      }

      await api.post(`/workspaces/${workspaceId}/members`, {
        user_id: selectedUser.id,
      });

      setSearchQuery("");
      setSelectedUser(null);
      setSearchResults([]);
      fetchMembers();
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to add member");
    }
  };

  const removeMember = async (userId: number) => {
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
      fetchMembers();
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Failed to remove member");
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchMembers();
    }
  }, [workspaceId]);

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8">
      {/* 🌟 Central Wrapper Container (Constrains width and centers everything on the screen) */}
      <div className="max-w-2xl mx-auto w-full flex flex-col justify-start items-stretch">
        
        {/* Back Button Action Bar */}
<div className="flex justify-start mb-6">
  <button
    onClick={() => navigate(`/workspaces/${workspaceId}`)}
    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-all"
  >
    {/* 🌟 Pure Inline SVG Back Arrow (No imports required!) */}
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor" 
      className="w-4 h-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
    Back to Workspace
  </button>
</div>
        <h1 className="text-4xl font-bold mb-8 text-left">Team Members</h1>

        {/* Add Member Section */}
        <div className="bg-[#111827] p-6 rounded-2xl border border-slate-700 mb-8 w-full">
          <h2 className="text-xl font-semibold mb-4">Add Member</h2>
          <div className="relative flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={selectedUser ? selectedUser.name : searchQuery}
                disabled={!!selectedUser}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white disabled:bg-slate-800 disabled:text-slate-400"
              />
              {selectedUser && (
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute right-3 top-3 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                >
                  Clear
                </button>
              )}

              {/* Live Dropdown Overlay Container */}
              {searchResults.length > 0 && !selectedUser && (
                <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchResults([]);
                      }}
                      className="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-b-0"
                    >
                      <p className="font-medium text-left">{user.name}</p>
                      <p className="text-xs text-slate-400 text-left">{user.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={addMember}
              className="bg-blue-600 hover:bg-blue-700 px-6 rounded-lg font-medium transition-colors h-[50px]"
            >
              Add
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="grid gap-4 w-full">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-[#111827] border border-slate-700 rounded-xl p-5 flex justify-between items-center w-full shadow-sm"
            >
              <div className="text-left">
                <h3 className="font-semibold text-lg text-slate-100">{member.user?.name || "Unknown Profile"}</h3>
                <p className="text-slate-400 text-sm">{member.user?.email || "No Email Registered"}</p>
                <span className="inline-block mt-2 bg-slate-800 border border-slate-700 px-3 py-0.5 rounded-full text-xs font-medium text-slate-300 capitalize">
                  {member.role}
                </span>
              </div>
              <button
                onClick={() => removeMember(member.user_id)}
                className="bg-red-600/90 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                Remove
              </button>
            </div>
          ))}

          {members.length === 0 && (
            <div className="text-slate-400 text-center py-12 bg-[#111827]/50 border border-dashed border-slate-800 rounded-xl w-full">
              No members found in this workspace.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}