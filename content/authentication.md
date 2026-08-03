---
title: Authentication and key rotation
description: Keep API credentials server-side and rotate them without breaking active clients.
section: Guides
order: 2
tags: [authentication, security, keys, tokens]
---
# Authentication and key rotation

Send a bearer token from a trusted server. Never put a production credential in browser JavaScript, a screenshot, a support ticket, or a documentation example.

## Make an authenticated request

```bash
curl https://api.example.com/v1/checkout \\
  -H "Authorization: Bearer $VESSEL_API_KEY" \\
  -H "Content-Type: application/json"
```

## Rotate without downtime

Create a replacement key, deploy it alongside the current key, move traffic, and revoke the old key only after active clients have rotated. Keep an overlap window long enough for background jobs and mobile clients to update.

For a provider key used by Vessel Assistant, prefer a Worker secret or Netlify environment variable. Browser BYOK is intentionally ephemeral and should only be used on a private deployment.
