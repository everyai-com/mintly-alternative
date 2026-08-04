---
title: Ship your first checkout
description: Create a hosted checkout session with the smallest working request.
section: Guides
order: 1
tags: [quickstart, checkout, payments]
audience: [developer, coding-agent]
related: [authentication, webhooks]
version: current
locale: en
updated: 2026-08-04
stability: stable
---
# Ship your first checkout

Use the SDK or a single API request to create a hosted checkout session for your customer. Keep the first integration small, then add webhooks and authentication after the happy path works.

## Create a session

```js
const session = await vessel.checkout.create({
  price: "price_basic",
  successUrl: "https://example.com/success"
});
```

The response includes a checkout URL. Redirect the customer to that URL and store the session id beside your order.

## What to do next

Read [Authentication](/docs/authentication/) before moving the API call to production. Add [Webhooks](/docs/webhooks/) so your server can react to payment state changes instead of trusting the browser redirect.
