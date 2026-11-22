// The rules of the game. There is no clock here: a command updates the state at
// once, and the events it returns are a record of what happened. Whoever called
// apply() decides how, or whether, to show them over time.

import {
  isPassable,
  type Terrain,
  terrainAt,
  terrainYield,
} from "./terrain.ts";

import { CAPSTONE, type Recipe, RECIPES } from "./recipes.ts";

export type Cell = { x: number; y: number };

export type Direction = "north" | "south" | "east" | "west";

// Plain data that survives JSON. Terrain is absent because the seed can recompute
// it: besides the seed, only what the player has caused belongs here.
export type GameState = {
  seed: number;
  player: Cell;
  inventory: Record<string, number>;
  changed: Record<string, string>;
  ended: boolean;
};

// Command: https://gameprogrammingpatterns.com/command.html
export type Command =
  | { type: "move"; direction: Direction }
  | { type: "gather" }
  | { type: "craft"; output: string };

// Domain Event: https://martinfowler.com/eaaDev/DomainEvent.html
export type GameEvent =
  | { type: "moved"; from: Cell; to: Cell }
  | { type: "blocked"; at: Cell; toward: Cell; terrain: Terrain }
  | {
    type: "gathered";
    at: Cell;
    item: string;
    inventory: Record<string, number>;
  }
  | { type: "gather failed"; at: Cell; terrain: Terrain }
  | { type: "crafted"; output: string; inventory: Record<string, number> }
  | { type: "craft failed"; output: string; missing: Record<string, number> }
  | { type: "ended" };

const STEPS: Record<Direction, Cell> = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

function cellKey(cell: Cell): string {
  return `${cell.x},${cell.y}`;
}

const GATHERED = "gathered";

export function cellNow(state: GameState, cell: Cell): string | undefined {
  if (state.changed[cellKey(cell)] === GATHERED) return undefined;
  return terrainYield(terrainAt(state.seed, cell.x, cell.y));
}

// Singleton, avoided on purpose: tests make as many games as they need. https://gameprogrammingpatterns.com/singleton.html
export function newGame(seed: number): GameState {
  return {
    seed,
    player: { x: 0, y: 0 },
    inventory: {},
    changed: {},
    ended: false,
  };
}

// The single way in. It updates the state it is given and returns the events.
export function apply(state: GameState, command: Command): GameEvent[] {
  // Once the game has ended, nothing can change it.
  if (state.ended) return [];
  switch (command.type) {
    case "move":
      return move(state, command.direction);
    case "gather":
      return gather(state);
    case "craft":
      return craft(state, command.output);
  }
}

// Missing Ingredients query
export function missingFor(
  state: GameState,
  recipe: Recipe,
): Record<string, number> {
  const missing: Record<string, number> = {};
  for (const [item, need] of Object.entries(recipe.inputs)) {
    const have = state.inventory[item] ?? 0;
    if (have < need) missing[item] = need - have;
  }
  return missing;
}

export function canCraft(state: GameState, recipe: Recipe): boolean {
  return Object.keys(missingFor(state, recipe)).length === 0;
}

function gather(state: GameState): GameEvent[] {
  const at = { ...state.player };
  const item = cellNow(state, at);
  if (item === undefined) {
    return [{
      type: "gather failed",
      at,
      terrain: terrainAt(state.seed, at.x, at.y),
    }];
  }
  state.inventory[item] = (state.inventory[item] ?? 0) + 1;
  state.changed[cellKey(at)] = GATHERED;
  return [{ type: "gathered", at, item, inventory: { ...state.inventory } }];
}

function craft(state: GameState, output: string): GameEvent[] {
  const recipe = RECIPES.find((r) => r.output === output);
  if (!recipe) return [];
  const missing = missingFor(state, recipe);
  if (Object.keys(missing).length > 0) {
    return [{ type: "craft failed", output, missing }];
  }
  for (const [item, need] of Object.entries(recipe.inputs)) {
    state.inventory[item] -= need;
    if (state.inventory[item] === 0) delete state.inventory[item];
  }
  state.inventory[output] = (state.inventory[output] ?? 0) + 1;
  const crafted: GameEvent = {
    type: "crafted",
    output,
    inventory: { ...state.inventory },
  };
  if (output === CAPSTONE) {
    state.ended = true;
    return [crafted, { type: "ended" }];
  }
  return [crafted];
}

function move(state: GameState, direction: Direction): GameEvent[] {
  const step = STEPS[direction];
  // Events are retained and played back later, while state keeps changing. So an
  // event gets cells of its own, never an object that state still holds.
  // Aliasing Bug: https://martinfowler.com/bliki/AliasingBug.html
  // Cells in events act as a Value Object: https://martinfowler.com/bliki/ValueObject.html
  const from = { ...state.player };
  const to = { x: from.x + step.x, y: from.y + step.y };
  const terrain = terrainAt(state.seed, to.x, to.y);
  if (!isPassable(terrain, state.inventory)) {
    return [{ type: "blocked", at: from, toward: to, terrain }];
  }
  state.player.x = to.x;
  state.player.y = to.y;
  return [{ type: "moved", from, to }];
}
