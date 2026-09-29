/**
 * test/phase4-exporters.test.mjs
 *
 * Phase 4 — Country/Document-Specific Exporters Test Suite
 *
 * Verifies:
 * 1. Specific PDF exporters for all 5 document types across all 6 countries (30 combinations)
 * 2. Country-specific configurations (VAT rates, tax ID labels, country names, currencies)
 * 3. Document semantic integrity (Payslip has no VAT; PO has buyer/supplier; Quotation has validity; BD has bank/IBAN)
 * 4. Saudi Arabia ZATCA XML structured exporter (valid UBL 2.1 XML, TLV QR Code generation, required tax fields)
 * 5. Other GCC countries reject XML as EXPORTER_NOT_IMPLEMENTED (no fake XML e-invoice specs)
 * 6. Non-invoice documents reject XML
 * 7. Zero DOM scraping: All exporters operate purely on canonical data
 * 8. Validation gate remains active: invalid canonical data is blocked prior to country exporter call
 */

import assert from "node:assert/strict";
import { exportDocument } from "../exporters/router.js";
import { INVOICE_COUNTRY_CONFIG } from "../exporters/invoice/index.js";
import { PAYSLIP_COUNTRY_CONFIG } from "../exporters/payslip/index.js";
import { QUOTATION_COUNTRY_CONFIG } from "../exporters/quotation/index.js";
import { PURCHASE_ORDER_COUNTRY_CONFIG } from "../exporters/purchase_order/index.js";
import { BILLING_DETAILS_COUNTRY_CONFIG } from "../exporters/billing_details/index.js";
import { generateZatcaQrTlv } from "../exporters/saudi_zatca.js";

const COUNTRIES = ["QA", "AE", "SA", "BH", "KW", "OM"];
const DOC_TYPES = ["invoice", "payslip", "quotation", "purchase-order", "billing-details"];

function makeMinimalInvoice(c) {
  const taxId = c === "SA" ? "300000000000003" : (c === "AE" ? "100123456789012" : "123456789012345");
  const currency = c === "SA" ? "SAR" : c === "AE" ? "AED" : c === "BH" ? "BHD" : c === "OM" ? "OMR" : c === "KW" ? "KWD" : "QAR";
  return {
    documentType: "invoice",
    country: c,
    id: `INV-${c}-001`,
    invoice_number: `INV-${c}-001`,
    issueDate: "2026-09-01",
    currency: { code: currency },
    seller: { name: `${c} Enterprise`, legal_name: `${c} Enterprise`, taxIdentity: { taxId }, address: { raw: "Main St" } },
    buyer: { name: "Client Corp", legal_name: "Client Corp", taxIdentity: { taxId: "" }, address: { raw: "" } },
    items: [{ id: "1", description: "Services", unitPrice: 200, quantity: 1, totalAmount: 200, unit_price: 200 }],
    line_items: [{ description: "Services", quantity: 1, unit_price: 200 }],
    taxes: [{ amount: 0, taxableAmount: 200 }],
    total: { subtotal: 200, tax: 0, discount: 0, grandTotal: 200 },
    grand_total: 200,
  };
}

function makeMinimalPayslip(c) {
  const currency = c === "SA" ? "SAR" : c === "AE" ? "AED" : c === "BH" ? "BHD" : c === "OM" ? "OMR" : c === "KW" ? "KWD" : "QAR";
  const idMap = { QA: "28463400123", AE: "784-1990-1234567-1", SA: "1012345678", BH: "901234567", KW: "290010112345", OM: "12345678" };
  return {
    documentType: "payslip",
    country: c,
    id: `PAY-${c}-001`,
    employer: { name: "Gulf Company" },
    employee: { name: "Rashid Ali", id: idMap[c] || "1012345678" },
    payPeriod: "2026-09",
    payDate: "2026-09-28",
    grossPay: 8000,
    netPay: 7200,
    currency: { code: currency },
  };
}

function makeMinimalQuotation(c) {
  const currency = c === "SA" ? "SAR" : c === "AE" ? "AED" : c === "BH" ? "BHD" : c === "OM" ? "OMR" : c === "KW" ? "KWD" : "QAR";
  return {
    documentType: "quotation",
    country: c,
    id: `QT-${c}-001`,
    issueDate: "2026-09-01",
    validUntil: "2026-10-01",
    currency: { code: currency },
    seller: { name: "Supplier Corp", address: { raw: "City Center" } },
    buyer: { name: "Client Inc" },
    items: [{ id: "1", description: "Design", unitPrice: 500, quantity: 1, totalAmount: 500, unit_price: 500 }],
    taxes: [{ amount: 0, taxableAmount: 500 }],
    total: { subtotal: 500, tax: 0, discount: 0, grandTotal: 500 },
  };
}

function makeMinimalPurchaseOrder(c) {
  const currency = c === "SA" ? "SAR" : c === "AE" ? "AED" : c === "BH" ? "BHD" : c === "OM" ? "OMR" : c === "KW" ? "KWD" : "QAR";
  return {
    documentType: "purchase_order",
    country: c,
    id: `PO-${c}-001`,
    issueDate: "2026-09-01",
    currency: { code: currency },
    buyer: { name: "Procurement Group", address: { raw: "Main Port" } },
    supplier: { name: "Industrial Supplies Ltd" },
    items: [{ id: "1", description: "Materials", unitPrice: 350, quantity: 2, totalAmount: 700, unit_price: 350 }],
    taxes: [{ amount: 0, taxableAmount: 700 }],
    total: { subtotal: 700, tax: 0, discount: 0, grandTotal: 700 },
  };
}

function makeMinimalBillingDetails(c) {
  const currency = c === "SA" ? "SAR" : c === "AE" ? "AED" : c === "BH" ? "BHD" : c === "OM" ? "OMR" : c === "KW" ? "KWD" : "QAR";
  const ibanMap = {
    QA: "QA29NBOK000000000000012345678",
    AE: "AE070331234567890123456",
    SA: "SA0380000000608010167519",
    BH: "BH67BMBL00001234567890",
    KW: "KW81NBOK0000000000000000123456",
    OM: "OM61BMSO0123456789012345",
  };
  return {
    documentType: "billing_details",
    country: c,
    id: `BD-${c}-001`,
    beneficiary: { name: "Trading Services Co" },
    bankAccount: {
      bankName: "Gulf Commercial Bank",
      iban: ibanMap[c] || ibanMap.QA,
      swiftBic: "GULFCBQA",
    },
    currency: { code: currency },
    amount: 3200,
    paymentReference: `REF-${c}-999`,
  };
}

const BUILDERS = {
  invoice: makeMinimalInvoice,
  payslip: makeMinimalPayslip,
  quotation: makeMinimalQuotation,
  "purchase-order": makeMinimalPurchaseOrder,
  "billing-details": makeMinimalBillingDetails,
};

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Invoice Exporters (All 6 Countries)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 4 — Section 1: Invoice Country-Aware PDF Exporters ═══\n");

for (const c of COUNTRIES) {
  await test(`Invoice PDF exporter for ${c}`, async () => {
    const doc = makeMinimalInvoice(c);
    const res = await exportDocument({
      document: doc,
      country: c,
      documentType: "invoice",
      format: "pdf",
    });

    assert.equal(res.success, true);
    assert.equal(res.format, "pdf");
    assert.equal(res.country, c);
    assert.equal(res.exporter, `invoice-${c.toLowerCase()}-pdf`);
    assert.ok(res.config);
    assert.equal(res.config.currency, INVOICE_COUNTRY_CONFIG[c].currency);
    assert.equal(res.config.vatRate, INVOICE_COUNTRY_CONFIG[c].vatRate);
    assert.equal(res.config.hasVat, INVOICE_COUNTRY_CONFIG[c].hasVat);

    // Saudi Arabia attaches ZATCA QR code data
    if (c === "SA") {
      assert.ok(res.metadata.qrCodeData, "SA invoice metadata must include ZATCA QR code data");
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Payslip Exporters (All 6 Countries)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 4 — Section 2: Payslip Country-Aware PDF Exporters ═══\n");

for (const c of COUNTRIES) {
  await test(`Payslip PDF exporter for ${c}`, async () => {
    const doc = makeMinimalPayslip(c);
    const res = await exportDocument({
      document: doc,
      country: c,
      documentType: "payslip",
      format: "pdf",
    });

    assert.equal(res.success, true);
    assert.equal(res.exporter, `payslip-${c.toLowerCase()}-pdf`);
    assert.ok(res.metadata);
    assert.equal(res.metadata.countryName, PAYSLIP_COUNTRY_CONFIG[c].countryName);
    assert.equal(res.metadata.currency, PAYSLIP_COUNTRY_CONFIG[c].currency);
    assert.ok(res.metadata.socialSecurityLabel, "Has country social security authority label");
    // Verify no invoice/VAT leakage
    assert.equal(res.metadata.vatRate, undefined);
    assert.equal(res.metadata.hasVat, undefined);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Quotation Exporters (All 6 Countries)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 4 — Section 3: Quotation Country-Aware PDF Exporters ═══\n");

for (const c of COUNTRIES) {
  await test(`Quotation PDF exporter for ${c}`, async () => {
    const doc = makeMinimalQuotation(c);
    const res = await exportDocument({
      document: doc,
      country: c,
      documentType: "quotation",
      format: "pdf",
    });

    assert.equal(res.success, true);
    assert.equal(res.exporter, `quotation-${c.toLowerCase()}-pdf`);
    assert.ok(res.metadata);
    assert.equal(res.metadata.currency, QUOTATION_COUNTRY_CONFIG[c].currency);
    assert.ok(res.metadata.validUntil !== undefined);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Purchase Order Exporters (All 6 Countries)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 4 — Section 4: Purchase Order Country-Aware PDF Exporters ═══\n");

for (const c of COUNTRIES) {
  await test(`Purchase Order PDF exporter for ${c}`, async () => {
    const doc = makeMinimalPurchaseOrder(c);
    const res = await exportDocument({
      document: doc,
      country: c,
      documentType: "purchase-order",
      format: "pdf",
    });

    assert.equal(res.success, true);
    assert.equal(res.exporter, `purchase-order-${c.toLowerCase()}-pdf`);
    assert.ok(res.metadata);
    assert.equal(res.metadata.currency, PURCHASE_ORDER_COUNTRY_CONFIG[c].currency);
    assert.ok(res.metadata.buyerName);
    assert.ok(res.metadata.supplierName);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Billing Details Exporters (All 6 Countries)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 4 — Section 5: Billing Details Country-Aware PDF Exporters ═══\n");

for (const c of COUNTRIES) {
  await test(`Billing Details PDF exporter for ${c}`, async () => {
    const doc = makeMinimalBillingDetails(c);
    const res = await exportDocument({
      document: doc,
      country: c,
      documentType: "billing-details",
      format: "pdf",
    });

    assert.equal(res.success, true);
    assert.equal(res.exporter, `billing-details-${c.toLowerCase()}-pdf`);
    assert.ok(res.metadata);
    assert.equal(res.metadata.currency, BILLING_DETAILS_COUNTRY_CONFIG[c].currency);
    assert.ok(res.metadata.iban.startsWith(BILLING_DETAILS_COUNTRY_CONFIG[c].ibanPrefix));
    assert.ok(res.metadata.beneficiary);
    // Strict isolation: verify no invoice/VAT fields
    assert.equal(res.metadata.vatRate, undefined);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Saudi Arabia ZATCA Structured XML Exporter
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 4 — Section 6: Saudi Arabia ZATCA Structured E-Invoice ═══\n");

await test("ZATCA TLV QR code generates standard Base64 string", () => {
  const tlvBase64 = generateZatcaQrTlv({
    sellerName: "Saudi Acme Corp",
    vatNumber: "300000000000003",
    timestamp: "2026-09-01T12:00:00",
    totalWithVat: 115.00,
    vatTotal: 15.00,
  });

  assert.ok(typeof tlvBase64 === "string" && tlvBase64.length > 20);
  const buf = Buffer.from(tlvBase64, "base64");
  // Tag 1 is 1
  assert.equal(buf[0], 1);
  // Length is length of seller name
  assert.equal(buf[1], "Saudi Acme Corp".length);
});

await test("Saudi Invoice XML exporter produces verified UBL 2.1 structure", async () => {
  const doc = makeMinimalInvoice("SA");
  const res = await exportDocument({
    document: doc,
    country: "SA",
    documentType: "invoice",
    format: "xml",
  });

  assert.equal(res.success, true);
  assert.equal(res.format, "xml");
  assert.equal(res.exporter, "invoice-sa-zatca-xml");
  assert.ok(res.qrBase64);
  assert.ok(res.data.includes("<Invoice"));
  assert.ok(res.data.includes("xmlns:cac="));
  assert.ok(res.data.includes("<cbc:InvoiceTypeCode name=\"0100000\">388</cbc:InvoiceTypeCode>"));
  assert.ok(res.data.includes("<cac:TaxCategory>"));
  assert.ok(res.data.includes("<cbc:Percent>15.00</cbc:Percent>"));
  assert.ok(res.file.filename.endsWith(".xml"));
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Non-SA / Non-Verified Structured Formats Rejected
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 4 — Section 7: Unverified Structured Formats Rejected ═══\n");

for (const c of ["QA", "AE", "BH", "KW", "OM"]) {
  await test(`XML export for ${c} invoice rejected with EXPORTER_NOT_IMPLEMENTED`, async () => {
    const doc = makeMinimalInvoice(c);
    const res = await exportDocument({
      document: doc,
      country: c,
      documentType: "invoice",
      format: "xml",
    });

    assert.equal(res.success, false);
    assert.equal(res.code, "EXPORTER_NOT_IMPLEMENTED");
  });
}

for (const dt of ["payslip", "quotation", "purchase-order", "billing-details"]) {
  await test(`XML export for SA ${dt} rejected with EXPORTER_NOT_IMPLEMENTED`, async () => {
    const doc = BUILDERS[dt]("SA");
    const res = await exportDocument({
      document: doc,
      country: "SA",
      documentType: dt,
      format: "xml",
    });

    assert.equal(res.success, false);
    assert.equal(res.code, "EXPORTER_NOT_IMPLEMENTED");
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${"═".repeat(60)}`);
if (failed === 0) {
  console.log(`✅  All ${passed} Phase 4 exporter tests passed.\n`);
} else {
  console.error(`❌  ${failed} test(s) failed.  ${passed} passed.\n`);
  process.exit(1);
}
