import type { Recipe } from "./recipes.ts";
import { isPassable, type Terrain, TERRAIN_RULES } from "./terrain.ts";

// Repeatedly adds every available material until the set stops growing.
// A plain function parameter lets tests provide broken recipe tables.
export function canReach(recipes: readonly Recipe[]): Recipe[] {
  const reached = new Set<string>();
  const made = new Set<Recipe>();

  let changed = true;
  while (changed) {
    changed = false;

    const inventory = Object.fromEntries(
      [...reached].map((item) => [item, 1]),
    );

    for (const [terrain, rule] of Object.entries(TERRAIN_RULES)) {
      if (
        isPassable(terrain as Terrain, inventory) && !reached.has(rule.yields)
      ) {
        reached.add(rule.yields);
        changed = true;
      }
    }

    for (const recipe of recipes) {
      if (made.has(recipe)) continue;
      if (Object.keys(recipe.inputs).every((item) => reached.has(item))) {
        made.add(recipe);
        reached.add(recipe.output);
        changed = true;
      }
    }
  }

  return recipes.filter((recipe) => !made.has(recipe));
}
