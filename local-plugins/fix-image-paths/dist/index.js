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
function fixSrc(src, mdDir) {
  if (!src || !src.startsWith(".")) return null;
  for (let k = 0; k <= 8; k++) {
    const candidate = stripPrefixSegments(src, k);
    if (!candidate) continue;
    try {
      const abs = path.resolve(mdDir, candidate);
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return candidate;
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
