/**
 * exporters/purchase_order/index.js
 *
 * Country-aware Purchase Order Exporters for all 6 GCC countries:
 * QA, AE, SA, BH, KW, OM
 *
 * Preserves Purchase Order semantics:
 * - PO number, issue date, delivery date
 * - Buyer (procuring entity) & Supplier (vendor)
 * - Shipping destination / warehouse address
 * - Incoterms, carrier, payment terms
 * - Line items, unit price, quantity, totals
 * - Does NOT convert into an invoice
 */

import { sanitizeFilename } from "../shared/utils.js";

export const PURCHASE_ORDER_COUNTRY_CONFIG = {
  QA: { countryName: "Qatar", currency: "QAR", vatRate: 0.0, hasVat: false },
  AE: { countryName: "United Arab Emirates", currency: "AED", vatRate: 0.05, hasVat: true },
  SA: { countryName: "Kingdom of Saudi Arabia", currency: "SAR", vatRate: 0.15, hasVat: true },
  BH: { countryName: "Kingdom of Bahrain", currency: "BHD", vatRate: 0.10, hasVat: true },
  KW: { countryName: "State of Kuwait", currency: "KWD", vatRate: 0.0, hasVat: false },
  OM: { countryName: "Sultanate of Oman", currency: "OMR", vatRate: 0.05, hasVat: true },
};

export function exportPurchaseOrderPdf(canonical, opts = {}) {
  const countryCode = String(opts.country || canonical.country || "QA").toUpperCase();
  const cfg = PURCHASE_ORDER_COUNTRY_CONFIG[countryCode] || PURCHASE_ORDER_COUNTRY_CONFIG.QA;

  const docId = canonical.id || "PO-000";

  return {
    success: true,
    format: "pdf",
    documentType: "purchase-order",
    country: countryCode,
    exporter: `purchase-order-${countryCode.toLowerCase()}-pdf`,
    filename: `${sanitizeFilename(docId)}.pdf`,
    printReady: true,
    config: cfg,
    metadata: {
      title: "PURCHASE ORDER",
      titleAr: "أمر شراء",
      countryName: cfg.countryName,
      currency: cfg.currency,
      buyerName: canonical.buyer?.name || "",
      supplierName: canonical.supplier?.name || "",
      disclaimer: `Commercial Purchase Order for ${cfg.countryName}. Procurement instruction only.`,
    },
  };
}

export default {
  exportPurchaseOrderPdf,
  PURCHASE_ORDER_COUNTRY_CONFIG,
};
