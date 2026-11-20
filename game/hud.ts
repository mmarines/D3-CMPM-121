import {
  type GameEvent,
  type GameState,
  TERRAIN_RULES,
  terrainAt,
} from "../core/mod.ts";

function element(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function describe(event: GameEvent): string {
  switch (event.type) {
    case "moved":
      return `moved to ${event.to.x}, ${event.to.y}`;
    case "blocked": {
      const opener = TERRAIN_RULES[event.terrain].opensWith;
      return opener
        ? `blocked by ${event.terrain}; requires ${opener}`
        : `blocked by ${event.terrain} at ${event.toward.x}, ${event.toward.y}`;
    }
    case "gathered":
      return `gathered ${event.item} at ${event.at.x}, ${event.at.y}`;
    case "gather failed":
      return `gather failed at ${event.at.x}, ${event.at.y}`;
    case "crafted":
      return `crafted ${event.output}`;
    case "craft failed":
      return `craft failed: missing ${
        Object.entries(event.missing).map(([item, count]) => `${count} ${item}`)
          .join(", ")
      }`;
  }
}

// The readout, as ordinary page elements that CSS can style and that assistive
// tools can read. It changes only as events play.
export class Hud {
  private readonly seed: number;

  constructor(state: GameState) {
    this.seed = state.seed;
    this.showPosition(state.player.x, state.player.y);
  }

  show(event: GameEvent) {
    element("live").textContent = describe(event);
    if (event.type === "moved") this.showPosition(event.to.x, event.to.y);
    if (event.type === "gathered") {
      this.showPosition(event.at.x, event.at.y);
      this.showInventory(event.inventory);
    }
    if (event.type === "crafted") this.showInventory(event.inventory);
  }

  private showPosition(x: number, y: number) {
    element("position").textContent = `${x}, ${y}`;
    element("terrain").textContent = terrainAt(this.seed, x, y);
  }

  private showInventory(inventory: Record<string, number>) {
    element("inventory").replaceChildren(
      ...Object.entries(inventory).map(([item, count]) => {
        const li = document.createElement("li");
        li.textContent = `${item}: ${count}`;
        return li;
      }),
    );
  }
}
