/**
 * Isometric Grid Utilities
 * Converts between grid coordinates and screen pixels
 */

export interface GridPosition {
  row: number;
  col: number;
}

export interface ScreenPosition {
  x: number;
  y: number;
}

export const TILE_WIDTH = 128;
export const TILE_HEIGHT = 64;

/**
 * Converts grid (row, col) to screen (x, y) coordinates
 * For isometric 2D rendering at 45° angle
 */
export const gridToScreen = (
  row: number,
  col: number,
  tileWidth: number = TILE_WIDTH,
  tileHeight: number = TILE_HEIGHT
): ScreenPosition => {
  const x = (col - row) * (tileWidth / 2);
  const y = (col + row) * (tileHeight / 2);
  return { x, y };
};

/**
 * Converts screen (x, y) to grid (row, col) coordinates
 */
export const screenToGrid = (
  x: number,
  y: number,
  tileWidth: number = TILE_WIDTH,
  tileHeight: number = TILE_HEIGHT
): GridPosition => {
  const col = Math.floor((x / (tileWidth / 2) + y / (tileHeight / 2)) / 2);
  const row = Math.floor((y / (tileHeight / 2) - x / (tileWidth / 2)) / 2);
  return { row, col };
};

/**
 * Get the center position of a tile for sprite placement
 */
export const getTileCenter = (
  row: number,
  col: number,
  tileWidth: number = TILE_WIDTH,
  tileHeight: number = TILE_HEIGHT
): ScreenPosition => {
  const { x, y } = gridToScreen(row, col, tileWidth, tileHeight);
  return { x, y: y + tileHeight / 4 };
};
