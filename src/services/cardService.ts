import api from "./api";

export interface Card {
  id: number;
  list_id: number;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "critical";
  due_date?: string;
  position: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CardAssignee {
  id: number;
  name: string;
  email: string;
}

export interface Comment {
  id: number;
  card_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export const cardService = {
  createCard: async (
    boardId: number,
    listId: number,
    title: string,
    description?: string,
    priority: string = "medium",
    dueDate?: string
  ): Promise<Card> => {
    const response = await api.post(`/cards/${boardId}`, {
      list_id: listId,
      title,
      description,
      priority,
      due_date: dueDate,
    });
    return response.data;
  },

  getCard: async (cardId: number): Promise<Card> => {
    const response = await api.get(`/cards/${cardId}`);
    return response.data;
  },

  updateCard: async (
    cardId: number,
    title?: string,
    description?: string,
    priority?: string,
    dueDate?: string
  ): Promise<Card> => {
    const response = await api.put(`/cards/${cardId}`, {
      title,
      description,
      priority,
      due_date: dueDate,
    });
    return response.data;
  },

  moveCard: async (
    cardId: number,
    listId: number,
    position: number
  ): Promise<any> => {
    const response = await api.put(`/cards/${cardId}/move`, {
      list_id: listId,
      position,
    });
    return response.data;
  },

  deleteCard: async (cardId: number) => {
    await api.delete(`/cards/${cardId}`);
  },

  assignCard: async (cardId: number, userId: number) => {
    const response = await api.post(`/cards/${cardId}/assign`, {
      user_id: userId,
    });
    return response.data;
  },

  unassignCard: async (cardId: number, userId: number) => {
    await api.delete(`/cards/${cardId}/assign/${userId}`);
  },

  getAssignees: async (cardId: number): Promise<{ card_id: number; assignees: CardAssignee[] }> => {
    const response = await api.get(`/cards/${cardId}/assignees`);
    return response.data;
  },

  addComment: async (cardId: number, message: string) => {
    const response = await api.post(`/cards/${cardId}/comments`, { message });
    return response.data;
  },

  getComments: async (
    cardId: number,
    skip: number = 0,
    limit: number = 50
  ): Promise<Comment[]> => {
    const response = await api.get(`/cards/${cardId}/comments`, {
      params: { skip, limit },
    });
    return response.data;
  },
};
