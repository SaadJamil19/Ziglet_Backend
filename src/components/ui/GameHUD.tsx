import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import "./GameHUD.css";
import { WalletConnect } from "./WalletConnect";
import { zigletApi } from "../../api/zigletApi";
import { useSessionStore } from "../../store/sessionStore";
import { useBackendStore } from "../../store/backendStore";

interface GardenState {
  growthPoints: number;
  level: number;
  streak: number;
  lastVisit: string;
}

interface Task {
  id: string;
  label: string;
  limit: number;
  completed: number;
  reward: number;
}

interface WalletState {
  balance: number;
}

interface GameHUDProps {
  onWater?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ onWater }) => {
  const { token } = useSessionStore();
  const {
    garden: backendGarden,
    tasks: backendTasks,
    rewards: backendRewards,
    setGarden: setBackendGarden,
    setTasks: setBackendTasks,
    setRewards,
  } = useBackendStore();
  const [garden, setLocalGarden] = useState<GardenState>({
    growthPoints: 0,
    level: 1,
    streak: 0,
    lastVisit: new Date().toISOString(),
  });

  const [wallet, setWallet] = useState<WalletState>({
    balance: 0,
  });

  const [tasks, setLocalTasks] = useState<Task[]>([
    {
      id: "water_grass",
      label: "Water Plants",
      limit: 1,
      completed: 0,
      reward: 50,
    },
    { id: "share", label: "Share on X", limit: 1, completed: 1, reward: 100 },
  ]);

  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const sync = async () => {
      try {
        await zigletApi.visitGarden(token);
        const [gardenState, tasksResponse, rewardsResponse] = await Promise.all(
          [
            zigletApi.getGardenState(token),
            zigletApi.getTasks(token),
            zigletApi.getRewardHistory(token, undefined, 20),
          ]
        );
        setBackendGarden(gardenState);
        setBackendTasks(tasksResponse.tasks);
        setRewards(rewardsResponse.history);
      } catch (error) {
        console.error("Backend sync failed:", error);
      }
    };
    void sync();
  }, [token, setBackendGarden, setBackendTasks, setRewards]);

  useEffect(() => {
    if (!backendGarden?.growth) return;
    const growthPoints = backendGarden.growth.growth_points ?? 0;
    const nextLevel = Math.max(1, Math.floor(growthPoints / 100) + 1);
    setLocalGarden((prev) => ({
      ...prev,
      growthPoints,
      level: nextLevel,
      streak: backendGarden.streak?.current_streak ?? prev.streak,
    }));
  }, [backendGarden]);

  useEffect(() => {
    if (backendRewards.length === 0) return;
    const zigBalance = backendRewards
      .filter((reward) => reward.reward_type === "ZIG")
      .reduce((sum, reward) => sum + reward.amount, 0);
    setWallet((prev) => ({ ...prev, balance: Math.round(zigBalance) }));
  }, [backendRewards]);

  const formatTaskLabel = (key: string) => {
    switch (key) {
      case "water_grass":
        return "Water Plants";
      case "swap":
        return "Swap Tokens";
      case "share":
        return "Share on X";
      default:
        return key.replace(/_/g, " ");
    }
  };

  const tasksForUI: Task[] =
    backendTasks.length > 0
      ? backendTasks.map((task) => ({
          id: task.key,
          label: formatTaskLabel(task.key),
          limit: task.max_per_day,
          completed: task.current_count,
          reward: Math.round(task.reward_amount),
        }))
      : tasks;

  const handleWaterAction = () => {
    const waterTask = tasks.find((t) => t.id === "water_grass");
    const canComplete = !!waterTask && waterTask.completed < waterTask.limit;
    if (canComplete) {
      const newTasks = tasks.map((t) =>
        t.id === "water_grass" ? { ...t, completed: t.completed + 1 } : t
      );
      setLocalTasks(newTasks);
      setWallet((prev) => ({ balance: prev.balance + waterTask.reward }));
    } else {
      toast.info("Watering anyway (testing mode).");
    }

    if (onWater) onWater();
    if (token) {
      void zigletApi
        .waterGarden(token)
        .then(() => zigletApi.getGardenState(token))
        .then((gardenState) => setBackendGarden(gardenState))
        .then(() => {
          if (!canComplete) return;
          return zigletApi.completeTask(token, "water_grass");
        })
        .then(() => zigletApi.getTasks(token))
        .then((tasksResponse) => setBackendTasks(tasksResponse.tasks))
        .catch((error) =>
          console.error("Failed to complete water task:", error)
        );
    }
  };

  const handleCapture = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      toast.error("Could not find canvas to capture.");
      return;
    }
    requestAnimationFrame(() => {
      try {
        const dataUrl = canvas.toDataURL("image/png");
        setScreenshotUrl(dataUrl);
        setShareOpen(true);
      } catch (error) {
        console.error("Screenshot failed:", error);
        toast.error("Screenshot failed.");
      }
    });
  };

  const handleShare = () => {
    const text =
      "My Ziglet Garden today  the garden changes once per day.";
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="game-hud">
      <div className="hud-section top-left">
        <div className="profile-card glass-panel p-2 flex items-center gap-3">
          <div className="avatar text-2xl bg-white/10 p-2 rounded-full">ZG</div>
          <div className="profile-info flex flex-col items-start gap-1">
            <WalletConnect />
            <div className="level-bar-container w-full min-w-[100px]">
              <div className="flex justify-between text-[10px] text-[#a5d6a7] uppercase font-bold mb-0.5">
                <span>Lvl {garden.level}</span>
                <span>60%</span>
              </div>
              <div className="progress-bar h-1.5 bg-[#0a1f0f] rounded-full overflow-hidden border border-white/5">
                <div
                  className="fill h-full bg-[#66bb6a]"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hud-section top-right">
        <div className="stat-badge glass-panel streak">
          <span className="icon">🔥</span>
          <span className="value">{garden.streak}</span>
          <span className="label">Days</span>
        </div>
        <div className="stat-badge glass-panel currency">
          <span className="icon">🪙</span>
          <span className="value">{wallet.balance}</span>
          <span className="label">ZIGS</span>
        </div>
        <div className="stat-badge glass-panel points">
          <span className="icon">✨</span>
          <span className="value">{garden.growthPoints}</span>
          <span className="label">Points</span>
        </div>
      </div>

      <div className="hud-section bottom-right">
        <button
          className="action-btn circle-btn glass-panel primary"
          onClick={handleWaterAction}
          title="Water Garden (+50 pts)"
        >
          <span className="btn-icon">💧</span>
        </button>

        <button
          className="action-btn circle-btn glass-panel"
          onClick={handleCapture}
          title="Capture Screenshot"
        >
          <span className="btn-icon">📸</span>
        </button>

        <button
          className="action-btn circle-btn glass-panel"
          onClick={() => setTaskModalOpen(!isTaskModalOpen)}
        >
          <span className="btn-icon">🧾</span>
          {tasks.filter((t) => t.completed < t.limit).length > 0 && (
            <span className="notification-dot"></span>
          )}
        </button>
      </div>

      {isTaskModalOpen && (
        <div className="modal-overlay">
          <div className="task-modal glass-panel">
            <div className="modal-header">
              <h3>Daily Missions</h3>
              <button
                className="close-btn"
                onClick={() => setTaskModalOpen(false)}
              >
                X
              </button>
            </div>
            <div className="task-list">
              {tasksForUI.map((task) => (
                <div
                  key={task.id}
                  className={`task-item ${
                    task.completed >= task.limit ? "completed" : ""
                  }`}
                >
                  <div className="task-info">
                    <span className="task-name">{task.label}</span>
                    <span className="task-reward">+{task.reward} ZIGS</span>
                  </div>
                  <div className="task-status">
                    {task.completed >= task.limit
                      ? "Done"
                      : `${task.completed}/${task.limit}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isShareOpen && (
        <div className="modal-overlay">
          <div className="task-modal glass-panel share-modal">
            <div className="modal-header">
              <h3>Share Your Garden</h3>
              <button className="close-btn" onClick={() => setShareOpen(false)}>
                X
              </button>
            </div>
            <div className="share-preview">
              {screenshotUrl ? (
                <img src={screenshotUrl} alt="Garden screenshot" />
              ) : (
                <div className="share-placeholder">No screenshot</div>
              )}
            </div>
            <button className="share-btn" onClick={handleShare}>
              Share on X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
