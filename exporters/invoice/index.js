/**
 * exporters/invoice/index.js
 *
 * Country-aware Invoice Exporters for all 6 GCC countries:
 * QA (Qatar), AE (UAE), SA (Saudi Arabia), BH (Bahrain), KW (Kuwait), OM (Oman)
 *
 * Strict isolation:
 * - VAT rates: SA 15%, BH 10%, AE 5%, OM 5%, QA 0%, KW 0%
 * - Identifiers: SA (15 digits starts with 3), AE TRN (15 digits), BH (15 digits), QA / KW (CR/Tax ref)
 * - Country labels, bilingual headers (Arabic / English)
 * - PDF representation !== Government e-invoice submission
 */

import { generateZatcaQrTlv } from "../saudi_zatca.js";
import { sanitizeFilename } from "../shared/utils.js";

export const INVOICE_COUNTRY_CONFIG = {
  QA: {
    countryName: "Qatar",
    countryNameAr: "دولة قطر",
    currency: "QAR",
    vatRate: 0.0,
    hasVat: false,
    taxIdLabel: "Tax Identification / CR No.",
    taxIdLabelAr: "الرقم الضريبي / السجل التجاري",
    authority: "General Tax Authority (GTA)",
    title: "TAX INVOICE",
    titleAr: "فاتورة ضريبية",
    notes: "Qatar current standard commercial invoice. Standard VAT is not enacted.",
  },
  AE: {
    countryName: "United Arab Emirates",
    countryNameAr: "الإمارات العربية المتحدة",
    currency: "AED",
    vatRate: 0.05,
    hasVat: true,
    taxIdLabel: "Tax Registration Number (TRN)",
    taxIdLabelAr: "رقم التسجيل الضريبي",
    authority: "Federal Tax Authority (FTA)",
    title: "TAX INVOICE",
    titleAr: "فاتورة ضريبية",
    notes: "Federal Decree-Law No. (8) of 2017 on Value Added Tax (5%). Full tax invoice required for B2B > AED 10,000.",
  },
  SA: {
    countryName: "Kingdom of Saudi Arabia",
    countryNameAr: "المملكة العربية السعودية",
    currency: "SAR",
    vatRate: 0.15,
    hasVat: true,
    taxIdLabel: "VAT Registration Number",
    taxIdLabelAr: "الرقم الضريبي للقيمة المضافة",
    authority: "Zakat, Tax and Customs Authority (ZATCA)",
    title: "TAX INVOICE",
    titleAr: "فاتورة ضريبية",
    notes: "ZATCA standard tax invoice layout (15% VAT). PDF document representation.",
  },
  BH: {
    countryName: "Kingdom of Bahrain",
    countryNameAr: "مملكة البحرين",
    currency: "BHD",
    vatRate: 0.10,
    hasVat: true,
    taxIdLabel: "VAT Account Number",
    taxIdLabelAr: "الرقم التعريفي لضريبة القيمة المضافة",
    authority: "National Bureau for Revenue (NBR)",
    title: "TAX INVOICE",
    titleAr: "فاتورة ضريبية",
    notes: "NBR VAT standard rate 10% effective since 1 January 2022.",
  },
  KW: {
    countryName: "State of Kuwait",
    countryNameAr: "دولة الكويت",
    currency: "KWD",
    vatRate: 0.0,
    hasVat: false,
    taxIdLabel: "Commercial Registration / Tax Card",
    taxIdLabelAr: "السجل التجاري / البطاقة الضريبية",
    authority: "Ministry of Finance",
    title: "COMMERCIAL INVOICE",
    titleAr: "فاتورة تجارية",
    notes: "Commercial invoice according to Kuwait Ministry of Commerce standards. VAT is not implemented.",
  },
  OM: {
    countryName: "Sultanate of Oman",
    countryNameAr: "سلطنة عمان",
    currency: "OMR",
    vatRate: 0.05,
    hasVat: true,
    taxIdLabel: "VAT Identification Number (VATIN)",
    taxIdLabelAr: "الرقم التعريفي لضريبة القيمة المضافة",
    authority: "Tax Authority (Sultanate of Oman)",
    title: "TAX INVOICE",
    titleAr: "فاتورة ضريبية",
    notes: "Oman Royal Decree No. 121/2020 on VAT (5%).",
  },
};

/**
 * Country-specific Invoice PDF Exporter
 */
export function exportInvoicePdf(canonical, opts = {}) {
  const countryCode = String(opts.country || canonical.country || "QA").toUpperCase();
  const cfg = INVOICE_COUNTRY_CONFIG[countryCode] || INVOICE_COUNTRY_CONFIG.QA;

  const docId = canonical.id || canonical.invoice_number || "INV-000";
  const issueDate = canonical.issueDate || canonical.issue_date || new Date().toISOString().slice(0, 10);
  const seller = canonical.seller || {};
  const buyer = canonical.buyer || {};
  const items = canonical.items || canonical.line_items || [];
  const total = canonical.total || {};

  // For SA, attach ZATCA Phase 1 QR data
  let qrCodeData = null;
  if (countryCode === "SA") {
    try {
      qrCodeData = generateZatcaQrTlv({
        sellerName: seller.name || seller.legal_name || "",
        vatNumber: seller.taxIdentity?.taxId || seller.tax_id || "",
        timestamp: `${issueDate}T12:00:00`,
        totalWithVat: total.grandTotal ?? canonical.grand_total ?? 0,
        vatTotal: total.tax ?? 0,
      });
    } catch (e) {
      // Non-fatal for PDF preview
    }
  }

  return {
    success: true,
    format: "pdf",
    documentType: "invoice",
    country: countryCode,
    exporter: `invoice-${countryCode.toLowerCase()}-pdf`,
    filename: `${sanitizeFilename(docId)}.pdf`,
    printReady: true,
    config: cfg,
    metadata: {
      title: cfg.title,
      titleAr: cfg.titleAr,
      authority: cfg.authority,
      vatRate: cfg.vatRate,
      hasVat: cfg.hasVat,
      taxIdLabel: cfg.taxIdLabel,
      taxIdLabelAr: cfg.taxIdLabelAr,
      qrCodeData,
      disclaimer: `${cfg.countryName} Invoice PDF representation. Not a government portal submission clearance.`,
    },
  };
}

export default {
  exportInvoicePdf,
  INVOICE_COUNTRY_CONFIG,
};
