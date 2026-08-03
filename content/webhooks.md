---
title: Verify webhook events
description: Verify signatures, preserve event ids, and acknowledge webhooks quickly.
section: Guides
order: 3
tags: [webhooks, events, security, retries]
---
# Verify webhook events

Treat webhook requests as untrusted input. Verify the signature before parsing the event, persist the event id for idempotency, and return a fast 2xx response after the event is durably queued.

## A safe handler shape

```ts
export async function handleWebhook(request: Request) {
  const rawBody = await request.text();
  verifySignature(request.headers, rawBody);
  const event = JSON.parse(rawBody);
  await enqueueOnce(event.id, event);
  return new Response("ok", { status: 202 });
}
```

If processing fails, retry from the queue rather than asking the provider to resend a request you have already accepted. Keep the original event id in logs and traces.
