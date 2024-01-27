import { it, describe, mock } from "node:test";
import { Intervable, Interval, WeekDay } from "../../src/domain/interval.js";
import assert from "node:assert";

const fakeGenerateIntervals = mock.fn(
  (from: Date, to: Date, skippedDays?: WeekDay[] | undefined) => {
    return [];
  }
);

class FakeInterval implements Intervable {
  generateIntervals(
    from: Date,
    to: Date,
    skippedDays?: WeekDay[] | undefined
  ): Date[] {
    return fakeGenerateIntervals(from, to, skippedDays);
  }
}

describe("Interval", () => {
  const interval = new FakeInterval();
  it("should be tested", () => {
    assert.equal(
      interval.generateIntervals(new Date(), new Date()).length,
      0,
      "should return empty array"
    );

    fakeGenerateIntervals.mock.resetCalls();
  });

  it("Should return proper range of dates", () => {
    const standardInterval = new Interval();

    // This date is a wednesday
    const from = new Date("2024-01-24");

    // This date is a wednesday too (1 week after)
    const to = new Date("2024-01-31");

    const result = standardInterval.generateIntervals(from, to);

    // It should return 8 dates (1 per day)
    assert.equal(result.length, 8, "Should return 8 dates");

    // All dates should be right from the first to the last
    // expected are 24, 25, 26, 27, 28, 29, 30, 31
    assert.equal(result[0].getDate(), 24, "Should return 24");
    assert.equal(result[1].getDate(), 25, "Should return 25");
    assert.equal(result[2].getDate(), 26, "Should return 26");
    assert.equal(result[3].getDate(), 27, "Should return 27");
    assert.equal(result[4].getDate(), 28, "Should return 28");
    assert.equal(result[5].getDate(), 29, "Should return 29");
    assert.equal(result[6].getDate(), 30, "Should return 30");
    assert.equal(result[7].getDate(), 31, "Should return 31");
  });

  it("Should call generateIntervals", () => {
    const from = new Date("2024-01-24");
    const to = new Date("2024-01-31");
    interval.generateIntervals(from, to);

    assert.equal(fakeGenerateIntervals.mock.calls.length, 1);
    assert.equal(fakeGenerateIntervals.mock.calls[0].arguments.length, 3);

    fakeGenerateIntervals.mock.resetCalls;
  });
});
