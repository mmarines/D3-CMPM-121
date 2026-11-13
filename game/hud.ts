import { type GameEvent, type GameState, terrainAt } from "../core/mod.ts";

function element(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function describe(event: GameEvent): string {
  switch (event.type) {
    case "moved":
      return `moved to ${event.to.x}, ${event.to.y}`;
    case "blocked":
      return `blocked by ${event.terrain} at ${event.toward.x}, ${event.toward.y}`;
    case "gathered":
      return `gathered ${event.item} at ${event.at.x}, ${event.at.y}`;
    case "gather failed":
      return `gather failed at ${event.at.x}, ${event.at.y}`;
  }
}

// The readout, as ordinary page elements that CSS can style and that assistive
// tools can read. It changes only as events play.
export class Hud {
  private readonly seed: number;
  private changed: Record<string, string> = {};

  constructor(state: GameState) {
    this.seed = state.seed;
    this.showPosition(state.player.x, state.player.y);
  }

  show(event: GameEvent) {
    element("live").textContent = describe(event);
    if (event.type === "gathered") {
      this.changed[`${event.at.x},${event.at.y}`] = event.item;
    }
    if (event.type === "moved") this.showPosition(event.to.x, event.to.y);
    if (event.type === "gathered") this.showPosition(event.at.x, event.at.y);
  }

  private showPosition(x: number, y: number) {
    const key = `${x},${y}`;
    element("position").textContent = `${x}, ${y}`;
    element("terrain").textContent = this.changed[key] ??
      terrainAt(this.seed, x, y);
  }
}
