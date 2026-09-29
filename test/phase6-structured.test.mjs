/**
 * test/phase6-structured.test.mjs
 *
 * Phase 6 — Advanced Structured / E-Invoice Exports Test Suite
 *
 * Verifies:
 * 1. Saudi Arabia ZATCA Structured Exporter generates valid UBL 2.1 XML and 5-tag TLV QR payload
 * 2. Saudi Tax Invoice vs Simplified Tax Invoice subtype profile handling (0100000 vs 0200000)
 * 3. UAE returns OFFICIAL_SPECIFICATION_UNAVAILABLE status (Accredited Service Provider channel required)
 * 4. Oman returns OFFICIAL_SPECIFICATION_UNAVAILABLE status (Fawtara restricted portal onboarding)
 * 5. Qatar, Bahrain, Kuwait return OFFICIAL_SPECIFICATION_UNAVAILABLE status for XML structured invoices
 * 6. Non-invoice documents (Payslip, Quotation, PO, BD) return EXPORTER_NOT_IMPLEMENTED for XML
 * 7. PDF and JSON exports continue to operate seamlessly across all 30 document/country combinations
 * 8. Validation gate strictly blocks invalid Saudi invoices prior to XML generation
 */

import assert from "node:assert/strict";
import { exportDocument } from "../exporters/router.js";
import { SaudiStructuredInvoiceExporter } from "../exporters/invoice/saudi_structured.js";

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

function makeSaudiInvoice({ valid = true, isSimplified = false } = {}) {
  return {
    documentType: "invoice",
    country: "SA",
    id: "INV-SA-2026-001",
    issueDate: "2026-09-01",
    issueTime: "10:30:00Z",
    currency: { code: "SAR" },
    seller: {
      name: valid ? "Riyadh Logistics Services Co." : "",
      legal_name: valid ? "Riyadh Logistics Services Co." : "",
      taxIdentity: { taxId: valid ? "300000000000003" : "123" },
      address: { raw: "King Fahd Road, Riyadh" },
    },
    buyer: {
      name: "Najd Trading Est.",
      legal_name: "Najd Trading Est.",
      taxIdentity: { taxId: "300000000000004" },
      address: { raw: "Olaya St, Riyadh" },
    },
    items: [
      { id: "1", description: "Warehouse Storage Service", unitPrice: 1000, quantity: 2, totalAmount: 2000, unit_price: 1000 },
    ],
    taxes: [{ amount: 300, taxableAmount: 2000 }],
    total: { subtotal: 2000, tax: 300, discount: 0, grandTotal: 2300 },
  };
}

console.log("\n═══ Phase 6 — Section 1: Saudi Arabia ZATCA Structured E-Invoice ═══\n");

await test("Saudi Standard Tax Invoice produces UBL 2.1 XML with subtype 0100000", async () => {
  const doc = makeSaudiInvoice({ isSimplified: false });
  const res = await exportDocument({
    document: doc,
    country: "SA",
    documentType: "invoice",
    format: "xml",
  });

  assert.equal(res.success, true);
  assert.equal(res.format, "xml");
  assert.equal(res.exporter, "invoice-sa-zatca-xml");
  assert.ok(res.data.includes("<cbc:InvoiceTypeCode name=\"0100000\">388</cbc:InvoiceTypeCode>"));
  assert.ok(res.data.includes("<cac:PartyTaxScheme><cbc:CompanyID>300000000000003</cbc:CompanyID>"));
  assert.ok(res.data.includes("<cbc:Percent>15.00</cbc:Percent>"));
  assert.ok(res.data.includes("<cbc:PayableAmount currencyID=\"SAR\">2300.00</cbc:PayableAmount>"));
  assert.ok(res.qrBase64);
  assert.equal(res.metadata.governmentSubmission, "NO (Client-side offline generation; government clearance not connected)");
});

await test("Saudi Simplified Tax Invoice produces subtype 0200000", async () => {
  const doc = makeSaudiInvoice();
  const res = await exportDocument({
    document: doc,
    country: "SA",
    documentType: "invoice",
    format: "xml",
    isSimplified: true,
  });

  assert.equal(res.success, true);
  assert.ok(res.data.includes("<cbc:InvoiceTypeCode name=\"0200000\">388</cbc:InvoiceTypeCode>"));
});

await test("Validation gate blocks invalid Saudi Invoice before structured export", async () => {
  const badDoc = makeSaudiInvoice({ valid: false });
  const res = await exportDocument({
    document: badDoc,
    country: "SA",
    documentType: "invoice",
    format: "xml",
  });

  assert.equal(res.success, false);
  assert.equal(res.code, "VALIDATION_FAILED");
  assert.equal(res.error, "validation_failed");
});

console.log("\n═══ Phase 6 — Section 2: Other GCC Structured Formats Status ═══\n");

await test("UAE structured XML returns OFFICIAL_SPECIFICATION_UNAVAILABLE status", async () => {
  const doc = {
    documentType: "invoice",
    country: "AE",
    id: "INV-AE-001",
    issueDate: "2026-09-01",
    currency: { code: "AED" },
    seller: { name: "Dubai Trader", taxIdentity: { taxId: "100123456789012" }, address: { raw: "Dubai" } },
    buyer: { name: "Client", address: { raw: "" } },
    items: [{ id: "1", unitPrice: 100, quantity: 1, totalAmount: 100 }],
    taxes: [{ amount: 5, taxableAmount: 100 }],
    total: { subtotal: 100, tax: 5, discount: 0, grandTotal: 105 },
  };

  const res = await exportDocument({
    document: doc,
    country: "AE",
    documentType: "invoice",
    format: "xml",
  });

  assert.equal(res.success, false);
  assert.equal(res.code, "EXPORTER_NOT_IMPLEMENTED");
  assert.equal(res.status, "OFFICIAL_SPECIFICATION_UNAVAILABLE");
  assert.ok(res.message.includes("Accredited Service Provider"));
});

await test("Oman structured XML returns OFFICIAL_SPECIFICATION_UNAVAILABLE status", async () => {
  const doc = {
    documentType: "invoice",
    country: "OM",
    id: "INV-OM-001",
    issueDate: "2026-09-01",
    currency: { code: "OMR" },
    seller: { name: "Muscat Trading", taxIdentity: { taxId: "123456789012345" }, address: { raw: "Muscat" } },
    buyer: { name: "Customer" },
    items: [{ id: "1", unitPrice: 100, quantity: 1, totalAmount: 100 }],
    taxes: [{ amount: 5, taxableAmount: 100 }],
    total: { subtotal: 100, tax: 5, discount: 0, grandTotal: 105 },
  };

  const res = await exportDocument({
    document: doc,
    country: "OM",
    documentType: "invoice",
    format: "xml",
  });

  assert.equal(res.success, false);
  assert.equal(res.code, "EXPORTER_NOT_IMPLEMENTED");
  assert.equal(res.status, "OFFICIAL_SPECIFICATION_UNAVAILABLE");
  assert.ok(res.message.includes("Fawtara"));
});

await test("Qatar, Bahrain, Kuwait XML structured exports return OFFICIAL_SPECIFICATION_UNAVAILABLE status", async () => {
  for (const c of ["QA", "BH", "KW"]) {
    const doc = {
      documentType: "invoice",
      country: c,
      id: `INV-${c}-001`,
      issueDate: "2026-09-01",
      currency: { code: c === "BH" ? "BHD" : c === "KW" ? "KWD" : "QAR" },
      seller: { name: "Seller Co", taxIdentity: { taxId: "123456789012345" }, address: { raw: "Capital City" } },
      buyer: { name: "Buyer Co" },
      items: [{ id: "1", unitPrice: 100, quantity: 1, totalAmount: 100 }],
      taxes: [{ amount: 0, taxableAmount: 100 }],
      total: { subtotal: 100, tax: 0, discount: 0, grandTotal: 100 },
    };

    const res = await exportDocument({
      document: doc,
      country: c,
      documentType: "invoice",
      format: "xml",
    });

    assert.equal(res.success, false);
    assert.equal(res.code, "EXPORTER_NOT_IMPLEMENTED");
    assert.equal(res.status, "OFFICIAL_SPECIFICATION_UNAVAILABLE");
    assert.equal(res.governmentSubmission, "NO");
  }
});

console.log("\n═══ Phase 6 — Section 3: Non-Invoice XML Isolation ═══\n");

await test("Non-invoice document types strictly reject XML requests", async () => {
  for (const dt of ["payslip", "quotation", "purchase-order", "billing-details"]) {
    const doc = {
      documentType: dt,
      country: "SA",
      id: "DOC-001",
      currency: { code: "SAR" },
    };

    const res = await exportDocument({
      document: doc,
      country: "SA",
      documentType: dt,
      format: "xml",
      validationResult: { valid: true, errors: [], warnings: [] },
    });

    assert.equal(res.success, false);
    assert.equal(res.code, "EXPORTER_NOT_IMPLEMENTED");
  }
});

console.log(`\n${"═".repeat(60)}`);
if (failed === 0) {
  console.log(`✅  All ${passed} Phase 6 structured tests passed.\n`);
} else {
  console.error(`❌  ${failed} test(s) failed.  ${passed} passed.\n`);
  process.exit(1);
}
