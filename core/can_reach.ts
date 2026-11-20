import type { Recipe } from "./recipes.ts";
import { isPassable, type Terrain, TERRAIN_RULES } from "./terrain.ts";

// Repeatedly adds every available material until the set stops growing.
// A plain function parameter lets tests provide broken recipe tables.
export function canReach(recipes: readonly Recipe[]): Recipe[] {
  const available = new Set<string>();

  let changed = true;
  while (changed) {
    changed = false;

    const inventory = Object.fromEntries(
      [...available].map((item) => [item, 1]),
    );

    for (const [terrain, rule] of Object.entries(TERRAIN_RULES)) {
      if (isPassable(terrain as Terrain, inventory)) {
        if (!available.has(rule.yields)) {
          available.add(rule.yields);
          changed = true;
        }
      }
    }

    for (const recipe of recipes) {
      if (available.has(recipe.output)) continue;
      if (
        Object.entries(recipe.inputs).every(([item, count]) =>
          available.has(item) && count > 0
        )
      ) {
        available.add(recipe.output);
        changed = true;
      }
    }
  }

  return recipes.filter((recipe) => !available.has(recipe.output));
}
