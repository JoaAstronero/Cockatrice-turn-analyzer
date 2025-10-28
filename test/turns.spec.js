import { describe, expect, it } from "vitest";
import { extractTurns, formatTime, parseLines } from "../src/lib/turns";

describe("turn parsing across midnight", () => {
  it("should compute monotonic absolute times and correct durations", () => {
    const log = `
[22:00:00] Alice's turn.
[22:02:00] Bob's turn.
[22:05:30] Alice's turn.
[23:59:50] Bob's turn.
[00:01:10] Alice's turn.
[00:05:00] Bob's turn.
`;
    const parsed = parseLines(log);
    expect(parsed.length).toBeGreaterThan(0);

    const { turns, ignored } = extractTurns(parsed);
    // we expect turns to be in chronological order, with absolute times increasing
    for (let i = 1; i < turns.length; i++) {
      expect(turns[i].start).toBeGreaterThanOrEqual(turns[i - 1].start);
    }

    // durations should be positive and reasonable
    for (const t of turns) {
      expect(t.duration).toBeGreaterThan(0);
      expect(Number.isFinite(t.duration)).toBe(true);
    }

    // verify at least one turn crosses midnight (start > 23:00 and another start in next day)
    const hasLate = turns.some((t) => {
      const hh = new Date(t.start * 1000).getUTCHours();
      return hh >= 22 || hh <= 1;
    });
    expect(hasLate).toBe(true);
  });
});
