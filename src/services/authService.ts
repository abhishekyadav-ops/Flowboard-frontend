import api from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  register: async (name: string, email: string, password: string) => {
    const response = await api.post("/users/register", {
      name,
      email,
      password,
      confirm_password: password,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post("/users/login", {
      username: email,
      password,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/users/me");
    return response.data;
  },

  searchUsers: async (query: string, limit: number = 20) => {
    const response = await api.get("/users/search", {
      params: { q: query, limit },
    });
    return response.data;
  },

  getAllUsers: async (skip: number = 0, limit: number = 10) => {
    const response = await api.get("/users", {
      params: { skip, limit },
    });
    return response.data;
  },
};
