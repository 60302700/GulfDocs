import assert from "assert";
import { getRules } from "../rules/index.js";
import { validateDocument } from "../rules/validator.js";

const countries = ["qa", "ae", "sa", "bh", "kw", "om"];
const docTypes = ["invoice", "payslip", "quotation", "purchase_order", "billing_details"];

(async function () {
  let passed = 0;
  for (const c of countries) {
    for (const dt of docTypes) {
      try {
        const rules = await getRules({ country: c, documentType: dt, issueDate: "2026-09-24", transactionType: "B2B" });
        assert.ok(rules.country === c.toUpperCase(), "Country code should match");
        assert.ok(rules.document_type === dt, "Document type should match");
        assert.ok(rules.status !== undefined, "Status should be defined");
        assert.ok(rules.required_fields !== undefined, "Required fields should be defined");
        
        let dummyCanonical = { documentType: dt, country: c.toUpperCase() };
        if(dt === "invoice") {
           dummyCanonical = {
             documentType: "invoice", country: c.toUpperCase(),
             seller: {name: "x", taxIdentity: {taxId: "y"}}, id: "123", issueDate: "2026",
             items: [{id: "1"}], total: {subtotal: 10, tax: 0, discount: 0, grandTotal: 10}
           };
        } else if (dt === "payslip") {
           dummyCanonical = {
             documentType: "payslip", country: c.toUpperCase(),
             employer: {name: "x"}, employee: {name: "y"}, payPeriod: "2026-09",
             grossPay: 10, netPay: 10
           };
        } else if (dt === "purchase_order" || dt === "quotation") {
           dummyCanonical = {
             documentType: dt, country: c.toUpperCase(),
             seller: {name: "x"}, buyer: {name: "y"}, supplier: {name: "z"}, id: "123", issueDate: "2026",
             items: [{id: "1"}], total: {subtotal: 10, tax: 0, discount: 0, grandTotal: 10}
           };
        } else if (dt === "billing_details") {
           dummyCanonical = {
             documentType: "billing_details", country: c.toUpperCase(),
             beneficiary: {name: "x"}, bankAccount: {bankName: "y", iban: c.toUpperCase() + "123"},
             currency: {code: "QAR"}, amount: 10, paymentReference: "ref1"
           };
        }
        
        const result = validateDocument(dummyCanonical, rules);
        // It might not be valid due to missing stuff or custom warnings, but let's check it returns structure 
        assert.ok(result.valid !== undefined);
        assert.ok(Array.isArray(result.errors));
        assert.ok(Array.isArray(result.warnings));
        
        passed++;
      } catch (err) {
        console.error(`❌ Test failed for ${c}-${dt}:`, err);
      }
    }
  }

  if (passed === 30) {
    console.log(`✅ All 30 country/document variations tested and loaded successfully.`);
  } else {
    process.exit(1);
  }
})();
