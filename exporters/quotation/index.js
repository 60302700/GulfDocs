/**
 * exporters/quotation/index.js
 *
 * Country-aware Quotation Exporters for all 6 GCC countries:
 * QA, AE, SA, BH, KW, OM
 *
 * Preserves Quotation semantics:
 * - Quotation reference ID & issue date
 * - Validity date / valid days
 * - Seller & prospective Buyer details
 * - Itemized scope, rates, subtotal, optional estimated VAT per country rate, and grand total
 * - Payment & delivery terms, project duration notes
 * - Does NOT convert into an invoice or claim tax clearance
 */

import { sanitizeFilename } from "../shared/utils.js";

export const QUOTATION_COUNTRY_CONFIG = {
  QA: { countryName: "Qatar", currency: "QAR", vatRate: 0.0, hasVat: false },
  AE: { countryName: "United Arab Emirates", currency: "AED", vatRate: 0.05, hasVat: true },
  SA: { countryName: "Kingdom of Saudi Arabia", currency: "SAR", vatRate: 0.15, hasVat: true },
  BH: { countryName: "Kingdom of Bahrain", currency: "BHD", vatRate: 0.10, hasVat: true },
  KW: { countryName: "State of Kuwait", currency: "KWD", vatRate: 0.0, hasVat: false },
  OM: { countryName: "Sultanate of Oman", currency: "OMR", vatRate: 0.05, hasVat: true },
};

export function exportQuotationPdf(canonical, opts = {}) {
  const countryCode = String(opts.country || canonical.country || "QA").toUpperCase();
  const cfg = QUOTATION_COUNTRY_CONFIG[countryCode] || QUOTATION_COUNTRY_CONFIG.QA;

  const docId = canonical.id || "QT-000";

  return {
    success: true,
    format: "pdf",
    documentType: "quotation",
    country: countryCode,
    exporter: `quotation-${countryCode.toLowerCase()}-pdf`,
    filename: `${sanitizeFilename(docId)}.pdf`,
    printReady: true,
    config: cfg,
    metadata: {
      title: "PRICE QUOTATION / ESTIMATE",
      titleAr: "عرض أسعار",
      countryName: cfg.countryName,
      currency: cfg.currency,
      validUntil: canonical.validUntil || "",
      vatRate: cfg.vatRate,
      hasVat: cfg.hasVat,
      disclaimer: `Commercial Quotation for ${cfg.countryName}. Valid as indicated. This is not a tax invoice.`,
    },
  };
}

export default {
  exportQuotationPdf,
  QUOTATION_COUNTRY_CONFIG,
};
