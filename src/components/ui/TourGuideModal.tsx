import { useEffect, useMemo, useState } from "react";
import { useSessionStore } from "../../store/sessionStore";
import "./TourGuideModal.css";

const TOUR_DONE_KEY = "ziglet_tour_done";

const steps = [
  {
    title: "Welcome to Ziglet Garden",
    body: "This is your plot. You will grow it by watering and completing daily missions.",
  },
  {
    title: "Daily Missions",
    body: "Open the missions panel and complete tasks like watering, swapping, and sharing to earn ZIG.",
  },
  {
    title: "Water to Grow",
    body: "Use the water action to help grass grow. Growth builds up over repeated sessions.",
  },
  {
    title: "Connect Wallet",
    body: "Connect your Zigchain wallet (zig1...) to save progress and claim rewards.",
  },
];

export const TourGuideModal = () => {
  const { token } = useSessionStore();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const isTourDone = useMemo(
    () => localStorage.getItem(TOUR_DONE_KEY) === "true",
    []
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOUR_DONE_KEY, "true");
      setIsOpen(false);
      return;
    }
    if (!isTourDone) {
      setIsOpen(true);
    }
  }, [token, isTourDone]);

  const goNext = () =>
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  const goBack = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  const openWallet = () => {
    window.dispatchEvent(new Event("ziglet:open-wallet"));
    setIsOpen(false);
    localStorage.setItem(TOUR_DONE_KEY, "true");
  };

  if (!isOpen) return null;

  const isLast = stepIndex === steps.length - 1;

  return (
    <div className="tour-overlay">
      <div className="tour-panel">
        <div className="tour-step">
          <span className="tour-chip">
            Step {stepIndex + 1} / {steps.length}
          </span>
          <h2>{steps[stepIndex].title}</h2>
          <p>{steps[stepIndex].body}</p>
        </div>
        <div className="tour-actions">
          <button
            className="tour-btn ghost"
            onClick={goBack}
            disabled={stepIndex === 0}
          >
            Back
          </button>
          {isLast ? (
            <button className="tour-btn primary" onClick={openWallet}>
              Connect Wallet
            </button>
          ) : (
            <button className="tour-btn primary" onClick={goNext}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
