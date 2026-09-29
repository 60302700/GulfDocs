/**
 * exporters/shared/utils.js
 *
 * Security & Sanitization utilities for Exporters
 */

/**
 * Sanitizes a string for safe use in file downloads.
 * Strips path traversal characters (../, ..\, /, \), control chars, quotes, and dangerous symbols.
 */
export function sanitizeFilename(name, fallback = "document") {
  if (!name || typeof name !== "string") return fallback;
  let cleaned = name
    .replace(/[\x00-\x1f\x7f]/g, "")
    .replace(/\.\.+/g, "")
    .replace(/[/\\]+/g, "-")
    .replace(/["'<>|:*?`]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .trim();
  if (!cleaned) return fallback;
  return cleaned.slice(0, 100);
}

/**
 * XML escape utility for structured outputs
 */
export function escapeXml(s) {
  if (s == null) return "";
  return String(s).replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
}

export default {
  sanitizeFilename,
  escapeXml,
};
