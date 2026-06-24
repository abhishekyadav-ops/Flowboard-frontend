import api from "./api";

export interface List {
  id: number;
  board_id: number;
  title: string;
  position: number;
}

export const listService = {
  createList: async (
    boardId: number,
    title: string,
    position: number = 0
  ): Promise<List> => {
    const response = await api.post(`/lists/${boardId}`, {
      title,
      position,
    });
    return response.data;
  },

  getList: async (listId: number): Promise<List> => {
    const response = await api.get(`/lists/${listId}`);
    return response.data;
  },

  updateList: async (
    listId: number,
    title?: string,
    position?: number
  ): Promise<List> => {
    const response = await api.put(`/lists/${listId}`, {
      title,
      position,
    });
    return response.data;
  },

  reorderList: async (listId: number, position: number) => {
    const response = await api.put(`/lists/${listId}/reorder`, { position });
    return response.data;
  },

  deleteList: async (listId: number) => {
    await api.delete(`/lists/${listId}`);
  },

  getCards: async (listId: number) => {
    const response = await api.get(`/lists/${listId}/cards`);
    return response.data;
  },
};
