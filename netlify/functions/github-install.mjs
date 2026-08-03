const REPOSITORY_URL = "https://github.com/everyai-com/mintly-alternative";

export default async function handler() {
  const slug = String(process.env.GITHUB_APP_SLUG || "").trim();
  if (slug) {
    return {
      statusCode: 302,
      headers: { location: `https://github.com/apps/${encodeURIComponent(slug)}/installations/new` },
      body: ""
    };
  }

  return {
    statusCode: 501,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    body: JSON.stringify({
      ok: false,
      code: "github_app_not_configured",
      message: "Configure GITHUB_APP_SLUG after creating your public GitHub App.",
      repository: REPOSITORY_URL,
      docs: "/github"
    })
  };
}
