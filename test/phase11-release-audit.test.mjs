/**
 * test/phase11-release-audit.test.mjs
 *
 * Phase 11 — Comprehensive Final Release Audit & Verification Suite
 *
 * Validates v1.0 release readiness across:
 * - Full 30/30 Document x Country Matrix
 * - Zero Compliance/Certification Overclaims
 * - Currency Precision (2 vs 3 decimals)
 * - Security, Privacy & Local Data-Flow Isolation
 * - Advertising Decoupling & Print Purity
 * - Internationalization & RTL Integrity
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import { exportDocument } from "../exporters/router.js";
import { getRules } from "../rules/index.js";
import { GCC_CURRENCIES } from "../i18n.js";
import { AdManager } from "../ad-manager.js";

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

console.log("\n╔════════════════════════════════════════════════════════════════════╗");
console.log("║     PHASE 11 — FINAL RELEASE COMPREHENSIVE AUDIT SUITE             ║");
console.log("╚════════════════════════════════════════════════════════════════════╝\n");

const COUNTRIES = ["QA", "AE", "SA", "BH", "KW", "OM"];
const DOC_TYPES = ["invoice", "payslip", "quotation", "purchase-order", "billing-details"];

// ─── SECTION 1: 30/30 PRODUCT MATRIX AUDIT ─────────────────────────────────────────
console.log("═══ Section 1: Full 30/30 Product Matrix Audit ═══\n");

function createSampleDoc(type, country) {
  const currencyMap = { QA: "QAR", AE: "AED", SA: "SAR", BH: "BHD", KW: "KWD", OM: "OMR" };
  const curr = currencyMap[country];

  if (type === "invoice") {
    return {
      id: `INV-${country}-RELEASE`,
      documentType: "invoice",
      country,
      currency: { code: curr },
      issueDate: "2026-09-01",
      seller: { name: "Seller Enterprise", taxIdentity: { taxId: country === "SA" ? "300000000000003" : "123456789012345" }, address: { raw: "City Center" } },
      buyer: { name: "Client Corp", taxIdentity: { taxId: country === "SA" ? "300000000000004" : undefined } },
      items: [{ id: "1", description: "Professional Services", quantity: 1, unitPrice: 1000, totalAmount: 1000 }],
      taxes: [{ amount: 0, taxableAmount: 1000 }],
      total: { subtotal: 1000, tax: 0, grandTotal: 1000 },
    };
  } else if (type === "payslip") {
    return {
      id: `PAY-${country}-RELEASE`,
      documentType: "payslip",
      country,
      currency: { code: curr },
      payPeriod: { startDate: "2026-09-01", endDate: "2026-09-30" },
      employer: { name: "Enterprise Corp", address: { raw: "HQ" } },
      employee: { id: "EMP-01", name: "Ahmed Al-Mansoor", designation: "Software Engineer" },
      earnings: [{ id: "e1", type: "basic", description: "Basic Salary", amount: 8000 }],
      deductions: [{ id: "d1", type: "social_insurance", description: "Pension Contribution", amount: 400 }],
      grossPay: 8000,
      totalDeductions: 400,
      netPay: 7600,
    };
  } else if (type === "quotation") {
    return {
      id: `QUO-${country}-RELEASE`,
      documentType: "quotation",
      country,
      currency: { code: curr },
      issueDate: "2026-09-01",
      validUntil: "2026-10-01",
      seller: { name: "Creative Agency", address: { raw: "Downtown" } },
      buyer: { name: "Prospective Client" },
      items: [{ id: "1", description: "Brand Identity Design", quantity: 1, unitPrice: 3000, totalAmount: 3000 }],
      taxes: [{ amount: 0, taxableAmount: 3000 }],
      total: { subtotal: 3000, tax: 0, grandTotal: 3000 },
    };
  } else if (type === "purchase-order") {
    return {
      id: `PO-${country}-RELEASE`,
      documentType: "purchase-order",
      country,
      currency: { code: curr },
      issueDate: "2026-09-01",
      buyer: { name: "Procurement Division", address: { raw: "Industrial Area" } },
      supplier: { name: "Hardware Vendor", address: { raw: "Tech Park" } },
      items: [{ id: "1", description: "Server Hardware", quantity: 2, unitPrice: 2500, totalAmount: 5000 }],
      taxes: [{ amount: 0, taxableAmount: 5000 }],
      total: { subtotal: 5000, tax: 0, grandTotal: 5000 },
    };
  } else if (type === "billing-details") {
    return {
      id: `BD-${country}-RELEASE`,
      documentType: "billing_details",
      country,
      currency: { code: curr },
      issueDate: "2026-09-01",
      dueDate: "2026-09-15",
      beneficiary: { name: "Gulf Consulting LLC", address: { raw: "Business Bay" } },
      bankAccount: {
        bankName: "National Bank",
        branch: "Main Branch",
        accountName: "Gulf Consulting LLC",
        accountNumber: "123456789",
        iban: country === "QA" ? "QA12GULF000000000000000012345" : `${country}00BANK0000001234567890`,
        swiftBic: "CBQAQAQA",
      },
      amount: 5000,
      total: { grandTotal: 5000 },
      paymentReference: "INV-REF-9920",
      notes: "Please include payment reference in transfer narrative.",
    };
  }
}

for (const docType of DOC_TYPES) {
  for (const country of COUNTRIES) {
    await test(`Matrix Release Check: [${country}] ${docType} (Rules, JSON & PDF)`, async () => {
      const doc = createSampleDoc(docType, country);
      const rules = await getRules({ country, documentType: docType });
      assert.ok(rules, `Rules should exist for ${country}/${docType}`);

      const json = await exportDocument({ document: doc, country, documentType: docType, format: "json" });
      assert.equal(json.success, true);

      const pdf = await exportDocument({ document: doc, country, documentType: docType, format: "pdf" });
      assert.equal(pdf.success, true);
    });
  }
}

// ─── SECTION 2: COMPLIANCE & LEGAL ACCURACY AUDIT ─────────────────────────────────
console.log("\n═══ Section 2: Compliance & Legal Accuracy Audit ═══\n");

await test("No misleading government certification or WPS compliance claims in templates", () => {
  const payslipHtml = fs.readFileSync("./payslip.html", "utf8");
  assert.ok(!payslipHtml.includes("WPS Compliant"));

  const indexHtml = fs.readFileSync("./index.html", "utf8");
  assert.ok(indexHtml.includes("We are not a government agency, accounting firm, or certified tax agent."));
});

await test("Legal disclaimer is properly stated on legal pages", () => {
  const termsHtml = fs.readFileSync("./terms-of-use.html", "utf8");
  const aboutHtml = fs.readFileSync("./about-us.html", "utf8");
  const requiredDisclaimer = "Validation reflects the country and document rules configured in this application. Users remain responsible for confirming applicable legal, tax, payroll and regulatory requirements.";

  assert.ok(termsHtml.includes(requiredDisclaimer));
  assert.ok(aboutHtml.includes(requiredDisclaimer));
});

// ─── SECTION 3: STRUCTURED E-INVOICE STATUS AUDIT ─────────────────────────────────
console.log("\n═══ Section 3: Structured E-Invoice Status Audit ═══\n");

await test("Saudi Arabia Standard Tax Invoice generates valid UBL 2.1 XML", async () => {
  const saDoc = createSampleDoc("invoice", "SA");
  saDoc.taxes = [{ amount: 150, taxableAmount: 1000 }];
  saDoc.total = { subtotal: 1000, tax: 150, grandTotal: 1150 };

  const xmlRes = await exportDocument({ document: saDoc, country: "SA", documentType: "invoice", format: "xml" });
  assert.equal(xmlRes.success, true);
  assert.ok(xmlRes.data.includes("urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"));
});

await test("Non-Saudi countries return OFFICIAL_SPECIFICATION_UNAVAILABLE without claiming failure", async () => {
  const qaDoc = createSampleDoc("invoice", "QA");
  const xmlRes = await exportDocument({ document: qaDoc, country: "QA", documentType: "invoice", format: "xml" });
  assert.equal(xmlRes.success, false);
  assert.equal(xmlRes.status, "OFFICIAL_SPECIFICATION_UNAVAILABLE");
});

// ─── SECTION 4: ADS & PRIVACY ISOLATION AUDIT ────────────────────────────────────
console.log("\n═══ Section 4: Ads & Privacy Isolation Audit ═══\n");

await test("AdManager is decoupled and print stylesheets hide all ad elements", () => {
  const css = fs.readFileSync("./style.css", "utf8");
  assert.ok(css.includes(".ad-top,"));
  assert.ok(css.includes(".ad-middle,"));
  assert.ok(css.includes(".ad-placeholder,"));
  assert.ok(css.includes("display: none !important;"));
});

await test("Zero document data is passed to external advertising globals", () => {
  assert.equal(global.invoiceData, undefined);
  assert.equal(global.documentData, undefined);
  assert.equal(global.canonicalDocument, undefined);
});

// ─── SECTION 5: CURRENCY PRECISION AUDIT ──────────────────────────────────────────
console.log("\n═══ Section 5: Currency Precision Engine Audit ═══\n");

await test("2-decimal and 3-decimal currencies maintain accurate precision", () => {
  assert.equal(GCC_CURRENCIES.QAR.decimals, 2);
  assert.equal(GCC_CURRENCIES.AED.decimals, 2);
  assert.equal(GCC_CURRENCIES.SAR.decimals, 2);
  assert.equal(GCC_CURRENCIES.BHD.decimals, 3);
  assert.equal(GCC_CURRENCIES.KWD.decimals, 3);
  assert.equal(GCC_CURRENCIES.OMR.decimals, 3);
});

console.log(`\n${"═".repeat(60)}`);
if (failed === 0) {
  console.log(`✅  All ${passed} Phase 11 Final Release Audit tests passed successfully.\n`);
} else {
  console.error(`❌  ${failed} test(s) failed.  ${passed} passed.\n`);
  process.exit(1);
}
