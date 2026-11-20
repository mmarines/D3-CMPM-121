import { assertEquals } from "@std/assert";
import { apply, isPassable, newGame, TERRAIN_RULES, terrainAt } from "./mod.ts";
import { SEED } from "./test_helpers.ts";

function findLavaEntry(seed: number): {
  from: { x: number; y: number };
  lava: { x: number; y: number };
} {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  for (let y = -100; y < 100; y++) {
    for (let x = -100; x < 100; x++) {
      if (terrainAt(seed, x, y) !== "lava") continue;
      for (const direction of directions) {
        const neighbor = { x: x + direction.x, y: y + direction.y };
        if (isPassable(terrainAt(seed, neighbor.x, neighbor.y), {})) {
          return { from: neighbor, lava: { x, y } };
        }
      }
    }
  }

  throw new Error("Found no passable cell beside lava.");
}

Deno.test("lava barrier is shut before opening and open after it is held", () => {
  const entry = findLavaEntry(SEED);
  const state = newGame(SEED);
  state.player = entry.from;

  const direction = {
    x: entry.lava.x - entry.from.x,
    y: entry.lava.y - entry.from.y,
  };
  const command = direction.x === 1
    ? "east"
    : direction.x === -1
    ? "west"
    : direction.y === 1
    ? "south"
    : "north";

  const blocked = apply(state, { type: "move", direction: command });
  assertEquals(state.player, entry.from);
  assertEquals(blocked[0].type, "blocked");

  state.inventory["Lavawalker's Incantation"] = 1;
  const opened = apply(state, { type: "move", direction: command });
  assertEquals(state.player, entry.lava);
  assertEquals(opened[0].type, "moved");
});

Deno.test("gathering works on lava after the barrier opens", () => {
  const entry = findLavaEntry(SEED);
  const state = newGame(SEED);
  state.player = entry.lava;
  state.inventory["Lavawalker's Incantation"] = 1;

  const events = apply(state, { type: "gather" });

  assertEquals(events[0].type, "gathered");
  assertEquals(
    state.inventory[TERRAIN_RULES.lava.yields],
    1,
  );
});
