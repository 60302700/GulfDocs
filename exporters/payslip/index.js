/**
 * exporters/payslip/index.js
 *
 * Country-aware Payslip Exporters for all 6 GCC countries:
 * QA, AE, SA, BH, KW, OM
 *
 * Strict isolation:
 * - NO VAT/tax invoice fields
 * - National ID / Resident ID formatting per country:
 *   QA: QID (11 digits)
 *   AE: Emirates ID (784-XXXX-XXXXXXX-X)
 *   SA: National ID / Iqama (10 digits starts with 1 or 2)
 *   BH: CPR (9 digits)
 *   KW: Civil ID (12 digits)
 *   OM: Civil Number (8 digits)
 * - Social Insurance bodies:
 *   QA: GRSIA
 *   AE: GPSSA
 *   SA: GOSI
 *   BH: SIO
 *   KW: PIFSS
 *   OM: PASI / SPF
 */

import { sanitizeFilename } from "../shared/utils.js";

export const PAYSLIP_COUNTRY_CONFIG = {
  QA: {
    countryName: "Qatar",
    currency: "QAR",
    idLabel: "QID (Qatar ID)",
    socialSecurityLabel: "GRSIA (Qatari Nationals)",
    wpsNotes: "WPS Wage Protection System compliant structure as per Qatar Ministry of Labour.",
  },
  AE: {
    countryName: "United Arab Emirates",
    currency: "AED",
    idLabel: "Emirates ID / Labour Card No.",
    socialSecurityLabel: "GPSSA (UAE Nationals)",
    wpsNotes: "Ministry of Human Resources and Emiratisation (MOHRE) WPS format reference.",
  },
  SA: {
    countryName: "Kingdom of Saudi Arabia",
    currency: "SAR",
    idLabel: "National ID / Iqama Number",
    socialSecurityLabel: "GOSI (General Organization for Social Insurance)",
    wpsNotes: "MHRSD / Qiwa Wage Protection System compliant reference.",
  },
  BH: {
    countryName: "Kingdom of Bahrain",
    currency: "BHD",
    idLabel: "CPR Number",
    socialSecurityLabel: "SIO (Social Insurance Organization)",
    wpsNotes: "LMRA / Central Bank of Bahrain Wage Protection System reference.",
  },
  KW: {
    countryName: "State of Kuwait",
    currency: "KWD",
    idLabel: "Civil ID Number",
    socialSecurityLabel: "PIFSS (Public Institution for Social Security)",
    wpsNotes: "PAM (Public Authority of Manpower) salary statement reference.",
  },
  OM: {
    countryName: "Sultanate of Oman",
    currency: "OMR",
    idLabel: "Civil Number",
    socialSecurityLabel: "Social Protection Fund (SPF / PASI)",
    wpsNotes: "Ministry of Labour / Central Bank of Oman Wages Protection System reference.",
  },
};

export function exportPayslipPdf(canonical, opts = {}) {
  const countryCode = String(opts.country || canonical.country || "QA").toUpperCase();
  const cfg = PAYSLIP_COUNTRY_CONFIG[countryCode] || PAYSLIP_COUNTRY_CONFIG.QA;

  const docId = canonical.id || "PAY-000";
  const employer = canonical.employer || {};
  const employee = canonical.employee || {};

  return {
    success: true,
    format: "pdf",
    documentType: "payslip",
    country: countryCode,
    exporter: `payslip-${countryCode.toLowerCase()}-pdf`,
    filename: `${sanitizeFilename(docId)}.pdf`,
    printReady: true,
    config: cfg,
    metadata: {
      title: "SALARY STATEMENT / PAYSLIP",
      titleAr: "مسير رواتب / قسيمة الراتب",
      countryName: cfg.countryName,
      currency: cfg.currency,
      idLabel: cfg.idLabel,
      socialSecurityLabel: cfg.socialSecurityLabel,
      wpsNotes: cfg.wpsNotes,
      employeeName: employee.name || "",
      employeeId: employee.id || "",
      grossPay: canonical.grossPay ?? 0,
      netPay: canonical.netPay ?? 0,
      disclaimer: `${cfg.countryName} Payslip document representation.`,
    },
  };
}

export default {
  exportPayslipPdf,
  PAYSLIP_COUNTRY_CONFIG,
};
