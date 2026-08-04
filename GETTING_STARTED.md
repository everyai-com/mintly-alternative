# Vessel in 60 seconds

Vessel works without an AI key. Start with the static docs and add a provider only when you want live Assistant answers.

## Local

```sh
git clone https://github.com/everyai-com/mintly-alternative.git
cd mintly-alternative
npm install
npm run setup
npm run dev
```

Open `http://localhost:5173`. The setup command creates `.env` from `.env.example` only when it does not already exist; it never overwrites local settings.

Run the confidence check at any time:

```sh
npm run doctor
npm run verify
```

## Add the Assistant

Edit `.env` and choose one provider:

```dotenv
AI_PROVIDER=openrouter
AI_MODEL=openai/gpt-4o-mini
AI_API_KEY=your-server-side-key
```

OpenRouter, OpenAI, Anthropic, and trusted OpenAI-compatible endpoints are supported. Keep keys in Worker secrets or Netlify environment variables for shared deployments. Browser BYOK is ephemeral and is not written to disk.

## Add your docs

- Put Markdown pages in `content/`.
- Put OpenAPI JSON, YAML, or YML contracts in `openapi/`.
- Update navigation and agent capabilities in `docs.config.json`.
- Run `npm run verify` before committing.

The build generates human docs, API references, `llms.txt`, an agent manifest, permissions, and read-only MCP surfaces from that source tree.

## One-click hosting

- [Deploy on Cloudflare Workers](https://deploy.workers.cloudflare.com/?url=https://github.com/everyai-com/mintly-alternative)
- [Deploy on Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/everyai-com/mintly-alternative)

After deployment, add `AI_API_KEY` only if you want live Assistant responses. The docs, generated API reference, request-preview playground, and read-only MCP contract work without it.

## If something looks wrong

```sh
npm run doctor -- --full
```

If the doctor reports an old Node version, activate Node 22 (`.nvmrc` is included), reinstall dependencies with `npm install`, and run the check again.
