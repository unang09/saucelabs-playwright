# Swag Labs — E2E Test Automation

End-to-end UI test automation for [Swag Labs](https://www.saucedemo.com/), built with **Playwright** and **TypeScript** using the **Page Object Model**.

Swag Labs is a demo e-commerce storefront published by Sauce Labs. It is deliberately seeded with broken users — accounts that drop clicks, throw uncaught exceptions, randomise prices or freeze the main thread — which makes it a good target for proving a suite can *detect* defects rather than only walk the happy path.

## Stack

| | |
|---|---|
| Runner | [`@playwright/test`](https://playwright.dev/) 1.62 |
| Language | TypeScript |
| Node | 22.x |
| Browsers | Chromium, Firefox, WebKit |
| Pattern | Page Object Model |

## Getting started

```bash
npm install              # install dependencies
npx playwright install   # download browser binaries
```

No environment variables or local server are required — the suite runs against the public site.

## Running tests

```bash
npx playwright test                        # full suite, all three browsers
npx playwright test --project=chromium     # one browser
npx playwright test --ui                   # interactive UI mode
npx playwright test --headed --debug       # step through with the inspector
npx playwright test -g "TC-LOGIN-01"       # a single case by ID
```

## Reports and traces

An HTML report is written after every run:

```bash
npx playwright show-report
```

Traces are captured on first retry. Open one for a step-by-step timeline with DOM snapshots:

```bash
npx playwright show-trace test-results/<path-to-trace>.zip
```

## Project structure

```
.
├── playwright.config.ts    # runner, browser projects, reporters
└── tests/                  # specs and page objects
```

`tests/` is the target layout as the suite is built out — page objects and fixtures separated from the specs that use them, so a selector change touches exactly one file.

## Application under test

Six accounts share the password `secret_sauce`:

| Username | Behaviour |
|---|---|
| `standard_user` | Baseline — everything works |
| `locked_out_user` | Login is blocked |
| `problem_user` | Broken images, add/remove, sorting and checkout |
| `performance_glitch_user` | ~5 s blocking delay rendering the inventory |
| `error_user` | Throws JS errors on add/remove/sort/checkout |
| `visual_user` | Layout defects and randomised prices |

The store is a React SPA with no backend API — session and cart state live entirely in cookies and `localStorage`.

### Testing against a defective app

Many of the behaviours above are permanent: the demo site will not be fixed. Tests covering them assert the *broken* behaviour, or are marked `test.fail()`, so that the suite reports a failure if the application ever changes. Expectations are never quietly relaxed to match a bug.
