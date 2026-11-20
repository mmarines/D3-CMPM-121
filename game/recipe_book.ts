import {
  type Command,
  type GameState,
  missingFor,
  RECIPES,
} from "../core/mod.ts";

function list(items: Record<string, number>): string {
  return Object.entries(items).map(([item, n]) => `${n} ${item}`).join(" + ");
}

// One button per recipe row
export class RecipeBook {
  private readonly state: GameState;
  private readonly buttons: HTMLButtonElement[] = [];

  constructor(
    element: HTMLElement,
    state: GameState,
    send: (command: Command) => void,
  ) {
    this.state = state;
    for (const recipe of RECIPES) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.addEventListener("click", (event) => {
        send({ type: "craft", output: recipe.output });
        // After a mouse click, give keys back to the game.
        if (event.detail > 0) button.blur();
      });
      item.append(button);
      element.append(item);
      this.buttons.push(button);
    }
  }

  update() {
    RECIPES.forEach((recipe, i) => {
      const missing = missingFor(this.state, recipe);
      const status = Object.keys(missing).length === 0
        ? "ready"
        : `missing ${list(missing)}`;
      this.buttons[i].textContent = `${recipe.output}\n(${
        list(recipe.inputs)
      }):\n ${status}`;
    });
  }
}
