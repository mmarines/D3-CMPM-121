export type Recipe = { output: string; inputs: Record<string, number> };

export const RECIPES: Recipe[] = [
  { output: "Lavawalker's Incantation", inputs: { charcoal: 4, papyrus: 3 } },
  { output: "Glider's Plume", inputs: { "phoenix feather": 6, papyrus: 5 } },
  {
    output: "Ashen Quill",
    inputs: {
      "wind's breath": 5,
      "phoenix feather": 5,
    },
  },
  {
    output: "The Last Chronicle",
    inputs: {
      "Ashen Quill": 1,
      "Glider's Plume": 1,
      "Lavawalker's Incantation": 1,
    },
  },
];

export const CAPSTONE = "The Last Chronicle";
