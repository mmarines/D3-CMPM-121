import type { Recipe } from "./recipes.ts";
import { isPassable, type Terrain, TERRAIN_RULES } from "./terrain.ts";

// Repeatedly adds every available material until the set stops growing.
// A plain function parameter lets tests provide broken recipe tables.
export function canReach(recipes: readonly Recipe[]): Recipe[] {
  const available = new Map<string, number>();

  let changed = true;
  while (changed) {
    changed = false;

    const inventory = Object.fromEntries(available);

    for (const [terrain, rule] of Object.entries(TERRAIN_RULES)) {
      if (isPassable(terrain as Terrain, inventory)) {
        if (!available.has(rule.yields)) {
          // Gatherable terrain yields can be collected repeatedly.
          available.set(rule.yields, Number.POSITIVE_INFINITY);
          changed = true;
        }
      }
    }

    for (const recipe of recipes) {
      if (available.has(recipe.output)) continue;
      if (
        Object.entries(recipe.inputs).every(([item, count]) =>
          (available.get(item) ?? 0) >= count
        )
      ) {
        // Craftable outputs can also be made again if their ingredients
        // remain gatherable or craftable.
        available.set(recipe.output, Number.POSITIVE_INFINITY);
        changed = true;
      }
    }
  }

  return recipes.filter((recipe) => !available.has(recipe.output));
}
