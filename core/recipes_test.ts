import { assertEquals } from "@std/assert";
import { apply, canCraft, newGame, RECIPES } from "./mod.ts";
import { SEED } from "./test_helpers.ts";

Deno.test("crafting with enough inputs spends them and adds the output", () => {
  const recipe = RECIPES[0];
  const state = newGame(SEED);
  state.inventory = {
    ...Object.fromEntries(
      Object.entries(recipe.inputs).map(([item, count]) => [item, count * 2]),
    ),
  };

  const first = apply(state, { type: "craft", output: recipe.output });
  const kept = JSON.parse(JSON.stringify(first));
  const second = apply(state, { type: "craft", output: recipe.output });

  assertEquals(state.inventory, { [recipe.output]: 2 });
  assertEquals(first, kept);
  assertEquals(first, [{
    type: "crafted",
    output: recipe.output,
    inventory: {
      ...Object.fromEntries(
        Object.entries(recipe.inputs).map(([item, count]) => [item, count]),
      ),
      [recipe.output]: 1,
    },
  }]);
  assertEquals(second, [{
    type: "crafted",
    output: recipe.output,
    inventory: { [recipe.output]: 2 },
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

Deno.test("recipes do not require their own output", () => {
  for (const recipe of RECIPES) {
    assertEquals(
      Object.hasOwn(recipe.inputs, recipe.output),
      false,
      `${recipe.output} requires itself`,
    );
  }
});

Deno.test("the core says when a recipe can be crafted", () => {
  const recipe = RECIPES[0];
  const state = newGame(SEED);

  assertEquals(canCraft(state, recipe), false);

  state.inventory = { ...recipe.inputs };
  assertEquals(canCraft(state, recipe), true);
});
