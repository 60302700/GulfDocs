/**
 * test/phase3-router.test.mjs
 *
 * Phase 3 — Exporter Router Tests
 *
 * Comprehensive test suite verifying:
 * 1. Correct exporter selected across all 6 countries × 5 document types (30 combinations)
 * 2. PDF routing for all 30 combinations
 * 3. JSON routing for all 30 combinations
 * 4. Unsupported exporter combinations rejected with structured error
 * 5. Unsupported formats rejected with structured error
 * 6. Validation gate: invalid documents blocked before routing to exporter
 * 7. Country switching
 * 8. Document switching
 * 9. Existing SA ZATCA XML exporter routed correctly
 * 10. Non-SA XML rejected with EXPORTER_NOT_IMPLEMENTED (never falling back to wrong exporter)
 * 11. No DOM dependency (pure canonical in, structured result out)
 * 12. Consistent result structure (success, format, documentType, country, exporter, file)
 */

import assert from "node:assert/strict";
import {
  exportDocument,
  routeExport,
  SUPPORTED_COUNTRIES,
  SUPPORTED_DOC_TYPES,
  normalizeCountry,
  normalizeDocType,
  normalizeFormat,
} from "../exporters/router.js";
import { getRules } from "../rules/index.js";

const COUNTRIES = ["QA", "AE", "SA", "BH", "KW", "OM"];
const DOC_TYPES = ["invoice", "payslip", "quotation", "purchase-order", "billing-details"];

// ─── Minimal valid canonical document factories ──────────────────────────────
function makeMinimalInvoice(country) {
  const c = country.toUpperCase();
  const taxId = c === "SA" ? "300000000000003" : (c === "AE" ? "100123456789012" : "123456789012345");
  return {
    documentType: "invoice",
    country: c,
    id: "INV-2026-001",
    invoice_number: "INV-2026-001",
    issueDate: "2026-09-01",
    currency: { code: c === "SA" ? "SAR" : c === "AE" ? "AED" : c === "BH" ? "BHD" : c === "OM" ? "OMR" : c === "KW" ? "KWD" : "QAR" },
    seller: { name: "Seller LLC", legal_name: "Seller LLC", taxIdentity: { taxId }, address: { raw: "Main Road" } },
    buyer: { name: "Buyer Co", legal_name: "Buyer Co", taxIdentity: { taxId: "" }, address: { raw: "" } },
    items: [{ id: "1", description: "Consulting", unitPrice: 100, quantity: 1, totalAmount: 100, unit_price: 100 }],
    line_items: [{ description: "Consulting", quantity: 1, unit_price: 100 }],
    taxes: [{ amount: 0, taxableAmount: 100 }],
    total: { subtotal: 100, tax: 0, discount: 0, grandTotal: 100 },
    grand_total: 100,
  };
}

function makeMinimalPayslip(country) {
  const c = country.toUpperCase();
  const idMap = {
    QA: "28463400123",
    AE: "784-1990-1234567-1",
    SA: "1012345678",
    BH: "901234567",
    KW: "290010112345",
    OM: "12345678",
  };
  return {
    documentType: "payslip",
    country: c,
    id: "PAY-2026-001",
    employer: { name: "Enterprise Corp" },
    employee: { name: "Ahmed Salem", id: idMap[c] || "1012345678" },
    payPeriod: "2026-09",
    payDate: "2026-09-28",
    grossPay: 5000,
    netPay: 4500,
    currency: { code: c === "SA" ? "SAR" : c === "AE" ? "AED" : c === "BH" ? "BHD" : c === "OM" ? "OMR" : c === "KW" ? "KWD" : "QAR" },
  };
}

function makeMinimalQuotation(country) {
  const c = country.toUpperCase();
  return {
    documentType: "quotation",
    country: c,
    id: "QT-2026-001",
    issueDate: "2026-09-01",
    validUntil: "2026-10-01",
    currency: { code: c === "SA" ? "SAR" : c === "AE" ? "AED" : c === "BH" ? "BHD" : c === "OM" ? "OMR" : c === "KW" ? "KWD" : "QAR" },
    seller: { name: "Provider Co", address: { raw: "Business Bay" } },
    buyer: { name: "Client Group" },
    items: [{ id: "1", description: "Design", unitPrice: 250, quantity: 2, totalAmount: 500, unit_price: 250 }],
    taxes: [{ amount: 0, taxableAmount: 500 }],
    total: { subtotal: 500, tax: 0, discount: 0, grandTotal: 500 },
  };
}

function makeMinimalPurchaseOrder(country) {
  const c = country.toUpperCase();
  return {
    documentType: "purchase_order",
    country: c,
    id: "PO-2026-001",
    issueDate: "2026-09-01",
    currency: { code: c === "SA" ? "SAR" : c === "AE" ? "AED" : c === "BH" ? "BHD" : c === "OM" ? "OMR" : c === "KW" ? "KWD" : "QAR" },
    buyer: { name: "Procurement LLC", address: { raw: "Port Area" } },
    supplier: { name: "Material Supplies" },
    items: [{ id: "1", description: "Hardware", unitPrice: 400, quantity: 1, totalAmount: 400, unit_price: 400 }],
    taxes: [{ amount: 0, taxableAmount: 400 }],
    total: { subtotal: 400, tax: 0, discount: 0, grandTotal: 400 },
  };
}

function makeMinimalBillingDetails(country) {
  const c = country.toUpperCase();
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
    id: "BD-2026-001",
    beneficiary: { name: "Beneficiary Trading" },
    bankAccount: {
      bankName: "National Commercial Bank",
      iban: ibanMap[c] || ibanMap.QA,
      swiftBic: "NCBKSA22XXX",
    },
    currency: { code: c === "SA" ? "SAR" : c === "AE" ? "AED" : c === "BH" ? "BHD" : c === "OM" ? "OMR" : c === "KW" ? "KWD" : "QAR" },
    amount: 1500,
    paymentReference: "REF-2026-888",
  };
}

const CANONICAL_BUILDERS = {
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
// 1. Normalization & Parameter Resolution
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 3 — Section 1: Normalization & Parameter Resolution ═══\n");

await test("normalizeCountry handles ISO, lowercase, and common aliases", () => {
  assert.equal(normalizeCountry("QA"), "QA");
  assert.equal(normalizeCountry("qa"), "QA");
  assert.equal(normalizeCountry("saudi arabia"), "SA");
  assert.equal(normalizeCountry("united arab emirates"), "AE");
  assert.equal(normalizeCountry("bahrain"), "BH");
  assert.equal(normalizeCountry("kuwait"), "KW");
  assert.equal(normalizeCountry("oman"), "OM");
  assert.equal(normalizeCountry("generic"), "GENERIC");
  assert.equal(normalizeCountry("invalid_country"), null);
});

await test("normalizeDocType handles slug variants and underscores", () => {
  assert.equal(normalizeDocType("invoice"), "invoice");
  assert.equal(normalizeDocType("payslip"), "payslip");
  assert.equal(normalizeDocType("quotation"), "quotation");
  assert.equal(normalizeDocType("purchase-order"), "purchase-order");
  assert.equal(normalizeDocType("purchase_order"), "purchase-order");
  assert.equal(normalizeDocType("billing-details"), "billing-details");
  assert.equal(normalizeDocType("billing_details"), "billing-details");
  assert.equal(normalizeDocType("random_type"), null);
});

await test("normalizeFormat cleans and lowercases format string", () => {
  assert.equal(normalizeFormat("JSON"), "json");
  assert.equal(normalizeFormat(" pdf "), "pdf");
  assert.equal(normalizeFormat("XML"), "xml");
  assert.equal(normalizeFormat(""), null);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. All 30 combinations: JSON Exporter Routing
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 3 — Section 2: JSON Exporter Routing (30 combinations) ═══\n");

for (const country of COUNTRIES) {
  for (const docType of DOC_TYPES) {
    await test(`JSON export: ${country} / ${docType}`, async () => {
      const canonical = CANONICAL_BUILDERS[docType](country);
      const res = await exportDocument({
        document: canonical,
        country,
        documentType: docType,
        format: "json",
      });

      assert.equal(res.success, true, "export should succeed");
      assert.equal(res.format, "json");
      assert.equal(res.country, country);
      assert.equal(res.documentType, docType);
      assert.ok(typeof res.data === "string", "data is string");
      assert.ok(res.file, "file object returned");
      assert.equal(res.file.mimeType, "application/json");

      // Verify serialized JSON matches canonical document
      const parsed = JSON.parse(res.data);
      assert.equal(parsed.id, canonical.id);
      assert.equal(parsed.country, country);
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. All 30 combinations: PDF Exporter Routing
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 3 — Section 3: PDF Exporter Routing (30 combinations) ═══\n");

for (const country of COUNTRIES) {
  for (const docType of DOC_TYPES) {
    await test(`PDF export: ${country} / ${docType}`, async () => {
      const canonical = CANONICAL_BUILDERS[docType](country);
      const res = await exportDocument({
        document: canonical,
        country,
        documentType: docType,
        format: "pdf",
      });

      assert.equal(res.success, true, "export should succeed");
      assert.equal(res.format, "pdf");
      assert.equal(res.country, country);
      assert.equal(res.documentType, docType);
      assert.equal(res.exporter, `${docType}-${country.toLowerCase()}-pdf`);
      assert.equal(res.printReady, true);
      assert.ok(res.filename.endsWith(".pdf"));
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Validation Gate: Invalid Documents Blocked
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 3 — Section 4: Validation Gate ═══\n");

await test("Validation gate blocks export if missing required fields (Invoice)", async () => {
  const badDoc = makeMinimalInvoice("QA");
  badDoc.seller.name = ""; // Missing required seller name
  const res = await exportDocument({
    document: badDoc,
    country: "QA",
    documentType: "invoice",
    format: "json",
  });

  assert.equal(res.success, false);
  assert.equal(res.code, "VALIDATION_FAILED");
  assert.equal(res.error, "validation_failed");
  assert.ok(res.validation, "validation report attached");
  assert.equal(res.validation.valid, false);
  assert.ok(res.validation.errors.length > 0);
});

await test("Validation gate blocks export if totals math is wrong", async () => {
  const badDoc = makeMinimalInvoice("AE");
  badDoc.total.grandTotal = 99999; // Corrupted total
  const res = await exportDocument({
    document: badDoc,
    country: "AE",
    documentType: "invoice",
    format: "pdf",
  });

  assert.equal(res.success, false);
  assert.equal(res.code, "VALIDATION_FAILED");
  assert.equal(res.validation.valid, false);
});

await test("Validation gate blocks export if payslip netPay > grossPay", async () => {
  const badDoc = makeMinimalPayslip("SA");
  badDoc.netPay = 8000;
  badDoc.grossPay = 1000;
  const res = await exportDocument({
    document: badDoc,
    country: "SA",
    documentType: "payslip",
    format: "json",
  });

  assert.equal(res.success, false);
  assert.equal(res.code, "VALIDATION_FAILED");
});

await test("Pre-computed validationResult: valid passes without re-running engine", async () => {
  const doc = makeMinimalInvoice("QA");
  const preValidation = { valid: true, errors: [], warnings: [] };
  const res = await exportDocument({
    document: doc,
    country: "QA",
    documentType: "invoice",
    format: "json",
    validationResult: preValidation,
  });

  assert.equal(res.success, true);
});

await test("Pre-computed validationResult: invalid blocks export immediately", async () => {
  const doc = makeMinimalInvoice("QA");
  const preValidation = { valid: false, errors: [{ code: "MOCK_ERROR" }], warnings: [] };
  const res = await exportDocument({
    document: doc,
    country: "QA",
    documentType: "invoice",
    format: "json",
    validationResult: preValidation,
  });

  assert.equal(res.success, false);
  assert.equal(res.code, "VALIDATION_FAILED");
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Country and Document Switching
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 3 — Section 5: Country & Document Switching ═══\n");

await test("Country switching selects correct country exporter id without leakage", async () => {
  const qaDoc = makeMinimalInvoice("QA");
  const saDoc = makeMinimalInvoice("SA");
  const aeDoc = makeMinimalInvoice("AE");

  const rQA = await exportDocument({ document: qaDoc, country: "QA", documentType: "invoice", format: "pdf" });
  const rSA = await exportDocument({ document: saDoc, country: "SA", documentType: "invoice", format: "pdf" });
  const rAE = await exportDocument({ document: aeDoc, country: "AE", documentType: "invoice", format: "pdf" });

  assert.equal(rQA.exporter, "invoice-qa-pdf");
  assert.equal(rSA.exporter, "invoice-sa-pdf");
  assert.equal(rAE.exporter, "invoice-ae-pdf");
});

await test("Document switching selects correct document exporter id without leakage", async () => {
  const inv = makeMinimalInvoice("BH");
  const pay = makeMinimalPayslip("BH");
  const quo = makeMinimalQuotation("BH");
  const po = makeMinimalPurchaseOrder("BH");
  const bd = makeMinimalBillingDetails("BH");

  const rInv = await exportDocument({ document: inv, country: "BH", documentType: "invoice", format: "pdf" });
  const rPay = await exportDocument({ document: pay, country: "BH", documentType: "payslip", format: "pdf" });
  const rQuo = await exportDocument({ document: quo, country: "BH", documentType: "quotation", format: "pdf" });
  const rPo = await exportDocument({ document: po, country: "BH", documentType: "purchase-order", format: "pdf" });
  const rBd = await exportDocument({ document: bd, country: "BH", documentType: "billing-details", format: "pdf" });

  assert.equal(rInv.exporter, "invoice-bh-pdf");
  assert.equal(rPay.exporter, "payslip-bh-pdf");
  assert.equal(rQuo.exporter, "quotation-bh-pdf");
  assert.equal(rPo.exporter, "purchase-order-bh-pdf");
  assert.equal(rBd.exporter, "billing-details-bh-pdf");
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Existing XML Exporter & Unsupported Format Handling
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 3 — Section 6: Format Support & Unsupported Rejections ═══\n");

await test("SA invoice + XML routes to existing invoice-sa-zatca-xml exporter", async () => {
  const saDoc = makeMinimalInvoice("SA");
  const res = await exportDocument({
    document: saDoc,
    country: "SA",
    documentType: "invoice",
    format: "xml",
  });

  assert.equal(res.success, true);
  assert.equal(res.format, "xml");
  assert.equal(res.exporter, "invoice-sa-zatca-xml");
  assert.ok(res.data.includes("<ZATCAInvoice>"));
  assert.ok(res.data.includes("<InvoiceNumber>INV-2026-001</InvoiceNumber>"));
});

await test("Non-SA XML export returns EXPORTER_NOT_IMPLEMENTED (never fallback to wrong exporter)", async () => {
  for (const c of ["QA", "AE", "BH", "KW", "OM"]) {
    const doc = makeMinimalInvoice(c);
    const res = await exportDocument({
      document: doc,
      country: c,
      documentType: "invoice",
      format: "xml",
    });

    assert.equal(res.success, false);
    assert.equal(res.code, "EXPORTER_NOT_IMPLEMENTED");
    assert.equal(res.error, "exporter_not_implemented");
  }
});

await test("Payslip + XML returns EXPORTER_NOT_IMPLEMENTED", async () => {
  const doc = makeMinimalPayslip("SA");
  const res = await exportDocument({
    document: doc,
    country: "SA",
    documentType: "payslip",
    format: "xml",
  });

  assert.equal(res.success, false);
  assert.equal(res.code, "EXPORTER_NOT_IMPLEMENTED");
});

await test("Unsupported formats (csv, xlsx, docx) return EXPORTER_NOT_IMPLEMENTED", async () => {
  const doc = makeMinimalInvoice("QA");
  for (const fmt of ["csv", "xlsx", "docx"]) {
    const res = await exportDocument({
      document: doc,
      country: "QA",
      documentType: "invoice",
      format: fmt,
    });

    assert.equal(res.success, false);
    assert.equal(res.code, "EXPORTER_NOT_IMPLEMENTED");
  }
});

await test("Unsupported country returns UNSUPPORTED_COUNTRY", async () => {
  const doc = makeMinimalInvoice("QA");
  const res = await exportDocument({
    document: doc,
    country: "FR", // France (non-GCC)
    documentType: "invoice",
    format: "json",
  });

  assert.equal(res.success, false);
  assert.equal(res.code, "UNSUPPORTED_COUNTRY");
});

await test("Unsupported document type returns UNSUPPORTED_DOCUMENT_TYPE", async () => {
  const doc = makeMinimalInvoice("QA");
  const res = await exportDocument({
    document: doc,
    country: "QA",
    documentType: "contract",
    format: "json",
  });

  assert.equal(res.success, false);
  assert.equal(res.code, "UNSUPPORTED_DOCUMENT_TYPE");
});

await test("Invalid canonical document parameter returns INVALID_DOCUMENT", async () => {
  const res = await exportDocument({
    document: null,
    country: "QA",
    documentType: "invoice",
    format: "json",
  });

  assert.equal(res.success, false);
  assert.equal(res.code, "INVALID_DOCUMENT");
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Backward-compatible routeExport adapter
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 3 — Section 7: Backward-compatibility adapter (routeExport) ═══\n");

await test("routeExport preserves legacy interface call shape", async () => {
  const doc = makeMinimalInvoice("QA");
  const res = await routeExport(doc, {
    country: "QA",
    docType: "invoice",
    format: "json",
  });

  assert.equal(res.success, true);
  assert.equal(res.format, "json");
});

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${"═".repeat(60)}`);
if (failed === 0) {
  console.log(`✅  All ${passed} Phase 3 tests passed.\n`);
} else {
  console.error(`❌  ${failed} test(s) failed.  ${passed} passed.\n`);
  process.exit(1);
}
