import { assertEquals } from "@std/assert";
import { apply, type Command, type GameEvent, newGame } from "./mod.ts";
import run from "./run.json" with { type: "json" };

const commands = run.commands as Command[];

function replay() {
  const state = newGame(run.seed);
  const events: GameEvent[] = [];
  for (const command of commands) events.push(...apply(state, command));
  return { state, events };
}

Deno.test("the recorded run finishes the game", () => {
  assertEquals(replay().state.ended, true);
});

Deno.test("replaying the run twice gives identical state and events", () => {
  const first = replay();
  const start = Date.now();
  while (Date.now() === start);
  const second = replay();
  assertEquals(second, first);
});
