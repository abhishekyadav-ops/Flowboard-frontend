import api from "./api";

export interface Workspace {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: number;
  workspace_id: number;
  user_id: number;
  name: string;
  email: string;
  role: "owner" | "manager" | "member";
  joined_at: string;
}

export interface WorkspaceStats {
  workspace_id: number;
  board_count: number;
  member_count: number;
}

export const workspaceService = {
  createWorkspace: async (
    name: string,
    description?: string
  ): Promise<Workspace> => {
    const response = await api.post("/workspaces/", {
      name,
      description,
    });
    return response.data;
  },

  getWorkspaces: async (skip: number = 0, limit: number = 10) => {
    const response = await api.get("/workspaces", {
      params: { skip, limit },
    });
    return response.data;
  },

  getWorkspace: async (workspaceId: number): Promise<Workspace> => {
    const response = await api.get(`/workspaces/${workspaceId}`);
    return response.data;
  },

  updateWorkspace: async (
    workspaceId: number,
    name?: string,
    description?: string
  ): Promise<Workspace> => {
    const response = await api.put(`/workspaces/${workspaceId}`, {
      name,
      description,
    });
    return response.data;
  },

  deleteWorkspace: async (workspaceId: number) => {
    await api.delete(`/workspaces/${workspaceId}`);
  },

  getMembers: async (workspaceId: number): Promise<WorkspaceMember[]> => {
    const response = await api.get(`/workspaces/${workspaceId}/members`);
    return response.data;
  },

  addMember: async (workspaceId: number, userId: number) => {
    const response = await api.post(`/workspaces/${workspaceId}/members`, {
      user_id: userId,
    });
    return response.data;
  },

  updateMemberRole: async (
    workspaceId: number,
    userId: number,
    role: "owner" | "manager" | "member"
  ) => {
    const response = await api.put(
      `/workspaces/${workspaceId}/members/${userId}/role`,
      { role }
    );
    return response.data;
  },

  removeMember: async (workspaceId: number, userId: number) => {
    await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },

  getStats: async (workspaceId: number): Promise<WorkspaceStats> => {
    const response = await api.get(`/workspaces/${workspaceId}/stats`);
    return response.data;
  },
};
