import {
  type GameState,
  isPassable,
  newGame,
  type Terrain,
  terrainAt,
} from "./mod.ts";

export const SEED = 121;

export function findCellOfTerrain(
  terrain: Terrain,
  seed = SEED,
  startX = 0,
  startY = 0,
): GameState {
  for (let y = startY; y < 10_000; y++) {
    for (let x = startX; x < 10_000; x++) {
      if (terrainAt(seed, x, y) === terrain) {
        return { ...newGame(seed), player: { x, y } };
      }
    }
  }
  throw new Error(`Found no ${terrain} cell in this world.`);
}

export function besideEasternCell(passable: boolean, seed = SEED): GameState {
  for (let x = 2; x < 10_000; x++) {
    const here = isPassable(terrainAt(seed, x, 0));
    const east = isPassable(terrainAt(seed, x + 1, 0));
    if (here && east === passable) {
      return { ...newGame(seed), player: { x, y: 0 } };
    }
  }
  throw new Error("Found no suitable cell on this row.");
}

export function standingOn(
  terrain: Terrain,
  seed = SEED,
): GameState {
  return findCellOfTerrain(terrain, seed);
}
