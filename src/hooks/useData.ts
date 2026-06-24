import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import { workspaceService } from "../services/workspaceService";
import { boardService } from "../services/boardService";
import { cardService } from "../services/cardService";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          localStorage.removeItem("token");
          setError("Failed to fetch user");
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      localStorage.setItem("token", response.access_token);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        await authService.register(name, email, password);
        await login(email, password);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Registration failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return { user, loading, error, login, register, logout };
};

export const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const data = await workspaceService.getWorkspaces();
      setWorkspaces(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return { workspaces, loading, error, fetchWorkspaces };
};

export const useWorkspace = (workspaceId: number) => {
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const [workspaceData, membersData, statsData] = await Promise.all([
        workspaceService.getWorkspace(workspaceId),
        workspaceService.getMembers(workspaceId),
        workspaceService.getStats(workspaceId),
      ]);
      setWorkspace(workspaceData);
      setMembers(membersData);
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspace();
    }
  }, [workspaceId, fetchWorkspace]);

  return { workspace, members, stats, loading, error, fetchWorkspace };
};

export const useBoards = (workspaceId: number) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    try {
      const data = await boardService.getWorkspaceBoards(workspaceId);
      setBoards(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      fetchBoards();
    }
  }, [workspaceId, fetchBoards]);

  return { boards, loading, error, fetchBoards };
};

export const useBoard = (boardId: number) => {
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    try {
      // Note: You may need to create a getLists endpoint or fetch from board
      const boardData = await boardService.getBoard(boardId);
      const statsData = await boardService.getStats(boardId);
      setBoard(boardData);
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    if (boardId) {
      fetchBoard();
    }
  }, [boardId, fetchBoard]);

  return { board, lists, stats, loading, error, fetchBoard };
};
