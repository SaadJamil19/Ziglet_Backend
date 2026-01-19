# 🎯 Ziglet: Technical Specification

## _Complete Implementation Blueprint_

---

## 📊 Project Summary

**Ziglet** is a premium Web3 garden builder game with:

- ✅ Modern glassmorphism UI
- ✅ Isometric 2D graphics (PixiJS)
- ✅ Immersive audio system
- ✅ Blockchain integration (Zigchain)
- ✅ Gamification & rewards
- ✅ Flawless UX with psychological hooks

---

## 🎨 UI Mockup Reference

![Ziglet UI Mockup](C:/Users/User/.gemini/antigravity/brain/79e588b9-2505-4b4d-9021-6df088f7a4ad/ziglet_ui_mockup_1768576671243.png)

### **Layout Breakdown:**

```
┌─────────────────────────────────────────────────────────────┐
│  💧 85/100   🔥 7 days   💎 Lv 5 [▓▓▓░░] 450/500   0x7e9...F2a9 │  ← Top Bar (Glassmorphism)
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐      ┌──────────────────┐      ┌──────────┐  │
│  │  DAILY   │      │                  │      │  GARDEN  │  │
│  │  TASKS   │      │   [Isometric     │      │ VITALITY │  │
│  │          │      │    Garden View]  │      │          │  │
│  │ ☑ Task 1 │      │                  │      │   65%    │  │
│  │ ☐ Task 2 │      │   Character +    │      │  ◯◯◯◯    │  │
│  │ ☐ Task 3 │      │   Plants         │      │  ☀💧🌱   │  │
│  └──────────┘      └──────────────────┘      └──────────┘  │
│                                                             │
│                  ┌────────────────────┐                     │
│                  │  WATER GARDEN  💧  │  ← Main CTA         │
│                  │  (Cyan Glow)       │                     │
│                  └────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Technical Architecture

### **1. Component Hierarchy**

```typescript
<App>
  ├── <WalletProvider>           // Wagmi context
  │   └── <QueryClientProvider>  // React Query
  │       └── <GameProvider>     // Game state context
  │           ├── <AudioManager> // Sound system
  │           ├── <HUD>          // UI overlay
  │           │   ├── <TopBar>
  │           │   │   ├── <WaterDisplay>
  │           │   │   ├── <StreakDisplay>
  │           │   │   ├── <LevelDisplay>
  │           │   │   └── <WalletConnect>
  │           │   ├── <LeftPanel>
  │           │   │   └── <TasksPanel>
  │           │   ├── <RightPanel>
  │           │   │   └── <VitalityBar>
  │           │   └── <BottomBar>
  │           │       └── <WaterButton>
  │           ├── <GameCanvas>   // PixiJS Stage
  │           │   ├── <Background>
  │           │   ├── <IsometricGrid>
  │           │   │   └── <Tile> (x100)
  │           │   ├── <Plants>
  │           │   │   └── <Plant> (x10-20)
  │           │   ├── <Character>
  │           │   └── <WaterParticles>
  │           └── <Modals>
  │               ├── <WelcomeModal>
  │               ├── <DailyRewardModal>
  │               └── <MilestoneModal>
  └── <ToastContainer>
```

### **2. Data Flow**

```
User Action (Click "Water Garden")
        ↓
UI Store (setIsWatering: true)
        ↓
Task Store (addTasks: [plant coordinates])
        ↓
Character Controller (processQueue)
        ↓
GSAP Animation (move → water → celebrate)
        ↓
Audio Manager (footsteps → water → growth)
        ↓
Plant Store (updatePlant: health +20)
        ↓
Game Store (updateGardenHealth: +5)
        ↓
Water Store (consumeWater: -10)
        ↓
Backend API (submitTask)
        ↓
Reward Distribution (ZIG tokens)
        ↓
UI Update (toast notification)
```

---

## 📦 Package Dependencies

```json
{
  "name": "ziglet",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "pixi.js": "^8.0.0",
    "@pixi/react": "^1.0.0",
    "gsap": "^3.12.5",
    "@gsap/react": "^2.1.0",
    "zustand": "^4.5.0",
    "wagmi": "^2.5.0",
    "viem": "^2.7.0",
    "@tanstack/react-query": "^5.20.0",
    "howler": "^2.2.4",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "date-fns": "^3.3.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/howler": "^2.2.11",
    "@types/node": "^20.11.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^6.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "eslint-config-prettier": "^9.1.0"
  }
}
```

---

## 🎨 Design Tokens

```typescript
// src/constants/colors.ts
export const COLORS = {
  // Forest Theme
  forest: {
    darkest: "#0a1f0f",
    dark: "#1b5e20",
    medium: "#2e7d32",
    light: "#66bb6a",
    lightest: "#a5d6a7",
  },

  // Web3 Cyber
  cyber: {
    cyan: "#00f5ff",
    purple: "#b388ff",
    gold: "#ffd54f",
  },

  // Glass Effects
  glass: {
    bg: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.15)",
    shadow: "rgba(31, 38, 135, 0.37)",
  },
};

// src/constants/config.ts
export const GAME_CONFIG = {
  grid: {
    rows: 10,
    cols: 10,
    tileWidth: 128,
    tileHeight: 64,
  },

  water: {
    dailyAllowance: 100,
    costPerPlant: 10,
    refillHours: 24,
  },

  rewards: {
    waterPlant: { zig: 5, xp: 20 },
    dailyLogin: { zig: 10, water: 50 },
    streak7: { zig: 100, water: 200 },
    streak14: { zig: 250, water: 500 },
  },

  performance: {
    targetFPS: 60,
    maxParticles: 500,
    cullDistance: 1000,
  },
};
```

---

## 🎵 Audio Assets Required

### **Sound Effects (WebM + MP3 fallback)**

```
/public/sounds/
├── character/
│   ├── footstep_grass_1.webm
│   ├── footstep_grass_2.webm
│   ├── footstep_grass_3.webm
│   ├── footstep_grass_4.webm
│   └── celebrate.webm
├── environment/
│   ├── water_drip_1.webm
│   ├── water_drip_2.webm
│   ├── water_drip_3.webm
│   ├── watering_can.webm
│   ├── plant_grow.webm
│   └── plant_wither.webm
├── ui/
│   ├── button_click.webm
│   ├── button_hover.webm
│   ├── modal_open.webm
│   ├── modal_close.webm
│   ├── task_complete.webm
│   ├── notification.webm
│   └── error.webm
├── rewards/
│   ├── coin_collect.webm
│   ├── streak_bonus.webm
│   ├── milestone.webm
│   └── level_up.webm
└── music/
    ├── main_theme.mp3
    └── victory_jingle.mp3
```

---

## 🖼️ Sprite Assets Required

### **Character Sprites (512x512px, 2x for retina)**

```
/public/sprites/characters/
├── character_idle.json          # 4 frames
├── character_walk_north.json    # 8 frames
├── character_walk_east.json     # 8 frames
├── character_walk_south.json    # 8 frames
├── character_walk_west.json     # 8 frames
├── character_water.json         # 12 frames
└── character_celebrate.json     # 16 frames
```

### **Plant Sprites (256x256px)**

```
/public/sprites/plants/
├── tree_seedling.png
├── tree_growing.png
├── tree_flourishing.png
├── tree_withered.png
├── flower_seedling.png
├── flower_growing.png
├── flower_flourishing.png
└── flower_withered.png
```

### **Tile Sprites (256x128px isometric)**

```
/public/sprites/tiles/
├── grass_lush.png
├── grass_dry.png
├── soil.png
├── path.png
└── water.png
```

### **UI Sprites (128x128px)**

```
/public/sprites/ui/
├── icons/
│   ├── water.png
│   ├── fire.png
│   ├── level.png
│   ├── coin.png
│   └── gem.png
└── buttons/
    ├── primary_normal.png
    ├── primary_hover.png
    └── primary_active.png
```

---

## 🔧 Configuration Files

### **vite.config.ts**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@stores": path.resolve(__dirname, "./src/stores"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@constants": path.resolve(__dirname, "./src/constants"),
    },
  },
  optimizeDeps: {
    include: ["pixi.js", "@pixi/react", "gsap", "howler"],
  },
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          pixi: ["pixi.js", "@pixi/react"],
          animation: ["gsap", "@gsap/react"],
          blockchain: ["wagmi", "viem"],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
```

### **tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          darkest: "#0a1f0f",
          dark: "#1b5e20",
          medium: "#2e7d32",
          light: "#66bb6a",
          lightest: "#a5d6a7",
        },
        cyber: {
          cyan: "#00f5ff",
          purple: "#b388ff",
          gold: "#ffd54f",
        },
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
        display: ["Orbitron", "Rajdhani", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
        "3xl": "64px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glass-inset": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)",
        glow: "0 0 20px rgba(0, 245, 255, 0.5)",
        "glow-strong": "0 0 40px rgba(0, 245, 255, 0.8)",
      },
    },
  },
  plugins: [],
};
```

### **tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@stores/*": ["./src/stores/*"],
      "@utils/*": ["./src/utils/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@types/*": ["./src/types/*"],
      "@constants/*": ["./src/constants/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 🚀 Development Workflow

### **Day 1: Project Setup**

```bash
# 1. Create project
npm create vite@latest ziglet -- --template react-ts
cd ziglet

# 2. Install dependencies
npm install

# 3. Install additional packages
npm install pixi.js @pixi/react gsap @gsap/react zustand wagmi viem @tanstack/react-query howler clsx tailwind-merge date-fns

# 4. Install dev dependencies
npm install -D tailwindcss postcss autoprefixer @types/howler

# 5. Initialize Tailwind
npx tailwindcss init -p

# 6. Start dev server
npm run dev
```

### **Day 2-3: Core Setup**

- Configure Vite, TypeScript, Tailwind
- Set up folder structure
- Create design tokens
- Build base components

### **Day 4-25: Implementation**

- Follow phases from MASTER_PLAN.md
- Test continuously
- Optimize performance
- Polish UX

---

## ✅ Definition of Done

A feature is complete when:

- [ ] Code is TypeScript strict mode compliant
- [ ] Component is fully responsive
- [ ] Animations are smooth (60 FPS)
- [ ] Sound effects are integrated
- [ ] Error states are handled
- [ ] Loading states are implemented
- [ ] Accessibility is considered
- [ ] Performance is optimized
- [ ] Code is documented
- [ ] Tests are written (if applicable)

---

## 🎯 Success Metrics

### **Technical**

- Bundle size: < 500KB (gzipped)
- Initial load: < 3 seconds
- Time to interactive: < 5 seconds
- Frame rate: 60 FPS (desktop), 30 FPS (mobile)
- Lighthouse score: > 90

### **UX**

- First action: < 30 seconds from landing
- Task completion rate: > 80%
- Daily return rate: > 50%
- Average session: > 5 minutes

---

## 📚 Resources

- [PixiJS Documentation](https://pixijs.com/docs)
- [GSAP Documentation](https://greensock.com/docs/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Wagmi Documentation](https://wagmi.sh/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Status**: ✅ Ready for Implementation  
**Next Step**: Initialize project with `npm create vite@latest ziglet -- --template react-ts`

---

_Technical Specification v1.0_  
_Last Updated: 2026-01-16_
