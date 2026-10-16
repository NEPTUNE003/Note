import fs from "node:fs";
import path from "node:path";

const MEDIA_TAGS = new Set(["img", "video", "audio", "source", "iframe"]);

// Drop k leading ".." segments and any "." / empty segments.
function stripPrefixSegments(src, k) {
  const segs = src.split("/").filter((s) => s !== "" && s !== ".");
  let i = 0;
  while (i < k && segs[i] === "..") i++;
  if (i !== k) return null;
  return segs.slice(i).join("/");
}

// crawl-links (shortest strategy) re-anchors relative media srcs with the
// page's pathToRoot, producing paths like "../.././image/x" from a source
// "../image/x". Pages are emitted as flat .html without redirects, so the
// re-anchored path 404s in the browser. Invert the rewrite: try stripping
// leading "../" segments (ascending) and keep the first candidate that
// resolves to a real file on disk relative to the markdown file's directory.

// The rewritten src is slug-lowercased, but the source tree keeps the
// original case (e.g. "电阻Y形…jpeg" vs "电阻y形…jpeg"), and Linux CI is
// case-sensitive — resolve each path segment case-insensitively instead.
function resolvePathCI(abs) {
  if (fs.existsSync(abs)) return abs;
  const dir = path.dirname(abs);
  if (dir === abs) return null;
  const realDir = resolvePathCI(dir);
  if (!realDir) return null;
  try {
    const base = path.basename(abs);
    const hit = fs.readdirSync(realDir).find((n) => n.toLowerCase() === base.toLowerCase());
    return hit ? path.join(realDir, hit) : null;
  } catch {
    return null;
  }
}

function fixSrc(src, mdDir) {
  if (!src || !src.startsWith(".")) return null;
  for (let k = 0; k <= 8; k++) {
    const candidate = stripPrefixSegments(src, k);
    if (!candidate) continue;
    try {
      const abs = path.resolve(mdDir, candidate);
      const real = resolvePathCI(abs);
      if (real && fs.statSync(real).isFile()) return candidate;
    } catch {
      // ignore invalid paths
    }
  }
  return null;
}

function walk(node, mdDir) {
  if (node.type === "element" && node.properties && MEDIA_TAGS.has(node.tagName)) {
    const src = node.properties.src;
    if (typeof src === "string") {
      const fixed = fixSrc(src, mdDir);
      if (fixed) node.properties.src = fixed;
    }
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, mdDir);
  }
}

const FixImagePaths = () => {
  return {
    name: "FixImagePaths",
    htmlPlugins(ctx) {
      return [
        () => {
          return (tree, file) => {
            const filePath = file.data?.filePath ?? file.path ?? null;
            if (!filePath) return;
            const mdDir = path.dirname(filePath);
            walk(tree, mdDir);
          };
        },
      ];
    },
  };
};

export default FixImagePaths;
export { FixImagePaths };
