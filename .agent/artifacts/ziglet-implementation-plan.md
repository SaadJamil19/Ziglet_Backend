# 🌴 Oasis of Zig: Complete Implementation Plan (2D Edition)

## 📋 Executive Summary

**Oasis of Zig** is a **2D isometric** blockchain-incentivized garden builder utilizing a "Nurture-to-Earn" mechanic. Players perform daily gardening tasks to maintain their virtual land and earn rewards on Zigchain via the Antigravity IDE ecosystem.

---

## 🎯 Core Gameplay Loop

1. **Daily Ritual**: User logs in and views their garden state (influenced by backend data)
2. **The Nurture Task**: User clicks the "Water" button
3. **Automated Jog**: Character sprite automatically navigates the isometric grid, watering plants via scripted GSAP sequence
4. **Visual Evolution**: Plants grow (or wither) based on user consistency - sprites swap to show growth stages
5. **Reward Trigger**: Frontend signals backend to release rewards to linked wallet

---

## 🎮 Gamification & Engagement Systems

### **1. Wallet Connection & Onboarding**

#### **Welcome Modal (First Visit)**

**File**: `src/components/ui/WelcomeModal.tsx`

**Design Requirements**:

- **Forest Theme**: Dark brown (#3e2723), dark green (#1b5e20), moss green (#558b2f)
- **Modal Overlay**: Semi-transparent dark backdrop
- **Glassmorphism Effect**: Frosted glass with forest colors
- **Animations**: Smooth fade-in with GSAP

**Visual Design**:

```
┌─────────────────────────────────────────┐
│  🌲 Welcome to Oasis of Zig 🌲         │
│                                         │
│  [Forest illustration/animation]        │
│                                         │
│  Nurture your garden daily and earn    │
│  rewards on Zigchain!                   │
│                                         │
│  [Connect Wallet Button]                │
│  (Dark green with glow effect)          │
│                                         │
│  Learn More                             │
└─────────────────────────────────────────┘
```

**Implementation**:

```typescript
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import gsap from "gsap";

export const WelcomeModal = () => {
  const { isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal only on first visit
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited && !isConnected) {
      setIsOpen(true);
      // Animate modal entrance
      gsap.from(".welcome-modal", {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: "back.out",
      });
    }
  }, [isConnected]);

  const handleConnect = () => {
    localStorage.setItem("hasVisited", "true");
    // Trigger wallet connection
  };

  if (!isOpen || isConnected) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="welcome-modal bg-gradient-to-br from-[#3e2723] to-[#1b5e20] p-8 rounded-2xl border-2 border-[#558b2f] shadow-2xl max-w-md w-full mx-4">
        {/* Forest Icon/Animation */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🌲🌿🌳</div>
          <h2 className="text-3xl font-bold text-[#a5d6a7] mb-2">
            Welcome to Oasis of Zig
          </h2>
          <p className="text-[#c8e6c9] text-sm">
            Nurture your garden daily and earn rewards on Zigchain!
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-3 mb-6 text-[#e8f5e9]">
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span className="text-sm">
              Daily water allowance to grow your garden
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span className="text-sm">
              Earn ZIG tokens for completing tasks
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span className="text-sm">Build streaks for bonus rewards</span>
          </div>
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          className="w-full bg-gradient-to-r from-[#2e7d32] to-[#388e3c] hover:from-[#388e3c] hover:to-[#43a047] text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          🔗 Connect Wallet to Continue
        </button>

        <button
          onClick={() => setIsOpen(false)}
          className="w-full mt-3 text-[#a5d6a7] hover:text-white text-sm transition-colors"
        >
          Learn More
        </button>
      </div>
    </div>
  );
};
```

### **2. Daily Water Allowance System**

#### **Water Resource Management**

**File**: `src/stores/useWaterStore.ts`

**Concept**:

- Users receive a **daily water allowance** (e.g., 100 water units)
- Each plant watering consumes water (e.g., 10 units per plant)
- Water resets every 24 hours
- Users can earn more water through tasks

**State Schema**:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WaterState {
  // Water Resources
  currentWater: number;
  maxWater: number;
  lastRefillDate: Date | null;

  // Daily Login Rewards
  lastLoginDate: Date | null;
  consecutiveLogins: number;
  totalLogins: number;
  dailyRewardClaimed: boolean;

  // Actions
  consumeWater: (amount: number) => boolean;
  refillWater: () => void;
  addWater: (amount: number) => void;
  checkDailyRefill: () => void;
  claimDailyReward: () => void;
}

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      currentWater: 100,
      maxWater: 100,
      lastRefillDate: null,
      lastLoginDate: null,
      consecutiveLogins: 0,
      totalLogins: 0,
      dailyRewardClaimed: false,

      consumeWater: (amount) => {
        const { currentWater } = get();
        if (currentWater >= amount) {
          set({ currentWater: currentWater - amount });
          return true;
        }
        return false;
      },

      refillWater: () => {
        set({
          currentWater: get().maxWater,
          lastRefillDate: new Date(),
          dailyRewardClaimed: false,
        });
      },

      addWater: (amount) => {
        set((state) => ({
          currentWater: Math.min(state.maxWater, state.currentWater + amount),
        }));
      },

      checkDailyRefill: () => {
        const { lastRefillDate, refillWater } = get();
        const now = new Date();

        if (!lastRefillDate) {
          refillWater();
          return;
        }

        const hoursSinceRefill =
          (now.getTime() - lastRefillDate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceRefill >= 24) {
          refillWater();
        }
      },

      claimDailyReward: () => {
        const { lastLoginDate, consecutiveLogins } = get();
        const now = new Date();

        if (!lastLoginDate) {
          // First login
          set({
            lastLoginDate: now,
            consecutiveLogins: 1,
            totalLogins: 1,
            dailyRewardClaimed: true,
          });
          return;
        }

        const daysSinceLogin = Math.floor(
          (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLogin === 1) {
          // Consecutive login
          set((state) => ({
            lastLoginDate: now,
            consecutiveLogins: state.consecutiveLogins + 1,
            totalLogins: state.totalLogins + 1,
            dailyRewardClaimed: true,
          }));
        } else if (daysSinceLogin > 1) {
          // Streak broken
          set({
            lastLoginDate: now,
            consecutiveLogins: 1,
            totalLogins: get().totalLogins + 1,
            dailyRewardClaimed: true,
          });
        }
      },
    }),
    {
      name: "water-storage",
    }
  )
);
```

#### **Water Display Component**

**File**: `src/components/ui/WaterDisplay.tsx`

```typescript
import { useWaterStore } from "../../stores/useWaterStore";

export const WaterDisplay = () => {
  const currentWater = useWaterStore((s) => s.currentWater);
  const maxWater = useWaterStore((s) => s.maxWater);
  const percentage = (currentWater / maxWater) * 100;

  return (
    <div className="bg-gradient-to-br from-[#3e2723]/80 to-[#1b5e20]/80 backdrop-blur-md rounded-lg px-4 py-3 border border-[#558b2f]/50">
      <div className="flex items-center gap-3">
        <div className="text-3xl">💧</div>
        <div className="flex-1">
          <div className="text-[#a5d6a7] text-xs font-semibold mb-1">
            Water Available
          </div>
          <div className="w-full h-2 bg-[#1b5e20] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-[#c8e6c9] text-xs mt-1">
            {currentWater} / {maxWater} units
          </div>
        </div>
      </div>
    </div>
  );
};
```

### **3. Daily Login Rewards**

#### **Daily Reward Modal**

**File**: `src/components/ui/DailyRewardModal.tsx`

**Rewards**:

- **Day 1-6**: 10 ZIG tokens + 50 water units
- **Day 7**: 100 ZIG tokens + 200 water units (Streak Bonus!)
- **Day 14**: 250 ZIG tokens + 500 water units (Milestone!)

```typescript
import { useEffect, useState } from "react";
import { useWaterStore } from "../../stores/useWaterStore";
import { useAccount } from "wagmi";
import gsap from "gsap";

export const DailyRewardModal = () => {
  const { isConnected } = useAccount();
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);

  const dailyRewardClaimed = useWaterStore((s) => s.dailyRewardClaimed);
  const consecutiveLogins = useWaterStore((s) => s.consecutiveLogins);
  const claimDailyReward = useWaterStore((s) => s.claimDailyReward);
  const addWater = useWaterStore((s) => s.addWater);

  useEffect(() => {
    if (isConnected && !dailyRewardClaimed) {
      // Calculate reward based on streak
      let tokens = 10;
      let water = 50;

      if (consecutiveLogins === 6) {
        // 7-day streak
        tokens = 100;
        water = 200;
      } else if (consecutiveLogins === 13) {
        // 14-day streak
        tokens = 250;
        water = 500;
      }

      setRewardAmount(tokens);
      setShowReward(true);

      // Animate modal
      gsap.from(".reward-modal", {
        scale: 0.5,
        rotation: 10,
        opacity: 0,
        duration: 0.6,
        ease: "elastic.out",
      });
    }
  }, [isConnected, dailyRewardClaimed]);

  const handleClaim = async () => {
    claimDailyReward();
    addWater(50); // Add bonus water

    // TODO: Call backend API to credit ZIG tokens
    // await api.claimDailyReward(walletAddress);

    // Animate claim
    gsap.to(".reward-modal", {
      scale: 1.1,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        setShowReward(false);
      },
    });
  };

  if (!showReward) return null;

  const isStreakBonus = consecutiveLogins === 6 || consecutiveLogins === 13;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="reward-modal bg-gradient-to-br from-[#3e2723] to-[#1b5e20] p-8 rounded-2xl border-2 border-yellow-500 shadow-2xl max-w-md w-full mx-4">
        {/* Reward Icon */}
        <div className="text-center mb-6">
          <div className="text-7xl mb-4 animate-bounce">
            {isStreakBonus ? "🎉" : "🎁"}
          </div>
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">
            {isStreakBonus ? "Streak Bonus!" : "Daily Reward"}
          </h2>
          <p className="text-[#c8e6c9] text-sm">
            Day {consecutiveLogins + 1} Login Streak
          </p>
        </div>

        {/* Rewards */}
        <div className="bg-black/30 rounded-lg p-4 mb-6">
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-3xl mb-2">🪙</div>
              <div className="text-yellow-400 font-bold text-xl">
                +{rewardAmount} ZIG
              </div>
              <div className="text-[#a5d6a7] text-xs">Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💧</div>
              <div className="text-cyan-400 font-bold text-xl">+50 Water</div>
              <div className="text-[#a5d6a7] text-xs">Units</div>
            </div>
          </div>
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Claim Reward
        </button>
      </div>
    </div>
  );
};
```

### **4. Task System**

#### **Daily Tasks**

**File**: `src/stores/useTasksStore.ts`

**Available Tasks**:

1. **Water the Garden** - Earn 5 ZIG + 20 XP
2. **Get More Water** - Visit Degenter.io to swap tokens - Earn 50 water units
3. **Share on Twitter** - Share garden progress - Earn 25 ZIG
4. **Invite a Friend** - Refer new users - Earn 100 ZIG

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Task {
  id: string;
  title: string;
  description: string;
  type: "water" | "swap" | "social" | "referral";
  reward: {
    zig?: number;
    water?: number;
    xp?: number;
  };
  completed: boolean;
  completedAt?: Date;
  externalLink?: string;
}

interface TasksState {
  tasks: Task[];
  completedToday: string[];
  lastResetDate: Date | null;

  // Actions
  completeTask: (taskId: string) => void;
  resetDailyTasks: () => void;
  checkDailyReset: () => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [
        {
          id: "water-garden",
          title: "Water the Garden",
          description: "Water all plants in your garden",
          type: "water",
          reward: { zig: 5, xp: 20 },
          completed: false,
        },
        {
          id: "get-water",
          title: "Get More Water",
          description: "Visit Degenter.io and swap ZIG tokens",
          type: "swap",
          reward: { water: 50 },
          completed: false,
          externalLink: "https://degenter.io",
        },
        {
          id: "share-twitter",
          title: "Share on Twitter",
          description: "Share your garden progress on Twitter",
          type: "social",
          reward: { zig: 25 },
          completed: false,
        },
        {
          id: "invite-friend",
          title: "Invite a Friend",
          description: "Refer a new user to Oasis of Zig",
          type: "referral",
          reward: { zig: 100 },
          completed: false,
        },
      ],
      completedToday: [],
      lastResetDate: null,

      completeTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, completed: true, completedAt: new Date() }
              : task
          ),
          completedToday: [...state.completedToday, taskId],
        }));
      },

      resetDailyTasks: () => {
        set((state) => ({
          tasks: state.tasks.map((task) => ({
            ...task,
            completed: false,
            completedAt: undefined,
          })),
          completedToday: [],
          lastResetDate: new Date(),
        }));
      },

      checkDailyReset: () => {
        const { lastResetDate, resetDailyTasks } = get();
        const now = new Date();

        if (!lastResetDate) {
          set({ lastResetDate: now });
          return;
        }

        const hoursSinceReset =
          (now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceReset >= 24) {
          resetDailyTasks();
        }
      },
    }),
    {
      name: "tasks-storage",
    }
  )
);
```

#### **Tasks Panel Component**

**File**: `src/components/ui/TasksPanel.tsx`

```typescript
import { useTasksStore } from "../../stores/useTasksStore";
import { useWaterStore } from "../../stores/useWaterStore";
import { useGameStore } from "../../stores/useGameStore";

export const TasksPanel = () => {
  const tasks = useTasksStore((s) => s.tasks);
  const completeTask = useTasksStore((s) => s.completeTask);
  const addWater = useWaterStore((s) => s.addWater);

  const handleTaskClick = async (task: Task) => {
    if (task.completed) return;

    if (task.type === "swap" && task.externalLink) {
      // Open external link
      window.open(task.externalLink, "_blank");
      // Mark as completed (can add verification later)
      completeTask(task.id);
      if (task.reward.water) addWater(task.reward.water);
    } else if (task.type === "social") {
      // Generate Twitter share link
      const text = encodeURIComponent(
        "Check out my garden in Oasis of Zig! 🌳💧 #OasisOfZig #Zigchain"
      );
      const url = `https://twitter.com/intent/tweet?text=${text}`;
      window.open(url, "_blank");
      completeTask(task.id);
    } else if (task.type === "water") {
      // This is handled by the main water button
      // Just show feedback
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#3e2723]/90 to-[#1b5e20]/90 backdrop-blur-md rounded-xl p-6 border border-[#558b2f]/50">
      <h3 className="text-2xl font-bold text-[#a5d6a7] mb-4">Daily Tasks</h3>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => handleTaskClick(task)}
            className={`
              bg-black/30 rounded-lg p-4 border border-[#558b2f]/30
              transition-all duration-300 cursor-pointer
              ${
                task.completed
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-black/40 hover:border-[#558b2f] hover:scale-102"
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[#c8e6c9] font-semibold">{task.title}</h4>
                  {task.completed && (
                    <span className="text-green-400 text-sm">✓</span>
                  )}
                </div>
                <p className="text-[#a5d6a7] text-sm mb-2">
                  {task.description}
                </p>

                {/* Rewards */}
                <div className="flex gap-3 text-xs">
                  {task.reward.zig && (
                    <span className="text-yellow-400">
                      🪙 +{task.reward.zig} ZIG
                    </span>
                  )}
                  {task.reward.water && (
                    <span className="text-cyan-400">
                      💧 +{task.reward.water} Water
                    </span>
                  )}
                  {task.reward.xp && (
                    <span className="text-purple-400">
                      ⭐ +{task.reward.xp} XP
                    </span>
                  )}
                </div>
              </div>

              {!task.completed && task.type === "swap" && (
                <span className="text-[#a5d6a7] text-xs">→</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### **5. Streaks & Milestones**

#### **Streak System**

**File**: `src/stores/useStreakStore.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Milestone {
  id: string;
  threshold: number; // Garden health %
  title: string;
  reward: {
    zig: number;
    water: number;
  };
  claimed: boolean;
}

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;

  // Milestones
  milestones: Milestone[];

  // Actions
  updateStreak: () => void;
  breakStreak: () => void;
  claimMilestone: (milestoneId: string) => void;
  checkMilestones: (gardenHealth: number) => void;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,

      milestones: [
        {
          id: "milestone-25",
          threshold: 25,
          title: "25% Garden Growth",
          reward: { zig: 50, water: 100 },
          claimed: false,
        },
        {
          id: "milestone-50",
          threshold: 50,
          title: "50% Garden Growth",
          reward: { zig: 100, water: 200 },
          claimed: false,
        },
        {
          id: "milestone-75",
          threshold: 75,
          title: "75% Garden Growth",
          reward: { zig: 200, water: 300 },
          claimed: false,
        },
        {
          id: "milestone-100",
          threshold: 100,
          title: "Full Garden!",
          reward: { zig: 500, water: 500 },
          claimed: false,
        },
      ],

      updateStreak: () => {
        const { lastActivityDate, currentStreak, longestStreak } = get();
        const now = new Date();

        if (!lastActivityDate) {
          set({
            currentStreak: 1,
            longestStreak: 1,
            lastActivityDate: now,
          });
          return;
        }

        const daysSinceActivity = Math.floor(
          (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceActivity === 1) {
          const newStreak = currentStreak + 1;
          set({
            currentStreak: newStreak,
            longestStreak: Math.max(longestStreak, newStreak),
            lastActivityDate: now,
          });
        } else if (daysSinceActivity > 1) {
          get().breakStreak();
        }
      },

      breakStreak: () => {
        set({
          currentStreak: 0,
          lastActivityDate: new Date(),
        });

        // Trigger garden decay
        useGameStore.getState().updateGardenHealth(-20);
      },

      claimMilestone: (milestoneId) => {
        set((state) => ({
          milestones: state.milestones.map((m) =>
            m.id === milestoneId ? { ...m, claimed: true } : m
          ),
        }));
      },

      checkMilestones: (gardenHealth) => {
        const { milestones } = get();
        milestones.forEach((milestone) => {
          if (!milestone.claimed && gardenHealth >= milestone.threshold) {
            // Show milestone reward modal
            console.log(`Milestone reached: ${milestone.title}`);
          }
        });
      },
    }),
    {
      name: "streak-storage",
    }
  )
);
```

#### **Streak Display Component**

**File**: `src/components/ui/StreakDisplay.tsx`

```typescript
import { useStreakStore } from "../../stores/useStreakStore";

export const StreakDisplay = () => {
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const longestStreak = useStreakStore((s) => s.longestStreak);

  const getStreakEmoji = (streak: number) => {
    if (streak >= 14) return "🔥🔥🔥";
    if (streak >= 7) return "🔥🔥";
    if (streak >= 3) return "🔥";
    return "⭐";
  };

  return (
    <div className="bg-gradient-to-br from-[#3e2723]/80 to-[#1b5e20]/80 backdrop-blur-md rounded-lg px-4 py-3 border border-[#558b2f]/50">
      <div className="flex items-center gap-3">
        <div className="text-3xl">{getStreakEmoji(currentStreak)}</div>
        <div>
          <div className="text-[#a5d6a7] text-xs font-semibold">
            Current Streak
          </div>
          <div className="text-[#c8e6c9] font-bold text-xl">
            {currentStreak} {currentStreak === 1 ? "Day" : "Days"}
          </div>
          <div className="text-[#a5d6a7] text-xs">
            Best: {longestStreak} days
          </div>
        </div>
      </div>

      {/* Streak Progress to next milestone */}
      {currentStreak < 7 && (
        <div className="mt-2">
          <div className="text-[#a5d6a7] text-xs mb-1">
            {7 - currentStreak} days to 7-day bonus
          </div>
          <div className="w-full h-1 bg-[#1b5e20] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500"
              style={{ width: `${(currentStreak / 7) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

### **6. Social Media Integration**

#### **Share Component**

**File**: `src/components/ui/ShareButton.tsx`

```typescript
import { useGameStore } from "../../stores/useGameStore";
import { useStreakStore } from "../../stores/useStreakStore";

export const ShareButton = () => {
  const gardenHealth = useGameStore((s) => s.gardenHealth);
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const playerLevel = useGameStore((s) => s.playerLevel);

  const handleShare = (platform: "twitter" | "facebook") => {
    const text =
      `🌳 My Oasis of Zig Garden 🌳\n\n` +
      `🌿 Health: ${gardenHealth}%\n` +
      `🔥 Streak: ${currentStreak} days\n` +
      `⭐ Level: ${playerLevel}\n\n` +
      `Join me and earn ZIG tokens! #OasisOfZig #Zigchain`;

    if (platform === "twitter") {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}`;
      window.open(url, "_blank");
    } else if (platform === "facebook") {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        window.location.href
      )}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleShare("twitter")}
        className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
      >
        🐦 Share on Twitter
      </button>
      <button
        onClick={() => handleShare("facebook")}
        className="bg-[#4267B2] hover:bg-[#365899] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
      >
        📘 Share on Facebook
      </button>
    </div>
  );
};
```

### **7. Updated Project Structure**

Add these new files to the project structure:

```
src/
├── components/
│   ├── ui/
│   │   ├── WelcomeModal.tsx         # Forest-themed wallet connection
│   │   ├── DailyRewardModal.tsx     # Daily login rewards
│   │   ├── WaterDisplay.tsx         # Water allowance indicator
│   │   ├── TasksPanel.tsx           # Daily tasks list
│   │   ├── StreakDisplay.tsx        # Streak counter
│   │   ├── MilestoneModal.tsx       # Milestone rewards
│   │   └── ShareButton.tsx          # Social media sharing
├── stores/
│   ├── useWaterStore.ts             # Water resource management
│   ├── useTasksStore.ts             # Task system state
│   └── useStreakStore.ts            # Streak & milestone tracking
```

---

## 🎨 Visual Composition & UI Layout

Following the **Clash of Clans** reference, our screen real estate is divided into **three layers**:

### **Layer 1: The Background (Environment)**

- Static or parallax-scrolling lush forest/beach border
- Creates depth and immersion
- Changes based on garden health (Lush vs. Dry)

### **Layer 2: The Game Board (Isometric 2D)**

- 45° tilted diamond grid where the "Bare Land" exists
- Character sprite navigates this grid
- Plants positioned on grid coordinates

### **Layer 3: The HUD (Heads-Up Display)**

- Fixed UI elements pinned to screen corners
- Wallet balance (top-right)
- Garden vitality progress bar (top-center)
- "Water Garden" button (bottom-center)
- Level/XP display (top-left)

---

## 🛠 Technical Stack (2D Canvas Focus)

| Layer                  | Technology                 | Purpose                                                  |
| ---------------------- | -------------------------- | -------------------------------------------------------- |
| **IDE**                | Antigravity                | Development environment                                  |
| **Framework**          | React + Vite               | Fast, modern web app                                     |
| **Rendering**          | PixiJS (via `@pixi/react`) | High-performance 2D WebGL renderer for sprite management |
| **Animation**          | GSAP (GreenSock)           | Character sprite movement, scale animations              |
| **State Management**   | Zustand                    | Lightweight, performant state                            |
| **Styling**            | Tailwind CSS               | HUD and UI overlays                                      |
| **Wallet Integration** | Wagmi / Viem               | Zigchain connectivity                                    |
| **Particles**          | PixiJS Particle Emitter    | 2D water droplet effects                                 |

---

## 📂 Project Structure

```
oasis-of-zig/
├── public/
│   ├── sprites/
│   │   ├── characters/      # Character sprite sheets
│   │   ├── plants/          # Plant growth stages
│   │   ├── tiles/           # Ground tiles
│   │   ├── particles/       # Water droplet sprites
│   │   └── environment/     # Background assets
│   ├── sounds/              # Audio effects
│   └── fonts/               # Custom fonts
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── GameCanvas.tsx        # Main PixiJS Stage
│   │   │   ├── IsometricGrid.tsx     # Diamond grid renderer
│   │   │   ├── Character.tsx         # Player sprite with animations
│   │   │   ├── Plant.tsx             # Individual plant sprite
│   │   │   ├── WaterParticles.tsx    # Particle emitter
│   │   │   ├── Background.tsx        # Parallax background
│   │   │   └── Tile.tsx              # Individual grid tile
│   │   ├── ui/
│   │   │   ├── HUD.tsx               # Main overlay container
│   │   │   ├── VitalityBar.tsx       # Garden health indicator
│   │   │   ├── WaterButton.tsx       # Primary action button
│   │   │   ├── WalletConnect.tsx     # Wallet connection UI
│   │   │   ├── LevelDisplay.tsx      # Character level/XP
│   │   │   └── ToastNotification.tsx # Feedback messages
│   ├── stores/
│   │   ├── useGameStore.ts           # Main game state
│   │   ├── useWalletStore.ts         # Wallet connection state
│   │   └── useTaskStore.ts           # Task queue management
│   ├── utils/
│   │   ├── isometric.ts              # Grid coordinate conversion
│   │   ├── pathfinding.ts            # 2D pathfinding logic
│   │   ├── animations.ts             # GSAP animation helpers
│   │   ├── spriteLoader.ts           # Asset loading utilities
│   │   └── api.ts                    # Backend API calls
│   ├── hooks/
│   │   ├── useCharacterController.ts # Character movement logic
│   │   ├── usePlantGrowth.ts         # Plant lifecycle management
│   │   ├── usePixiApp.ts             # PixiJS initialization
│   │   └── useWalletConnection.ts    # Wallet integration
│   ├── types/
│   │   └── index.ts                  # TypeScript definitions
│   ├── constants/
│   │   └── config.ts                 # Game configuration
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Implementation Phases

---

### **Phase 1: Foundation & Isometric Grid** (Week 1-2)

#### **Objectives**

- Set up project infrastructure with PixiJS
- Implement isometric coordinate system
- Create diamond-shaped grid renderer
- Establish environment state management

#### **Tasks**

##### 1.1 Project Initialization

```bash
# Initialize Vite + React + TypeScript project
npm create vite@latest oasis-of-zig -- --template react-ts
cd oasis-of-zig

# Install core dependencies
npm install pixi.js @pixi/react
npm install gsap
npm install zustand
npm install tailwindcss postcss autoprefixer
npm install wagmi viem @tanstack/react-query

# Install dev dependencies
npm install -D @types/pixi.js
```

##### 1.2 Isometric Coordinate System

**File**: `src/utils/isometric.ts`

**Requirements**:

- Convert grid (row, col) to screen (x, y)
- Convert screen (x, y) to grid (row, col)
- Handle 45° diamond grid layout
- Support different tile sizes

**Core Functions**:

```typescript
// Converts Grid (Row/Col) to Screen (X/Y)
export const gridToScreen = (
  row: number,
  col: number,
  tileWidth: number,
  tileHeight: number
): { x: number; y: number } => {
  const x = (col - row) * (tileWidth / 2);
  const y = (col + row) * (tileHeight / 2);
  return { x, y };
};

// Converts Screen (X/Y) to Grid (Row/Col)
export const screenToGrid = (
  x: number,
  y: number,
  tileWidth: number,
  tileHeight: number
): { row: number; col: number } => {
  const col = Math.floor((x / (tileWidth / 2) + y / (tileHeight / 2)) / 2);
  const row = Math.floor((y / (tileHeight / 2) - x / (tileWidth / 2)) / 2);
  return { row, col };
};

// Get tile center position
export const getTileCenter = (
  row: number,
  col: number,
  tileWidth: number,
  tileHeight: number
): { x: number; y: number } => {
  const { x, y } = gridToScreen(row, col, tileWidth, tileHeight);
  return { x, y: y + tileHeight / 4 }; // Offset for visual center
};
```

##### 1.3 PixiJS Canvas Setup

**File**: `src/components/game/GameCanvas.tsx`

**Requirements**:

- Initialize PixiJS Application
- Set canvas size (responsive)
- Configure renderer options
- Handle window resize

**Implementation**:

```typescript
import { Stage, Container } from "@pixi/react";
import { useEffect, useState } from "react";

export const GameCanvas = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Stage
      width={dimensions.width}
      height={dimensions.height}
      options={{
        backgroundColor: 0x87ceeb, // Sky blue
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      }}
    >
      <Container x={dimensions.width / 2} y={100}>
        {/* Game content will go here */}
      </Container>
    </Stage>
  );
};
```

##### 1.4 Isometric Grid Renderer

**File**: `src/components/game/IsometricGrid.tsx`

**Requirements**:

- Render 10x10 diamond grid
- Each tile is a sprite or graphics object
- Visual distinction for different tile types
- Hover effects (optional)

**Data Structure**:

```typescript
interface Tile {
  row: number;
  col: number;
  type: "soil" | "path" | "water";
  occupied: boolean;
  plantId?: string;
  sprite?: string; // Path to tile sprite
}

interface GridConfig {
  rows: 10;
  cols: 10;
  tileWidth: 128; // pixels
  tileHeight: 64; // pixels (half of width for isometric)
}
```

**Rendering Logic**:

```typescript
import { Graphics } from "@pixi/react";
import { gridToScreen } from "../../utils/isometric";

export const IsometricGrid = ({ tiles, config }) => {
  return (
    <>
      {tiles.map((tile) => {
        const { x, y } = gridToScreen(
          tile.row,
          tile.col,
          config.tileWidth,
          config.tileHeight
        );

        return (
          <Tile
            key={`${tile.row}-${tile.col}`}
            x={x}
            y={y}
            tile={tile}
            config={config}
          />
        );
      })}
    </>
  );
};
```

##### 1.5 Environment State Management

**File**: `src/stores/useGameStore.ts`

**Requirements**:

- Global state for environment (Lush vs. Dry)
- Garden health percentage (0-100%)
- Sprite/texture swapping based on health
- Day counter and streak tracking

**State Schema**:

```typescript
import { create } from "zustand";

interface Tile {
  row: number;
  col: number;
  type: "soil" | "path" | "water";
  occupied: boolean;
  plantId?: string;
}

interface Plant {
  id: string;
  row: number;
  col: number;
  stage: "seedling" | "growing" | "flourishing" | "withered";
  health: number;
  daysWithoutWater: number;
  lastWatered: Date | null;
}

interface GameState {
  // Environment
  environmentState: "lush" | "dry";
  gardenHealth: number; // 0-100
  dayStreak: number;
  lastWateredDate: Date | null;

  // Grid
  tiles: Tile[];
  plants: Plant[];

  // Player
  playerLevel: number;
  playerXP: number;
  totalPlantsWatered: number;

  // Actions
  setEnvironmentState: (state: "lush" | "dry") => void;
  updateGardenHealth: (delta: number) => void;
  recordWatering: () => void;
  addPlant: (plant: Plant) => void;
  updatePlant: (id: string, updates: Partial<Plant>) => void;
  removePlant: (id: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  environmentState: "lush",
  gardenHealth: 100,
  dayStreak: 0,
  lastWateredDate: null,
  tiles: initializeTiles(),
  plants: [],
  playerLevel: 1,
  playerXP: 0,
  totalPlantsWatered: 0,

  setEnvironmentState: (state) => set({ environmentState: state }),
  updateGardenHealth: (delta) =>
    set((s) => ({
      gardenHealth: Math.max(0, Math.min(100, s.gardenHealth + delta)),
    })),
  recordWatering: () =>
    set((s) => ({
      lastWateredDate: new Date(),
      dayStreak: s.dayStreak + 1,
    })),
  addPlant: (plant) => set((s) => ({ plants: [...s.plants, plant] })),
  updatePlant: (id, updates) =>
    set((s) => ({
      plants: s.plants.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  removePlant: (id) =>
    set((s) => ({
      plants: s.plants.filter((p) => p.id !== id),
    })),
}));

function initializeTiles(): Tile[] {
  const tiles: Tile[] = [];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      tiles.push({
        row,
        col,
        type: "soil",
        occupied: false,
      });
    }
  }
  return tiles;
}
```

**Deliverables**:

- ✅ Working Vite + React + PixiJS setup
- ✅ Isometric coordinate conversion utilities
- ✅ Visible 10x10 diamond grid
- ✅ Zustand store with environment state
- ✅ Basic canvas with proper rendering

---

### **Phase 2: Character Sprite & Automated Movement** (Week 3-4)

#### **Objectives**

- Implement character sprite with animations
- Integrate GSAP for smooth movement
- Create task queue system
- Add sprite-based watering effects

#### **Tasks**

##### 2.1 Character Sprite Integration

**File**: `src/components/game/Character.tsx`

**Requirements**:

- Load character sprite sheet
- Animate between frames (idle, walk_north, walk_east, walk_south, walk_west, water)
- Position sprite on grid
- Flip sprite based on movement direction

**Sprite Sheet Structure**:

```
character_spritesheet.png
- idle: frames 0-3
- walk_north: frames 4-7
- walk_east: frames 8-11
- walk_south: frames 12-15
- walk_west: frames 16-19
- water: frames 20-23
```

**Implementation**:

```typescript
import { AnimatedSprite, useTick } from "@pixi/react";
import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

interface CharacterProps {
  row: number;
  col: number;
  animation:
    | "idle"
    | "walk_north"
    | "walk_east"
    | "walk_south"
    | "walk_west"
    | "water";
}

export const Character = ({ row, col, animation }: CharacterProps) => {
  const [textures, setTextures] = useState<PIXI.Texture[]>([]);
  const { x, y } = gridToScreen(row, col, 128, 64);

  useEffect(() => {
    // Load sprite sheet and create textures
    const loadSprites = async () => {
      const sheet = await PIXI.Assets.load(
        "/sprites/characters/character_spritesheet.json"
      );
      setTextures(sheet.animations[animation]);
    };
    loadSprites();
  }, [animation]);

  if (textures.length === 0) return null;

  return (
    <AnimatedSprite
      textures={textures}
      isPlaying={true}
      animationSpeed={0.1}
      x={x}
      y={y}
      anchor={0.5}
    />
  );
};
```

##### 2.2 Task Queue System

**File**: `src/stores/useTaskStore.ts`

**Requirements**:

- Accept array of grid coordinates
- Queue processing (FIFO)
- Task states: pending, active, completed
- Pause/resume functionality

**State Schema**:

```typescript
import { create } from "zustand";

interface Task {
  id: string;
  targetRow: number;
  targetCol: number;
  action: "water" | "harvest" | "plant";
  status: "pending" | "active" | "completed";
}

interface TaskState {
  queue: Task[];
  currentTask: Task | null;
  isProcessing: boolean;

  // Actions
  addTasks: (
    coordinates: { row: number; col: number }[],
    action: Task["action"]
  ) => void;
  processNextTask: () => void;
  completeCurrentTask: () => void;
  clearQueue: () => void;
  pauseProcessing: () => void;
  resumeProcessing: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  queue: [],
  currentTask: null,
  isProcessing: false,

  addTasks: (coordinates, action) => {
    const newTasks: Task[] = coordinates.map((coord, index) => ({
      id: `task-${Date.now()}-${index}`,
      targetRow: coord.row,
      targetCol: coord.col,
      action,
      status: "pending",
    }));

    set((state) => ({ queue: [...state.queue, ...newTasks] }));

    // Auto-start processing if not already running
    if (!get().isProcessing) {
      get().processNextTask();
    }
  },

  processNextTask: () => {
    const { queue } = get();
    if (queue.length === 0) {
      set({ isProcessing: false, currentTask: null });
      return;
    }

    const nextTask = queue[0];
    set({
      currentTask: { ...nextTask, status: "active" },
      queue: queue.slice(1),
      isProcessing: true,
    });
  },

  completeCurrentTask: () => {
    set({ currentTask: null });
    get().processNextTask();
  },

  clearQueue: () => set({ queue: [], currentTask: null, isProcessing: false }),
  pauseProcessing: () => set({ isProcessing: false }),
  resumeProcessing: () => {
    set({ isProcessing: true });
    get().processNextTask();
  },
}));
```

##### 2.3 GSAP Character Controller

**File**: `src/hooks/useCharacterController.ts`

**Requirements**:

- GSAP timeline for movement sequences
- Smooth pixel position interpolation
- Sprite animation synchronization
- Pause at each tile for watering action

**Implementation**:

```typescript
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useTaskStore } from "../stores/useTaskStore";
import { useGameStore } from "../stores/useGameStore";
import { gridToScreen, getTileCenter } from "../utils/isometric";

interface CharacterState {
  row: number;
  col: number;
  x: number;
  y: number;
  animation: string;
}

export const useCharacterController = () => {
  const characterRef = useRef<CharacterState>({
    row: 5,
    col: 5,
    x: 0,
    y: 0,
    animation: "idle",
  });

  const currentTask = useTaskStore((s) => s.currentTask);
  const completeTask = useTaskStore((s) => s.completeCurrentTask);
  const updatePlant = useGameStore((s) => s.updatePlant);

  useEffect(() => {
    if (!currentTask) return;

    const { targetRow, targetCol, action } = currentTask;
    const { x: targetX, y: targetY } = getTileCenter(
      targetRow,
      targetCol,
      128,
      64
    );
    const { x: currentX, y: currentY } = getTileCenter(
      characterRef.current.row,
      characterRef.current.col,
      128,
      64
    );

    // Determine walk direction
    const direction = getWalkDirection(
      characterRef.current.row,
      characterRef.current.col,
      targetRow,
      targetCol
    );

    // Create GSAP timeline
    const timeline = gsap.timeline({
      onComplete: () => {
        characterRef.current.row = targetRow;
        characterRef.current.col = targetCol;
        completeTask();
      },
    });

    timeline
      // Walk to target
      .to(characterRef.current, {
        x: targetX,
        y: targetY,
        duration: 1,
        ease: "power2.inOut",
        onStart: () => {
          characterRef.current.animation = `walk_${direction}`;
        },
      })
      // Perform action
      .call(() => {
        characterRef.current.animation = action;
        if (action === "water") {
          // Trigger water particles
          // Update plant state
          const plant = useGameStore
            .getState()
            .plants.find((p) => p.row === targetRow && p.col === targetCol);
          if (plant) {
            updatePlant(plant.id, {
              lastWatered: new Date(),
              daysWithoutWater: 0,
              health: Math.min(100, plant.health + 20),
            });
          }
        }
      })
      // Pause for action animation
      .to({}, { duration: 1.5 })
      // Return to idle
      .call(() => {
        characterRef.current.animation = "idle";
      });

    return () => {
      timeline.kill();
    };
  }, [currentTask]);

  return characterRef.current;
};

function getWalkDirection(
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): "north" | "east" | "south" | "west" {
  const deltaRow = toRow - fromRow;
  const deltaCol = toCol - fromCol;

  if (Math.abs(deltaRow) > Math.abs(deltaCol)) {
    return deltaRow > 0 ? "south" : "north";
  } else {
    return deltaCol > 0 ? "east" : "west";
  }
}
```

##### 2.4 Water Particle System (2D Sprites)

**File**: `src/components/game/WaterParticles.tsx`

**Requirements**:

- PixiJS Particle Emitter
- Blue water droplet sprites
- Emit from character position
- Gravity and fade-out effect

**Implementation**:

```typescript
import { Container, useApp } from "@pixi/react";
import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { Emitter } from "@pixi/particle-emitter";

interface WaterParticlesProps {
  x: number;
  y: number;
  active: boolean;
}

export const WaterParticles = ({ x, y, active }: WaterParticlesProps) => {
  const app = useApp();
  const emitterRef = useRef<Emitter | null>(null);
  const containerRef = useRef<PIXI.Container>(new PIXI.Container());

  useEffect(() => {
    const emitter = new Emitter(containerRef.current, {
      lifetime: { min: 0.5, max: 1.5 },
      frequency: 0.01,
      spawnChance: 1,
      particlesPerWave: 5,
      emitterLifetime: 1.5,
      maxParticles: 100,
      pos: { x, y },
      addAtBack: false,
      behaviors: [
        {
          type: "alpha",
          config: {
            alpha: {
              list: [
                { value: 1, time: 0 },
                { value: 0, time: 1 },
              ],
            },
          },
        },
        {
          type: "scale",
          config: {
            scale: {
              list: [
                { value: 0.5, time: 0 },
                { value: 0.1, time: 1 },
              ],
            },
          },
        },
        {
          type: "color",
          config: {
            color: {
              list: [
                { value: "4da6ff", time: 0 },
                { value: "0066cc", time: 1 },
              ],
            },
          },
        },
        {
          type: "moveSpeed",
          config: {
            speed: {
              list: [
                { value: 100, time: 0 },
                { value: 50, time: 1 },
              ],
            },
          },
        },
        {
          type: "rotation",
          config: {
            accel: 0,
            minSpeed: 0,
            maxSpeed: 200,
            minStart: 0,
            maxStart: 360,
          },
        },
        {
          type: "spawnShape",
          config: {
            type: "rect",
            data: { x: -10, y: -10, w: 20, h: 20 },
          },
        },
      ],
    });

    emitterRef.current = emitter;

    let elapsed = Date.now();
    const update = () => {
      const now = Date.now();
      emitter.update((now - elapsed) * 0.001);
      elapsed = now;
    };

    app.ticker.add(update);

    return () => {
      app.ticker.remove(update);
      emitter.destroy();
    };
  }, []);

  useEffect(() => {
    if (emitterRef.current) {
      emitterRef.current.updateOwnerPos(x, y);
      if (active) {
        emitterRef.current.emit = true;
      } else {
        emitterRef.current.emit = false;
      }
    }
  }, [x, y, active]);

  return <Container ref={containerRef} />;
};
```

##### 2.5 Pathfinding Logic (2D Grid)

**File**: `src/utils/pathfinding.ts`

**Requirements**:

- Simple A\* or Manhattan distance pathfinding
- Avoid occupied tiles
- Return array of waypoints (row, col)
- Optimize for short distances

**Implementation**:

```typescript
interface GridNode {
  row: number;
  col: number;
  walkable: boolean;
}

export function findPath(
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  grid: GridNode[][]
): { row: number; col: number }[] {
  // Simple Manhattan distance pathfinding for now
  // Can be upgraded to A* if needed

  const path: { row: number; col: number }[] = [];
  let currentRow = startRow;
  let currentCol = startCol;

  while (currentRow !== endRow || currentCol !== endCol) {
    // Move towards target
    if (currentRow < endRow && grid[currentRow + 1][currentCol].walkable) {
      currentRow++;
    } else if (
      currentRow > endRow &&
      grid[currentRow - 1][currentCol].walkable
    ) {
      currentRow--;
    } else if (
      currentCol < endCol &&
      grid[currentRow][currentCol + 1].walkable
    ) {
      currentCol++;
    } else if (
      currentCol > endCol &&
      grid[currentRow][currentCol - 1].walkable
    ) {
      currentCol--;
    } else {
      // Blocked, break
      break;
    }

    path.push({ row: currentRow, col: currentCol });
  }

  return path;
}
```

**Deliverables**:

- ✅ Character sprite loaded and animated
- ✅ Task queue system functional
- ✅ GSAP-driven movement between tiles
- ✅ Water particles spawn on action
- ✅ Smooth sprite transitions

---

### **Phase 3: Plant Sprites & Growth System** (Week 5-6)

#### **Objectives**

- Implement sprite-based plant growth
- Add withering/decay mechanics
- Create character leveling system
- Visual feedback for player progress

#### **Tasks**

##### 3.1 Plant Sprite Component

**File**: `src/components/game/Plant.tsx`

**Requirements**:

- Four sprite stages: Seedling, Growing, Flourishing, Withered
- Sprite swapping based on growth stage
- GSAP "pop" animation on growth
- Health-based color tinting

**Sprite Assets**:

```
/sprites/plants/
  ├── tree_seedling.png
  ├── tree_growing.png
  ├── tree_flourishing.png
  └── tree_withered.png
```

**Implementation**:

```typescript
import { Sprite } from "@pixi/react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { gridToScreen } from "../../utils/isometric";

interface PlantProps {
  id: string;
  row: number;
  col: number;
  stage: "seedling" | "growing" | "flourishing" | "withered";
  health: number;
}

const SPRITE_MAP = {
  seedling: "/sprites/plants/tree_seedling.png",
  growing: "/sprites/plants/tree_growing.png",
  flourishing: "/sprites/plants/tree_flourishing.png",
  withered: "/sprites/plants/tree_withered.png",
};

const SCALE_MAP = {
  seedling: 0.4,
  growing: 0.7,
  flourishing: 1.0,
  withered: 0.6,
};

export const Plant = ({ id, row, col, stage, health }: PlantProps) => {
  const spriteRef = useRef<any>(null);
  const prevStageRef = useRef(stage);
  const { x, y } = gridToScreen(row, col, 128, 64);

  // Animate growth when stage changes
  useEffect(() => {
    if (prevStageRef.current !== stage && spriteRef.current) {
      // "Pop" animation
      gsap
        .timeline()
        .to(spriteRef.current.scale, {
          x: SCALE_MAP[stage] * 1.2,
          y: SCALE_MAP[stage] * 1.2,
          duration: 0.2,
          ease: "back.out",
        })
        .to(spriteRef.current.scale, {
          x: SCALE_MAP[stage],
          y: SCALE_MAP[stage],
          duration: 0.2,
          ease: "elastic.out",
        });
    }
    prevStageRef.current = stage;
  }, [stage]);

  // Tint based on health
  const tint = health < 50 ? 0xcccccc : 0xffffff;

  return (
    <Sprite
      ref={spriteRef}
      image={SPRITE_MAP[stage]}
      x={x}
      y={y}
      anchor={0.5}
      scale={SCALE_MAP[stage]}
      tint={tint}
    />
  );
};
```

##### 3.2 Plant Growth Logic

**File**: `src/hooks/usePlantGrowth.ts`

**Requirements**:

- Time-based growth progression
- Watering accelerates growth
- Missed days trigger decay
- Stage transitions with animations

**Growth Rules**:

- Seedling → Growing: 2 days with water
- Growing → Flourishing: 3 days with water
- Any stage → Withered: 2 consecutive days without water

**Implementation**:

```typescript
import { useEffect } from "react";
import { useGameStore } from "../stores/useGameStore";

export const usePlantGrowth = () => {
  const plants = useGameStore((s) => s.plants);
  const updatePlant = useGameStore((s) => s.updatePlant);

  useEffect(() => {
    // Check plant growth every hour
    const interval = setInterval(() => {
      const now = new Date();

      plants.forEach((plant) => {
        const daysSinceWatered = plant.lastWatered
          ? Math.floor(
              (now.getTime() - plant.lastWatered.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 999;

        // Decay logic
        if (daysSinceWatered >= 2 && plant.stage !== "withered") {
          updatePlant(plant.id, {
            stage: "withered",
            health: Math.max(0, plant.health - 30),
            daysWithoutWater: daysSinceWatered,
          });
        }

        // Growth logic (only if watered recently)
        if (daysSinceWatered < 1) {
          let newStage = plant.stage;

          if (plant.stage === "seedling" && plant.health >= 40) {
            newStage = "growing";
          } else if (plant.stage === "growing" && plant.health >= 70) {
            newStage = "flourishing";
          }

          if (newStage !== plant.stage) {
            updatePlant(plant.id, { stage: newStage });
          }
        }
      });
    }, 1000 * 60 * 60); // Check every hour

    return () => clearInterval(interval);
  }, [plants]);
};
```

##### 3.3 Withering Animation

**File**: `src/utils/plantDecay.ts`

**Requirements**:

- Gradual color shift to brown/grey (tint)
- Scale reduction animation
- Health degradation over time
- Revival mechanic (watering withered plants)

**Implementation**:

```typescript
import gsap from "gsap";

export const animateWither = (spriteRef: any) => {
  return gsap
    .timeline()
    .to(spriteRef, {
      tint: 0x8b7355, // Brown
      duration: 2,
      ease: "power2.inOut",
    })
    .to(
      spriteRef.scale,
      {
        x: 0.5,
        y: 0.5,
        duration: 2,
        ease: "power2.inOut",
      },
      "<"
    );
};

export const animateRevival = (spriteRef: any, targetScale: number) => {
  return gsap
    .timeline()
    .to(spriteRef, {
      tint: 0xffffff, // White (no tint)
      duration: 1,
      ease: "power2.out",
    })
    .to(
      spriteRef.scale,
      {
        x: targetScale,
        y: targetScale,
        duration: 1,
        ease: "back.out",
      },
      "<"
    );
};
```

##### 3.4 Character Leveling System

**File**: `src/stores/useGameStore.ts` (extend)

**Requirements**:

- XP gained from watering plants
- Level thresholds (100 XP per level)
- Visual character upgrades per level
- Unlock new abilities/areas

**Leveling Logic**:

```typescript
// Add to useGameStore
interface PlayerProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalPlantsWatered: number;
  characterSkin: string;
  wateringCanModel: string;
}

// XP calculation
const XP_PER_LEVEL = 100;

const gainXP = (amount: number) =>
  set((state) => {
    const newXP = state.playerXP + amount;
    const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;

    return {
      playerXP: newXP,
      playerLevel: newLevel,
      xpToNextLevel: newLevel * XP_PER_LEVEL - newXP,
    };
  });

// XP Rewards
const XP_REWARDS = {
  seedling: 5,
  growing: 10,
  flourishing: 15,
  withered_revival: 25,
};
```

##### 3.5 Visual Upgrade System

**Requirements**:

- Level 5: Upgraded watering can sprite (silver)
- Level 10: New character sprite sheet
- Level 15: Golden watering can
- Level 20: Special particle effects (sparkles)

**Deliverables**:

- ✅ Plants with 4 distinct sprite stages
- ✅ Automatic growth progression
- ✅ Withering mechanics for neglected plants
- ✅ Character XP and leveling system
- ✅ Visual upgrades tied to player level

---

### **Phase 4: HUD & User Interface** (Week 7)

#### **Objectives**

- Create Clash of Clans-inspired HUD
- Implement garden vitality display
- Add wallet connection UI
- Build responsive controls

#### **Tasks**

##### 4.1 Main HUD Component

**File**: `src/components/ui/HUD.tsx`

**Requirements**:

- HTML overlay on top of PixiJS canvas
- Pinned corner elements
- Glassmorphism design
- Responsive layout

**Layout Structure**:

```
┌─────────────────────────────────────────────┐
│ [Level 5]    [Garden: 75% Healthy]  [Wallet]│ ← Top Bar
│                                             │
│                                             │
│            [PixiJS Canvas Below]            │
│                                             │
│                                             │
│              [Water Garden]                 │ ← Bottom CTA
└─────────────────────────────────────────────┘
```

**Implementation**:

```typescript
import { VitalityBar } from "./VitalityBar";
import { WaterButton } from "./WaterButton";
import { WalletConnect } from "./WalletConnect";
import { LevelDisplay } from "./LevelDisplay";
import { ToastNotification } from "./ToastNotification";

export const HUD = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-auto">
        <LevelDisplay />
        <VitalityBar />
        <WalletConnect />
      </div>

      {/* Bottom Action */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <WaterButton />
      </div>

      {/* Toast Notifications */}
      <ToastNotification />
    </div>
  );
};
```

##### 4.2 Garden Vitality Bar

**File**: `src/components/ui/VitalityBar.tsx`

**Requirements**:

- Real-time progress bar (0-100%)
- Color gradient (red → yellow → green)
- Animated transitions
- Tooltip with details

**Implementation**:

```typescript
import { useGameStore } from "../../stores/useGameStore";

export const VitalityBar = () => {
  const gardenHealth = useGameStore((s) => s.gardenHealth);

  const getColor = (health: number) => {
    if (health >= 67) return "bg-green-500";
    if (health >= 34) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-lg px-6 py-3 border border-white/20">
      <div className="text-white/90 text-sm mb-2 font-semibold">
        Garden Vitality
      </div>
      <div className="w-64 h-3 bg-gray-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${getColor(
            gardenHealth
          )}`}
          style={{ width: `${gardenHealth}%` }}
        />
      </div>
      <div className="text-white/70 text-xs mt-1">{gardenHealth}% Healthy</div>
    </div>
  );
};
```

##### 4.3 Water Garden Button

**File**: `src/components/ui/WaterButton.tsx`

**Requirements**:

- Large, prominent CTA button
- Disabled state when task running
- Loading animation during watering
- Success feedback on completion

**Implementation**:

```typescript
import { useTaskStore } from "../../stores/useTaskStore";
import { useGameStore } from "../../stores/useGameStore";

export const WaterButton = () => {
  const isProcessing = useTaskStore((s) => s.isProcessing);
  const addTasks = useTaskStore((s) => s.addTasks);
  const plants = useGameStore((s) => s.plants);

  const handleWater = () => {
    // Get all plant coordinates
    const coordinates = plants.map((p) => ({ row: p.row, col: p.col }));
    addTasks(coordinates, "water");
  };

  return (
    <button
      onClick={handleWater}
      disabled={isProcessing || plants.length === 0}
      className={`
        px-12 py-4 rounded-full font-bold text-lg
        transition-all duration-300 transform
        ${
          isProcessing
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105 hover:shadow-2xl"
        }
        text-white shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {isProcessing ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Watering...
        </span>
      ) : (
        "💧 Water Garden"
      )}
    </button>
  );
};
```

##### 4.4 Wallet Connection

**File**: `src/components/ui/WalletConnect.tsx`

**Requirements**:

- Connect/disconnect wallet
- Display truncated address
- Network indicator (Zigchain)
- Balance display (optional)

**Implementation**:

```typescript
import { useAccount, useConnect, useDisconnect } from "wagmi";

export const WalletConnect = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="bg-black/40 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-white/90 text-sm font-mono">
            {truncateAddress(address)}
          </span>
          <button
            onClick={() => disconnect()}
            className="ml-2 text-white/60 hover:text-white/90 text-xs"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-lg text-white font-semibold hover:scale-105 transition-transform"
    >
      Connect Wallet
    </button>
  );
};
```

##### 4.5 Level & XP Display

**File**: `src/components/ui/LevelDisplay.tsx`

**Requirements**:

- Current level badge
- XP progress bar
- Next level preview
- Animated level-up celebration

**Implementation**:

```typescript
import { useGameStore } from "../../stores/useGameStore";

export const LevelDisplay = () => {
  const level = useGameStore((s) => s.playerLevel);
  const xp = useGameStore((s) => s.playerXP);

  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const xpProgress = ((xp - xpForCurrentLevel) / 100) * 100;

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-lg px-6 py-3 border border-white/20">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg">
          {level}
        </div>
        <div>
          <div className="text-white/90 text-sm font-semibold">
            Level {level}
          </div>
          <div className="w-32 h-2 bg-gray-700/50 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <div className="text-white/60 text-xs mt-0.5">
            {xp - xpForCurrentLevel} / 100 XP
          </div>
        </div>
      </div>
    </div>
  );
};
```

##### 4.6 Toast Notification System

**File**: `src/components/ui/ToastNotification.tsx`

**Requirements**:

- Floating messages (e.g., "+5% Beautiful!")
- Auto-dismiss after 2 seconds
- Smooth fade-in/out animations
- Queue multiple toasts

**Deliverables**:

- ✅ Fully functional HUD overlay
- ✅ Real-time vitality bar
- ✅ Interactive water button
- ✅ Wallet connection UI
- ✅ Level/XP display
- ✅ Toast notification system

---

### **Phase 5: Backend Integration** (Week 8)

#### **Objectives**

- Connect to Zigchain backend
- Fetch initial garden state
- Submit task completion
- Trigger reward distribution

#### **Tasks**

##### 5.1 API Client Setup

**File**: `src/utils/api.ts`

**Requirements**:

- RESTful API client
- Authentication headers
- Error handling
- Request/response types

**Endpoints**:

```typescript
interface GardenState {
  plants: Plant[];
  gardenHealth: number;
  dayStreak: number;
  lastWateredDate: string;
  playerLevel: number;
  playerXP: number;
}

interface WateringTaskData {
  walletAddress: string;
  timestamp: number;
  plantsWatered: string[];
  signature: string;
}

interface TaskResponse {
  success: boolean;
  xpGained: number;
  rewardAmount: number;
  message: string;
}

export class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async getGardenState(walletAddress: string): Promise<GardenState> {
    const response = await fetch(`${this.baseURL}/garden/${walletAddress}`);
    if (!response.ok) throw new Error("Failed to fetch garden state");
    return response.json();
  }

  async submitWateringTask(data: WateringTaskData): Promise<TaskResponse> {
    const response = await fetch(`${this.baseURL}/tasks/water`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to submit task");
    return response.json();
  }

  async claimRewards(walletAddress: string): Promise<{ amount: number }> {
    const response = await fetch(`${this.baseURL}/rewards/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });
    if (!response.ok) throw new Error("Failed to claim rewards");
    return response.json();
  }
}

export const api = new APIClient(
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
);
```

##### 5.2 Initial State Hydration

**File**: `src/hooks/useGardenSync.ts`

**Requirements**:

- Fetch garden state on wallet connect
- Populate plants from backend data
- Sync day streak and health
- Handle offline/cache scenarios

**Implementation**:

```typescript
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useGameStore } from "../stores/useGameStore";
import { api } from "../utils/api";

export const useGardenSync = () => {
  const { address, isConnected } = useAccount();
  const setEnvironmentState = useGameStore((s) => s.setEnvironmentState);
  const updateGardenHealth = useGameStore((s) => s.updateGardenHealth);

  useEffect(() => {
    if (!isConnected || !address) return;

    const fetchGardenState = async () => {
      try {
        const state = await api.getGardenState(address);

        // Hydrate store
        useGameStore.setState({
          plants: state.plants,
          gardenHealth: state.gardenHealth,
          dayStreak: state.dayStreak,
          lastWateredDate: state.lastWateredDate
            ? new Date(state.lastWateredDate)
            : null,
          playerLevel: state.playerLevel,
          playerXP: state.playerXP,
          environmentState: state.gardenHealth > 50 ? "lush" : "dry",
        });
      } catch (error) {
        console.error("Failed to fetch garden state:", error);
        // Use cached/default state
      }
    };

    fetchGardenState();
  }, [isConnected, address]);
};
```

##### 5.3 Task Submission

**File**: `src/hooks/useTaskSubmission.ts`

**Requirements**:

- POST watering completion to backend
- Include timestamp and plant IDs
- Wallet signature for verification
- Handle network errors gracefully

**Implementation**:

```typescript
import { useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useTaskStore } from "../stores/useTaskStore";
import { useGameStore } from "../stores/useGameStore";
import { api } from "../utils/api";

export const useTaskSubmission = () => {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const isProcessing = useTaskStore((s) => s.isProcessing);
  const queue = useTaskStore((s) => s.queue);

  useEffect(() => {
    if (!isProcessing && queue.length === 0 && address) {
      // All tasks completed, submit to backend
      submitCompletedTasks();
    }
  }, [isProcessing, queue.length]);

  const submitCompletedTasks = async () => {
    if (!address) return;

    const plants = useGameStore.getState().plants;
    const plantIds = plants.map((p) => p.id);

    try {
      // Sign message for verification
      const message = `Water garden at ${Date.now()}`;
      const signature = await signMessageAsync({ message });

      const response = await api.submitWateringTask({
        walletAddress: address,
        timestamp: Date.now(),
        plantsWatered: plantIds,
        signature,
      });

      if (response.success) {
        // Update XP
        useGameStore.setState((s) => ({
          playerXP: s.playerXP + response.xpGained,
        }));

        // Show success toast
        console.log(
          `Earned ${response.xpGained} XP and ${response.rewardAmount} tokens!`
        );
      }
    } catch (error) {
      console.error("Failed to submit task:", error);
    }
  };
};
```

##### 5.4 Reward Distribution

**Requirements**:

- Backend validates task completion
- Smart contract mints/transfers tokens
- Frontend displays reward notification
- Update user balance

**Deliverables**:

- ✅ API client with all endpoints
- ✅ Garden state synchronization
- ✅ Task submission workflow
- ✅ Reward claiming functionality
- ✅ Robust error handling

---

### **Phase 6: Polish & Optimization** (Week 9-10)

#### **Objectives**

- Performance optimization
- Audio/SFX integration
- Accessibility improvements
- Mobile responsiveness
- Testing and bug fixes

#### **Tasks**

##### 6.1 Performance Optimization

- **Sprite Pooling**: Reuse sprite objects instead of creating new ones
- **Texture Atlases**: Combine sprites into atlases for fewer draw calls
- **Culling**: Don't render sprites outside viewport
- **Lazy Loading**: Load assets on demand
- **Code Splitting**: Split bundle by route

##### 6.2 Audio Integration

**Sounds Needed**:

- Background music (ambient garden theme)
- Watering sound effect
- Plant growth "pop"
- Level-up fanfare
- UI click sounds

**Implementation**:

```typescript
import { Howl } from "howler";

export const sounds = {
  water: new Howl({ src: ["/sounds/water.mp3"], volume: 0.5 }),
  growth: new Howl({ src: ["/sounds/growth.mp3"], volume: 0.6 }),
  levelUp: new Howl({ src: ["/sounds/levelup.mp3"], volume: 0.7 }),
  bgMusic: new Howl({ src: ["/sounds/ambient.mp3"], loop: true, volume: 0.3 }),
};

// Play sound
sounds.water.play();
```

##### 6.3 Mobile Optimization

- Touch controls for panning canvas
- Responsive HUD layout
- Performance mode (reduced particles)
- Mobile-specific UI adjustments

##### 6.4 Accessibility

- Keyboard navigation
- Screen reader support for UI
- High contrast mode
- Reduced motion option

##### 6.5 Testing

- Unit tests for game logic
- Integration tests for API
- Visual regression testing
- Cross-browser testing
- Performance profiling

**Deliverables**:

- ✅ Optimized performance (60 FPS target)
- ✅ Audio/SFX integrated
- ✅ Mobile-responsive design
- ✅ Accessibility features
- ✅ Comprehensive testing

---

## 🎨 Visual Design Guidelines

### Color Palette

**Lush Environment**:

- Primary Green: `#2ecc71`
- Grass: `#27ae60`
- Soil: `#8b4513`
- Water: `#3498db`

**Dry Environment**:

- Dry Grass: `#d4a574`
- Cracked Soil: `#8b7355`
- Faded Green: `#a9b388`

**UI Colors**:

- Background: `rgba(0, 0, 0, 0.4)` (glassmorphism)
- Accent: `#f39c12` (gold)
- Success: `#2ecc71`
- Warning: `#e74c3c`

### Typography

- Primary Font: "Inter" (Google Fonts)
- Headings: Bold, 24-32px
- Body: Regular, 14-16px
- Monospace (addresses): "Roboto Mono"

### Animations

- Easing: `power2.inOut` (GSAP)
- Duration: 0.3-1.5s (context-dependent)
- Particle lifetime: 1-2s

---

## 🔧 Configuration Files

### `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["pixi.js", "@pixi/react", "gsap"],
  },
  server: {
    port: 3000,
  },
});
```

### `tailwind.config.js`

```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "lush-green": "#2ecc71",
        "dry-brown": "#d4a574",
        "water-blue": "#3498db",
        "accent-gold": "#f39c12",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
```

---

## 📊 Performance Targets

| Metric        | Target  | Critical Threshold |
| ------------- | ------- | ------------------ |
| FPS (Desktop) | 60      | 30                 |
| FPS (Mobile)  | 30      | 20                 |
| Initial Load  | < 3s    | < 5s               |
| API Response  | < 500ms | < 2s               |
| Memory Usage  | < 150MB | < 300MB            |

---

## 🚦 Milestones & Timeline

| Week | Phase   | Deliverable                                     |
| ---- | ------- | ----------------------------------------------- |
| 1-2  | Phase 1 | Foundation complete, isometric grid working     |
| 3-4  | Phase 2 | Character sprite movement & watering functional |
| 5-6  | Phase 3 | Plant sprites & leveling implemented            |
| 7    | Phase 4 | HUD and UI complete                             |
| 8    | Phase 5 | Backend integration live                        |
| 9-10 | Phase 6 | Polished, tested, production-ready              |

---

## 🎯 First Implementation Task

### **Isometric Grid Coordinate System**

This is the **most important** part of a 2D isometric game because it maps 2D screen pixels to your game's coordinate system.

**Starter Code**: Already provided in Phase 1.2 above!

```typescript
// src/utils/isometric.ts
export const gridToScreen = (row, col, tileWidth, tileHeight) => {
  const x = (col - row) * (tileWidth / 2);
  const y = (col + row) * (tileHeight / 2);
  return { x, y };
};
```

---

## 🚀 Next Steps

1. **Initialize Project**: Run the commands in Phase 1.1
2. **Create Isometric Utils**: Implement `src/utils/isometric.ts`
3. **Set up PixiJS Canvas**: Create `GameCanvas.tsx`
4. **Render First Grid**: Implement `IsometricGrid.tsx`
5. **Test Coordinate Conversion**: Verify grid renders correctly

---

**End of Implementation Plan (2D Edition)**

_This document is a living guide and should be updated as the project evolves._
