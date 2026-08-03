---
title: Checkout API reference
description: Create and expire checkout sessions with the API contract close to runnable examples.
section: API reference
order: 5
tags: [api, checkout, reference, idempotency]
---
# Checkout API reference

The checkout endpoint creates a hosted session for a price. Send an idempotency key when the request can be retried by a job or user action.

## Create a checkout session

```http
POST /v1/checkout
Authorization: Bearer $VESSEL_API_KEY
Idempotency-Key: order_123_attempt_1
Content-Type: application/json

{"price":"price_basic","success_url":"https://example.com/success"}
```

The response contains an `id`, `url`, and `status`. Store the id and use webhooks as the source of truth for completion.
