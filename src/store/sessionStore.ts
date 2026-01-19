import { create } from "zustand";
import type { ZigletUser } from "../api/zigletApi";

interface SessionState {
  token: string | null;
  user: ZigletUser | null;
  zigAddress: string | null;
  setSession: (token: string, user: ZigletUser) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  token: null,
  user: null,
  zigAddress: null,
  setSession: (token, user) => set({ token, user, zigAddress: user.zig_address }),
  clearSession: () => set({ token: null, user: null, zigAddress: null }),
}));
