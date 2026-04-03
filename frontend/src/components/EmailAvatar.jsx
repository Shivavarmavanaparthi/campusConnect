import { useMemo } from "react";

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function getInitials(name, email) {
  const src = (name || "").trim() || (email || "").trim();
  if (!src) return "?";
  const parts = src.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) {
    const s = parts[0].slice(0, 2).toUpperCase();
    return s || "?";
  }
  return (
    (parts[0][0] || "").toUpperCase() + (parts[1][0] || "").toUpperCase()
  );
}

export default function EmailAvatar({
  email,
  name,
  size = 48,
  className = "",
}) {
  const { initials, svgDataUrl } = useMemo(() => {
    const seed = `${email || ""}`.trim() || `${name || ""}`.trim();
    const h = hashString(seed);

    const hue1 = h % 360;
    const hue2 = (h * 7) % 360;
    const hue3 = (h * 13) % 360;

    const initialsInner = getInitials(name, email);

    // Simple “galaxy-ish” deterministic SVG based on hash.
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue1} 90% 60%)"/>
      <stop offset="0.55" stop-color="hsl(${hue2} 90% 60%)"/>
      <stop offset="1" stop-color="hsl(${hue3} 90% 60%)"/>
    </linearGradient>
    <radialGradient id="r" cx="30%" cy="25%" r="75%">
      <stop offset="0" stop-color="rgba(255,255,255,0.75)"/>
      <stop offset="1" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="64" height="64" rx="32" fill="url(#g)"/>
  <circle cx="${(h % 34) + 15}" cy="${((h >> 4) % 34) + 10}" r="${
      (h % 10) + 8
    }" fill="url(#r)"/>
  <g fill="rgba(255,255,255,0.9)">
    ${Array.from({ length: 18 })
      .map((_, i) => {
        const x = (h + i * 37) % 64;
        const y = (h + i * 91) % 64;
        const r = ((h + i * 17) % 5) + 1.2;
        const o = 0.35 + (((h + i * 29) % 100) / 100) * 0.55;
        return `<circle cx="${x}" cy="${y}" r="${r.toFixed(
          1
        )}" opacity="${o.toFixed(2)}"/>`;
      })
      .join("")}
  </g>
  <text x="50%" y="54%" text-anchor="middle" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="18" font-weight="700" fill="rgba(255,255,255,0.96)">
    ${initialsInner}
  </text>
</svg>`.trim();

    return {
      initials: initialsInner,
      svgDataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    };
  }, [email, name, size]);

  return (
    <img
      src={svgDataUrl}
      alt={initials}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      draggable={false}
    />
  );
}

