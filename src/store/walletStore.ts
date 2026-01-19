import { create } from "zustand";

interface WalletState {
  address: string | null;
  status: "Connected" | "Disconnected" | "Connecting" | "Rejected" | "NotExist";
  setAddress: (address: string | null) => void;
  setStatus: (status: WalletState["status"]) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  status: "Disconnected",
  setAddress: (address) => set({ address }),
  setStatus: (status) => set({ status }),
}));
