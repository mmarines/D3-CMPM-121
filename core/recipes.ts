export type Recipe = { output: string; inputs: Record<string, number> };

export const RECIPES: Recipe[] = [
  { output: "Lavawalker's Incantation", inputs: { charcoal: 2, papyrus: 1 } },
  { output: "Glider's Plume", inputs: { "phoenix feather": 4, papyrus: 3 } },
  {
    output: "Ashen Quill",
    inputs: { "wind's breath": 3, "phoenix feather": 2 },
  },
];
