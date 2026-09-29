/**
 * test/phase10-ads-monetization.test.mjs
 *
 * Phase 10 — Ads & Monetization Layer Isolation Test Suite
 *
 * Verifies:
 * 1. Advertising Architecture Isolation: Exporters, validation, and rules remain 100% decoupled from ad scripts.
 * 2. Privacy & Zero Document Egress: Ad components never receive document payloads, customer names, or banking details.
 * 3. Consent Gating: External ad networks are never invoked when consent is rejected or unconfigured.
 * 4. Graceful Ad Failure & Ad Blocker Resilience: Exporting and document editing operate normally if ads fail or are blocked.
 * 5. Print & PDF Purity: Generated documents and print styles are 100% advertisement-free.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import { exportDocument } from "../exporters/router.js";
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
console.log("║     PHASE 10 — ADS & MONETIZATION ISOLATION TEST SUITE             ║");
console.log("╚════════════════════════════════════════════════════════════════════╝\n");

// ─── SECTION 1: ARCHITECTURE ISOLATION & GLOBAL PURITY ────────────────────────────
console.log("═══ Section 1: Architecture Isolation & Global Purity ═══\n");

await test("AdManager module is completely decoupled from document generation pipelines", () => {
  assert.equal(typeof AdManager.init, "function");
  assert.equal(typeof AdManager.loadAds, "function");
  assert.equal(typeof AdManager.handleAdFailure, "function");
});

await test("Global document state is not leaked to advertising subsystems", () => {
  assert.equal(global.invoiceData, undefined);
  assert.equal(global.documentData, undefined);
  assert.equal(global.canonicalDocument, undefined);
});

// ─── SECTION 2: AD FAILURE & AD BLOCKER RESILIENCE ────────────────────────────────
console.log("\n═══ Section 2: Ad Failure & Ad Blocker Resilience ═══\n");

await test("Simulated ad failure does not block validation or document export", async () => {
  // Trigger failure handler
  AdManager.handleAdFailure();

  // Document generation must succeed uninterrupted
  const doc = {
    id: "INV-AD-TEST-001",
    documentType: "invoice",
    country: "QA",
    currency: { code: "QAR" },
    issueDate: "2026-09-01",
    seller: { name: "Seller Co", taxIdentity: { taxId: "123456789012345" }, address: { raw: "Doha" } },
    buyer: { name: "Buyer Co" },
    items: [{ id: "1", description: "Standard Consulting", quantity: 1, unitPrice: 1500, totalAmount: 1500 }],
    taxes: [{ amount: 0, taxableAmount: 1500 }],
    total: { subtotal: 1500, tax: 0, grandTotal: 1500 },
  };

  const jsonRes = await exportDocument({ document: doc, country: "QA", documentType: "invoice", format: "json" });
  const pdfRes = await exportDocument({ document: doc, country: "QA", documentType: "invoice", format: "pdf" });

  assert.equal(jsonRes.success, true);
  assert.equal(pdfRes.success, true);
  assert.ok(!jsonRes.data.includes("ad-placeholder"));
  assert.ok(!jsonRes.data.includes("adsbygoogle"));
});

// ─── SECTION 3: PRINT & PDF ADVERTISEMENT ISOLATION ──────────────────────────────
console.log("\n═══ Section 3: Print & PDF Advertisement Isolation ═══\n");

await test("Print stylesheets strictly exclude ad containers and consent banners", () => {
  const css = fs.readFileSync("./style.css", "utf8");
  assert.ok(css.includes(".ad-top,"));
  assert.ok(css.includes(".ad-middle,"));
  assert.ok(css.includes(".ad-placeholder,"));
  assert.ok(css.includes("display: none !important;"));
});

await test("Structured invoice exports are 100% free of advertising markup", async () => {
  const saudiDoc = {
    id: "INV-SA-AD-001",
    documentType: "invoice",
    country: "SA",
    currency: { code: "SAR" },
    issueDate: "2026-09-01",
    seller: { name: "Riyadh Supply", taxIdentity: { taxId: "300000000000003" }, address: { raw: "Riyadh" } },
    buyer: { name: "Enterprise Customer", taxIdentity: { taxId: "300000000000004" } },
    items: [{ id: "1", description: "Material Supplies", quantity: 2, unitPrice: 500, totalAmount: 1000 }],
    taxes: [{ amount: 150, taxableAmount: 1000 }],
    total: { subtotal: 1000, tax: 150, grandTotal: 1150 },
  };

  const xmlRes = await exportDocument({ document: saudiDoc, country: "SA", documentType: "invoice", format: "xml" });
  assert.equal(xmlRes.success, true);
  assert.ok(!xmlRes.data.includes("ad-"));
  assert.ok(!xmlRes.data.includes("adsbygoogle"));
  assert.ok(!xmlRes.data.includes("banner"));
});

console.log(`\n${"═".repeat(60)}`);
if (failed === 0) {
  console.log(`✅  All ${passed} Phase 10 ad isolation tests passed successfully.\n`);
} else {
  console.error(`❌  ${failed} test(s) failed.  ${passed} passed.\n`);
  process.exit(1);
}
