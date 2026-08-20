# Swag Labs (saucedemo.com) — Test Case Suite

**Application:** https://www.saucedemo.com/
**Type:** React SPA (client-side routing, no backend API — state lives in cookies/localStorage)
**Prepared for:** Playwright + Page Object Model automation portfolio

---

## 1. Application Reference

Everything below was verified against the live application, not assumed.

### 1.1 Credentials

| Username                  | Password       | Behaviour                                                        |
| ------------------------- | -------------- | ---------------------------------------------------------------- |
| `standard_user`           | `secret_sauce` | Baseline — everything works                                      |
| `locked_out_user`         | `secret_sauce` | Login blocked                                                    |
| `problem_user`            | `secret_sauce` | Multiple functional defects (images, add/remove, sort, checkout) |
| `performance_glitch_user` | `secret_sauce` | ~5 s blocking delay rendering inventory                          |
| `error_user`              | `secret_sauce` | Throws JS errors on add/remove/sort/checkout                     |
| `visual_user`             | `secret_sauce` | Layout + price rendering defects                                 |

### 1.2 Routes

| Route                           | Page                                        |
| ------------------------------- | ------------------------------------------- |
| `/`                             | Login (note: **not** `/login.html`)         |
| `/inventory.html`               | Products                                    |
| `/inventory-item.html?id=<0-5>` | Product detail                              |
| `/inventory-long.html`          | Long product list (22 items, size variants) |
| `/cart.html`                    | Cart                                        |
| `/checkout-step-one.html`       | Customer information                        |
| `/checkout-step-two.html`       | Order overview                              |
| `/checkout-complete.html`       | Order confirmation                          |

### 1.3 Product catalogue (`/inventory.html`)

| id  | Name                              | Price  | add/remove `data-test` slug         |
| --- | --------------------------------- | ------ | ----------------------------------- |
| 0   | Sauce Labs Bike Light             | $9.99  | `sauce-labs-bike-light`             |
| 1   | Sauce Labs Bolt T-Shirt           | $15.99 | `sauce-labs-bolt-t-shirt`           |
| 2   | Sauce Labs Onesie                 | $7.99  | `sauce-labs-onesie`                 |
| 3   | Test.allTheThings() T-Shirt (Red) | $15.99 | `test.allthethings()-t-shirt-(red)` |
| 4   | Sauce Labs Backpack               | $29.99 | `sauce-labs-backpack`               |
| 5   | Sauce Labs Fleece Jacket          | $49.99 | `sauce-labs-fleece-jacket`          |

> The `id` column matters: `problem_user` and `error_user` behave differently for **odd** vs **even** ids. Keep it in your test data model.

### 1.4 Key selectors

| Area       | Selectors                                                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login      | `[data-test=username]`, `[data-test=password]`, `[data-test=login-button]`, `[data-test=error]`                                                                                                                                             |
| Header     | `#react-burger-menu-btn`, `#react-burger-cross-btn`, `[data-test=shopping-cart-link]`, `[data-test=shopping-cart-badge]`, `[data-test=title]`                                                                                               |
| Menu       | `[data-test=inventory-sidebar-link]`, `[data-test=about-sidebar-link]`, `[data-test=logout-sidebar-link]`, `[data-test=reset-sidebar-link]`                                                                                                 |
| Inventory  | `[data-test=inventory-item]`, `[data-test=inventory-item-name]`, `[data-test=inventory-item-desc]`, `[data-test=inventory-item-price]`, `[data-test=product-sort-container]`, `[data-test=add-to-cart-<slug>]`, `[data-test=remove-<slug>]` |
| Cart       | `[data-test=item-quantity]`, `[data-test=continue-shopping]`, `[data-test=checkout]`                                                                                                                                                        |
| Checkout 1 | `[data-test=firstName]`, `[data-test=lastName]`, `[data-test=postalCode]`, `[data-test=continue]`, `[data-test=cancel]`                                                                                                                     |
| Checkout 2 | `[data-test=payment-info-value]`, `[data-test=shipping-info-value]`, `[data-test=subtotal-label]`, `[data-test=tax-label]`, `[data-test=total-label]`, `[data-test=finish]`                                                                 |
| Complete   | `[data-test=complete-header]`, `[data-test=complete-text]`, `[data-test=back-to-products]`, `[data-test=generate-pdf-order]`                                                                                                                |

### 1.5 Exact message strings

| Context                   | Message                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| Empty username            | `Epic sadface: Username is required`                                                                |
| Empty password            | `Epic sadface: Password is required`                                                                |
| Wrong credentials         | `Epic sadface: Username and password do not match any user in this service`                         |
| Locked out                | `Epic sadface: Sorry, this user has been locked out.`                                               |
| Unauthenticated deep link | `Epic sadface: You can only access '/inventory.html' when you are logged in.`                       |
| Checkout validation       | `Error: First Name is required` / `Error: Last Name is required` / `Error: Postal Code is required` |
| Order confirmation        | `Thank you for your order!`                                                                         |
| Order body text           | `Your order has been dispatched, and will arrive just as fast as the pony can get there!`           |
| `error_user` sort alert   | `Sorting is broken! This error has been reported to Backtrace.`                                     |

### 1.6 Business rules

- Tax rate: **8%** of item total, rounded to 2 dp (`$29.99 → $2.40 → $32.39`).
- Payment: `SauceCard #31337`. Shipping: `Free Pony Express Delivery!`.
- Session is held in cookie `session-username`. Logout deletes it.
- Cart contents survive logout → login (see TC-SES-06).

### 1.7 Legend

| Tag   | Meaning                                                                                                                                                                                              |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P** | Positive — valid input, expected-to-succeed path                                                                                                                                                     |
| **N** | Negative — invalid input / rejected action                                                                                                                                                           |
| **E** | Edge — boundary, state, timing, or unusual-but-legal condition                                                                                                                                       |
| 🐞    | Expected result documents a **real application defect**. Assert the defect (regression-lock), or mark `test.fail()`. Do not "fix" the expectation to what _should_ happen — the app will not change. |

---

## 2. Authentication — Login

| ID          | Title                                            | Type | Pri      | Preconditions                  | Steps                                                                             | Expected Result                                                                                                       |
| ----------- | ------------------------------------------------ | ---- | -------- | ------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| TC-LOGIN-01 | Login with `standard_user`                       | P    | Critical | On `/`                         | 1. Enter `standard_user` / `secret_sauce`<br>2. Click Login                       | Redirects to `/inventory.html`; title reads `Products`; 6 items rendered; cookie `session-username=standard_user` set |
| TC-LOGIN-02 | Login with `problem_user`                        | P    | High     | On `/`                         | 1. Enter `problem_user` / `secret_sauce`<br>2. Click Login                        | Redirects to `/inventory.html` (login itself succeeds)                                                                |
| TC-LOGIN-03 | Login with `performance_glitch_user`             | P    | High     | On `/`                         | 1. Enter `performance_glitch_user` / `secret_sauce`<br>2. Click Login             | Redirects to `/inventory.html` after a noticeable delay                                                               |
| TC-LOGIN-04 | Login with `error_user`                          | P    | Medium   | On `/`                         | 1. Enter `error_user` / `secret_sauce`<br>2. Click Login                          | Redirects to `/inventory.html`                                                                                        |
| TC-LOGIN-05 | Login with `visual_user`                         | P    | Medium   | On `/`                         | 1. Enter `visual_user` / `secret_sauce`<br>2. Click Login                         | Redirects to `/inventory.html`                                                                                        |
| TC-LOGIN-06 | Locked-out user is rejected                      | N    | Critical | On `/`                         | 1. Enter `locked_out_user` / `secret_sauce`<br>2. Click Login                     | Stays on `/`; error `Epic sadface: Sorry, this user has been locked out.`; no session cookie set                      |
| TC-LOGIN-07 | Submit with both fields empty                    | N    | High     | On `/`                         | 1. Leave both blank<br>2. Click Login                                             | Error `Epic sadface: Username is required` (username validated first)                                                 |
| TC-LOGIN-08 | Submit with username only                        | N    | High     | On `/`                         | 1. Enter `standard_user`, leave password blank<br>2. Click Login                  | Error `Epic sadface: Password is required`                                                                            |
| TC-LOGIN-09 | Submit with password only                        | N    | High     | On `/`                         | 1. Leave username blank, enter `secret_sauce`<br>2. Click Login                   | Error `Epic sadface: Username is required`                                                                            |
| TC-LOGIN-10 | Valid username, wrong password                   | N    | High     | On `/`                         | 1. Enter `standard_user` / `wrong_password`<br>2. Click Login                     | Error `Epic sadface: Username and password do not match any user in this service`                                     |
| TC-LOGIN-11 | Unknown username, valid password                 | N    | High     | On `/`                         | 1. Enter `unknown_user` / `secret_sauce`<br>2. Click Login                        | Same generic mismatch error (no user enumeration)                                                                     |
| TC-LOGIN-12 | Both credentials wrong                           | N    | Medium   | On `/`                         | 1. Enter `foo` / `bar`<br>2. Click Login                                          | Generic mismatch error                                                                                                |
| TC-LOGIN-13 | Username is case-sensitive                       | E    | Medium   | On `/`                         | 1. Enter `STANDARD_USER` / `secret_sauce`<br>2. Click Login                       | Rejected with generic mismatch error                                                                                  |
| TC-LOGIN-14 | Password is case-sensitive                       | E    | Medium   | On `/`                         | 1. Enter `standard_user` / `SECRET_SAUCE`<br>2. Click Login                       | Rejected with generic mismatch error                                                                                  |
| TC-LOGIN-15 | Leading/trailing whitespace is not trimmed       | E    | Medium   | On `/`                         | 1. Enter `␣standard_user␣` / `secret_sauce`<br>2. Click Login                     | Rejected with generic mismatch error — input is not trimmed                                                           |
| TC-LOGIN-16 | Whitespace-only input                            | N    | Low      | On `/`                         | 1. Enter `␣␣␣` in both fields<br>2. Click Login                                   | Rejected (mismatch error) — spaces count as non-empty, so the "required" branch is skipped                            |
| TC-LOGIN-17 | Very long username (500 chars)                   | E    | Low      | On `/`                         | 1. Paste 500 `a` chars into username<br>2. Enter valid password<br>3. Click Login | Field accepts all 500 chars (no `maxlength`); login rejected; no crash or layout break                                |
| TC-LOGIN-18 | SQL-injection-style payload                      | N    | Medium   | On `/`                         | 1. Enter `' OR '1'='1` in both fields<br>2. Click Login                           | Rejected with generic mismatch error; no auth bypass                                                                  |
| TC-LOGIN-19 | XSS payload in username                          | N    | Medium   | On `/`                         | 1. Enter `<img src=x onerror=alert(1)>` as username<br>2. Click Login             | No dialog fires; payload rendered as inert text if echoed                                                             |
| TC-LOGIN-20 | Password field masks input                       | P    | High     | On `/`                         | 1. Inspect password input                                                         | `type="password"`; characters are masked                                                                              |
| TC-LOGIN-21 | Submit via Enter key                             | P    | Medium   | On `/`                         | 1. Enter valid credentials<br>2. Press `Enter` in the password field              | Form submits; redirects to `/inventory.html`                                                                          |
| TC-LOGIN-22 | Error message is dismissible                     | P    | Medium   | An error is displayed          | 1. Click the `✕` on the error banner                                              | Error banner is removed; both inputs lose their error styling                                                         |
| TC-LOGIN-23 | Error clears on next valid attempt               | E    | Medium   | An error is displayed          | 1. Enter valid credentials<br>2. Click Login                                      | Login succeeds; error does not persist onto the inventory page                                                        |
| TC-LOGIN-24 | Accepted-credentials list is displayed           | P    | Low      | On `/`                         | 1. Read the credentials panel                                                     | All 6 usernames listed; password panel shows `secret_sauce`                                                           |
| TC-LOGIN-25 | Repeated failed attempts do not lock the account | E    | Low      | On `/`                         | 1. Submit wrong credentials 10 times<br>2. Submit valid credentials               | No rate limiting or lockout; login succeeds on the valid attempt                                                      |
| TC-LOGIN-26 | Browser back after successful login              | E    | Medium   | Logged in on `/inventory.html` | 1. Press browser Back                                                             | Returns to `/`; session cookie still present; app does not crash                                                      |

---

## 3. Session, Routing & Access Control

| ID        | Title                                                  | Type | Pri      | Preconditions                  | Steps                                                                                                  | Expected Result                                                                                        |
| --------- | ------------------------------------------------------ | ---- | -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| TC-SES-01 | Deep link to inventory while logged out                | N    | Critical | Logged out                     | 1. Navigate to `/inventory.html`                                                                       | Redirected to `/`; error `Epic sadface: You can only access '/inventory.html' when you are logged in.` |
| TC-SES-02 | Deep link to cart while logged out                     | N    | High     | Logged out                     | 1. Navigate to `/cart.html`                                                                            | Redirected to `/` with the equivalent access error for `/cart.html`                                    |
| TC-SES-03 | Deep link to each checkout step while logged out       | N    | High     | Logged out                     | 1. Navigate to `/checkout-step-one.html`, `/checkout-step-two.html`, `/checkout-complete.html` in turn | Each redirects to `/` with the corresponding access error                                              |
| TC-SES-04 | Logout clears the session                              | P    | Critical | Logged in                      | 1. Open burger menu<br>2. Click Logout                                                                 | Redirected to `/`; cookie `session-username` deleted                                                   |
| TC-SES-05 | Back button after logout does not restore the session  | N    | Critical | Just logged out                | 1. Press browser Back                                                                                  | Lands on `/` with the access-denied error; inventory is **not** rendered                               |
| TC-SES-06 | Cart survives logout and re-login                      | E    | High     | Logged in as `standard_user`   | 1. Add Backpack<br>2. Logout<br>3. Log in again as `standard_user`                                     | 🐞 Badge still shows `1` — the cart is not cleared on logout                                           |
| TC-SES-07 | Cart is isolated per user                              | E    | Medium   | —                              | 1. Log in as `standard_user`, add an item, logout<br>2. Log in as `problem_user`                       | Verify whether the previous user's cart leaks across accounts; document the observed behaviour         |
| TC-SES-08 | Session survives a page refresh                        | P    | High     | Logged in on `/inventory.html` | 1. Reload the page                                                                                     | Still authenticated; inventory renders; cart badge preserved                                           |
| TC-SES-09 | Manually deleting the session cookie logs the user out | E    | Medium   | Logged in                      | 1. Delete cookie `session-username`<br>2. Navigate to `/inventory.html`                                | Redirected to `/` with the access error                                                                |
| TC-SES-10 | Forged session cookie value                            | N    | Medium   | Logged out                     | 1. Set `session-username=hacker`<br>2. Navigate to `/inventory.html`                                   | Access denied — only the 6 known usernames are accepted                                                |
| TC-SES-11 | Forged cookie for the locked-out user                  | N    | Medium   | Logged out                     | 1. Set `session-username=locked_out_user`<br>2. Navigate to `/inventory.html`                          | Access denied — the locked-out user is excluded from the allowed set                                   |
| TC-SES-12 | Unknown route                                          | E    | Low      | Logged in                      | 1. Navigate to `/does-not-exist.html`                                                                  | App handles the unmatched route gracefully (no blank page or uncaught error)                           |
| TC-SES-13 | Deep link straight to order overview                   | E    | Medium   | Logged in, item in cart        | 1. Navigate directly to `/checkout-step-two.html`                                                      | 🐞 Page renders fully, bypassing step one — customer information is never collected                    |
| TC-SES-14 | Deep link straight to order confirmation               | E    | Medium   | Logged in                      | 1. Navigate directly to `/checkout-complete.html`                                                      | Confirmation renders without any order having been placed — document the behaviour                     |
| TC-SES-15 | Concurrent sessions in two tabs                        | E    | Low      | Logged in, two tabs open       | 1. Log out in tab A<br>2. Interact with tab B                                                          | Tab B's next navigation is rejected; document whether the current view stays stale                     |

---

## 4. Inventory / Products Page

| ID        | Title                                                        | Type | Pri      | Preconditions                | Steps                                                 | Expected Result                                                                      |
| --------- | ------------------------------------------------------------ | ---- | -------- | ---------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| TC-INV-01 | Six products are listed                                      | P    | Critical | Logged in as `standard_user` | 1. Open `/inventory.html`                             | Exactly 6 `inventory-item` elements                                                  |
| TC-INV-02 | Product names match the catalogue                            | P    | Critical | Logged in                    | 1. Read all product names                             | Matches §1.3 exactly, including `Test.allTheThings() T-Shirt (Red)`                  |
| TC-INV-03 | Product prices match the catalogue                           | P    | Critical | Logged in                    | 1. Read all prices                                    | `$29.99, $9.99, $15.99, $49.99, $7.99, $15.99` in default (A→Z) order                |
| TC-INV-04 | Every product has name, description, price, image and button | P    | High     | Logged in                    | 1. Inspect each card                                  | All five elements present and non-empty on all 6 cards                               |
| TC-INV-05 | All product images load successfully                         | P    | High     | Logged in                    | 1. Check each `<img>` `naturalWidth` / network status | All images return 200 and render; none resolve to `sl-404`                           |
| TC-INV-06 | Page title reads "Products"                                  | P    | Medium   | Logged in                    | 1. Read `[data-test=title]`                           | `Products`                                                                           |
| TC-INV-07 | Add a single item updates the badge                          | P    | Critical | Logged in                    | 1. Click Add to cart on Backpack                      | Badge shows `1`; the button label changes to `Remove`                                |
| TC-INV-08 | Add all six items                                            | P    | High     | Logged in                    | 1. Add every product                                  | Badge shows `6`; all six buttons read `Remove`                                       |
| TC-INV-09 | Remove an item from the inventory page                       | P    | High     | Backpack in cart             | 1. Click Remove on Backpack                           | Badge disappears (0 items); button reverts to `Add to cart`                          |
| TC-INV-10 | Badge is hidden when the cart is empty                       | P    | High     | Empty cart                   | 1. Open `/inventory.html`                             | No `shopping-cart-badge` element in the DOM                                          |
| TC-INV-11 | Add/remove toggling is stable                                | E    | Medium   | Logged in                    | 1. Add then remove the same item 5 times              | Badge ends at 0; no duplicate entries; button state stays in sync                    |
| TC-INV-12 | Cart state survives navigation                               | P    | High     | 2 items in cart              | 1. Go to cart<br>2. Click Continue Shopping           | Badge still shows `2`; both buttons still read `Remove`                              |
| TC-INV-13 | Cart state survives a page reload                            | E    | High     | 2 items in cart              | 1. Reload `/inventory.html`                           | Badge still shows `2`; button states preserved                                       |
| TC-INV-14 | Product name links to the detail page                        | P    | High     | Logged in                    | 1. Click a product name                               | Navigates to `/inventory-item.html?id=<correct id>`                                  |
| TC-INV-15 | Product image links to the detail page                       | P    | Medium   | Logged in                    | 1. Click a product image                              | Navigates to the same product's detail page                                          |
| TC-INV-16 | Cart icon navigates to the cart                              | P    | High     | Logged in                    | 1. Click the cart icon                                | Navigates to `/cart.html`                                                            |
| TC-INV-17 | Long inventory list renders                                  | E    | Low      | Logged in                    | 1. Navigate to `/inventory-long.html`                 | 22 items render, including size variants (XS–XXL); page scrolls without layout break |
| TC-INV-18 | Add to cart from the long list                               | E    | Low      | On `/inventory-long.html`    | 1. Add a size-variant item                            | Badge increments; item appears in the cart with the correct variant name             |

---

## 5. Sorting

| ID         | Title                                  | Type | Pri    | Preconditions                | Steps                                       | Expected Result                                                                                                              |
| ---------- | -------------------------------------- | ---- | ------ | ---------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| TC-SORT-01 | Default sort is Name (A→Z)             | P    | High   | Logged in as `standard_user` | 1. Read the sort dropdown value             | `az`; Backpack first, `Test.allTheThings()…` last                                                                            |
| TC-SORT-02 | Sort by Name (A→Z)                     | P    | High   | Logged in                    | 1. Select `Name (A to Z)`                   | Names in ascending alphabetical order                                                                                        |
| TC-SORT-03 | Sort by Name (Z→A)                     | P    | High   | Logged in                    | 1. Select `Name (Z to A)`                   | Names in descending order; prices `$15.99 $7.99 $49.99 $15.99 $9.99 $29.99`                                                  |
| TC-SORT-04 | Sort by Price (low→high)               | P    | High   | Logged in                    | 1. Select `Price (low to high)`             | `$7.99 $9.99 $15.99 $15.99 $29.99 $49.99`                                                                                    |
| TC-SORT-05 | Sort by Price (high→low)               | P    | High   | Logged in                    | 1. Select `Price (high to low)`             | `$49.99 $29.99 $15.99 $15.99 $9.99 $7.99`                                                                                    |
| TC-SORT-06 | Dropdown exposes exactly four options  | P    | Medium | Logged in                    | 1. Read all options                         | Values `az`, `za`, `lohi`, `hilo` with labels `Name (A to Z)`, `Name (Z to A)`, `Price (low to high)`, `Price (high to low)` |
| TC-SORT-07 | Tied prices keep a stable order        | E    | Medium | Logged in                    | 1. Sort by price (either direction)         | The two `$15.99` items appear adjacent and in a deterministic order across reloads                                           |
| TC-SORT-08 | Sorting does not alter the item count  | E    | Medium | Logged in                    | 1. Apply each sort in turn                  | 6 items after every sort; no duplicates or drops                                                                             |
| TC-SORT-09 | Sorting preserves cart state           | E    | High   | 2 items in cart              | 1. Change the sort order                    | Badge unchanged; the same two buttons still read `Remove`                                                                    |
| TC-SORT-10 | Sort selection resets on reload        | E    | Medium | Sorted by `hilo`             | 1. Reload the page                          | 🐞 Sort reverts to `az` — the selection is not persisted                                                                     |
| TC-SORT-11 | Sort selection resets after navigation | E    | Medium | Sorted by `hilo`             | 1. Go to cart<br>2. Click Continue Shopping | 🐞 Sort reverts to `az` and the list re-renders alphabetically                                                               |
| TC-SORT-12 | Sorting is applied on the long list    | E    | Low    | On `/inventory-long.html`    | 1. Apply each sort                          | All 22 items sort correctly                                                                                                  |

---

## 6. Product Detail Page

| ID        | Title                                        | Type | Pri    | Preconditions                    | Steps                                 | Expected Result                                                            |
| --------- | -------------------------------------------- | ---- | ------ | -------------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| TC-DTL-01 | Detail page shows the correct product        | P    | High   | Logged in                        | 1. Open `/inventory-item.html?id=4`   | Name `Sauce Labs Backpack`, price `$29.99`, matching description and image |
| TC-DTL-02 | All six detail pages render correctly        | P    | High   | Logged in                        | 1. Visit `id=0` through `id=5`        | Each page matches the catalogue row in §1.3                                |
| TC-DTL-03 | Add to cart from the detail page             | P    | High   | On a detail page                 | 1. Click Add to cart                  | Badge increments; button becomes `Remove`                                  |
| TC-DTL-04 | Remove from the detail page                  | P    | High   | Item in cart, on its detail page | 1. Click Remove                       | Badge decrements; button reverts to `Add to cart`                          |
| TC-DTL-05 | Back to products returns to the inventory    | P    | High   | On a detail page                 | 1. Click `Back to products`           | Navigates to `/inventory.html`                                             |
| TC-DTL-06 | Cart state is shared with the inventory page | E    | Medium | Item added from the detail page  | 1. Click Back to products             | That product's button reads `Remove` on the inventory list                 |
| TC-DTL-07 | Non-existent product id                      | N    | Medium | Logged in                        | 1. Open `/inventory-item.html?id=999` | Page renders `ITEM NOT FOUND` instead of crashing                          |
| TC-DTL-08 | Negative product id                          | N    | Low    | Logged in                        | 1. Open `/inventory-item.html?id=-1`  | Handled gracefully — `ITEM NOT FOUND`                                      |
| TC-DTL-09 | Non-numeric product id                       | N    | Low    | Logged in                        | 1. Open `/inventory-item.html?id=abc` | Handled gracefully — `ITEM NOT FOUND`                                      |
| TC-DTL-10 | Missing id parameter                         | N    | Low    | Logged in                        | 1. Open `/inventory-item.html`        | Handled gracefully; no uncaught exception                                  |
| TC-DTL-11 | Boundary product ids                         | E    | Medium | Logged in                        | 1. Open `id=0` and `id=5`             | Both render valid products (first and last of the catalogue)               |
| TC-DTL-12 | Browser back from the detail page            | E    | Low    | Navigated inventory → detail     | 1. Press browser Back                 | Returns to `/inventory.html` with cart state intact                        |

---

## 7. Cart

| ID         | Title                                             | Type | Pri      | Preconditions         | Steps                               | Expected Result                                                            |
| ---------- | ------------------------------------------------- | ---- | -------- | --------------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| TC-CART-01 | Cart lists the added item                         | P    | Critical | Backpack added        | 1. Open `/cart.html`                | One row: `Sauce Labs Backpack`, `$29.99`, quantity `1`                     |
| TC-CART-02 | Cart lists multiple items                         | P    | High     | 3 items added         | 1. Open `/cart.html`                | 3 rows with the correct names, prices and descriptions                     |
| TC-CART-03 | Cart row count matches the badge                  | E    | High     | N items added         | 1. Compare badge to row count       | Badge value equals the number of rows for N = 1…6                          |
| TC-CART-04 | Quantity is always 1                              | E    | Medium   | Item added            | 1. Read the quantity field          | `1` — the app has no quantity control; the same item cannot be added twice |
| TC-CART-05 | Empty cart renders no rows                        | P    | High     | Empty cart            | 1. Open `/cart.html`                | Zero item rows; page still renders its header and buttons                  |
| TC-CART-06 | Remove an item from the cart                      | P    | Critical | 2 items in cart       | 1. Click Remove on one row          | That row disappears; badge decrements to `1`                               |
| TC-CART-07 | Remove the last item                              | E    | High     | 1 item in cart        | 1. Click Remove                     | Cart is empty; badge disappears entirely                                   |
| TC-CART-08 | Remove all items one by one                       | E    | Medium   | 6 items in cart       | 1. Remove each row in turn          | Cart empties fully; badge disappears; no orphaned rows                     |
| TC-CART-09 | Continue Shopping returns to the inventory        | P    | High     | On `/cart.html`       | 1. Click Continue Shopping          | Navigates to `/inventory.html`; cart contents preserved                    |
| TC-CART-10 | Checkout starts the checkout flow                 | P    | Critical | Item in cart          | 1. Click Checkout                   | Navigates to `/checkout-step-one.html`                                     |
| TC-CART-11 | Checkout with an empty cart is permitted          | E    | High     | Empty cart            | 1. Click Checkout                   | 🐞 Proceeds to step one — there is no empty-cart guard                     |
| TC-CART-12 | Removal in the cart syncs to the inventory page   | E    | High     | Item removed in cart  | 1. Click Continue Shopping          | That product's button reads `Add to cart` again                            |
| TC-CART-13 | Cart contents survive a reload                    | E    | High     | 2 items in cart       | 1. Reload `/cart.html`              | Both rows still present; badge unchanged                                   |
| TC-CART-14 | Product name in the cart links to its detail page | P    | Medium   | Item in cart          | 1. Click the product name           | Navigates to that product's detail page                                    |
| TC-CART-15 | Cart prices match the inventory prices            | E    | High     | Several items in cart | 1. Compare each row's price to §1.3 | Prices are identical — no markup or rounding drift                         |

---

## 8. Checkout — Step One (Customer Information)

| ID         | Title                                      | Type | Pri      | Preconditions           | Steps                                                                      | Expected Result                                                         |
| ---------- | ------------------------------------------ | ---- | -------- | ----------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| TC-CHK1-01 | Submit with all fields valid               | P    | Critical | On step one             | 1. Enter `John` / `Doe` / `12345`<br>2. Click Continue                     | Navigates to `/checkout-step-two.html`                                  |
| TC-CHK1-02 | Submit with all fields empty               | N    | Critical | On step one             | 1. Click Continue                                                          | Error `Error: First Name is required`; stays on step one                |
| TC-CHK1-03 | Missing last name                          | N    | High     | On step one             | 1. Enter first name and postal code only<br>2. Click Continue              | Error `Error: Last Name is required`                                    |
| TC-CHK1-04 | Missing postal code                        | N    | High     | On step one             | 1. Enter first and last name only<br>2. Click Continue                     | Error `Error: Postal Code is required`                                  |
| TC-CHK1-05 | Missing first name only                    | N    | High     | On step one             | 1. Enter last name and postal code only<br>2. Click Continue               | Error `Error: First Name is required`                                   |
| TC-CHK1-06 | Validation order is first → last → postal  | E    | Medium   | On step one             | 1. Submit empty, fill first name, resubmit, fill last name, resubmit       | Errors appear in exactly that sequence                                  |
| TC-CHK1-07 | Cancel returns to the cart                 | P    | High     | On step one             | 1. Click Cancel                                                            | Navigates to `/cart.html`; cart contents unchanged                      |
| TC-CHK1-08 | Whitespace-only values pass validation     | E    | High     | On step one             | 1. Enter `␣` in all three fields<br>2. Click Continue                      | 🐞 Proceeds to step two — values are not trimmed before the empty check |
| TC-CHK1-09 | Single-character values                    | E    | Medium   | On step one             | 1. Enter `A` / `B` / `1`<br>2. Click Continue                              | Accepted; proceeds to step two                                          |
| TC-CHK1-10 | Very long values (500 chars)               | E    | Medium   | On step one             | 1. Paste 500 chars into each field<br>2. Click Continue                    | Accepted without truncation; no layout break on step two                |
| TC-CHK1-11 | Numeric first and last name                | N    | Medium   | On step one             | 1. Enter `12345` / `67890` / `12345`<br>2. Click Continue                  | 🐞 Accepted — there is no character-type validation on names            |
| TC-CHK1-12 | Special characters in names                | E    | Medium   | On step one             | 1. Enter `!@#$%^&*()` in the name fields<br>2. Click Continue              | Accepted; characters are not corrupted downstream                       |
| TC-CHK1-13 | Unicode / accented names                   | E    | Medium   | On step one             | 1. Enter `José` / `Müller-Ødegård` / `12345`<br>2. Click Continue          | Accepted and rendered correctly                                         |
| TC-CHK1-14 | XSS payload in the name fields             | N    | High     | On step one             | 1. Enter `<img src=x onerror=alert(1)>` as first name<br>2. Click Continue | No dialog fires; the payload is escaped wherever it is echoed           |
| TC-CHK1-15 | Alphabetic postal code                     | E    | Medium   | On step one             | 1. Enter `ABCDE` as postal code<br>2. Click Continue                       | 🐞 Accepted — the postal code is not format-validated                   |
| TC-CHK1-16 | Negative / signed postal code              | E    | Low      | On step one             | 1. Enter `-999`<br>2. Click Continue                                       | Accepted; no crash                                                      |
| TC-CHK1-17 | Error banner is dismissible                | P    | Medium   | Validation error shown  | 1. Click the `✕` on the banner                                             | Banner is removed; field error styling clears                           |
| TC-CHK1-18 | Error clears after a successful submit     | E    | Medium   | Validation error shown  | 1. Fill all fields correctly<br>2. Click Continue                          | Navigates to step two; no residual error banner                         |
| TC-CHK1-19 | Field values persist after a failed submit | E    | Medium   | On step one             | 1. Enter a first name only<br>2. Click Continue                            | The first name remains in its field alongside the error                 |
| TC-CHK1-20 | Checkout with an empty cart                | E    | High     | Empty cart, on step one | 1. Enter valid details<br>2. Click Continue                                | 🐞 Reaches step two with `Total: $0.00` and no line items               |

---

## 9. Checkout — Step Two (Order Overview)

| ID         | Title                                                     | Type | Pri      | Preconditions               | Steps                                             | Expected Result                                                |
| ---------- | --------------------------------------------------------- | ---- | -------- | --------------------------- | ------------------------------------------------- | -------------------------------------------------------------- |
| TC-CHK2-01 | Ordered items are listed                                  | P    | Critical | 1 item, on step two         | 1. Read the item rows                             | Backpack, `$29.99`, quantity `1`                               |
| TC-CHK2-02 | Multiple items are listed                                 | P    | High     | 3 items, on step two        | 1. Read the item rows                             | All three rows with correct names and prices                   |
| TC-CHK2-03 | Payment information                                       | P    | High     | On step two                 | 1. Read the payment value                         | `SauceCard #31337`                                             |
| TC-CHK2-04 | Shipping information                                      | P    | High     | On step two                 | 1. Read the shipping value                        | `Free Pony Express Delivery!`                                  |
| TC-CHK2-05 | Item total equals the sum of prices                       | P    | Critical | 3 items, on step two        | 1. Compare `Item total` to the sum of line prices | Exact match                                                    |
| TC-CHK2-06 | Tax is 8% of the item total                               | P    | Critical | Backpack only, on step two  | 1. Read the tax label                             | `Tax: $2.40` (29.99 × 0.08 = 2.3992 → 2.40)                    |
| TC-CHK2-07 | Total equals item total plus tax                          | P    | Critical | Backpack only, on step two  | 1. Read the total label                           | `Total: $32.39`                                                |
| TC-CHK2-08 | Totals are correct for all six items                      | E    | High     | 6 items, on step two        | 1. Verify all three totals                        | Item total `$129.94`, tax `$10.40`, total `$140.34`            |
| TC-CHK2-09 | Tax rounding on a repeating decimal                       | E    | Medium   | Cart totalling e.g. `$7.99` | 1. Read the tax label                             | Rounded to exactly 2 dp (`$0.64`); no floating-point artefacts |
| TC-CHK2-10 | Totals for an empty cart                                  | E    | Medium   | Empty cart, on step two     | 1. Read all totals                                | `Item total: $0.00`, `Tax: $0.00`, `Total: $0.00`              |
| TC-CHK2-11 | Finish completes the order                                | P    | Critical | On step two                 | 1. Click Finish                                   | Navigates to `/checkout-complete.html`                         |
| TC-CHK2-12 | Cancel returns to the inventory                           | P    | High     | On step two                 | 1. Click Cancel                                   | Navigates to `/inventory.html`; cart contents preserved        |
| TC-CHK2-13 | Overview prices match the cart prices                     | E    | High     | Several items               | 1. Compare the cart page to step two              | Identical line prices                                          |
| TC-CHK2-14 | Reload on step two                                        | E    | Medium   | On step two                 | 1. Reload the page                                | Item rows and totals still render correctly                    |
| TC-CHK2-15 | Browser back from step two                                | E    | Low      | On step two                 | 1. Press browser Back                             | Returns to step one; cart is unchanged                         |
| TC-CHK2-16 | Customer information entered in step one is not displayed | E    | Low      | On step two                 | 1. Look for the name/postal code                  | Confirm whether the details are shown; document the behaviour  |

---

## 10. Checkout — Complete

| ID         | Title                                         | Type | Pri      | Preconditions                   | Steps                                                                       | Expected Result                                                                              |
| ---------- | --------------------------------------------- | ---- | -------- | ------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| TC-CHKC-01 | Confirmation header                           | P    | Critical | Order placed                    | 1. Read the header                                                          | `Thank you for your order!`                                                                  |
| TC-CHKC-02 | Confirmation body text                        | P    | High     | Order placed                    | 1. Read the body text                                                       | `Your order has been dispatched, and will arrive just as fast as the pony can get there!`    |
| TC-CHKC-03 | Cart is emptied after the order               | P    | Critical | Order placed as `standard_user` | 1. Check the badge                                                          | No badge — the cart has been cleared                                                         |
| TC-CHKC-04 | Back Home returns to the inventory            | P    | High     | On the confirmation page        | 1. Click `Back Home`                                                        | Navigates to `/inventory.html` with an empty cart                                            |
| TC-CHKC-05 | Generate PDF button is present                | P    | Medium   | On the confirmation page        | 1. Locate `[data-test=generate-pdf-order]`                                  | Button is visible and enabled                                                                |
| TC-CHKC-06 | Generate PDF produces a download              | P    | Medium   | On the confirmation page        | 1. Click `Generate PDF`                                                     | A PDF download is triggered; the file is non-empty                                           |
| TC-CHKC-07 | Pony image / confirmation graphic renders     | P    | Low      | On the confirmation page        | 1. Inspect the image                                                        | Loads successfully (HTTP 200)                                                                |
| TC-CHKC-08 | Reload on the confirmation page               | E    | Medium   | On the confirmation page        | 1. Reload                                                                   | Page still renders; no crash from lost router state                                          |
| TC-CHKC-09 | Back button after ordering does not re-submit | E    | Medium   | On the confirmation page        | 1. Press browser Back                                                       | Returns to step two; clicking Finish again does not create a second order from an empty cart |
| TC-CHKC-10 | Full end-to-end order, six items              | P    | Critical | Logged in, empty cart           | 1. Add all 6 items<br>2. Cart → Checkout → fill details → Continue → Finish | Confirmation shown; cart empty; totals matched `$140.34` on step two                         |

---

## 11. Navigation, Menu & Header

| ID        | Title                                           | Type | Pri      | Preconditions                | Steps                                                                            | Expected Result                                                                                              |
| --------- | ----------------------------------------------- | ---- | -------- | ---------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| TC-NAV-01 | Burger menu opens                               | P    | High     | Logged in                    | 1. Click `#react-burger-menu-btn`                                                | Sidebar opens with 4 links: All Items, About, Logout, Reset App State                                        |
| TC-NAV-02 | Burger menu closes                              | P    | High     | Menu open                    | 1. Click `#react-burger-cross-btn`                                               | Sidebar closes; links become non-interactive                                                                 |
| TC-NAV-03 | All Items navigates to the inventory            | P    | High     | Menu open on `/cart.html`    | 1. Click All Items                                                               | Navigates to `/inventory.html`                                                                               |
| TC-NAV-04 | About opens the Sauce Labs site                 | P    | Medium   | Menu open as `standard_user` | 1. Click About                                                                   | Navigates to `https://saucelabs.com/`                                                                        |
| TC-NAV-05 | Logout link                                     | P    | Critical | Menu open                    | 1. Click Logout                                                                  | Returns to `/`; session cleared (see TC-SES-04)                                                              |
| TC-NAV-06 | Reset App State clears the cart                 | P    | High     | 2 items in cart              | 1. Menu → Reset App State                                                        | Badge disappears                                                                                             |
| TC-NAV-07 | Reset App State leaves stale button labels      | E    | High     | Item added, then reset       | 1. Menu → Reset App State<br>2. Close the menu and inspect that product's button | 🐞 Badge is cleared but the button still reads `Remove` — the button state is not re-rendered until a reload |
| TC-NAV-08 | Reset App State does not log the user out       | E    | Medium   | Logged in                    | 1. Menu → Reset App State                                                        | Still on `/inventory.html`; session cookie intact                                                            |
| TC-NAV-09 | Menu is reachable from every authenticated page | E    | Medium   | Logged in                    | 1. Open the menu on inventory, detail, cart, and each checkout page              | Menu opens and all 4 links work on every page                                                                |
| TC-NAV-10 | Cart badge is visible from every page           | E    | Medium   | 2 items in cart              | 1. Visit each authenticated page                                                 | Badge shows `2` in the header throughout                                                                     |
| TC-NAV-11 | Menu links are not focusable when closed        | E    | Low      | Menu closed                  | 1. Tab through the page                                                          | Closed-menu links are not reachable by keyboard                                                              |

---

## 12. Defective-User Behaviour

These are the highest-value cases for a portfolio: they prove the suite can _detect_ bugs rather than only walk the happy path. Every expectation below was reproduced against the live site.

### 12.1 `problem_user`

| ID       | Title                                      | Type | Pri      | Steps                                                                           | Expected Result                                                                         |
| -------- | ------------------------------------------ | ---- | -------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| TC-PU-01 | All product images are broken              | N    | High     | 1. Log in as `problem_user`<br>2. Inspect every image `src`                     | 🐞 All 6 images resolve to `sl-404` — a single placeholder replaces every product image |
| TC-PU-02 | Odd-id products cannot be added            | N    | Critical | 1. Click Add to cart on Bolt T-Shirt (id 1)                                     | 🐞 Nothing happens — no badge appears; the button stays `Add to cart`                   |
| TC-PU-03 | Even-id products can be added              | P    | High     | 1. Click Add to cart on Backpack (id 4)                                         | Badge shows `1`; the button becomes `Remove`                                            |
| TC-PU-04 | Even-id products cannot be removed         | N    | Critical | 1. Add Backpack (id 4)<br>2. Click Remove                                       | 🐞 Badge stays at `1` — the item cannot be removed from the inventory page              |
| TC-PU-05 | Add is broken for ids 1, 3 and 5           | N    | High     | 1. Attempt to add Bolt T-Shirt, Test.allTheThings() T-Shirt and Fleece Jacket   | 🐞 All three fail silently                                                              |
| TC-PU-06 | Remove is broken for ids 0, 2 and 4        | N    | High     | 1. Add Bike Light, Onesie and Backpack, then attempt to remove each             | 🐞 All three removals fail silently                                                     |
| TC-PU-07 | Sorting has no effect                      | N    | Critical | 1. Select `Name (Z to A)`<br>2. Compare the order before and after              | 🐞 The order is unchanged — the sort handler is skipped entirely                        |
| TC-PU-08 | Product name links are dead                | N    | High     | 1. Inspect a product name's `href`                                              | 🐞 `href="#"` — clicking does not navigate to the detail page                           |
| TC-PU-09 | Typing in Last Name writes into First Name | N    | Critical | 1. Go to checkout step one<br>2. Type `Doe` into Last Name                      | 🐞 The characters land in the First Name field; Last Name stays empty                   |
| TC-PU-10 | Checkout step one cannot be completed      | N    | Critical | 1. Fill all three fields as a user would<br>2. Click Continue                   | 🐞 Blocked by `Error: Last Name is required` — the flow is unreachable through the UI   |
| TC-PU-11 | Order overview doubles every price         | N    | Critical | 1. Add Backpack (`$29.99`)<br>2. Navigate directly to `/checkout-step-two.html` | 🐞 `Item total: $59.98`, `Tax: $4.80`, `Total: $64.78` — each price is counted twice    |
| TC-PU-12 | Cart is not cleared after ordering         | N    | High     | 1. Reach step two by deep link<br>2. Click Finish<br>3. Return to the inventory | 🐞 Confirmation is shown, but the badge still reads `1`                                 |
| TC-PU-13 | About link points to a 404                 | N    | Medium   | 1. Menu → About                                                                 | 🐞 Navigates to `https://saucelabs.com/error/404` instead of the marketing site         |

### 12.2 `error_user`

| ID       | Title                                                | Type | Pri      | Steps                                                                          | Expected Result                                                                                                   |
| -------- | ---------------------------------------------------- | ---- | -------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| TC-EU-01 | Adding an odd-id product throws                      | N    | Critical | 1. Log in as `error_user`<br>2. Click Add to cart on Bolt T-Shirt (id 1)       | 🐞 Uncaught `Error: Failed to add item to the cart.`; the item is not added                                       |
| TC-EU-02 | Adding an even-id product works                      | P    | High     | 1. Click Add to cart on Backpack (id 4)                                        | Badge shows `1`; no console error                                                                                 |
| TC-EU-03 | Removing an even-id product throws                   | N    | Critical | 1. Add Backpack (id 4)<br>2. Click Remove                                      | 🐞 Uncaught `Error: Failed to remove item from cart.`; the item stays in the cart                                 |
| TC-EU-04 | Sorting raises an alert                              | N    | Critical | 1. Select any sort option                                                      | 🐞 Native alert `Sorting is broken! This error has been reported to Backtrace.`; the order does not change        |
| TC-EU-05 | Typing in Last Name throws a TypeError               | N    | Critical | 1. Go to checkout step one<br>2. Type into Last Name                           | 🐞 Uncaught `TypeError: Cannot read properties of undefined (reading 'value')`; the field stays empty             |
| TC-EU-06 | Last-name validation is skipped                      | N    | Critical | 1. Fill First Name and Postal Code, leave Last Name empty<br>2. Click Continue | 🐞 Proceeds to step two — the required-field check is bypassed for this user                                      |
| TC-EU-07 | Finish never completes the order                     | N    | Critical | 1. Reach step two<br>2. Click Finish                                           | 🐞 Uncaught `TypeError: ai.cesetRart is not a function`; stays on step two — the confirmation page is unreachable |
| TC-EU-08 | Cart is never cleared                                | N    | High     | 1. Attempt to finish the order<br>2. Check the badge                           | 🐞 Cart contents persist because the reset call throws                                                            |
| TC-EU-09 | Product detail description fails to render           | N    | Medium   | 1. Open any product detail page                                                | 🐞 The description area renders an error state instead of the product text                                        |
| TC-EU-10 | No uncaught errors on the happy path for other users | P    | Medium   | 1. Repeat the same flow as `standard_user` while listening for `pageerror`     | Zero uncaught exceptions — confirms the errors are user-specific                                                  |

### 12.3 `visual_user`

| ID       | Title                                               | Type | Pri      | Steps                                                                                                 | Expected Result                                                                                                                |
| -------- | --------------------------------------------------- | ---- | -------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| TC-VU-01 | First product image is broken                       | N    | High     | 1. Log in as `visual_user`<br>2. Inspect the image `src` values                                       | 🐞 The first item resolves to `sl-404`; the other five load their real images                                                  |
| TC-VU-02 | Prices are randomised                               | N    | Critical | 1. Read all six prices<br>2. Reload and read them again                                               | 🐞 Prices differ between renders and none match the catalogue (e.g. `$75.73` then `$60.52` for the same product)               |
| TC-VU-03 | Cart container carries a failure class              | N    | High     | 1. Inspect `#shopping_cart_container`                                                                 | 🐞 `class="shopping_cart_container visual_failure"` — the cart icon is visually misplaced                                      |
| TC-VU-04 | Some product text is misaligned                     | N    | Medium   | 1. Inspect the text alignment of items at positions 3 and 4                                           | 🐞 Right-aligned instead of left-aligned, unlike the rest of the grid                                                          |
| TC-VU-05 | One Add-to-cart button is misaligned                | N    | Medium   | 1. Inspect the button on the 6th item                                                                 | 🐞 Carries a misalignment class; renders offset from the others                                                                |
| TC-VU-06 | Burger menu carries a failure class                 | N    | Medium   | 1. Inspect the burger menu element                                                                    | 🐞 `visual_failure` class applied                                                                                              |
| TC-VU-07 | Checkout button carries a failure class             | N    | Medium   | 1. Go to `/cart.html`<br>2. Inspect the checkout button                                               | 🐞 `btn_visual_failure` class applied                                                                                          |
| TC-VU-08 | Visual regression baseline                          | N    | High     | 1. Capture a full-page screenshot of the inventory<br>2. Compare against the `standard_user` baseline | 🐞 Diff exceeds the threshold. **Mask the price elements** first — they are randomised and would otherwise make the test flaky |
| TC-VU-09 | Checkout totals are computed from randomised prices | E    | Medium   | 1. Add an item and proceed to step two<br>2. Compare the totals to the displayed price                | Document whether the total uses the randomised price or the catalogue price                                                    |

### 12.4 `performance_glitch_user`

| ID       | Title                                               | Type | Pri      | Steps                                                                                                 | Expected Result                                                                                 |
| -------- | --------------------------------------------------- | ---- | -------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| TC-PG-01 | Inventory load is severely delayed                  | N    | Critical | 1. Log in as `performance_glitch_user`<br>2. Measure the time from submit to the first item rendering | 🐞 ~5 s (measured 5.4 s) versus well under 1 s for `standard_user`                              |
| TC-PG-02 | Delay exceeds the default Playwright timeout budget | E    | High     | 1. Run the login step with a 5 s action timeout                                                       | Fails — the suite needs an extended timeout for this user. Document the required override       |
| TC-PG-03 | The delay blocks the main thread                    | E    | Medium   | 1. During the delay, attempt to interact with the page                                                | 🐞 The page is frozen — a busy-wait loop, not an async wait, so no spinner or progress is shown |
| TC-PG-04 | Functionality is correct once loaded                | P    | High     | 1. Wait for the inventory<br>2. Add an item, sort, and check out                                      | All operations behave exactly as for `standard_user` — only timing is affected                  |
| TC-PG-05 | The delay recurs on every inventory render          | E    | Medium   | 1. Navigate away and back to `/inventory.html` several times                                          | Confirm whether the delay repeats each time or only on first load                               |
| TC-PG-06 | Other pages are unaffected                          | E    | Low      | 1. Time the cart and checkout pages                                                                   | These render at normal speed — the delay is specific to the inventory page                      |

---

## 13. Cross-Cutting: UI, Compatibility & Accessibility

| ID       | Title                                     | Type | Pri    | Steps                                                                        | Expected Result                                                                             |
| -------- | ----------------------------------------- | ---- | ------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| TC-UI-01 | Full flow on Chromium, Firefox and WebKit | P    | High   | 1. Run TC-CHKC-10 on all three projects                                      | Identical behaviour on every browser                                                        |
| TC-UI-02 | Mobile viewport (375×667)                 | E    | Medium | 1. Run the full flow on a Pixel 5 / iPhone 12 viewport                       | Layout adapts; all controls remain reachable and tappable                                   |
| TC-UI-03 | Tablet viewport (768×1024)                | E    | Low    | 1. Load the inventory                                                        | Grid reflows without overlap or clipping                                                    |
| TC-UI-04 | Very narrow viewport (320 px)             | E    | Low    | 1. Load each page                                                            | No horizontal scrollbar on the body; no clipped text                                        |
| TC-UI-05 | Keyboard-only login                       | E    | Medium | 1. Tab to username → password → Login<br>2. Press Enter                      | Focus order is logical; login succeeds without a mouse                                      |
| TC-UI-06 | Keyboard-only checkout                    | E    | Medium | 1. Complete step one using Tab and Enter only                                | All fields and buttons are reachable and operable                                           |
| TC-UI-07 | Visible focus indicators                  | E    | Low    | 1. Tab through the interactive elements                                      | Every focused control has a visible indicator                                               |
| TC-UI-08 | Images have alt text                      | E    | Medium | 1. Inspect the product images                                                | Each has a meaningful `alt` attribute                                                       |
| TC-UI-09 | Form inputs have accessible names         | E    | Medium | 1. Inspect the login and checkout inputs                                     | Each is associated with a label or has an `aria-label`/placeholder that conveys its purpose |
| TC-UI-10 | Automated accessibility scan              | E    | Medium | 1. Run axe-core on each page                                                 | Record the violations as a baseline; assert no _new_ violations are introduced              |
| TC-UI-11 | Page title                                | P    | Low    | 1. Read `document.title` on each page                                        | `Swag Labs`                                                                                 |
| TC-UI-12 | Footer content                            | P    | Low    | 1. Read the footer on an authenticated page                                  | Copyright text and social links render; links point to the expected destinations            |
| TC-UI-13 | No console errors on the happy path       | P    | High   | 1. Run the full `standard_user` flow while capturing console and `pageerror` | Zero errors — this is what makes the `error_user` cases meaningful                          |
| TC-UI-14 | No broken network requests                | P    | Medium | 1. Run the full flow while capturing responses                               | No 4xx/5xx for the app's own assets                                                         |
| TC-UI-15 | Behaviour with JavaScript disabled        | N    | Low    | 1. Disable JS and load `/`                                                   | The `noscript` message is shown — the app is unusable, as expected for a React SPA          |

---

## 14. Coverage Summary

| Module                            | Cases   |
| --------------------------------- | ------- |
| Authentication — Login            | 26      |
| Session, Routing & Access Control | 15      |
| Inventory / Products              | 18      |
| Sorting                           | 12      |
| Product Detail                    | 12      |
| Cart                              | 15      |
| Checkout — Step One               | 20      |
| Checkout — Step Two               | 16      |
| Checkout — Complete               | 10      |
| Navigation & Menu                 | 11      |
| `problem_user`                    | 13      |
| `error_user`                      | 10      |
| `visual_user`                     | 9       |
| `performance_glitch_user`         | 6       |
| Cross-cutting UI / A11y           | 15      |
| **Total**                         | **208** |

By type: **78 positive**, **56 negative**, **74 edge**.

**40 cases (🐞) assert a real application defect.** 30 sit in the defective-user modules; the other 10 are app-wide gaps that affect `standard_user` too — the missing empty-cart guard (TC-CART-11, TC-CHK1-20), untrimmed and unvalidated checkout input (TC-CHK1-08/11/15), sort selection not persisted (TC-SORT-10/11), the cart surviving logout (TC-SES-06), the step-two deep link bypassing step one (TC-SES-13), and the stale button label after Reset App State (TC-NAV-07).

---

## 15. Notes for Automation

1. **Login route is `/`, not `/login.html`.** A surprising number of public saucedemo suites get this wrong.
2. **Assert defects, don't wish them away.** The 🐞 cases are permanent application behaviour. Either assert the broken behaviour (so a _change_ fails the suite) or mark them `test.fail()` — Playwright will then flag it if the app is ever fixed.
3. **`error_user` needs `pageerror` listeners.** Its failures are uncaught exceptions, not visible UI messages. Attach the listener _before_ the triggering action.
4. **`error_user` sorting fires a native `alert`.** Register a `page.on('dialog')` handler or the test will hang.
5. **`performance_glitch_user` needs an extended timeout** — roughly 5 s of blocked main thread. Override the timeout for that project or those tests specifically; do not raise it globally, or you will mask real regressions.
6. **`visual_user` prices are random on every render.** Mask them in visual comparisons and never assert an exact value.
7. **Odd/even ids drive `problem_user` and `error_user`.** Model products as `{ id, name, price, slug }` so parity-based cases stay readable.
8. **`data-test` attributes are stable — prefer them** over CSS classes or text, except where you are deliberately asserting a class (the `visual_user` cases).
9. **Slugs derive from product names**, so the Test.allTheThings() shirt yields `add-to-cart-test.allthethings()-t-shirt-(red)`. Escape it carefully or build the locator with `getByTestId`, which does not parse the value as a selector.
10. **Reset state between tests.** The cart survives logout, so use a fresh browser context per test rather than relying on `Reset App State` — which itself leaves stale button labels (TC-NAV-07).
11. **Independent tests need seeded state.** Log in via cookie injection (`session-username=<user>`) plus a `localStorage` cart seed to skip the UI login where the test is not about login.
