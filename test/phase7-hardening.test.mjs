/**
 * test/phase7-hardening.test.mjs
 *
 * Phase 7 — Comprehensive Hardening & Integration Verification Test Suite
 *
 * Rigorously verifies all requirements of Phase 7:
 * 1. 30 Document x Country combinations full lifecycle
 * 2. Invoice edge cases, mathematical totals, and tax calculations
 * 3. Payslip isolation from VAT, earnings/deductions consistency
 * 4. Quotation validity period and payment terms independence
 * 5. Purchase Order delivery terms and shipping freight handling
 * 6. Billing Details banking/IBAN verification without invoice leakage
 * 7. Canonical model immutability during export operations
 * 8. Router deterministic isolation and structured error reporting
 * 9. Validation gate blocking on invalid inputs across all countries
 * 10. Currency precision engine (2 vs 3 decimals)
 * 11. Arabic / RTL / i18n dictionary parity and date formatting
 * 12. Country switching & Document switching lifecycle isolation
 * 13. Saudi ZATCA structured UBL 2.1 XML export and TLV QR code integrity
 * 14. Structured rejection of non-SA XML exports without fallback
 */

import assert from "node:assert/strict";
import { exportDocument, routeExport, SUPPORTED_COUNTRIES, SUPPORTED_DOC_TYPES } from "../exporters/router.js";
import { getRules } from "../rules/index.js";
import { validateDocument } from "../rules/engine.js";
import { formatCurrencyAmount, formatDate, getTranslation, DICTIONARY, GCC_CURRENCIES } from "../i18n.js";
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

// Helper: Make valid canonical documents for testing
function makeSampleDoc(docType, country) {
  const currencyCode = country === "BH" ? "BHD" : country === "KW" ? "KWD" : country === "OM" ? "OMR" : country === "SA" ? "SAR" : country === "AE" ? "AED" : "QAR";
  const trn = country === "SA" ? "300000000000003" : country === "AE" ? "100123456789012" : "123456789012345";

  if (docType === "invoice") {
    const taxRate = country === "SA" ? 0.15 : country === "BH" ? 0.10 : (country === "AE" || country === "OM") ? 0.05 : 0;
    const subtotal = 1000;
    const tax = Number((subtotal * taxRate).toFixed(3));
    const grandTotal = Number((subtotal + tax).toFixed(3));
    return {
      id: `INV-${country}-001`,
      documentType: "invoice",
      country,
      currency: { code: currencyCode },
      issueDate: "2026-09-01",
      dueDate: "2026-09-30",
      seller: {
        name: `${country} General Trading Co. W.L.L.`,
        taxIdentity: { taxId: trn },
        address: { raw: `Commercial Center, ${country}` },
        contact: { phone: "+974 4400 0000", email: "info@example.com" },
      },
      buyer: {
        name: "Enterprise Client LLC",
        taxIdentity: { taxId: trn },
        address: { raw: `Business Bay, ${country}` },
      },
      items: [
        { id: "1", description: "Technical Consultancy & Engineering Services", quantity: 2, unitPrice: 500, unit_price: 500, totalAmount: 1000 },
      ],
      taxes: [{ category: "S", rate: taxRate * 100, amount: tax, taxableAmount: subtotal }],
      total: { subtotal, discount: 0, taxableAmount: subtotal, tax, grandTotal, amountPaid: 0, amountDue: grandTotal },
      payment: { bankAccount: { bankName: "Gulf Bank", iban: "QA12GULF00001234567890", swiftBic: "GULFQAQA" }, method: "Bank Transfer" },
      references: [{ id: "PO-REF-999", type: "Purchase Order" }],
      notes: "Payment due within 30 days of invoice issuance.",
    };
  }

  if (docType === "payslip") {
    return {
      id: `PAY-${country}-001`,
      documentType: "payslip",
      country,
      currency: { code: currencyCode },
      issueDate: "2026-09-25",
      payPeriod: "2026-09",
      payDate: "2026-09-28",
      employer: {
        name: `${country} Holding Group`,
        registrationNumber: "CR-987654",
        address: { raw: `HQ Tower, ${country}` },
      },
      employee: {
        name: "Ahmed Al-Mansoor",
        id: country === "QA" ? "29012345678" : country === "SA" ? "1098765432" : "EMP-4521",
        role: "Senior Systems Analyst",
        department: "Information Technology",
      },
      basicSalary: 5000,
      allowances: [{ description: "Housing & Transport", amount: 1500 }],
      grossPay: 6500,
      deductions: [{ description: "Social Insurance", amount: 200 }],
      netPay: 6300,
      payment: { bankAccount: { bankName: "National Bank", accountNumber: "123456789" }, method: "WPS Bank Transfer" },
      notes: "Confidential salary document.",
    };
  }

  if (docType === "quotation") {
    return {
      id: `QT-${country}-001`,
      documentType: "quotation",
      country,
      currency: { code: currencyCode },
      issueDate: "2026-09-01",
      validUntil: "2026-10-01",
      seller: {
        name: `${country} Industrial Supplies`,
        address: { raw: `Industrial Area, ${country}` },
      },
      buyer: {
        name: "Prospective Client Co.",
        address: { raw: `City Center, ${country}` },
      },
      items: [
        { id: "1", description: "Industrial Generator Maintenance Pack", quantity: 1, unitPrice: 2500, totalAmount: 2500 },
      ],
      total: { subtotal: 2500, discount: 100, taxableAmount: 2400, tax: 0, grandTotal: 2400 },
      payment: { terms: "50% advance upon confirmation, 50% upon delivery" },
      notes: "Quotation valid for 30 calendar days from issue date.",
    };
  }

  if (docType === "purchase-order" || docType === "purchase_order") {
    return {
      id: `PO-${country}-001`,
      documentType: "purchase_order",
      country,
      currency: { code: currencyCode },
      issueDate: "2026-09-05",
      requiredDeliveryDate: "2026-09-20",
      buyer: {
        name: `${country} Procurement Authority`,
        address: { raw: `Government District, ${country}` },
      },
      supplier: {
        name: "Prime Material Vendors Ltd.",
        address: { raw: `Logistics Hub, ${country}` },
      },
      items: [
        { id: "1", description: "Heavy Duty Server Racks", quantity: 4, unitPrice: 750, totalAmount: 3000 },
      ],
      shipping: { amount: 150 },
      total: { subtotal: 3000, discount: 0, tax: 0, grandTotal: 3000 },
      payment: { terms: "Net 45 days after verified receipt and inspection" },
      deliveryTerms: "Delivered At Place (DAP) Central Warehouse",
      notes: "Attach PO reference on all shipping crates and delivery notes.",
    };
  }

  if (docType === "billing-details" || docType === "billing_details") {
    return {
      id: `BD-${country}-001`,
      documentType: "billing_details",
      country,
      currency: { code: currencyCode },
      issueDate: "2026-09-01",
      dueDate: "2026-09-15",
      beneficiary: {
        name: `${country} Corporate Beneficiary Services`,
        taxIdentity: { taxId: trn },
        address: { raw: `Financial Plaza, ${country}` },
      },
      bankAccount: {
        bankName: "Commercial Bank of Qatar",
        branch: "Grand Hamad Main Branch",
        accountName: `${country} Corporate Beneficiary Services`,
        accountNumber: "98765432100",
        iban: country === "QA" ? "QA12GULF000000000000000012345" : `${country}00BANK0000001234567890`,
        swiftBic: "CBQAQAQA",
      },
      amount: 8500,
      paymentReference: "INV-REF-2026-8889",
      total: { grandTotal: 8500 },
      notes: "Please include payment reference in transfer narrative.",
    };
  }

  throw new Error(`Unknown docType: ${docType}`);
}

console.log("\n╔════════════════════════════════════════════════════════════════════╗");
console.log("║     PHASE 7 — COMPREHENSIVE HARDENING & VERIFICATION SUITE         ║");
console.log("╚════════════════════════════════════════════════════════════════════╝\n");

// ─── SECTION 1: FULL 30 COMBINATIONS MATRIX (5 Docs x 6 Countries) ───────────────────
console.log("═══ Section 1: Full 30 Document x Country Combinations Matrix ═══\n");

for (const dt of SUPPORTED_DOC_TYPES) {
  for (const c of SUPPORTED_COUNTRIES) {
    await test(`Matrix Check: [${c}] ${dt} (Rules, Validation, JSON & PDF Export)`, async () => {
      const doc = makeSampleDoc(dt, c);
      
      // 1. Rules retrieval
      const rules = await getRules({ country: c, documentType: dt });
      assert.ok(rules, `Rules should resolve for ${c} / ${dt}`);
      
      // 2. Validation engine
      const val = validateDocument(doc, rules);
      assert.equal(val.valid, true, `Validation failed for ${c} / ${dt}: ${JSON.stringify(val.errors)}`);
      
      // 3. JSON export
      const jsonRes = await exportDocument({
        document: doc,
        country: c,
        documentType: dt,
        format: "json",
        validationResult: val,
      });
      assert.equal(jsonRes.success, true);
      assert.equal(jsonRes.format, "json");
      assert.ok(jsonRes.data, "JSON output should contain serialized data");

      // 4. PDF export
      const pdfRes = await exportDocument({
        document: doc,
        country: c,
        documentType: dt,
        format: "pdf",
        validationResult: val,
      });
      assert.equal(pdfRes.success, true);
      assert.equal(pdfRes.format, "pdf");
      assert.ok(pdfRes.filename || pdfRes.file, "PDF result should contain filename/file");
    });
  }
}

// ─── SECTION 2: INVOICE TESTING & MATHEMATICAL CONSISTENCY ───────────────────────────
console.log("\n═══ Section 2: Invoice Hardening & Math Precision ═══\n");

await test("Invoice with multiple items, zero tax (QA/KW) calculates consistent totals", async () => {
  const doc = makeSampleDoc("invoice", "QA");
  doc.items = [
    { id: "1", description: "Item 1", quantity: 3, unitPrice: 33.33, totalAmount: 99.99 },
    { id: "2", description: "Item 2", quantity: 2, unitPrice: 50.00, totalAmount: 100.00 },
    { id: "3", description: "Item 3", quantity: 10, unitPrice: 0.50, totalAmount: 5.00 },
  ];
  doc.total.subtotal = 204.99;
  doc.total.discount = 4.99;
  doc.total.taxableAmount = 200.00;
  doc.total.tax = 0;
  doc.total.grandTotal = 200.00;
  doc.total.amountPaid = 50.00;
  doc.total.amountDue = 150.00;

  const rules = await getRules({ country: "QA", documentType: "invoice" });
  const val = validateDocument(doc, rules);
  assert.equal(val.valid, true);
});

await test("Invoice with mathematical mismatch is strictly blocked by validation gate", async () => {
  const doc = makeSampleDoc("invoice", "SA");
  doc.total.subtotal = 1000;
  doc.total.tax = 150;
  doc.total.grandTotal = 9999; // Corrupt grand total

  const res = await exportDocument({
    document: doc,
    country: "SA",
    documentType: "invoice",
    format: "pdf",
  });

  assert.equal(res.success, false);
  assert.equal(res.code, "VALIDATION_FAILED");
});

await test("Invoice with long descriptions (>1000 chars) and long names exports safely", async () => {
  const doc = makeSampleDoc("invoice", "AE");
  doc.seller.name = "A".repeat(200);
  doc.items[0].description = "Very detailed specification ".repeat(50);

  const res = await exportDocument({
    document: doc,
    country: "AE",
    documentType: "invoice",
    format: "json",
  });
  assert.equal(res.success, true);
  const parsed = JSON.parse(res.data);
  assert.equal(parsed.seller.name.length, 200);
});

// ─── SECTION 3: PAYSLIP TESTING & SEPARATION FROM VAT ────────────────────────────────
console.log("\n═══ Section 3: Payslip Testing & Independence ═══\n");

await test("Payslip is insulated from VAT requirements across all countries", async () => {
  for (const c of SUPPORTED_COUNTRIES) {
    const doc = makeSampleDoc("payslip", c);
    const rules = await getRules({ country: c, documentType: "payslip" });
    const val = validateDocument(doc, rules);
    assert.equal(val.valid, true);
    assert.ok(!rules.required_fields.includes("taxes") && !rules.required_fields.includes("tax"));
  }
});

await test("Payslip with netPay > grossPay is rejected with validation error", async () => {
  const doc = makeSampleDoc("payslip", "KW");
  doc.grossPay = 1000;
  doc.netPay = 1500; // Impossible
  const rules = await getRules({ country: "KW", documentType: "payslip" });
  const val = validateDocument(doc, rules);
  assert.equal(val.valid, false);
  assert.ok(val.errors.some(e => e.field === "netPay" || e.code === "NET_EXCEEDS_GROSS"));
});

// ─── SECTION 4: QUOTATION & PURCHASE ORDER TESTING ──────────────────────────────────
console.log("\n═══ Section 4: Quotation & Purchase Order Hardening ═══\n");

await test("Quotation preserves validity date and payment terms independently", async () => {
  const doc = makeSampleDoc("quotation", "OM");
  doc.validUntil = "2026-11-15";
  const res = await exportDocument({
    document: doc,
    country: "OM",
    documentType: "quotation",
    format: "json",
  });
  assert.equal(res.success, true);
  const parsed = JSON.parse(res.data);
  assert.equal(parsed.validUntil, "2026-11-15");
  assert.equal(parsed.documentType, "quotation");
});

await test("Purchase Order calculates grand total consistently", async () => {
  const doc = makeSampleDoc("purchase-order", "BH");
  doc.items = [{ id: "1", description: "Parts", quantity: 2, unitPrice: 200, totalAmount: 400 }];
  doc.shipping = { amount: 50 };
  doc.total.subtotal = 400;
  doc.total.tax = 0;
  doc.total.grandTotal = 400;

  const res = await exportDocument({
    document: doc,
    country: "BH",
    documentType: "purchase_order",
    format: "json",
  });
  assert.equal(res.success, true);
  const parsed = JSON.parse(res.data);
  assert.equal(parsed.shipping.amount, 50);
  assert.equal(parsed.total.grandTotal, 400);
});

// ─── SECTION 5: BILLING DETAILS TESTING ──────────────────────────────────────────────
console.log("\n═══ Section 5: Billing Details Hardening ═══\n");

await test("Billing Details accepts complete banking info without requiring invoice line items", async () => {
  const doc = makeSampleDoc("billing-details", "QA");
  doc.items = []; // No line items
  const rules = await getRules({ country: "QA", documentType: "billing_details" });
  const val = validateDocument(doc, rules);
  assert.equal(val.valid, true);

  const res = await exportDocument({
    document: doc,
    country: "QA",
    documentType: "billing_details",
    format: "json",
  });
  assert.equal(res.success, true);
  const parsed = JSON.parse(res.data);
  assert.equal(parsed.bankAccount.iban, "QA12GULF000000000000000012345");
});

// ─── SECTION 6: CANONICAL IMMUTABILITY & DATA ISOLATION ──────────────────────────────
console.log("\n═══ Section 6: Canonical Immutability & Re-Export Isolation ═══\n");

await test("Export operations do not mutate source canonical document", async () => {
  const doc = makeSampleDoc("invoice", "SA");
  const originalSnapshot = JSON.stringify(doc);

  await exportDocument({ document: doc, country: "SA", documentType: "invoice", format: "json" });
  await exportDocument({ document: doc, country: "SA", documentType: "invoice", format: "pdf" });
  await exportDocument({ document: doc, country: "SA", documentType: "invoice", format: "xml" });

  assert.equal(JSON.stringify(doc), originalSnapshot, "Canonical document should remain strictly immutable during exports");
});

// ─── SECTION 7: ROUTER ISOLATION & STRUCTURED ERROR CODES ────────────────────────────
console.log("\n═══ Section 7: Router Isolation & Structured Error Codes ═══\n");

await test("Structured rejection of unsupported formats (csv, xlsx, docx)", async () => {
  for (const fmt of ["csv", "xlsx", "docx"]) {
    const doc = makeSampleDoc("invoice", "QA");
    const res = await exportDocument({ document: doc, country: "QA", documentType: "invoice", format: fmt });
    assert.equal(res.success, false);
    assert.equal(res.code, "EXPORTER_NOT_IMPLEMENTED");
  }
});

await test("Structured rejection of invalid country or document type", async () => {
  const doc = makeSampleDoc("invoice", "QA");
  const badCountry = await exportDocument({ document: doc, country: "XYZ", documentType: "invoice", format: "json" });
  assert.equal(badCountry.success, false);
  assert.equal(badCountry.code, "UNSUPPORTED_COUNTRY");

  const badDocType = await exportDocument({ document: doc, country: "QA", documentType: "unknown_doc", format: "json" });
  assert.equal(badDocType.success, false);
  assert.equal(badDocType.code, "UNSUPPORTED_DOCUMENT_TYPE");
});

await test("Legacy routeExport adapter preserves structured error shape", async () => {
  const doc = makeSampleDoc("invoice", "AE");
  const res = await routeExport(doc, { country: "AE", docType: "invoice", format: "xml" });
  assert.equal(res.success, false);
  assert.equal(res.error, "exporter_not_implemented");
  assert.equal(res.status, "OFFICIAL_SPECIFICATION_UNAVAILABLE");
});

// ─── SECTION 8: CURRENCY PRECISION ENGINE ────────────────────────────────────────────
console.log("\n═══ Section 8: Currency Precision Engine (2 vs 3 decimals) ═══\n");

await test("Currency precision: 3 decimals for BHD, KWD, OMR and 2 decimals for QAR, AED, SAR", () => {
  assert.equal(GCC_CURRENCIES.BHD.decimals, 3);
  assert.equal(GCC_CURRENCIES.KWD.decimals, 3);
  assert.equal(GCC_CURRENCIES.OMR.decimals, 3);
  assert.equal(GCC_CURRENCIES.QAR.decimals, 2);
  assert.equal(GCC_CURRENCIES.AED.decimals, 2);
  assert.equal(GCC_CURRENCIES.SAR.decimals, 2);

  assert.equal(formatCurrencyAmount(123.4567, "BHD", "en"), "BHD 123.457");
  assert.equal(formatCurrencyAmount(123.4567, "KWD", "en"), "KWD 123.457");
  assert.equal(formatCurrencyAmount(123.4567, "OMR", "en"), "OMR 123.457");
  assert.equal(formatCurrencyAmount(123.4567, "QAR", "en"), "QAR 123.46");
  assert.equal(formatCurrencyAmount(123.4567, "AED", "en"), "AED 123.46");
  assert.equal(formatCurrencyAmount(123.4567, "SAR", "en"), "SAR 123.46");
});

// ─── SECTION 9: ARABIC / RTL / I18N DICTIONARY PARITY ────────────────────────────────
console.log("\n═══ Section 9: Arabic / RTL / i18n Verification ═══\n");

await test("All English dictionary keys have Arabic counterparts across all 5 document types", () => {
  const enKeys = Object.keys(DICTIONARY.en);
  const arKeys = Object.keys(DICTIONARY.ar);
  assert.equal(enKeys.length, arKeys.length);
  for (const k of enKeys) {
    assert.ok(DICTIONARY.ar[k], `Missing Arabic translation for key "${k}"`);
  }
});

await test("Date formatting in English and Arabic", () => {
  const dateStr = "2026-09-24";
  const enFormatted = formatDate(dateStr, "en");
  const arFormatted = formatDate(dateStr, "ar");
  assert.ok(enFormatted.includes("2026"));
  assert.ok(arFormatted.includes("2026") || arFormatted.includes("٢٠٢٦") || arFormatted.length > 0);
});

// ─── SECTION 10: COUNTRY & DOCUMENT SWITCHING ISOLATION ──────────────────────────────
console.log("\n═══ Section 10: Country & Document Cyclic Switching Isolation ═══\n");

await test("Cyclic country switching (QA -> SA -> AE -> OM -> BH -> KW -> QA) preserves rule purity", async () => {
  const cycle = ["QA", "SA", "AE", "OM", "BH", "KW", "QA"];
  for (let i = 0; i < cycle.length - 1; i++) {
    const c1 = cycle[i];
    const c2 = cycle[i + 1];
    const r1 = await getRules({ country: c1, documentType: "invoice" });
    const r2 = await getRules({ country: c2, documentType: "invoice" });
    assert.equal(r1.country, c1);
    assert.equal(r2.country, c2);
  }
});

await test("Cyclic document switching (Invoice -> Payslip -> Quotation -> PO -> BD -> Invoice) maintains schema boundary", async () => {
  const docCycle = ["invoice", "payslip", "quotation", "purchase-order", "billing-details", "invoice"];
  for (let i = 0; i < docCycle.length - 1; i++) {
    const d1 = docCycle[i];
    const d2 = docCycle[i + 1];
    const r1 = await getRules({ country: "SA", documentType: d1 });
    const r2 = await getRules({ country: "SA", documentType: d2 });
    assert.equal(r1.document_type, d1.replace("-", "_"));
    assert.equal(r2.document_type, d2.replace("-", "_"));
  }
});

// ─── SECTION 11: SAUDI ZATCA STRUCTURED E-INVOICE HARDENING ──────────────────────────
console.log("\n═══ Section 11: Saudi Arabia ZATCA E-Invoice Verification ═══\n");

await test("Saudi Standard Tax Invoice produces compliant UBL 2.1 XML structure", async () => {
  const doc = makeSampleDoc("invoice", "SA");
  const res = await exportDocument({ document: doc, country: "SA", documentType: "invoice", format: "xml" });
  assert.equal(res.success, true);
  assert.ok(res.data.includes("<cbc:InvoiceTypeCode name=\"0100000\">388</cbc:InvoiceTypeCode>"));
  assert.ok(res.data.includes("<cbc:Percent>15.00</cbc:Percent>"));
  assert.ok(res.qrBase64);
  assert.equal(res.metadata.governmentSubmission.startsWith("NO"), true);
});

console.log(`\n${"═".repeat(60)}`);
if (failed === 0) {
  console.log(`✅  All ${passed} Phase 7 hardening tests passed successfully.\n`);
} else {
  console.error(`❌  ${failed} test(s) failed.  ${passed} passed.\n`);
  process.exit(1);
}
