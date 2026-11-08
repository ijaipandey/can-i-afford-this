# Can I Afford This?

A small, privacy-first web tool that answers one question honestly: **can I afford this right now?**

Most people know their bank balance but not how much of it is genuinely safe to spend. This tool separates the money that is free to use from the money that must stay protected, then gives a plain buy-or-wait verdict with the reasoning shown.

**Live demo:** https://ijaipandey.github.io/can-i-afford-this/

## How it works

You enter:

- **Item price** - what the thing costs
- **Money free to spend** - what is left after bills and savings are set aside
- **Protected funds** - money the tool will never count as spendable (bills, savings, emergency)
- **Purpose** - a real need, a want, or just curiosity
- **Optional multiplier rule** - e.g. the "10x rule": only buy if your free money is at least 10 times the price. The multiplier is yours to set; it is a personal discipline setting, not universal financial advice

You get one of four verdicts:

- **Yes - comfortably affordable**
- **Tight** - possible, but it leaves you thin (a need can still be worth it)
- **Your rule says wait** - a want or curiosity that fails your own rule
- **Not yet - you are short** - with the exact shortfall

## Privacy

No accounts, no bank connections, no analytics, no server. All calculation happens in your browser with vanilla JavaScript; the numbers you type never leave the page. Try it with fictional numbers - that is all the demo needs.

## Run it locally

It is a static site. Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Run the tests

The affordability logic lives in `afford.js` as pure functions, tested with Node's built-in test runner (no dependencies):

```bash
node --test
```

## Project layout

| File | Purpose |
| --- | --- |
| `afford.js` | Pure affordability logic, shared by the page and the tests |
| `app.js` | DOM wiring for the page |
| `index.html` / `styles.css` | The page |
| `test/afford.test.js` | Tests for the verdict logic |

## License

MIT - see [LICENSE](LICENSE).
