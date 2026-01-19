import { create } from "zustand";
import type { GardenStateResponse, RewardHistoryItem, TaskItem } from "../api/zigletApi";

interface BackendState {
  garden: GardenStateResponse | null;
  tasks: TaskItem[];
  rewards: RewardHistoryItem[];
  setGarden: (garden: GardenStateResponse) => void;
  setTasks: (tasks: TaskItem[]) => void;
  setRewards: (rewards: RewardHistoryItem[]) => void;
  reset: () => void;
}

export const useBackendStore = create<BackendState>((set) => ({
  garden: null,
  tasks: [],
  rewards: [],
  setGarden: (garden) => set({ garden }),
  setTasks: (tasks) => set({ tasks }),
  setRewards: (rewards) => set({ rewards }),
  reset: () => set({ garden: null, tasks: [], rewards: [] }),
}));
