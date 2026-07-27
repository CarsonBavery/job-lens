export interface GithubRepoData {
  description: string | null;
  language: string | null;
  readme: string | null;
}

// Pure and unit-tested in isolation -- accepts the common URL shapes a user
// might paste (with/without protocol, trailing slash, trailing .git,
// extra path segments like /tree/main).
export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  const match = url
    .trim()
    .match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s#?]+)/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

// GitHub's unauthenticated API rate limit is ~60 requests/hour per IP --
// low enough to be worth a clear, specific error rather than letting a 403
// surface as a generic failure.
export async function fetchGithubRepo(url: string): Promise<GithubRepoData> {
  const parsed = parseGithubUrl(url);
  if (!parsed) {
    throw new Error("That doesn't look like a GitHub repository URL.");
  }
  const { owner, repo } = parsed;

  const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (repoResponse.status === 404) {
    throw new Error("GitHub repository not found. Check the URL and that it's public.");
  }
  if (repoResponse.status === 403) {
    throw new Error("GitHub's API rate limit was hit. Try again in a few minutes.");
  }
  if (!repoResponse.ok) {
    throw new Error(`GitHub API request failed (${repoResponse.status}).`);
  }
  const repoData = (await repoResponse.json()) as { description: string | null; language: string | null };

  // A repo without a README is normal, not an error -- summarization just
  // falls back to whatever the repo metadata alone provides.
  let readme: string | null = null;
  const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (readmeResponse.ok) {
    const readmeData = (await readmeResponse.json()) as { content: string; encoding: string };
    if (readmeData.encoding === "base64") {
      readme = Buffer.from(readmeData.content, "base64").toString("utf-8");
    }
  }

  return { description: repoData.description, language: repoData.language, readme };
}
