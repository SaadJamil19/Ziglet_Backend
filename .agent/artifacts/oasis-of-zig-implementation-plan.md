# 🌴 Ziglet: Complete Implementation Plan

## 📋 Executive Summary

**Ziglet** is a 3D blockchain-incentivized garden builder utilizing a "Nurture-to-Earn" mechanic. Players perform daily gardening tasks to maintain their virtual land and earn rewards on Zigchain.

---

## 🎯 Core Gameplay Loop

1. **Daily Ritual**: User logs in and views their garden state (influenced by backend data)
2. **The Nurture Task**: User clicks the "Water" button
3. **Automated Jog**: Character automatically navigates the grid, watering plants via scripted GSAP sequence
4. **Visual Evolution**: Plants grow (or wither) based on user consistency
5. **Reward Trigger**: Frontend signals backend to release rewards to linked wallet

---

## 🛠 Technical Stack

| Category               | Technology                         | Purpose                           |
| ---------------------- | ---------------------------------- | --------------------------------- |
| **IDE**                | Antigravity                        | Development environment           |
| **Framework**          | React + Vite                       | Fast, modern web app              |
| **3D Engine**          | Three.js + React Three Fiber (R3F) | 3D rendering and scene management |
| **Animation**          | GSAP (GreenSock)                   | Character pathing, UI animations  |
| **State Management**   | Zustand                            | Lightweight, performant state     |
| **Styling**            | Tailwind CSS                       | HUD and UI overlays               |
| **Wallet Integration** | Wagmi / Viem                       | Zigchain connectivity             |
| **Particles**          | Three.js Points                    | Water effects                     |

---

## 📂 Project Structure

```
ziglet/
├── public/
│   ├── models/           # 3D models (GLB/GLTF)
│   ├── textures/         # Environment textures
│   └── sounds/           # Audio effects
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── Scene.tsx           # Main R3F Canvas
│   │   │   ├── Camera.tsx          # Isometric orthographic camera
│   │   │   ├── Grid.tsx            # Tile-based grid system
│   │   │   ├── Character.tsx       # Player character with animations
│   │   │   ├── Plant.tsx           # Individual plant component
│   │   │   ├── WaterParticles.tsx  # Watering effect
│   │   │   └── Environment.tsx     # Sky, lighting, ground
│   │   ├── ui/
│   │   │   ├── HUD.tsx             # Main heads-up display
│   │   │   ├── VitalityBar.tsx     # Garden health indicator
│   │   │   ├── WaterButton.tsx     # Primary action button
│   │   │   ├── WalletConnect.tsx   # Wallet connection UI
│   │   │   └── LevelDisplay.tsx    # Character level/XP
│   ├── stores/
│   │   ├── useGameStore.ts         # Main game state
│   │   ├── useWalletStore.ts       # Wallet connection state
│   │   └── useTaskStore.ts         # Task queue management
│   ├── utils/
│   │   ├── pathfinding.ts          # Grid navigation logic
│   │   ├── animations.ts           # GSAP animation helpers
│   │   └── api.ts                  # Backend API calls
│   ├── hooks/
│   │   ├── useCharacterController.ts  # Character movement logic
│   │   ├── usePlantGrowth.ts          # Plant lifecycle management
│   │   └── useWalletConnection.ts     # Wallet integration
│   ├── types/
│   │   └── index.ts                # TypeScript definitions
│   ├── constants/
│   │   └── config.ts               # Game configuration
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

### **Phase 1: Foundation & Environment** (Week 1-2)

#### **Objectives**

- Set up project infrastructure
- Implement isometric camera system
- Create tile-based grid
- Establish environment state management

#### **Tasks**

##### 1.1 Project Initialization

```bash
# Initialize Vite + React + TypeScript project
npm create vite@latest ziglet -- --template react-ts
cd ziglet

# Install core dependencies
npm install three @react-three/fiber @react-three/drei
npm install gsap
npm install zustand
npm install tailwindcss postcss autoprefixer
npm install wagmi viem @tanstack/react-query

# Install dev dependencies
npm install -D @types/three
```

##### 1.2 Isometric Orthographic Camera Setup

**File**: `src/components/3d/Camera.tsx`

**Requirements**:

- Orthographic projection for isometric view
- 45° angle for "Clash of Clans" perspective
- Smooth camera controls (optional orbit for debugging)
- Responsive to window resize

**Key Features**:

```typescript
// Camera configuration
const cameraConfig = {
  position: [10, 10, 10],
  zoom: 50,
  near: 0.1,
  far: 1000,
  fov: 75,
};
```

##### 1.3 Tile-Based Grid System

**File**: `src/components/3d/Grid.tsx`

**Requirements**:

- 10x10 grid (expandable)
- Each tile: 1 unit × 1 unit
- Visual grid lines for development
- Coordinate system (X, Z)
- Tile highlighting on hover (optional)

**Data Structure**:

```typescript
interface Tile {
  x: number;
  z: number;
  type: "soil" | "path" | "water";
  occupied: boolean;
  plantId?: string;
}
```

##### 1.4 Environment State Management

**File**: `src/stores/useGameStore.ts`

**Requirements**:

- Global state for environment (Lush vs. Dry)
- Garden health percentage (0-100%)
- Texture swapping based on health
- Day counter and streak tracking

**State Schema**:

```typescript
interface GameState {
  environmentState: "lush" | "dry";
  gardenHealth: number; // 0-100
  dayStreak: number;
  lastWateredDate: Date | null;

  // Actions
  setEnvironmentState: (state: "lush" | "dry") => void;
  updateGardenHealth: (delta: number) => void;
  recordWatering: () => void;
}
```

##### 1.5 Basic Environment Rendering

**File**: `src/components/3d/Environment.tsx`

**Requirements**:

- Ground plane with texture
- Directional lighting (sun)
- Ambient lighting
- Sky gradient or skybox
- Fog for depth

**Deliverables**:

- ✅ Working Vite + React + R3F setup
- ✅ Isometric camera with proper perspective
- ✅ Visible 10x10 grid
- ✅ Zustand store with environment state
- ✅ Basic scene with lighting

---

### **Phase 2: Character Controller & Animation** (Week 3-4)

#### **Objectives**

- Implement automated character movement
- Integrate GSAP for smooth animations
- Create task queue system
- Add watering particle effects

#### **Tasks**

##### 2.1 Character Model Integration

**File**: `src/components/3d/Character.tsx`

**Requirements**:

- Load 3D character model (GLB/GLTF)
- Idle, walk, and watering animations
- Character positioning on grid
- Rotation to face movement direction

**Model Specifications**:

- Format: GLB (optimized)
- Animations: idle, walk, water
- Scale: Fits within 1 grid unit

##### 2.2 Task Queue System

**File**: `src/stores/useTaskStore.ts`

**Requirements**:

- Accept array of coordinates `[{x, z}, {x, z}, ...]`
- Queue processing (FIFO)
- Task states: pending, active, completed
- Pause/resume functionality

**State Schema**:

```typescript
interface Task {
  id: string;
  targetX: number;
  targetZ: number;
  action: "water" | "harvest" | "plant";
  status: "pending" | "active" | "completed";
}

interface TaskState {
  queue: Task[];
  currentTask: Task | null;
  isProcessing: boolean;

  // Actions
  addTasks: (coordinates: { x: number; z: number }[]) => void;
  processNextTask: () => void;
  clearQueue: () => void;
}
```

##### 2.3 GSAP Character Controller

**File**: `src/hooks/useCharacterController.ts`

**Requirements**:

- GSAP timeline for movement sequences
- Smooth position interpolation
- Rotation tweening
- Pause at each tile for watering
- Animation state synchronization

**Animation Sequence**:

```typescript
const wateringSequence = gsap
  .timeline()
  .to(characterRef.current.position, {
    x: targetX,
    z: targetZ,
    duration: 1,
    ease: "power2.inOut",
  })
  .to(
    characterRef.current.rotation,
    {
      y: targetRotation,
      duration: 0.3,
    },
    "<"
  )
  .call(() => playWateringAnimation())
  .call(() => spawnWaterParticles())
  .to({}, { duration: 1.5 }) // Watering pause
  .call(() => completeTask());
```

##### 2.4 Watering Particle System

**File**: `src/components/3d/WaterParticles.tsx`

**Requirements**:

- Three.js Points system
- Blue water droplets
- Emit from watering can position
- Gravity and fade-out effect
- Pooling for performance

**Particle Configuration**:

```typescript
const particleConfig = {
  count: 100,
  lifetime: 1.5, // seconds
  startColor: new THREE.Color(0x4da6ff),
  endColor: new THREE.Color(0x0066cc),
  startSize: 0.1,
  endSize: 0.05,
  gravity: -2,
};
```

##### 2.5 Pathfinding Logic

**File**: `src/utils/pathfinding.ts`

**Requirements**:

- Simple A\* or grid-based pathfinding
- Avoid occupied tiles
- Return array of waypoints
- Optimize for short distances

**Deliverables**:

- ✅ Character model loaded and animated
- ✅ Task queue system functional
- ✅ GSAP-driven movement between tiles
- ✅ Watering particles spawn on action
- ✅ Smooth rotation and animation transitions

---

### **Phase 3: Plant Lifecycle & Progression** (Week 5-6)

#### **Objectives**

- Implement 3-stage plant growth system
- Add withering/decay mechanics
- Create character leveling system
- Visual feedback for player progress

#### **Tasks**

##### 3.1 Plant Component with Growth Stages

**File**: `src/components/3d/Plant.tsx`

**Requirements**:

- Three visual stages: Seedling, Growing, Flourishing
- Smooth transitions between stages
- Scale and color variations
- Health indicator

**Growth Stages**:

```typescript
enum PlantStage {
  SEEDLING = "seedling", // Scale: 0.3, Color: Light green
  GROWING = "growing", // Scale: 0.6, Color: Green
  FLOURISHING = "flourishing", // Scale: 1.0, Color: Vibrant green
}

interface PlantData {
  id: string;
  x: number;
  z: number;
  stage: PlantStage;
  health: number; // 0-100
  daysWithoutWater: number;
  lastWatered: Date;
}
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

##### 3.3 Withering System

**File**: `src/utils/plantDecay.ts`

**Requirements**:

- Gradual color shift to brown/grey
- Scale reduction animation
- Health degradation over time
- Revival mechanic (watering withered plants)

**Decay Animation**:

```typescript
const witherAnimation = gsap
  .timeline()
  .to(plantMaterial.color, {
    r: 0.4,
    g: 0.3,
    b: 0.2, // Brown
    duration: 2,
  })
  .to(
    plantRef.current.scale,
    {
      x: 0.5,
      y: 0.5,
      z: 0.5,
      duration: 2,
    },
    "<"
  );
```

##### 3.4 Character Leveling System

**File**: `src/stores/useGameStore.ts` (extend)

**Requirements**:

- XP gained from watering plants
- Level thresholds (e.g., 100 XP per level)
- Visual character upgrades per level
- Unlock new abilities/areas

**Leveling Schema**:

```typescript
interface PlayerProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalPlantsWatered: number;

  // Visual upgrades
  characterSkin: string;
  wateringCanModel: string;
}
```

**XP Rewards**:

- Water seedling: +5 XP
- Water growing plant: +10 XP
- Water flourishing plant: +15 XP
- Revive withered plant: +25 XP

##### 3.5 Visual Upgrade System

**Requirements**:

- Level 5: Upgraded watering can (silver)
- Level 10: New character outfit
- Level 15: Golden watering can
- Level 20: Special particle effects

**Deliverables**:

- ✅ Plants with 3 distinct growth stages
- ✅ Automatic growth progression
- ✅ Withering mechanics for neglected plants
- ✅ Character XP and leveling system
- ✅ Visual upgrades tied to player level

---

### **Phase 4: HUD & User Interface** (Week 7)

#### **Objectives**

- Create immersive HUD overlay
- Implement garden vitality display
- Add wallet connection UI
- Build responsive controls

#### **Tasks**

##### 4.1 Main HUD Component

**File**: `src/components/ui/HUD.tsx`

**Requirements**:

- Transparent overlay (doesn't block 3D view)
- Responsive layout (mobile, tablet, desktop)
- Glassmorphism design
- Smooth fade-in animations

**Layout**:

```
┌─────────────────────────────────────┐
│ [Logo]              [Wallet] [Menu] │ ← Top Bar
├─────────────────────────────────────┤
│                                     │
│         [3D Scene View]             │
│                                     │
├─────────────────────────────────────┤
│ [Vitality: 75%] [Level 5] [XP Bar] │ ← Bottom Stats
│           [Water Garden]            │ ← Action Button
└─────────────────────────────────────┘
```

##### 4.2 Garden Vitality Bar

**File**: `src/components/ui/VitalityBar.tsx`

**Requirements**:

- Real-time progress bar (0-100%)
- Color gradient (red → yellow → green)
- Animated transitions
- Tooltip with details

**Visual States**:

- 0-33%: Red (Critical)
- 34-66%: Yellow (Needs attention)
- 67-100%: Green (Healthy)

##### 4.3 Water Garden Button

**File**: `src/components/ui/WaterButton.tsx`

**Requirements**:

- Large, prominent CTA button
- Disabled state when task running
- Loading animation during watering
- Success feedback on completion

**States**:

```typescript
type ButtonState =
  | "idle" // Ready to water
  | "processing" // Character watering
  | "cooldown" // Already watered today
  | "disabled"; // No plants to water
```

##### 4.4 Wallet Connection

**File**: `src/components/ui/WalletConnect.tsx`

**Requirements**:

- Connect/disconnect wallet
- Display truncated address
- Network indicator (Zigchain)
- Balance display (optional)

**Integration**:

```typescript
import { useConnect, useAccount, useDisconnect } from "wagmi";

// Wagmi configuration for Zigchain
const zigchainConfig = {
  id: "zigchain",
  name: "Zigchain",
  network: "zigchain",
  rpcUrls: {
    default: "https://rpc.zigchain.io",
  },
};
```

##### 4.5 Level & XP Display

**File**: `src/components/ui/LevelDisplay.tsx`

**Requirements**:

- Current level badge
- XP progress bar
- Next level preview
- Animated level-up celebration

**Deliverables**:

- ✅ Fully functional HUD overlay
- ✅ Real-time vitality bar
- ✅ Interactive water button
- ✅ Wallet connection UI
- ✅ Level/XP display

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
interface APIClient {
  // Fetch user's garden state
  getGardenState(walletAddress: string): Promise<GardenState>;

  // Submit watering task completion
  submitWateringTask(data: WateringTaskData): Promise<TaskResponse>;

  // Claim rewards
  claimRewards(walletAddress: string): Promise<RewardResponse>;

  // Get leaderboard
  getLeaderboard(): Promise<LeaderboardEntry[]>;
}
```

##### 5.2 Initial State Hydration

**File**: `src/hooks/useGardenSync.ts`

**Requirements**:

- Fetch garden state on wallet connect
- Populate plants from backend data
- Sync day streak and health
- Handle offline/cache scenarios

**Flow**:

```
1. User connects wallet
2. Fetch garden state from API
3. Hydrate Zustand store
4. Render plants in 3D scene
5. Calculate current vitality
```

##### 5.3 Task Submission

**File**: `src/utils/api.ts` (extend)

**Requirements**:

- POST watering completion to backend
- Include timestamp and plant IDs
- Wallet signature for verification
- Handle network errors gracefully

**Payload**:

```typescript
interface WateringTaskData {
  walletAddress: string;
  timestamp: number;
  plantsWatered: string[]; // Plant IDs
  signature: string; // Wallet signature
}
```

##### 5.4 Reward Distribution

**Requirements**:

- Backend validates task completion
- Smart contract mints/transfers tokens
- Frontend displays reward notification
- Update user balance

**Reward Flow**:

```
1. User completes watering task
2. Frontend submits to backend
3. Backend validates and triggers smart contract
4. Tokens sent to user's wallet
5. Success notification in UI
```

##### 5.5 Error Handling & Retry Logic

**Requirements**:

- Network timeout handling
- Retry failed requests (exponential backoff)
- User-friendly error messages
- Offline mode support

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

- Implement object pooling for particles
- LOD (Level of Detail) for distant plants
- Frustum culling
- Texture compression
- Code splitting and lazy loading

##### 6.2 Audio Integration

**Sounds Needed**:

- Background music (ambient garden theme)
- Watering sound effect
- Plant growth "pop"
- Level-up fanfare
- UI click sounds

**Implementation**:

```typescript
import { Audio, AudioListener, AudioLoader } from "three";

const audioLoader = new AudioLoader();
const waterSound = new Audio(listener);
audioLoader.load("/sounds/water.mp3", (buffer) => {
  waterSound.setBuffer(buffer);
});
```

##### 6.3 Mobile Optimization

- Touch controls for camera
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

- Background: `rgba(0, 0, 0, 0.6)` (glassmorphism)
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
    include: ["three", "@react-three/fiber", "@react-three/drei"],
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
| Memory Usage  | < 200MB | < 400MB            |

---

## 🚦 Milestones & Timeline

| Week | Phase   | Deliverable                                |
| ---- | ------- | ------------------------------------------ |
| 1-2  | Phase 1 | Foundation complete, camera & grid working |
| 3-4  | Phase 2 | Character movement & watering functional   |
| 5-6  | Phase 3 | Plant lifecycle & leveling implemented     |
| 7    | Phase 4 | HUD and UI complete                        |
| 8    | Phase 5 | Backend integration live                   |
| 9-10 | Phase 6 | Polished, tested, production-ready         |

---

## 🧪 Testing Strategy

### Unit Tests

- Game logic (growth, decay, XP calculations)
- Pathfinding algorithms
- State management (Zustand stores)

### Integration Tests

- API communication
- Wallet connection flow
- Task submission pipeline

### E2E Tests

- Complete watering workflow
- Reward claiming
- Multi-day progression

### Performance Tests

- Frame rate monitoring
- Memory leak detection
- Network request profiling

---

## 🔐 Security Considerations

1. **Wallet Security**:

   - Never store private keys
   - Use secure signature verification
   - Validate all transactions client-side

2. **API Security**:

   - HTTPS only
   - Rate limiting
   - Input validation
   - CORS configuration

3. **Smart Contract**:
   - Audit reward distribution logic
   - Prevent double-claiming
   - Gas optimization

---

## 📚 Resources & References

### Documentation

- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [GSAP Docs](https://greensock.com/docs/)
- [Zustand Guide](https://docs.pmnd.rs/zustand)
- [Wagmi Docs](https://wagmi.sh/)

### Assets

- **3D Models**: Sketchfab, TurboSquid (free/paid)
- **Textures**: Poly Haven, Texture Haven
- **Sounds**: Freesound.org, Zapsplat

### Inspiration

- Clash of Clans (camera perspective)
- Hay Day (farming mechanics)
- Axie Infinity (blockchain integration)

---

## 🎯 Success Metrics

### User Engagement

- Daily Active Users (DAU)
- Average session duration: > 5 minutes
- Day streak retention: > 50% at day 7

### Technical Performance

- 60 FPS on desktop
- < 3s initial load time
- < 1% error rate on API calls

### Blockchain Metrics

- Successful reward claims: > 95%
- Average transaction time: < 30s
- Wallet connection success: > 98%

---

## 🚀 Future Enhancements (Post-Launch)

### Phase 7: Social Features

- Multiplayer garden visits
- Leaderboards
- Gift plants to friends
- Guild/team systems

### Phase 8: Advanced Gameplay

- Multiple plant types
- Seasonal events
- Weather system
- Rare plant breeding

### Phase 9: Economy Expansion

- NFT plants
- Marketplace for trading
- Staking mechanisms
- Premium cosmetics

---

## 📝 Notes for Development

### Best Practices

1. **Component Organization**: Keep 3D and UI components separate
2. **State Management**: Use Zustand for global state, local state for component-specific data
3. **Performance**: Profile regularly, optimize early
4. **Git Workflow**: Feature branches, PR reviews, semantic commits
5. **Documentation**: Comment complex logic, maintain README

### Common Pitfalls to Avoid

- ❌ Don't mutate Three.js objects directly in React
- ❌ Avoid creating new geometries/materials on every render
- ❌ Don't block the main thread with heavy calculations
- ❌ Never trust client-side data for rewards (validate server-side)
- ❌ Don't skip mobile testing until the end

### Development Tips

- Use `<Stats />` from `@react-three/drei` for FPS monitoring
- Enable React DevTools for Zustand state inspection
- Use GSAP's timeline debugging tools
- Test wallet integration on testnet first
- Keep particle counts reasonable (< 1000 active)

---

## ✅ Definition of Done

A phase is considered complete when:

- [ ] All tasks implemented and tested
- [ ] Code reviewed and merged
- [ ] Documentation updated
- [ ] Performance targets met
- [ ] No critical bugs
- [ ] Stakeholder approval received

---

**End of Implementation Plan**

_This document is a living guide and should be updated as the project evolves._
