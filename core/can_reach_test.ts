import { assertEquals } from "@std/assert";
import { canReach, CAPSTONE, RECIPES } from "./mod.ts";

Deno.test("the real recipe table is fully reachable", () => {
  assertEquals(canReach(RECIPES), []);
});

Deno.test("the fixpoint rejects a recipe with unavailable inputs", () => {
  const broken = [{
    output: "Broken",
    inputs: { "missing item": 1 },
  }];

  assertEquals(canReach(broken), broken);
});

Deno.test("the fixpoint checks an ingredient count, not only its name", () => {
  const needsMany = [{
    output: "Many Items",
    inputs: { charcoal: 2 },
  }];
  assertEquals(canReach(needsMany), []);

  const needsMissing = [{
    output: "Missing Items",
    inputs: { "missing item": 2 },
  }];
  assertEquals(canReach(needsMissing), needsMissing);
});

Deno.test("the fixpoint rejects a recipe that requires its own output", () => {
  const broken = [{
    output: "Broken",
    inputs: { Broken: 1 },
  }];

  assertEquals(canReach(broken), broken);
});

Deno.test("the capstone can be reached", () => {
  const unreachable = canReach(RECIPES).map((row) => row.output);
  assertEquals(unreachable.includes(CAPSTONE), false);
});
