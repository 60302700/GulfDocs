/**
 * test/phase2-rules.test.mjs
 *
 * Phase 2 — GCC Rules Engine Tests
 *
 * Tests all 30 country/document combinations for:
 *   - Module loads and returns correct shape
 *   - Country isolation (no cross-contamination)
 *   - Document-type isolation (no cross-contamination)
 *   - validateDocument() produces valid/invalid results with the engine
 *   - Country switching changes rules
 *   - Document switching changes rules
 */

import assert from "node:assert/strict";
import { getRules } from "../rules/index.js";
import { validateDocument } from "../rules/engine.js";

const COUNTRIES = ["qa", "ae", "sa", "bh", "kw", "om"];
const DOC_TYPES = ["invoice", "payslip", "quotation", "purchase_order", "billing_details"];

// ─────────────────────────────────────────────────────────────────────────────
//  Canonical helpers — produce minimal VALID documents per type
// ─────────────────────────────────────────────────────────────────────────────
function minimalInvoice(country) { return { documentType: "invoice", country, id: "INV-001", issueDate: "2026-09-01", currency: { code: "USD" }, seller: { name: "Seller Co", taxIdentity: { taxId: "123456789012345" }, address: { raw: "123 Main St" } }, buyer: { name: "Buyer Co", taxIdentity: { taxId: "" }, address: { raw: "" } }, items: [{ id: "1", unitPrice: 100, quantity: 1, totalAmount: 100 }], taxes: [{ amount: 5, taxableAmount: 100 }], total: { subtotal: 100, tax: 5, discount: 0, grandTotal: 105 } }; }
function minimalPayslip(country) { return { documentType: "payslip", country, employer: { name: "Employer LLC" }, employee: { name: "John Doe", id: "EMP-001" }, payPeriod: "2026-09", payDate: "2026-09-25", grossPay: 3000, netPay: 2700, currency: { code: "USD" } }; }
function minimalQuotation(country) { return { documentType: "quotation", country, id: "QT-001", issueDate: "2026-09-01", validUntil: "2026-10-01", currency: { code: "USD" }, seller: { name: "Seller Co", address: { raw: "Addr" } }, buyer: { name: "Buyer Co" }, items: [{ id: "1", unitPrice: 50, quantity: 2, totalAmount: 100 }], taxes: [{ amount: 0, taxableAmount: 100 }], total: { subtotal: 100, tax: 0, discount: 0, grandTotal: 100 } }; }
function minimalPurchaseOrder(country) { return { documentType: "purchase_order", country, id: "PO-001", issueDate: "2026-09-01", currency: { code: "USD" }, buyer: { name: "Buyer Co", address: { raw: "Addr" } }, supplier: { name: "Supplier Ltd" }, items: [{ id: "1", unitPrice: 200, quantity: 1, totalAmount: 200 }], taxes: [{ amount: 0, taxableAmount: 200 }], total: { subtotal: 200, tax: 0, discount: 0, grandTotal: 200 } }; }
function minimalBillingDetails(country) { return { documentType: "billing_details", country, beneficiary: { name: "Beneficiary" }, bankAccount: { bankName: "National Bank", iban: (country || "QA") + "29NBOK0000000000123456", swiftBic: "NBOKQAQAXXX" }, currency: { code: "USD" }, amount: 500, paymentReference: "PAY-2026-001" }; }

const MINIMAL_BUILDERS = {
    invoice: minimalInvoice,
    payslip: minimalPayslip,
    quotation: minimalQuotation,
    purchase_order: minimalPurchaseOrder,
    billing_details: minimalBillingDetails,
};

// ─────────────────────────────────────────────────────────────────────────────
//  Test runner
// ─────────────────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

async function test(label, fn) {
    try {
        await fn();
        console.log(`  ✅ ${label}`);
        passed++;
    } catch (err) {
        console.error(`  ❌ ${label}`);
        console.error(`       ${err.message}`);
        failed++;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  1. All 30 combinations: module shape
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 2 — Section 1: Module shape (30 combinations) ═══\n");

for (const c of COUNTRIES) {
    for (const dt of DOC_TYPES) {
        await test(`${c.toUpperCase()} / ${dt}  — getRules() shape`, async () => {
            const rules = await getRules({ country: c, documentType: dt, issueDate: "2026-09-24" });

            assert.equal(rules.country, c.toUpperCase(), "country code");
            assert.equal(rules.document_type, dt, "document_type");
            assert.ok(typeof rules.currency === "string", "currency is string");
            assert.ok(typeof rules.vat_rate === "number", "vat_rate is number");
            assert.ok(typeof rules.has_vat === "boolean", "has_vat is boolean");
            assert.ok(typeof rules.engine_status === "string", "engine_status is string");
            assert.ok(Array.isArray(rules.required_fields), "required_fields is array");
            assert.ok(Array.isArray(rules.source_registry), "source_registry is array");
            assert.ok(typeof rules.customValidate === "function", "customValidate is function");

            // Source registry must have at least one entry with traceability fields
            const src = rules.source_registry[0];
            assert.ok(src, "source_registry[0] exists");
            assert.ok(src.authority, "authority present");
            assert.ok(src.sourceTitle, "sourceTitle present");
            assert.ok(src.effectiveDate, "effectiveDate present");
            assert.ok(src.status, "source status present");
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  2. VAT / tax-rate isolation (SA=15%, BH=10%, KW/QA=0%)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 2 — Section 2: Tax-rate isolation ═══\n");

await test("SA invoice VAT rate is 15%", async () => {
    const r = await getRules({ country: "sa", documentType: "invoice" });
    assert.equal(r.vat_rate, 0.15, `expected 0.15 got ${r.vat_rate}`);
});
await test("BH invoice VAT rate is 10%", async () => {
    const r = await getRules({ country: "bh", documentType: "invoice" });
    assert.equal(r.vat_rate, 0.10, `expected 0.10 got ${r.vat_rate}`);
});
await test("AE invoice VAT rate is 5%", async () => {
    const r = await getRules({ country: "ae", documentType: "invoice" });
    assert.equal(r.vat_rate, 0.05);
});
await test("OM invoice VAT rate is 5%", async () => {
    const r = await getRules({ country: "om", documentType: "invoice" });
    assert.equal(r.vat_rate, 0.05);
});
await test("QA invoice has no VAT (0%)", async () => {
    const r = await getRules({ country: "qa", documentType: "invoice" });
    assert.equal(r.has_vat, false);
    assert.equal(r.vat_rate, 0);
});
await test("KW invoice has no VAT (0%)", async () => {
    const r = await getRules({ country: "kw", documentType: "invoice" });
    assert.equal(r.has_vat, false);
    assert.equal(r.vat_rate, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
//  3. Country switching — rules change, do not leak
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 2 — Section 3: Country switching ═══\n");

for (let i = 0; i < COUNTRIES.length; i++) {
    const from = COUNTRIES[i];
    const to = COUNTRIES[(i + 1) % COUNTRIES.length];
    await test(`Switch ${from.toUpperCase()} → ${to.toUpperCase()} (invoice): no rule leak`, async () => {
        const rA = await getRules({ country: from, documentType: "invoice" });
        const rB = await getRules({ country: to, documentType: "invoice" });
        assert.notEqual(rA.country, rB.country, "country codes differ");
        // Currency should differ for at least some pairs
        // (we just ensure the objects are independent)
        if (rA.currency === rB.currency) {
            // still OK — just make sure the actual objects are not the same reference
            assert.notEqual(rA, rB);
        } else {
            assert.notEqual(rA.currency, rB.currency, `currency should differ: ${from}→${to}`);
        }
        // Extra rules must not carry over
        const aCodes = (rA.extra_rules || []).map(x => x.code);
        const bCodes = (rB.extra_rules || []).map(x => x.code);
        aCodes.forEach(code => {
            assert.ok(!bCodes.includes(code), `Extra rule "${code}" from ${from} leaked into ${to}`);
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
//  4. Document switching — rules change, no cross-contamination
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 2 — Section 4: Document switching ═══\n");

for (const c of COUNTRIES) {
    await test(`${c.toUpperCase()}: Invoice rules ≠ Payslip rules (no VAT in payslip)`, async () => {
        const invRules = await getRules({ country: c, documentType: "invoice" });
        const payRules = await getRules({ country: c, documentType: "payslip" });
        assert.equal(invRules.document_type, "invoice");
        assert.equal(payRules.document_type, "payslip");
        // Payslip required_fields must NOT contain VAT/tax invoice fields
        const payFields = payRules.required_fields.join("|");
        assert.ok(!payFields.includes("taxIdentity"), `taxIdentity leaked into payslip required fields for ${c}`);
        assert.ok(!payFields.includes("taxes"), `taxes leaked into payslip required fields for ${c}`);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
//  5. validateDocument() — minimal-valid canonical returns valid=true
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 2 — Section 5: engine.js — valid canonical ═══\n");

for (const c of COUNTRIES) {
    for (const dt of DOC_TYPES) {
        await test(`${c.toUpperCase()} / ${dt} — valid canonical → valid=true`, async () => {
            const rules = await getRules({ country: c, documentType: dt });
            const canonical = MINIMAL_BUILDERS[dt](c.toUpperCase());
            const result = validateDocument(canonical, rules);
            assert.ok(result.valid !== undefined, "valid field present");
            assert.ok(Array.isArray(result.errors), "errors is array");
            assert.ok(Array.isArray(result.warnings), "warnings is array");
            assert.ok(typeof result.disclaimer === "string", "disclaimer present");
            // A properly-filled minimal document should pass (warnings OK, errors should be 0)
            const blockers = result.errors.filter(e => e.code !== "RULES_NOT_IMPLEMENTED");
            assert.equal(blockers.length, 0, `Unexpected errors: ${JSON.stringify(blockers)}`);
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  6. validateDocument() — missing required fields produce errors
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 2 — Section 6: engine.js — missing fields produce errors ═══\n");

await test("Invoice: missing seller.name → error", async () => {
    const rules = await getRules({ country: "ae", documentType: "invoice" });
    const doc = minimalInvoice("AE");
    doc.seller.name = "";
    const { errors } = validateDocument(doc, rules);
    const hit = errors.find(e => e.field === "seller.name" && e.code === "MISSING_REQUIRED_FIELD");
    assert.ok(hit, "Expected MISSING_REQUIRED_FIELD for seller.name");
});

await test("Payslip: netPay > grossPay → error", async () => {
    const rules = await getRules({ country: "ae", documentType: "payslip" });
    const doc = minimalPayslip("AE");
    doc.netPay = 9999;
    doc.grossPay = 100;
    const { errors } = validateDocument(doc, rules);
    const hit = errors.find(e => e.code === "NET_EXCEEDS_GROSS");
    assert.ok(hit, "Expected NET_EXCEEDS_GROSS error");
});

await test("Invoice: totals math wrong → error (engine cross-field)", async () => {
    const rules = await getRules({ country: "sa", documentType: "invoice" });
    const doc = minimalInvoice("SA");
    doc.total.grandTotal = 999; // deliberately wrong
    const { errors } = validateDocument(doc, rules);
    const hit = errors.find(e => e.code === "TOTALS_MATH_ERROR");
    assert.ok(hit, "Expected TOTALS_MATH_ERROR");
});

await test("SA invoice: TRN not starting with 3 → customValidate error", async () => {
    const rules = await getRules({ country: "sa", documentType: "invoice" });
    const doc = minimalInvoice("SA");
    doc.seller.taxIdentity.taxId = "123456789012345"; // does NOT start with 3
    const { errors } = validateDocument(doc, rules);
    const hit = errors.find(e => e.code === "SA_VAT_NUMBER_FORMAT");
    assert.ok(hit, "Expected SA_VAT_NUMBER_FORMAT error");
});

await test("AE invoice: TRN not 15 digits → customValidate error", async () => {
    const rules = await getRules({ country: "ae", documentType: "invoice" });
    const doc = minimalInvoice("AE");
    doc.seller.taxIdentity.taxId = "12345"; // too short
    const { errors } = validateDocument(doc, rules);
    const hit = errors.find(e => e.code === "AE_TRN_FORMAT");
    assert.ok(hit, "Expected AE_TRN_FORMAT error");
});

await test("Country mismatch → error", async () => {
    const rules = await getRules({ country: "qa", documentType: "invoice" });
    const doc = minimalInvoice("AE"); // wrong country on canonical
    const { errors } = validateDocument(doc, rules);
    const hit = errors.find(e => e.code === "COUNTRY_MISMATCH");
    assert.ok(hit, "Expected COUNTRY_MISMATCH error");
});

await test("Unknown country → NOT_YET_IMPLEMENTED", async () => {
    const rules = await getRules({ country: "XX", documentType: "invoice" });
    assert.equal(rules.engine_status, "NOT_YET_IMPLEMENTED");
});

await test("Unknown document type → NOT_YET_IMPLEMENTED", async () => {
    const rules = await getRules({ country: "qa", documentType: "unknown_thing" });
    assert.equal(rules.engine_status, "NOT_YET_IMPLEMENTED");
});

// ─────────────────────────────────────────────────────────────────────────────
//  7. Extra rules / future-requirement flags
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══ Phase 2 — Section 7: Extra rules metadata ═══\n");

await test("SA invoice has ZATCA Phase 2 FUTURE_REQUIREMENT extra rule", async () => {
    const rules = await getRules({ country: "sa", documentType: "invoice" });
    const hit = rules.extra_rules.find(r => r.code === "SA_INV_ZATCA_PHASE2" && r.status === "FUTURE_REQUIREMENT");
    assert.ok(hit, "Expected SA_INV_ZATCA_PHASE2 future-requirement rule");
});

await test("OM invoice has Fawtara FUTURE_REQUIREMENT extra rule", async () => {
    const rules = await getRules({ country: "om", documentType: "invoice" });
    const hit = rules.extra_rules.find(r => r.code === "OM_INV_FAWTARA" && r.status === "FUTURE_REQUIREMENT");
    assert.ok(hit, "Expected OM_INV_FAWTARA future-requirement rule");
});

await test("KW invoice has VAT FUTURE_REQUIREMENT extra rule", async () => {
    const rules = await getRules({ country: "kw", documentType: "invoice" });
    const hit = rules.extra_rules.find(r => r.status === "FUTURE_REQUIREMENT");
    assert.ok(hit, "Expected KW future-requirement rule on invoice");
});

await test("BH invoice has OFFICIAL_SPECIFICATION_UNAVAILABLE e-invoice extra rule", async () => {
    const rules = await getRules({ country: "bh", documentType: "invoice" });
    const hit = rules.extra_rules.find(r => r.status === "OFFICIAL_SPECIFICATION_UNAVAILABLE");
    assert.ok(hit, "Expected BH OFFICIAL_SPECIFICATION_UNAVAILABLE e-invoice rule");
});

// ─────────────────────────────────────────────────────────────────────────────
//  Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${"═".repeat(60)}`);
if (failed === 0) {
    console.log(`✅  All ${passed} tests passed.\n`);
} else {
    console.error(`❌  ${failed} test(s) failed.  ${passed} passed.\n`);
    process.exit(1);
}
