export interface ZigletUser {
  id: string;
  zig_address: string;
  created_at: string;
  last_login_at: string;
}

export interface NonceResponse {
  nonce: string;
}

export interface VerifyResponse {
  token: string;
  user: ZigletUser;
}

export interface GardenStateResponse {
  day: string;
  daily_visit: {
    id: string;
    garden_day: string;
    visited_at: string;
    login_reward_claimed: boolean;
  } | null;
  growth: {
    user_id: string;
    growth_points: number;
    last_growth_day: string;
  };
  streak: {
    user_id: string;
    current_streak: number;
    longest_streak: number;
    last_active_day: string;
  } | null;
}

export interface WaterGardenResponse {
  watered: boolean;
  growth: {
    user_id: string;
    growth_points: number;
    last_growth_day: string;
  };
}

export interface VisitGardenResponse {
  visited: boolean;
  day: string;
  state: {
    id: string;
    garden_day: string;
    visited_at: string;
    login_reward_claimed: boolean;
  };
}

export interface TaskItem {
  id: string;
  key: string;
  max_per_day: number;
  reward_amount: number;
  reward_type: string;
  current_count: number;
  is_completed: boolean;
}

export interface RewardHistoryItem {
  id: string;
  source: string;
  reward_type: string;
  amount: number;
  garden_day: string;
  created_at: string;
}

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Request failed: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as T;
};

export const zigletApi = {
  getNonce: (zigAddress: string) =>
    apiFetch<NonceResponse>("/auth/nonce", {
      method: "POST",
      body: JSON.stringify({ zig_address: zigAddress }),
    }),
  verifySignature: (
    zigAddress: string,
    pub_key: { type: string; value: string },
    signature: string
  ) =>
    apiFetch<VerifyResponse>("/auth/verify", {
      method: "POST",
      body: JSON.stringify({
        zig_address: zigAddress,
        pub_key,
        signature,
      }),
    }),
  visitGarden: (token: string) =>
    apiFetch<VisitGardenResponse>("/garden/visit", { method: "POST" }, token),
  getGardenState: (token: string) =>
    apiFetch<GardenStateResponse>("/garden/state", {}, token),
  waterGarden: (token: string) =>
    apiFetch<WaterGardenResponse>("/garden/water", { method: "POST" }, token),
  getTasks: (token: string) =>
    apiFetch<{ tasks: TaskItem[] }>("/tasks", {}, token),
  completeTask: (token: string, key: string) =>
    apiFetch<{ success: boolean; result: unknown }>(
      "/tasks/complete",
      {
        method: "POST",
        body: JSON.stringify({ key }),
      },
      token
    ),
  getRewardHistory: (token: string, cursor?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (limit) params.set("limit", limit.toString());
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<{ history: RewardHistoryItem[]; nextCursor?: string }>(
      `/rewards/history${suffix}`,
      {},
      token
    );
  },
  verifyExternal: (token: string, tx_hash: string) =>
    apiFetch<{ success: boolean; reward: unknown }>(
      "/external/verify",
      {
        method: "POST",
        body: JSON.stringify({ tx_hash }),
      },
      token
    ),
};
