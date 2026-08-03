# GitHub connection

The public source repository is [everyai-com/mintly-alternative](https://github.com/everyai-com/mintly-alternative). Cloudflare and Netlify one-click deployment both clone from this repository, so a deployment can remain connected to GitHub for future pushes and previews.

## Optional GitHub App

The `/api/github/install` route is a safe redirect stub. Set `GITHUB_APP_SLUG` after creating a public GitHub App and it will send users to GitHub’s repository-selection installer. Until then, the route returns a configuration response instead of pointing at a fake app.

The app should request the minimum permissions needed:

- repository metadata: read-only;
- repository contents: read-only for docs sync;
- pull requests: read/write only when the agent workflow opens reviewable PRs;
- webhooks: only for push and pull-request events that Vessel actually consumes.

Do not request organization administration or broad write access for the initial integration. Users should be able to select only the repositories they want to connect.

## Suggested sync flow

1. Install the GitHub App on one or more selected repositories.
2. Verify the installation callback and store only the installation ID encrypted at rest.
3. Read the docs branch and build a preview from the commit SHA.
4. Generate `llms.txt`, API references, and agent context from that same SHA.
5. Open a pull request for agent-authored changes; never write directly to the default branch.

GitHub’s official guidance covers [app permissions](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app) and [repository-scoped installation](https://docs.github.com/en/apps/using-github-apps/installing-a-github-app-from-a-third-party).
