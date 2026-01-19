import { Application } from "@pixi/react";
import { useEffect, useState } from "react";
import { IsometricGrid } from "./IsometricGrid";
import { GAME_CONFIG } from "../../constants/config";
import { BirdFlocks } from "./BirdFlocks";
import { useBackendStore } from "../../store/backendStore";

interface GameCanvasProps {
  isWatering: boolean;
}

export const GameCanvas = ({ isWatering }: GameCanvasProps) => {
  const { garden } = useBackendStore();
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
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
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Application
        width={dimensions.width}
        height={dimensions.height}
        antialias={GAME_CONFIG.rendering.antialias}
        resolution={GAME_CONFIG.rendering.resolution}
        autoDensity={GAME_CONFIG.rendering.autoDensity}
        backgroundColor={GAME_CONFIG.rendering.backgroundColor}
        preserveDrawingBuffer
      >
        <BirdFlocks width={dimensions.width} height={dimensions.height} />
        <IsometricGrid
          offsetX={dimensions.width / 2}
          offsetY={dimensions.height / 4}
          isWatering={isWatering}
          growthPoints={garden?.growth?.growth_points ?? 0}
        />
      </Application>
    </div>
  );
};
