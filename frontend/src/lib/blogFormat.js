export function buildBlogContent({ coverUrl, excerpt, body, tags }) {
  let s = "";
  if (coverUrl?.trim()) s += `__COVER__${coverUrl.trim()}__\n\n`;
  if (excerpt?.trim()) s += `${excerpt.trim()}\n\n---\n\n`;
  s += (body || "").trim();
  if (tags?.trim()) {
    const tagStr = tags
      .split(",")
      .map((t) => "#" + t.trim().replace(/^#/, ""))
      .filter(Boolean)
      .join(" ");
    if (tagStr) s += "\n\n" + tagStr;
  }
  return s;
}

export function parseBlogContent(raw) {
  if (!raw) {
    return {
      cover: null,
      excerpt: "",
      body: "",
      tags: [],
      displaySnippet: "",
    };
  }
  let c = raw;
  let cover = null;
  const coverMatch = c.match(/^__COVER__(.+?)__\s*\n*/);
  if (coverMatch) {
    cover = coverMatch[1];
    c = c.slice(coverMatch[0].length);
  }
  const split = c.split(/\n---\n/);
  let excerpt = "";
  let body = c;
  if (split.length >= 2) {
    excerpt = split[0].trim();
    body = split.slice(1).join("\n---\n").trim();
  }
  const tagMatches = body.match(/#[\w\u00c0-\u024f-]+/g) || [];
  const tags = tagMatches.map((t) => t.slice(1));
  const bodyWithoutTrailingTags = body
    .replace(/\n?#[\w\u00c0-\u024f-]+(\s+#[\w\u00c0-\u024f-]+)*\s*$/u, "")
    .trim();
  const words = bodyWithoutTrailingTags.split(/\s+/).filter(Boolean);
  const readMinutes = Math.max(1, Math.ceil(words.length / 200));
  const displaySnippet =
    excerpt || (bodyWithoutTrailingTags ? bodyWithoutTrailingTags.slice(0, 180) : "");
  return {
    cover,
    excerpt,
    body: bodyWithoutTrailingTags,
    tags,
    displaySnippet: displaySnippet.length >= 180 ? displaySnippet.trim() + "…" : displaySnippet,
    readMinutes,
  };
}
