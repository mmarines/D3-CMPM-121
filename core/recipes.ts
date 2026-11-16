export type Recipe = { output: string; inputs: Record<string, number> };

export const RECIPES: Recipe[] = [
  { output: "Book of Tides", inputs: { charcoal: 2, papyrus: 1 } },
  { output: "Raft", inputs: { "Book of Tides": 1, papyrus: 2 } },
];
