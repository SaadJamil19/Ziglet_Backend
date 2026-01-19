# 🎯 Ziglet: Implementation Strategy & Best Practices

## 📋 Executive Summary

This document outlines the professional implementation strategy for **Ziglet**, a 2D isometric blockchain-incentivized garden builder. Based on 2026 best practices for React, PixiJS, GSAP, and Zustand.

---

## 🏗️ Architecture Decisions

### **1. Tech Stack Rationale**

| Technology       | Version | Rationale                                              |
| ---------------- | ------- | ------------------------------------------------------ |
| **React**        | 19.x    | Latest with improved concurrent features               |
| **Vite**         | 6.x     | Fastest build tool, HMR, optimized for modern browsers |
| **TypeScript**   | 5.x     | Type safety, better DX, catches errors early           |
| **PixiJS**       | 8.x     | High-performance 2D WebGL rendering                    |
| **@pixi/react**  | Latest  | Official React integration, declarative API            |
| **GSAP**         | 3.12+   | Industry-standard animation library                    |
| **@gsap/react**  | Latest  | Official React integration with useGSAP hook           |
| **Zustand**      | 4.x     | Lightweight state management, persist middleware       |
| **Wagmi**        | 2.x     | React hooks for Ethereum/Zigchain                      |
| **Viem**         | 2.x     | TypeScript-first Ethereum library                      |
| **Tailwind CSS** | 3.x     | Utility-first CSS framework                            |

---

## 🎨 Project Structure (Production-Ready)

```
ziglet/
├── public/
│   ├── sprites/
│   │   ├── characters/          # Character sprite sheets
│   │   ├── plants/              # Plant growth stages
│   │   ├── tiles/               # Ground tiles
│   │   ├── particles/           # Water droplet sprites
│   │   └── environment/         # Background assets
│   ├── sounds/                  # Audio effects
│   └── fonts/                   # Custom fonts
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── GameCanvas.tsx
│   │   │   ├── IsometricGrid.tsx
│   │   │   ├── Character.tsx
│   │   │   ├── Plant.tsx
│   │   │   ├── WaterParticles.tsx
│   │   │   ├── Background.tsx
│   │   │   └── Tile.tsx
│   │   └── ui/
│   │       ├── HUD.tsx
│   │       ├── WelcomeModal.tsx
│   │       ├── DailyRewardModal.tsx
│   │       ├── WaterDisplay.tsx
│   │       ├── TasksPanel.tsx
│   │       ├── StreakDisplay.tsx
│   │       ├── VitalityBar.tsx
│   │       ├── WaterButton.tsx
│   │       ├── WalletConnect.tsx
│   │       ├── LevelDisplay.tsx
│   │       └── ShareButton.tsx
│   ├── stores/
│   │   ├── useGameStore.ts      # Main game state
│   │   ├── useWaterStore.ts     # Water & daily rewards
│   │   ├── useTasksStore.ts     # Task management
│   │   ├── useStreakStore.ts    # Streaks & milestones
│   │   └── useWalletStore.ts    # Wallet connection
│   ├── hooks/
│   │   ├── useCharacterController.ts
│   │   ├── usePlantGrowth.ts
│   │   ├── usePixiApp.ts
│   │   ├── useWalletConnection.ts
│   │   └── useGSAPAnimations.ts
│   ├── utils/
│   │   ├── isometric.ts         # Grid coordinate conversion
│   │   ├── pathfinding.ts       # 2D pathfinding logic
│   │   ├── animations.ts        # GSAP animation helpers
│   │   ├── spriteLoader.ts      # Asset loading utilities
│   │   └── api.ts               # Backend API calls
│   ├── types/
│   │   ├── index.ts             # Global TypeScript types
│   │   ├── game.types.ts        # Game-specific types
│   │   └── api.types.ts         # API response types
│   ├── constants/
│   │   ├── config.ts            # Game configuration
│   │   ├── colors.ts            # Forest color palette
│   │   └── rewards.ts           # Reward configurations
│   ├── lib/
│   │   ├── pixi.ts              # PixiJS setup & extend API
│   │   └── wagmi.ts             # Wagmi/Viem configuration
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 🔧 Critical Best Practices

### **1. PixiJS Integration (@pixi/react)**

#### ✅ DO:

```typescript
// Use the extend API to optimize bundle size
import { Application } from "@pixi/react";
import { Container, Sprite, Graphics } from "pixi.js";
import { extend } from "@pixi/react";

// Explicitly declare what you're using
extend({ Container, Sprite, Graphics });

// Use prefixed components to avoid collisions
<pixiContainer x={100} y={100}>
  <pixiSprite texture={texture} />
</pixiContainer>;
```

#### ❌ DON'T:

```typescript
// Don't import entire PixiJS library
import * as PIXI from 'pixi.js';

// Don't use unprefixed components (can conflict with react-dom)
<Container>  // ❌ Use <pixiContainer> instead
```

### **2. GSAP Integration (@gsap/react)**

#### ✅ DO:

```typescript
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";

export const AnimatedComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use useGSAP with scope for automatic cleanup
  useGSAP(
    () => {
      gsap.to(".box", {
        x: 100,
        duration: 1,
      });
    },
    { scope: containerRef }
  ); // Scope to container

  return <div ref={containerRef}>...</div>;
};
```

#### ❌ DON'T:

```typescript
// Don't use useEffect for GSAP animations
useEffect(() => {
  gsap.to(".box", { x: 100 }); // ❌ No automatic cleanup
}, []);
```

### **3. Zustand with Persist**

#### ✅ DO:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  score: number;
  incrementScore: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      score: 0,
      incrementScore: () => set((state) => ({ score: state.score + 1 })),
    }),
    {
      name: "game-storage", // localStorage key
      partialize: (state) => ({ score: state.score }), // Only persist score
    }
  )
);
```

#### ❌ DON'T:

```typescript
// Don't persist functions or non-serializable data
persist(
  (set) => ({
    callback: () => {}, // ❌ Functions can't be serialized
    date: new Date(), // ❌ Will be stringified
  }),
  { name: "storage" }
);
```

### **4. TypeScript Best Practices**

#### ✅ DO:

```typescript
// Define strict types for all state
interface Plant {
  id: string;
  row: number;
  col: number;
  stage: "seedling" | "growing" | "flourishing" | "withered";
  health: number;
  lastWatered: Date | null;
}

// Use type guards
function isPlant(obj: unknown): obj is Plant {
  return (
    typeof obj === "object" && obj !== null && "id" in obj && "stage" in obj
  );
}
```

### **5. Performance Optimization**

#### ✅ DO:

- Use `React.memo` for expensive components
- Implement sprite pooling for particles
- Use texture atlases (spritesheets)
- Debounce scroll/resize events
- Lazy load routes and heavy components

```typescript
// Memoize expensive components
export const Plant = React.memo(({ id, stage }: PlantProps) => {
  // Component logic
});

// Lazy load routes
const GameCanvas = lazy(() => import("./components/game/GameCanvas"));
```

---

## 🚀 Implementation Phases

### **Phase 0: Project Setup** (Day 1)

1. Initialize Vite + React + TypeScript
2. Install all dependencies
3. Configure Tailwind CSS
4. Set up ESLint + Prettier
5. Configure environment variables
6. Create base folder structure

### **Phase 1: Core Infrastructure** (Day 2-3)

1. Set up PixiJS with extend API
2. Create isometric coordinate utilities
3. Implement Zustand stores with TypeScript
4. Configure GSAP with useGSAP hook
5. Set up Wagmi for wallet connection

### **Phase 2: Game Canvas** (Day 4-5)

1. Implement GameCanvas component
2. Create IsometricGrid renderer
3. Add Tile components
4. Implement Background with parallax

### **Phase 3: Character & Animation** (Day 6-8)

1. Character sprite integration
2. GSAP-based movement system
3. Task queue implementation
4. Water particle effects

### **Phase 4: Plant System** (Day 9-11)

1. Plant sprite components
2. Growth state machine
3. Withering mechanics
4. Visual transitions

### **Phase 5: UI/UX** (Day 12-14)

1. Forest-themed modals
2. HUD components
3. Task panel
4. Streak display
5. Water management UI

### **Phase 6: Gamification** (Day 15-17)

1. Daily rewards system
2. Streak tracking
3. Milestone rewards
4. Social sharing

### **Phase 7: Backend Integration** (Day 18-20)

1. API client setup
2. Wallet integration
3. Transaction handling
4. Reward distribution

### **Phase 8: Polish & Testing** (Day 21-25)

1. Performance optimization
2. Audio integration
3. Mobile responsiveness
4. Cross-browser testing
5. Bug fixes

---

## 🎯 Critical Success Factors

### **1. Type Safety**

- Every component, hook, and store must be fully typed
- No `any` types (use `unknown` if necessary)
- Strict TypeScript configuration

### **2. Performance**

- Target 60 FPS on desktop, 30 FPS on mobile
- Bundle size < 500KB (gzipped)
- Initial load < 3 seconds

### **3. Code Quality**

- ESLint with strict rules
- Prettier for formatting
- Husky for pre-commit hooks
- Conventional commits

### **4. Testing**

- Unit tests for utilities
- Integration tests for stores
- E2E tests for critical flows

### **5. Documentation**

- JSDoc comments for complex functions
- README with setup instructions
- Component documentation

---

## 🔒 Security Considerations

1. **Never store private keys** - Use wallet providers
2. **Validate all user input** - Both client and server
3. **Use HTTPS only** - No mixed content
4. **Implement rate limiting** - Prevent abuse
5. **Sanitize localStorage data** - Prevent XSS

---

## 📦 Dependency Installation Order

```bash
# 1. Core dependencies
npm install react react-dom
npm install -D typescript @types/react @types/react-dom

# 2. Build tools
npm install -D vite @vitejs/plugin-react

# 3. PixiJS
npm install pixi.js @pixi/react

# 4. GSAP
npm install gsap @gsap/react

# 5. State management
npm install zustand

# 6. Blockchain
npm install wagmi viem @tanstack/react-query

# 7. Styling
npm install -D tailwindcss postcss autoprefixer
npm install clsx tailwind-merge

# 8. Utilities
npm install date-fns
npm install -D @types/node

# 9. Development tools
npm install -D eslint prettier eslint-config-prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

---

## ✅ Pre-Development Checklist

- [ ] All dependencies researched and versions confirmed
- [ ] Project structure planned and documented
- [ ] TypeScript configuration ready
- [ ] ESLint/Prettier configuration ready
- [ ] Git repository initialized
- [ ] Environment variables template created
- [ ] README with setup instructions
- [ ] Implementation phases clearly defined
- [ ] Performance targets set
- [ ] Security considerations documented

---

## 🎓 Key Learnings Applied

1. **PixiJS v8 requires explicit extend API** - Reduces bundle size
2. **useGSAP hook provides automatic cleanup** - Prevents memory leaks
3. **Zustand persist needs partialize** - Only persist serializable data
4. **React 19 Strict Mode runs effects twice** - useGSAP handles this
5. **Scope GSAP animations to containers** - Prevents selector conflicts
6. **Use prefixed PixiJS components** - Avoids JSX collisions
7. **Store GSAP timelines in refs** - Persist across re-renders
8. **Animate transform/opacity only** - GPU-accelerated performance

---

## 🚦 Ready to Build

This strategy document ensures we:

- ✅ Follow 2026 best practices
- ✅ Use latest stable versions
- ✅ Implement proper TypeScript
- ✅ Optimize for performance
- ✅ Maintain code quality
- ✅ Ensure security
- ✅ Plan for scalability

**Next Step**: Initialize the project with Vite and set up the base configuration.

---

_Document Version: 1.0_  
_Last Updated: 2026-01-16_  
_Author: AI Development Team_
