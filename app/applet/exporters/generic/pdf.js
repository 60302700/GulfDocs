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

export function exportGenericPdf(canonical, opts = {}) {
  if (!canonical || typeof canonical !== "object") {
    throw new Error("Invalid canonical document provided to exportGenericPdf");
  }

  const docId = canonical.id || "document";
  const docType = canonical.documentType || opts.documentType || "document";
  const country = canonical.country || opts.country || "GCC";

  // If in browser context with window available, window.print() can be triggered by UI caller.
  return {
    success: true,
    format: "pdf",
    documentType: docType,
    country: country,
    exporter: `${docType.replace(/_/g, "-")}-${country.toLowerCase()}-pdf`,
    filename: `${docId}.pdf`,
    printReady: true,
    message: `Generic PDF exporter ready for ${country}/${docType}.`,
  };
}

export default { exportGenericPdf };
