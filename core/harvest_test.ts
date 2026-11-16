import { assertEquals } from "@std/assert";
import { apply, cellNow, newGame, terrainAt, terrainYield } from "./mod.ts";
import { SEED } from "./test_helpers.ts";

Deno.test("gathering adds the current cell's item to the inventory", () => {
  const state = newGame(SEED);
  const item = cellNow(state, state.player);

  const events = apply(state, { type: "gather" });

  assertEquals(item, terrainYield(terrainAt(SEED, 0, 0)));
  assertEquals(state.inventory, { [item!]: 1 });
  assertEquals(events, [{ type: "gathered", at: { x: 0, y: 0 }, item: item! }]);
});

Deno.test("gathering twice from one cell only adds the item once", () => {
  const state = newGame(SEED);
  apply(state, { type: "gather" });
  const snapshot = JSON.parse(JSON.stringify(state));

  const events = apply(state, { type: "gather" });

  assertEquals(state, snapshot);
  assertEquals(events, [{
    type: "gather failed",
    at: { x: 0, y: 0 },
    terrain: terrainAt(SEED, 0, 0),
  }]);
});

Deno.test("saved state holds only the cells that changed", () => {
  const state = newGame(SEED);
  apply(state, { type: "gather" });
  assertEquals(Object.keys(state.changed), ["0,0"]);
});
