import { assertEquals } from "@std/assert";
import { apply, newGame, RECIPES, TERRAIN_YIELDS } from "./mod.ts";
import { SEED } from "./test_helpers.ts";

Deno.test("crafting with enough inputs spends them and adds the output", () => {
  const recipe = RECIPES[0];
  const state = newGame(SEED);
  state.inventory = { ...recipe.inputs };

  const events = apply(state, { type: "craft", output: recipe.output });

  assertEquals(state.inventory, { [recipe.output]: 1 });
  assertEquals(events, [{
    type: "crafted",
    output: recipe.output,
    inventory: { [recipe.output]: 1 },
  }]);
});

Deno.test("a failed craft changes nothing and says what is missing", () => {
  const recipe = RECIPES[0];
  const state = newGame(SEED);
  const snapshot = JSON.parse(JSON.stringify(state));

  const events = apply(state, { type: "craft", output: recipe.output });

  assertEquals(state, snapshot);
  assertEquals(events, [{
    type: "craft failed",
    output: recipe.output,
    missing: recipe.inputs,
  }]);
});

// A content test: it checks the data, not the code.
Deno.test("every recipe input can be gathered or made", () => {
  const sources = new Set([
    ...Object.values(TERRAIN_YIELDS),
    ...RECIPES.map((row) => row.output),
  ]);
  for (const recipe of RECIPES) {
    for (const input of Object.keys(recipe.inputs)) {
      assertEquals(sources.has(input), true, `nothing provides ${input}`);
    }
  }
});

Deno.test("recipes do not require their own output", () => {
  for (const recipe of RECIPES) {
    assertEquals(
      Object.hasOwn(recipe.inputs, recipe.output),
      false,
      `${recipe.output} requires itself`,
    );
  }
});
