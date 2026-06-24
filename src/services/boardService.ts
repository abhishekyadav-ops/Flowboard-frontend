import api from "./api";

export interface Board {
  id: number;
  workspace_id: number;
  name: string;
  description?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface BoardStats {
  board_id: number;
  list_count: number;
  card_count: number;
}

export const boardService = {
  createBoard: async (
    workspaceId: number,
    name: string,
    description?: string
  ): Promise<Board> => {
    const response = await api.post(`/boards/${workspaceId}`, {
      name,
      description,
    });
    return response.data;
  },

  getWorkspaceBoards: async (
    workspaceId: number,
    skip: number = 0,
    limit: number = 10
  ) => {
    const response = await api.get(`/boards/${workspaceId}`, {
      params: { skip, limit },
    });
    return response.data;
  },

  getBoard: async (boardId: number): Promise<Board> => {
    const response = await api.get(`/boards/${boardId}/details`);
    return response.data;
  },

  updateBoard: async (
    boardId: number,
    name?: string,
    description?: string
  ): Promise<Board> => {
    const response = await api.put(`/boards/${boardId}`, {
      name,
      description,
    });
    return response.data;
  },

  deleteBoard: async (boardId: number) => {
    await api.delete(`/boards/${boardId}`);
  },

  getStats: async (boardId: number): Promise<BoardStats> => {
    const response = await api.get(`/boards/${boardId}/stats`);
    return response.data;
  },
};
