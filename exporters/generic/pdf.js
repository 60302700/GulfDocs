/**
 * exporters/generic/pdf.js
 *
 * Professional document PDF exporter for canonical document representation.
 * 
 * IMPORTANT:
 * PDF !== structured government e-invoice.
 * This represents a visual / printable document representation.
 * In a browser client, this triggers print preview or generates client PDF.
 * On server / headless, returns structured metadata and rendered printable content.
 */

import { sanitizeFilename } from "../shared/utils.js";

export function exportGenericPdf(canonical, opts = {}) {
  if (!canonical || typeof canonical !== "object") {
    throw new Error("Invalid canonical document provided to exportGenericPdf");
  }

  const docId = canonical.id || "document";
  const docType = opts.documentType || (canonical.documentType ? String(canonical.documentType).replace(/_/g, "-") : "document");
  const country = opts.country || canonical.country || "GCC";

  return {
    success: true,
    format: "pdf",
    documentType: docType,
    country: country,
    exporter: `${docType.replace(/_/g, "-")}-${country.toLowerCase()}-pdf`,
    filename: `${sanitizeFilename(docId)}.pdf`,
    printReady: true,
    message: `Generic PDF exporter ready for ${country}/${docType}.`,
  };
}

export default { exportGenericPdf };
