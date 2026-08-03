# shadcn/ui decision

Vessel is MIT licensed and intentionally keeps the marketing surface dependency-light. shadcn/ui is also open source and MIT licensed, but it is a source distribution system rather than a runtime component package: it copies editable component code into the application.

## Recommendation

Use shadcn/ui for the authenticated control plane that is next on the roadmap:

- docs editor and navigation builder;
- AI provider settings and key management;
- analytics, feedback, and release controls;
- GitHub installation and repository permissions.

Keep the current landing page as framework-light HTML/CSS. Adding React, Tailwind, and shadcn/ui solely to render a public marketing page would make the starter heavier without improving self-hosting or portability.

When the control plane is introduced, use the official Vite setup and keep the generated components in-repo under `src/components/ui`. The components should remain forkable, reviewable, and replaceable; no hosted shadcn service is required.

## Security boundary

Provider keys belong in Cloudflare Worker secrets or Netlify environment variables. The browser can send an explicitly ephemeral BYOK key to the user’s own deployment, but Vessel must never persist it in local storage, URLs, source control, or analytics events.

See the [official Vite setup](https://ui.shadcn.com/docs/installation/vite) and the [shadcn/ui MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).
