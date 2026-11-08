/* Core affordability logic. Pure functions, no DOM. Shared by the page and the tests. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Afford = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function toNumber(v) {
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() !== "") return Number(v);
    return NaN;
  }

  /**
   * Evaluate whether an item is affordable.
   * @param {object} input
   *   price        item price (required, > 0)
   *   available    general-purpose money free to spend (required, >= 0)
   *   protectedFunds  money that must stay untouched (optional, >= 0)
   *   rule         "none" | "multiplier"
   *   multiplier   for rule "multiplier": free money must be >= price * multiplier
   *   purpose      "need" | "want" | "curiosity"
   * @returns {object} { ok, verdict, headline, reasons[], spendable, shortfall }
   * verdict: "yes" | "tight" | "reconsider" | "not-now"
   */
  function evaluate(input) {
    input = input || {};
    var price = toNumber(input.price);
    var available = toNumber(input.available);
    var protectedFunds = input.protectedFunds === undefined || input.protectedFunds === ""
      ? 0 : toNumber(input.protectedFunds);
    var rule = input.rule === "multiplier" ? "multiplier" : "none";
    var multiplier = toNumber(input.multiplier);
    if (!isFinite(multiplier) || multiplier < 1) multiplier = 10;
    var purpose = ["need", "want", "curiosity"].indexOf(input.purpose) >= 0 ? input.purpose : "want";

    if (!isFinite(price) || price <= 0)
      return { ok: false, error: "Enter an item price greater than zero." };
    if (!isFinite(available) || available < 0)
      return { ok: false, error: "Enter the money you have free to spend (0 or more)." };
    if (!isFinite(protectedFunds) || protectedFunds < 0)
      return { ok: false, error: "Protected funds must be 0 or more." };

    var spendable = available; // protected funds are never counted as spendable
    var shortfall = price - spendable;
    var reasons = [];

    if (shortfall > 0) {
      reasons.push("The item costs more than the money you have free to spend.");
      if (protectedFunds > 0)
        reasons.push("Protected funds are kept out of this check on purpose, so they are not a fallback.");
      reasons.push(purpose === "need"
        ? "It is marked as a need: the honest options are to save the shortfall first or find a cheaper alternative."
        : "Since it is not a need, the clean answer is to wait until the money is there.");
      return { ok: true, verdict: "not-now", headline: "Not yet - you are short", reasons: reasons, spendable: spendable, shortfall: shortfall };
    }

    var leftover = spendable - price;
    reasons.push("After buying, you would still have free money left over.");

    if (rule === "multiplier") {
      var required = price * multiplier;
      if (spendable >= required) {
        reasons.push("It passes your " + multiplier + "x rule: your free money is at least " + multiplier + " times the price.");
        return { ok: true, verdict: "yes", headline: "Yes - comfortably affordable", reasons: reasons, spendable: spendable, shortfall: 0 };
      }
      reasons.push("It fails your " + multiplier + "x rule: that rule wants free money of at least " + fmt(required) + " for this price.");
      if (purpose === "need") {
        reasons.push("It is a real need, so buying is defensible, but the rule says your cushion is thinner than you like.");
        return { ok: true, verdict: "tight", headline: "Okay, but tight for a need", reasons: reasons, spendable: spendable, shortfall: 0 };
      }
      reasons.push(purpose === "curiosity"
        ? "Marked as curiosity - your own rule says postpone it."
        : "It is a want, not a need - your own rule says postpone it.");
      return { ok: true, verdict: "reconsider", headline: "Your rule says wait", reasons: reasons, spendable: spendable, shortfall: 0 };
    }

    var ratio = price / spendable;
    if (ratio <= 0.25) {
      reasons.push("It uses a small share of your free money (25% or less).");
      return { ok: true, verdict: "yes", headline: "Yes - comfortably affordable", reasons: reasons, spendable: spendable, shortfall: 0 };
    }
    if (ratio <= 0.6) {
      reasons.push("It uses a noticeable share of your free money (between 25% and 60%).");
      reasons.push(purpose === "need" ? "As a need, that is usually acceptable." : "For a " + purpose + ", it is your call - just go in with open eyes.");
      return { ok: true, verdict: purpose === "need" ? "yes" : "tight", headline: purpose === "need" ? "Yes - acceptable for a need" : "Affordable, but not trivial", reasons: reasons, spendable: spendable, shortfall: 0 };
    }
    reasons.push("It would use more than 60% of your free money.");
    reasons.push(purpose === "need"
      ? "It is a need, so it may still be right, but it leaves you thin."
      : "For something that is not a need, spending most of your free money at once usually deserves a pause.");
    return { ok: true, verdict: purpose === "need" ? "tight" : "reconsider", headline: purpose === "need" ? "Possible, but heavy" : "Worth pausing on", reasons: reasons, spendable: spendable, shortfall: 0 };
  }

  function fmt(n) {
    return String(Math.round(n * 100) / 100);
  }

  return { evaluate: evaluate };
});
