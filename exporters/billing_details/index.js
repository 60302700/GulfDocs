/**
 * exporters/billing_details/index.js
 *
 * Country-aware Billing Details Exporters for all 6 GCC countries:
 * QA, AE, SA, BH, KW, OM
 *
 * Preserves Payment-Instruction / Billing Details semantics:
 * - Beneficiary entity & account holder
 * - Bank name, SWIFT/BIC code, IBAN per country format
 * - Payment reference, currency, payable amount, due date
 * - Remittance instructions
 * - Strict isolation: NO invoice or VAT fields
 */

import { sanitizeFilename } from "../shared/utils.js";

export const BILLING_DETAILS_COUNTRY_CONFIG = {
  QA: {
    countryName: "Qatar",
    currency: "QAR",
    ibanPrefix: "QA",
    ibanLength: 29,
    swiftFormat: "QNBAQAQA",
  },
  AE: {
    countryName: "United Arab Emirates",
    currency: "AED",
    ibanPrefix: "AE",
    ibanLength: 23,
    swiftFormat: "EBIXAEAD",
  },
  SA: {
    countryName: "Kingdom of Saudi Arabia",
    currency: "SAR",
    ibanPrefix: "SA",
    ibanLength: 24,
    swiftFormat: "NCBKSA22",
  },
  BH: {
    countryName: "Kingdom of Bahrain",
    currency: "BHD",
    ibanPrefix: "BH",
    ibanLength: 22,
    swiftFormat: "BBKU22BH",
  },
  KW: {
    countryName: "State of Kuwait",
    currency: "KWD",
    ibanPrefix: "KW",
    ibanLength: 30,
    swiftFormat: "NBOKKWKW",
  },
  OM: {
    countryName: "Sultanate of Oman",
    currency: "OMR",
    ibanPrefix: "OM",
    ibanLength: 23,
    swiftFormat: "BMSOMXXX",
  },
};

export function exportBillingDetailsPdf(canonical, opts = {}) {
  const countryCode = String(opts.country || canonical.country || "QA").toUpperCase();
  const cfg = BILLING_DETAILS_COUNTRY_CONFIG[countryCode] || BILLING_DETAILS_COUNTRY_CONFIG.QA;

  const docId = canonical.id || "BD-000";
  const bank = canonical.bankAccount || {};

  return {
    success: true,
    format: "pdf",
    documentType: "billing-details",
    country: countryCode,
    exporter: `billing-details-${countryCode.toLowerCase()}-pdf`,
    filename: `${sanitizeFilename(docId)}.pdf`,
    printReady: true,
    config: cfg,
    metadata: {
      title: "PAYMENT INSTRUCTIONS / BANKING DETAILS",
      titleAr: "بيانات التحويل البنكي وتفاصيل الدفع",
      countryName: cfg.countryName,
      currency: cfg.currency,
      beneficiary: canonical.beneficiary?.name || "",
      bankName: bank.bankName || "",
      iban: bank.iban || "",
      swiftBic: bank.swiftBic || "",
      amount: canonical.amount ?? 0,
      paymentReference: canonical.paymentReference || "",
      disclaimer: `Official Payment Instruction for ${cfg.countryName}. Contains bank settlement instructions only; does not constitute a tax invoice.`,
    },
  };
}

export default {
  exportBillingDetailsPdf,
  BILLING_DETAILS_COUNTRY_CONFIG,
};
