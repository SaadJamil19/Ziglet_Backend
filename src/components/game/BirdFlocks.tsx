import { useApplication, useTick } from "@pixi/react";
import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

interface Bird {
  sprite: PIXI.Container;
  vx: number;
  wobbleOffset: number;
  wobbleSpeed: number;
  baseY: number;
}

interface BirdFlocksProps {
  width: number;
  height: number;
}

const createBird = (scale: number) => {
  const bird = new PIXI.Container();
  const wings = new PIXI.Graphics();
  wings.lineStyle(2 * scale, 0x1b1b1b, 0.9);
  wings.moveTo(-6 * scale, 2 * scale);
  wings.lineTo(0, -4 * scale);
  wings.lineTo(6 * scale, 2 * scale);
  bird.addChild(wings);
  return bird;
};

export const BirdFlocks = ({ width, height }: BirdFlocksProps) => {
  const appState = useApplication();
  const app = appState?.app;
  const containerRef = useRef<PIXI.Container | null>(null);
  const birdsRef = useRef<Bird[]>([]);
  const spawnTimerRef = useRef(0);
  const tickRef = useRef(0);

  useEffect(() => {
    if (!app) return;
    const container = new PIXI.Container();
    container.zIndex = 5000;
    containerRef.current = container;
    app.stage.sortableChildren = true;
    app.stage.addChild(container);

    return () => {
      app.stage.removeChild(container);
      container.destroy({ children: true });
      birdsRef.current = [];
    };
  }, [app]);

  useTick((ticker: PIXI.Ticker) => {
    if (!containerRef.current) return;
    const delta = ticker.deltaTime;
    tickRef.current += delta;
    spawnTimerRef.current -= delta;

    if (spawnTimerRef.current <= 0) {
      const flockSize = 5 + Math.floor(Math.random() * 4);
      const fromLeft = Math.random() > 0.5;
      const startX = fromLeft ? -80 : width + 80;
      const startY = height * (0.12 + Math.random() * 0.25);
      const baseSpeed = (2.8 + Math.random() * 1.6) * (fromLeft ? 1 : -1);

      for (let i = 0; i < flockSize; i += 1) {
        const scale = 1.1 + Math.random() * 0.6;
        const birdSprite = createBird(scale);
        birdSprite.x = startX + (fromLeft ? -i * 18 : i * 18);
        birdSprite.y = startY + i * 8;
        if (!fromLeft) {
          birdSprite.scale.x *= -1;
        }
        containerRef.current.addChild(birdSprite);
        birdsRef.current.push({
          sprite: birdSprite,
          vx: baseSpeed + Math.random() * 0.6 * (fromLeft ? 1 : -1),
          wobbleOffset: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.05 + Math.random() * 0.05,
          baseY: birdSprite.y,
        });
      }

      spawnTimerRef.current = 140 + Math.random() * 180;
    }

    birdsRef.current = birdsRef.current.filter((bird) => {
      bird.sprite.x += bird.vx * delta;
      bird.sprite.y =
        bird.baseY +
        Math.sin(tickRef.current * bird.wobbleSpeed + bird.wobbleOffset) * 8;
      const offscreen =
        bird.sprite.x < -120 || bird.sprite.x > width + 120;
      if (offscreen) {
        bird.sprite.destroy();
        return false;
      }
      return true;
    });
  });

  return null;
};
