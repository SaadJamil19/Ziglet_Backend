/**
 * Game Configuration Constants
 */

export const GAME_CONFIG = {
  // Grid Configuration
  grid: {
    rows: 10,
    cols: 10,
    tileWidth: 128,
    tileHeight: 64,
  },

  // Visual Quality Settings
  rendering: {
    antialias: true,
    resolution:
      typeof window !== "undefined" ? window.devicePixelRatio || 2 : 2,
    autoDensity: true,
    backgroundColor: 0x1a2e1a, // Dark forest green
  },

  // Camera Settings
  camera: {
    initialZoom: 1,
    minZoom: 0.5,
    maxZoom: 2,
  },
} as const;

/**
 * Color Palette - Modern Web3 Forest Theme
 */
export const COLORS = {
  // Forest Theme (Primary)
  forest: {
    darkest: 0x0a1f0f,
    dark: 0x1b5e20,
    medium: 0x2e7d32,
    light: 0x66bb6a,
    lightest: 0xa5d6a7,
  },

  // Web3 Cyber (Accent)
  cyber: {
    cyan: 0x00f5ff,
    purple: 0xb388ff,
    gold: 0xffd54f,
  },

  // Tile Colors
  tiles: {
    grassLush: 0x4caf50,
    grassDry: 0x8d6e63,
    soil: 0x5d4037,
    path: 0x795548,
  },
} as const;
