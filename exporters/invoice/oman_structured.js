/**
 * exporters/invoice/oman_structured.js
 *
 * Oman Structured E-Invoice (Fawtara) Status Exporter.
 *
 * Official Oman Fawtara Status:
 * - Oman Tax Authority electronic invoicing framework ("Fawtara") requires authorized taxpayer
 *   onboarding and central portal communication keys.
 * - Direct standalone client-side XML generation without Tax Authority API keys is currently
 *   OFFICIAL_SPECIFICATION_UNAVAILABLE.
 *
 * Compliance:
 * - Does NOT invent custom XML schema or fake clearance endpoints.
 * - Standard Oman VAT Invoice PDF and JSON exports remain fully operational.
 */

export class OmanStructuredInvoiceExporter {
  static export(canonical, opts = {}) {
    return {
      success: false,
      code: "EXPORTER_NOT_IMPLEMENTED",
      error: "exporter_not_implemented",
      status: "OFFICIAL_SPECIFICATION_UNAVAILABLE",
      country: "OM",
      documentType: "invoice",
      format: "xml",
      authority: "Tax Authority (Sultanate of Oman)",
      framework: "Fawtara",
      message: "Oman Fawtara structured e-invoicing is currently in progressive onboarding. Direct standalone client-side XML generation without Tax Authority API keys is not officially supported.",
      governmentSubmission: "NO",
    };
  }
}

export default OmanStructuredInvoiceExporter;
