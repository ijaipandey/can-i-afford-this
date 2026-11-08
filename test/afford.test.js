const test = require("node:test");
const assert = require("node:assert/strict");
const Afford = require("../afford.js");

test("rejects invalid price", () => {
  assert.equal(Afford.evaluate({ price: 0, available: 100 }).ok, false);
  assert.equal(Afford.evaluate({ price: -5, available: 100 }).ok, false);
  assert.equal(Afford.evaluate({ price: "abc", available: 100 }).ok, false);
  assert.equal(Afford.evaluate({ price: "", available: 100 }).ok, false);
});

test("rejects invalid available amount", () => {
  assert.equal(Afford.evaluate({ price: 10, available: -1 }).ok, false);
  assert.equal(Afford.evaluate({ price: 10, available: "xyz" }).ok, false);
});

test("not-now when price exceeds free money, with correct shortfall", () => {
  const r = Afford.evaluate({ price: 500, available: 300 });
  assert.equal(r.ok, true);
  assert.equal(r.verdict, "not-now");
  assert.equal(r.shortfall, 200);
});

test("protected funds are never counted as spendable", () => {
  const r = Afford.evaluate({ price: 500, available: 300, protectedFunds: 100000 });
  assert.equal(r.verdict, "not-now");
  assert.equal(r.spendable, 300);
});

test("protected funds validation", () => {
  assert.equal(Afford.evaluate({ price: 10, available: 100, protectedFunds: -5 }).ok, false);
  assert.equal(Afford.evaluate({ price: 10, available: 100, protectedFunds: "" }).ok, true);
});

test("comfortable yes on a small share of free money (no rule)", () => {
  const r = Afford.evaluate({ price: 100, available: 1000 });
  assert.equal(r.verdict, "yes");
  assert.equal(r.shortfall, 0);
});

test("10x rule: passes when free money >= price * multiplier", () => {
  const r = Afford.evaluate({ price: 100, available: 1000, rule: "multiplier", multiplier: 10 });
  assert.equal(r.verdict, "yes");
});

test("10x rule: a want that fails the rule says wait", () => {
  const r = Afford.evaluate({ price: 100, available: 500, rule: "multiplier", multiplier: 10, purpose: "want" });
  assert.equal(r.verdict, "reconsider");
});

test("10x rule: a curiosity that fails the rule says wait", () => {
  const r = Afford.evaluate({ price: 100, available: 500, rule: "multiplier", multiplier: 10, purpose: "curiosity" });
  assert.equal(r.verdict, "reconsider");
});

test("10x rule: a need that fails the rule is tight, not blocked", () => {
  const r = Afford.evaluate({ price: 100, available: 500, rule: "multiplier", multiplier: 10, purpose: "need" });
  assert.equal(r.verdict, "tight");
});

test("custom multiplier is honored; invalid multiplier falls back to 10", () => {
  const r = Afford.evaluate({ price: 100, available: 300, rule: "multiplier", multiplier: 3 });
  assert.equal(r.verdict, "yes");
  const r2 = Afford.evaluate({ price: 100, available: 500, rule: "multiplier", multiplier: 0 });
  assert.equal(r2.verdict, "reconsider");
});

test("no-rule: mid share for a want is tight, for a need is yes", () => {
  const want = Afford.evaluate({ price: 400, available: 1000, purpose: "want" });
  assert.equal(want.verdict, "tight");
  const need = Afford.evaluate({ price: 400, available: 1000, purpose: "need" });
  assert.equal(need.verdict, "yes");
});

test("no-rule: heavy spend for a non-need says pause", () => {
  const r = Afford.evaluate({ price: 800, available: 1000, purpose: "curiosity" });
  assert.equal(r.verdict, "reconsider");
});

test("exactly affordable (price == available) is allowed, not short", () => {
  const r = Afford.evaluate({ price: 500, available: 500 });
  assert.notEqual(r.verdict, "not-now");
  assert.equal(r.shortfall, 0);
});

test("string inputs are accepted", () => {
  const r = Afford.evaluate({ price: "250", available: "1000" });
  assert.equal(r.ok, true);
  assert.equal(r.verdict, "yes");
});
