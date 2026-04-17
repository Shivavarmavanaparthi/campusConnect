/**
 * Escape plain text for LaTeX (outside verbatim). URLs for \\href first arg use escapeHref.
 */
export function escapeLatex(text) {
  if (text == null) return "";
  return String(text).replace(/\\/g, "\\textbackslash{}").replace(/[&%$#_{}~^]/g, (ch) => {
    const map = {
      "&": "\\&",
      "%": "\\%",
      $: "\\$",
      "#": "\\#",
      _: "\\_",
      "{": "\\{",
      "}": "\\}",
      "~": "\\textasciitilde{}",
      "^": "\\textasciicircum{}",
    };
    return map[ch] ?? ch;
  });
}

/** Minimal escaping for URLs inside \\href{...}{} */
export function escapeHrefUrl(url) {
  if (url == null) return "";
  return String(url).replace(/\\/g, "\\textbackslash{}").replace(/([%$#_{}~^])/g, (ch) => {
    const map = {
      "%": "\\%",
      $: "\\$",
      "#": "\\#",
      _: "\\_",
      "{": "\\{",
      "}": "\\}",
      "~": "\\textasciitilde{}",
      "^": "\\textasciicircum{}",
    };
    return map[ch] ?? ch;
  });
}