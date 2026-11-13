import { assertEquals } from "@std/assert";
import { apply, cellNow, newGame, terrainAt, terrainYield } from "./mod.ts";
import { SEED, standingOn } from "./test_helpers.ts";

Deno.test("gathering adds the current cell's item to the inventory", () => {
  const state = newGame(SEED);
  const item = cellNow(state, state.player);

  const events = apply(state, { type: "gather" });

  assertEquals(item, terrainYield(terrainAt(SEED, 0, 0)));
  assertEquals(state.inventory, { [item!]: 1 });
  assertEquals(state.changed, { "0,0": item! });
  assertEquals(events, [{ type: "gathered", at: { x: 0, y: 0 }, item: item! }]);
});

Deno.test("gathering a cell that is already changed fails without changing state", () => {
  const state = standingOn("oasis");
  const at = { ...state.player };

  state.changed[`${at.x},${at.y}`] = "papyrus";
  const snapshot = JSON.parse(JSON.stringify(state));

  const events = apply(state, { type: "gather" });

  assertEquals(state, snapshot);
  assertEquals(events, [{
    type: "gather failed",
    at,
    terrain: terrainAt(SEED, at.x, at.y),
  }]);
});

Deno.test("gather moves nothing and reports why when the cell is already changed", () => {
  const state = standingOn("oasis");
  const at = { ...state.player };

  state.changed[`${at.x},${at.y}`] = "papyrus";
  const snapshot = JSON.parse(JSON.stringify(state));

  const events = apply(state, { type: "gather" });

  assertEquals(state, snapshot);
  assertEquals(events, [{
    type: "gather failed",
    at,
    terrain: terrainAt(SEED, at.x, at.y),
  }]);
});
