import React, { useEffect, useState } from "react";
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

const MEMBERS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; }
  body { font-family: 'Inter', sans-serif; overflow-x: hidden; background: #050A14; }

  @keyframes aurora {
    0%   { transform: translate(0%,0%)   scale(1);    opacity: .45; }
    33%  { transform: translate(4%,-6%)  scale(1.06); opacity: .35; }
    66%  { transform: translate(-3%,5%)  scale(.97);  opacity: .50; }
    100% { transform: translate(0%,0%)   scale(1);    opacity: .45; }
  }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }

  .dropdown-scroll::-webkit-scrollbar { width: 4px; }
  .dropdown-scroll::-webkit-scrollbar-track { background: transparent; }
  .dropdown-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,.25); border-radius: 99px; }

  .members-navbar {
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
  @media (min-width: 640px) { .members-navbar { height: 64px; padding: 0 32px; } }

  .content-card {
    background: linear-gradient(160deg,#0D1830 0%,#0A1220 100%);
    border: 1px solid rgba(99,102,241,.12);
    border-radius: 20px;
    padding: 24px;
    width: 100%;
    box-shadow: 0 4px 24px rgba(0,0,0,.2);
  }

  .member-item-row {
    background: linear-gradient(145deg,#131f35,#0e1826);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 14px;
    padding: 16px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    transition: border-color .2s, box-shadow .2s, transform .15s;
  }
  @media (hover:hover) {
    .member-item-row:hover {
      border-color: rgba(99,102,241,.25);
      box-shadow: 0 4px 20px rgba(0,0,0,.3);
    }
  }

  .input-glow:focus {
    outline: none;
    border-color: rgba(99,102,241,.7) !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,.12);
  }

  .tag { border-radius: 7px; font-size: 11px; font-weight: 600; padding: 2px 7px; display:inline-flex; align-items:center; }
  .tag-indigo { background:rgba(99,102,241,.12); border:1px solid rgba(99,102,241,.25); color:#A5B4FC; }
  
  .logo-ring {
    border-radius:12px;
    background:linear-gradient(135deg,#6366F1,#22D3EE);
    display:flex; align-items:center; justify-content:center;
    font-weight:800; color:#fff;
    box-shadow:0 4px 16px rgba(99,102,241,.4);
    flex-shrink:0;
  }

  .breadcrumb {
    background:none; border:none; color:#6366F1; font-size:12px;
    font-weight:600; cursor:pointer; font-family:inherit; padding:0;
    transition:color .2s; white-space:nowrap;
  }
  @media (hover:hover) { .breadcrumb:hover { color:#818CF8; } }

  @media (prefers-reduced-motion:reduce) {
    .member-item-row { transition:none; }
    .aurora-blob { animation:none !important; }
  }
`;

export default function Members() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);

  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = MEMBERS_STYLES;
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, []);

  const fetchMembers = async () => {
    if (!workspaceId) return;
    try {
      const response = await api.get(`/workspaces/${workspaceId}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  // Fixed Debounced Search Effect logic loop
  useEffect(() => {
    if (!workspaceId) return;

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await api.get(`/workspaces/${workspaceId}/search-users?q=${searchQuery}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error("User search failed", error);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, workspaceId]);

  const addMember = async () => {
    if (!workspaceId) return;
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
    if (!workspaceId) return;
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
    <div style={{ minHeight: "100vh", background: "#050A14", color: "#E2E8F0", fontFamily: "Inter,sans-serif", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      
      {/* Aurora blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {[
          { top: "-15%", left: "15%",  w: 500, h: 500, color: "rgba(99,102,241,.14)", dur: "20s", delay: "0s",  rev: false },
          { top: "55%",  right: "8%",  w: 420, h: 420, color: "rgba(34,211,238,.10)", dur: "25s", delay: "2s",  rev: true  },
          { top: "30%",  left: "45%",  w: 350, h: 350, color: "rgba(139,92,246,.08)", dur: "30s", delay: "5s",  rev: false },
        ].map((b, i) => (
          <div key={i} className="aurora-blob" style={{
            position: "absolute",
            top: b.top, left: (b as any).left, right: (b as any).right,
            width: b.w, height: b.h, borderRadius: "50%",
            background: `radial-gradient(ellipse,${b.color} 0%,transparent 70%)`,
            animation: `aurora ${b.dur} ease-in-out infinite ${b.delay}${b.rev ? " reverse" : ""}`,
            filter: "blur(50px)",
          }} />
        ))}
      </div>

      {/* Navbar */}
      <nav className="members-navbar">
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <div className="logo-ring" style={{ width: 38, height: 38, fontSize: 17 }}>F</div>
            <div style={{ minWidth: 0 }}>
              <button
                className="breadcrumb"
                onClick={() => navigate(`/workspaces/${workspaceId}/boards`)}
              >
                ← Workspace
              </button>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Manage Workspace Team
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: "#475569", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366F1", display: "inline-block", boxShadow: "0 0 8px rgba(99,102,241,.6)" }} />
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </span>
          </div>
        </div>
      </nav>

      {/* Content Canvas */}
      <div style={{
        flex: 1,
        marginTop: 60,
        padding: "32px max(16px, env(safe-area-inset-left)) 60px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ width: "100%", maxWidth: "640px", display: "flex", flexDirection: "column", gap: 24 }}>
          
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.8px", animation: "fadeUp .4s ease both" }}>
            Team Members
          </h1>

          {/* Add Member Box */}
          <div className="content-card" style={{ animation: "fadeUp .4s .06s ease both", position: "relative", zIndex: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9", marginBottom: 16, letterSpacing: "-0.2px" }}>
              Add Workspace Member
            </h2>
            <div style={{ display: "flex", gap: 12, position: "relative", alignItems: "stretch" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={selectedUser ? selectedUser.name : searchQuery}
                  disabled={!!selectedUser}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-glow"
                  style={{
                    width: "100%", height: "46px",
                    background: "rgba(5,10,20,.7)", border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 12, padding: "0 14px", color: "#E2E8F0", fontSize: 13,
                    fontFamily: "inherit", transition: "border-color .2s,box-shadow .2s",
                  }}
                />
                {selectedUser && (
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setSearchQuery("");
                    }}
                    style={{
                      position: "absolute", right: 12, top: 10,
                      background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.1)",
                      color: "#94A3B8", borderRadius: 8, padding: "4px 10px", fontSize: 11,
                      fontWeight: 600, cursor: "pointer", fontFamily: "inherit", zIndex: 1
                    }}
                  >
                    Clear
                  </button>
                )}

                {/* Dropdown Overlay Results */}
                {searchResults.length > 0 && !selectedUser && (
                  <div className="dropdown-scroll" style={{
                    position: "absolute", left: 0, right: 0, marginTop: 6,
                    background: "linear-gradient(145deg,#0D1830,#0A1220)",
                    border: "1px solid rgba(99,102,241,.35)", borderRadius: 14,
                    boxShadow: "0 20px 40px rgba(0,0,0,.7)", zIndex: 999,
                    maxHeight: "200px", overflowY: "auto"
                  }}>
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchResults([]);
                        }}
                        style={{
                          padding: "12px 16px", cursor: "pointer",
                          borderBottom: "1px solid rgba(255,255,255,.04)",
                          transition: "background .15s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,.04)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9", textAlign: "left" }}>{user.name}</p>
                        <p style={{ fontSize: 11, color: "#64748B", marginTop: 2, textAlign: "left" }}>{user.email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={addMember}
                style={{
                  background: "linear-gradient(135deg,#6366F1,#4F46E5)", border: "none",
                  color: "#fff", borderRadius: 12, padding: "0 24px", fontSize: 13,
                  fontWeight: 700, cursor: "pointer", fontFamily: "inherit", height: "46px",
                  boxShadow: "0 4px 12px rgba(99,102,241,.3)", transition: "opacity .2s"
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Members List Container */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", position: "relative", zIndex: 1 }}>
            {members.map((member, idx) => (
              <div
                key={member.id}
                className="member-item-row"
                style={{ animation: `fadeUp .4s ${0.12 + idx * 0.04}s ease both` }}
              >
                <div style={{ textAlign: "left" }}>
                  <h3 style={{ fontWeight: 700, fontSize: 14, color: "#F1F5F9" }}>
                    {member.user?.name || "Unknown Profile"}
                  </h3>
                  <p style={{ color: "#64748B", fontSize: 12, marginTop: 2 }}>
                    {member.user?.email || "No Email Registered"}
                  </p>
                  <div style={{ marginTop: 8 }}>
                    <span className="tag tag-indigo">
                      {member.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeMember(member.user_id)}
                  style={{
                    fontSize: 12, color: "#F87171", background: "rgba(239,68,68,.08)",
                    border: "1px solid rgba(239,68,68,.2)", padding: "7px 14px", borderRadius: 10,
                    fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background .2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,.16)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,.08)"}
                >
                  Remove
                </button>
              </div>
            ))}

            {members.length === 0 && (
              <div style={{
                textAlign: "center", border: "1px dashed rgba(99,102,241,.2)", borderRadius: 24,
                background: "rgba(99,102,241,.03)", padding: "48px 32px", animation: "fadeUp .5s ease both"
              }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: .4 }}>⬡</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#475569" }}>No members found</p>
                <p style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>Add contributors above to access the workspace.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}