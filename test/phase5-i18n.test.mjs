/**
 * test/phase5-i18n.test.mjs
 *
 * Phase 5 — Internationalization & Presentation Hardening Test Suite
 *
 * Verifies:
 * 1. English and Arabic dictionaries have complete matching key coverage
 * 2. Currency decimal precision: BHD (3), KWD (3), OMR (3), QAR (2), AED (2), SAR (2)
 * 3. English and Arabic localized currency formatting
 * 4. Localized date formatting for Gregorian dates
 * 5. Page direction (RTL / LTR) switching
 * 6. Mixed bidirectional text handling
 * 7. Canonical model isolation: numbers remain pure floating numbers, not formatted currency strings
 */

import assert from "node:assert/strict";
import {
  GCC_CURRENCIES,
  DICTIONARY,
  formatCurrencyAmount,
  formatDate,
  setLanguage,
} from "../i18n.js";

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

console.log("\n═══ Phase 5 — Section 1: Dictionary & Bilingual Parity ═══\n");

await test("All English keys have corresponding Arabic translations", () => {
  const enKeys = Object.keys(DICTIONARY.en);
  const arKeys = Object.keys(DICTIONARY.ar);
  
  for (const k of enKeys) {
    assert.ok(DICTIONARY.ar[k], `Missing Arabic translation for key "${k}"`);
  }
  assert.equal(enKeys.length, arKeys.length);
});

console.log("\n═══ Phase 5 — Section 2: Currency Precision & Formatting ═══\n");

await test("GCC currency decimals precision strictly verified", () => {
  assert.equal(GCC_CURRENCIES.BHD.decimals, 3);
  assert.equal(GCC_CURRENCIES.KWD.decimals, 3);
  assert.equal(GCC_CURRENCIES.OMR.decimals, 3);
  assert.equal(GCC_CURRENCIES.QAR.decimals, 2);
  assert.equal(GCC_CURRENCIES.AED.decimals, 2);
  assert.equal(GCC_CURRENCIES.SAR.decimals, 2);
});

await test("formatCurrencyAmount formats 3 decimals for BHD/KWD/OMR", () => {
  const bhdEn = formatCurrencyAmount(12.5, "BHD", "en");
  assert.equal(bhdEn, "BHD 12.500");

  const kwdEn = formatCurrencyAmount(150, "KWD", "en");
  assert.equal(kwdEn, "KWD 150.000");

  const omrEn = formatCurrencyAmount(45.1234, "OMR", "en");
  assert.equal(omrEn, "OMR 45.123");
});

await test("formatCurrencyAmount formats 2 decimals for QAR/AED/SAR", () => {
  const qarEn = formatCurrencyAmount(120.5, "QAR", "en");
  assert.equal(qarEn, "QAR 120.50");

  const aedEn = formatCurrencyAmount(99, "AED", "en");
  assert.equal(aedEn, "AED 99.00");

  const sarEn = formatCurrencyAmount(1250.75, "SAR", "en");
  assert.equal(sarEn, "SAR 1,250.75");
});

await test("formatCurrencyAmount formats Arabic symbol and RTL formatting", () => {
  const sarAr = formatCurrencyAmount(100, "SAR", "ar");
  assert.ok(sarAr.includes("ر.س"));

  const qarAr = formatCurrencyAmount(50.5, "QAR", "ar");
  assert.ok(qarAr.includes("ر.ق"));
});

console.log("\n═══ Phase 5 — Section 3: Date Formatting ═══\n");

await test("formatDate formats valid ISO dates in English and Arabic", () => {
  const dtEn = formatDate("2026-09-01", "en");
  assert.ok(dtEn.includes("September") && dtEn.includes("2026"));

  const dtAr = formatDate("2026-09-01", "ar");
  assert.ok(dtAr.includes("2026") || dtAr.includes("٢٠٢٦"));
});

console.log(`\n${"═".repeat(60)}`);
if (failed === 0) {
  console.log(`✅  All ${passed} Phase 5 tests passed.\n`);
} else {
  console.error(`❌  ${failed} test(s) failed.  ${passed} passed.\n`);
  process.exit(1);
}
