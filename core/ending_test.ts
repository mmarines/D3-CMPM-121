import { assertEquals } from "@std/assert";
import { apply, CAPSTONE, newGame, RECIPES } from "./mod.ts";
import { SEED } from "./test_helpers.ts";

Deno.test("after the ending, no command changes anything", () => {
  const state = newGame(SEED);
  state.ended = true;
  const snapshot = JSON.parse(JSON.stringify(state));

  for (
    const command of [
      { type: "move", direction: "east" },
      { type: "gather" },
      { type: "craft", output: RECIPES[0].output },
    ] as const
  ) {
    assertEquals(apply(state, command), []);
  }
  assertEquals(state, snapshot);
});

Deno.test("crafting the capstone ends the game", () => {
  const capstone = RECIPES.find((row) => row.output === CAPSTONE)!;
  const state = newGame(SEED);
  state.inventory = { ...capstone.inputs };

  const events = apply(state, { type: "craft", output: CAPSTONE });

  assertEquals(state.ended, true);
  assertEquals(events.map((event) => event.type), ["crafted", "ended"]);
});
