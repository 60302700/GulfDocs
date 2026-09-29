/**
 * exporters/generic/json.js
 *
 * Serializes a canonical document to deterministic, normalized JSON.
 * Does not scrape the DOM. Values remain normalized.
 */

export function exportCanonicalJson(canonical, opts = {}) {
  if (!canonical || typeof canonical !== "object") {
    throw new Error("Invalid canonical document provided to exportCanonicalJson");
  }

  const jsonString = JSON.stringify(canonical, null, 2);

  return {
    success: true,
    format: "json",
    documentType: canonical.documentType || opts.documentType || "document",
    country: canonical.country || opts.country || "GCC",
    exporter: "generic-json",
    data: jsonString,
    file: {
      content: jsonString,
      mimeType: "application/json",
      filename: `${canonical.id || "document"}.json`,
    },
  };
}

export default { exportCanonicalJson };
