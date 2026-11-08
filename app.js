/* DOM wiring for the affordability checker. All logic lives in afford.js. */
(function () {
  "use strict";

  var form = document.getElementById("afford-form");
  var ruleToggle = document.getElementById("rule-toggle");
  var multiplierRow = document.getElementById("multiplier-row");
  var result = document.getElementById("result");
  var errorBox = document.getElementById("error");
  var headline = document.getElementById("verdict-headline");
  var reasonsList = document.getElementById("verdict-reasons");
  var numbers = document.getElementById("verdict-numbers");

  ruleToggle.addEventListener("change", function () {
    multiplierRow.hidden = !ruleToggle.checked;
  });

  function money(value, currency) {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: currency, maximumFractionDigits: 2 }).format(value);
    } catch (e) {
      return String(Math.round(value * 100) / 100) + " " + currency;
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    errorBox.hidden = true;

    var currency = document.getElementById("currency").value;
    var outcome = Afford.evaluate({
      price: document.getElementById("price").value,
      available: document.getElementById("available").value,
      protectedFunds: document.getElementById("protected").value,
      rule: ruleToggle.checked ? "multiplier" : "none",
      multiplier: document.getElementById("multiplier").value,
      purpose: document.getElementById("purpose").value
    });

    if (!outcome.ok) {
      result.hidden = true;
      errorBox.textContent = outcome.error;
      errorBox.hidden = false;
      return;
    }

    headline.textContent = outcome.headline;
    result.className = "result " + outcome.verdict;

    reasonsList.innerHTML = "";
    outcome.reasons.forEach(function (reason) {
      var li = document.createElement("li");
      li.textContent = reason;
      reasonsList.appendChild(li);
    });

    var price = Number(document.getElementById("price").value);
    var lines = [];
    if (outcome.shortfall > 0) {
      lines.push("Price " + money(price, currency) + " - free money " + money(outcome.spendable, currency) + " = short by " + money(outcome.shortfall, currency) + ".");
    } else {
      lines.push("Price " + money(price, currency) + " - free money " + money(outcome.spendable, currency) + " leaves " + money(outcome.spendable - price, currency) + " afterwards.");
    }
    numbers.textContent = lines.join(" ");
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
})();
