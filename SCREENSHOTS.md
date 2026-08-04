# Vessel visual tour

These screenshots are captured from the current production build with `npm run preview` at a 1384 × 882 desktop viewport. They show the real static-first UI shipped in this repository; no hosted service or API key is required to view them.

## Landing page

The open-source product story starts with one Git-backed source becoming human docs, agent context, and an MCP-ready surface.

![Vessel landing page](screenshots/landing.jpg)

## BYOK Assistant

The Assistant keeps provider choice and credentials in the user's control. OpenRouter, OpenAI, Anthropic, and custom OpenAI-compatible endpoints are supported.

![Vessel BYOK Assistant](screenshots/assistant.jpg)

## One-click self-hosting

The deploy surface makes Cloudflare Workers, Netlify, and bring-your-own infrastructure first-class paths.

![Vessel self-hosting options](screenshots/deploy.jpg)

## Human and agent documentation

The generated docs surface includes navigation, search, source metadata, and links to machine-readable contracts.

![Vessel documentation](screenshots/docs.jpg)

## API reference and safe request preview

The OpenAPI surface explains the contract and builds curl or fetch examples without sending requests from the public page.

![Vessel API reference](screenshots/api.jpg)

To refresh the gallery after a UI change, run the local preview server, capture the same routes, and keep the images aligned with the current build:

- `/` — landing page
- `/#assistant-studio` — BYOK Assistant
- `/#deploy` — self-hosting options
- `/docs/` — human and agent docs
- `/api/` — API reference and request preview
