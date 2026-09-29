/**
 * exporters/generic/json.js
 *
 * Serializes a canonical document to deterministic, normalized JSON.
 * Does not scrape the DOM. Values remain normalized.
 */

import { sanitizeFilename } from "../shared/utils.js";

export function exportCanonicalJson(canonical, opts = {}) {
  if (!canonical || typeof canonical !== "object") {
    throw new Error("Invalid canonical document provided to exportCanonicalJson");
  }

  const jsonString = JSON.stringify(canonical, null, 2);
  const docType = opts.documentType || (canonical.documentType ? String(canonical.documentType).replace(/_/g, "-") : "document");
  const country = opts.country || canonical.country || "GCC";

  return {
    success: true,
    format: "json",
    documentType: docType,
    country: country,
    exporter: "generic-json",
    data: jsonString,
    file: {
      content: jsonString,
      mimeType: "application/json",
      filename: `${sanitizeFilename(canonical.id || "document")}.json`,
    },
  };
}

export default { exportCanonicalJson };
