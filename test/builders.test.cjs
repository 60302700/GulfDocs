const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const filesToTest = [
  { html: "invoice.html", js: "scripts.js", func: "buildCanonicalInvoice", type: "invoice" },
  { html: "payslip.html", js: "payslip.js", func: "buildCanonicalPayslip", type: "payslip" },
  { html: "quotation.html", js: "quotation.js", func: "buildCanonicalQuotation", type: "quotation" },
  { html: "purchase-order.html", js: "purchase-order.js", func: "buildCanonicalPurchaseOrder", type: "purchase_order" },
  { html: "billing-details.html", js: "billing-details.js", func: "buildCanonicalBillingDetails", type: "billing_details" },
];

(async function () {
  let passed = 0;
  for (const t of filesToTest) {
    const htmlPath = path.join(__dirname, "..", t.html);
    const jsPath = path.join(__dirname, "..", t.js);
    const htmlCode = fs.readFileSync(htmlPath, "utf-8");
    const jsCode = fs.readFileSync(jsPath, "utf-8");

    const dom = new JSDOM(htmlCode, { runScripts: "dangerously" });
    const window = dom.window;
    
    const scriptEl = window.document.createElement("script");
    scriptEl.textContent = jsCode;
    window.document.head.appendChild(scriptEl);

    // Some scripts add event listeners on DOMContentLoaded
    // so we manually trigger it
    const event = window.document.createEvent("Event");
    event.initEvent("DOMContentLoaded", true, true);
    window.document.dispatchEvent(event);

    const builder = window[t.func];
    if (!builder) {
      console.error(`❌ ${t.func} missing in ${t.js}`);
      continue;
    }

    try {
      const canonical = builder();
      // Check required canonical common fields
      assert.ok(canonical.id !== undefined, `${t.type} missing id`);
      assert.ok(canonical.documentType === t.type, `${t.type} bad documentType`);
      assert.ok(canonical.country !== undefined, `${t.type} missing country`);
      assert.ok(canonical.language === "en", `${t.type} bad language`);
      assert.ok(canonical.currency && canonical.currency.code, `${t.type} missing currency`);
      assert.ok(canonical.issueDate !== undefined, `${t.type} missing issueDate`);
      assert.ok(canonical.status !== undefined, `${t.type} missing status`);
      assert.ok(canonical.version !== undefined, `${t.type} missing version`);
      
      // Additional checks
      if (t.type === "payslip") {
        assert.ok(canonical.employer !== undefined, "payslip missing employer");
        assert.ok(canonical.employee !== undefined, "payslip missing employee");
        assert.ok(canonical.netPay !== undefined, "payslip missing netPay");
      } else if (t.type === "billing_details") {
        assert.ok(canonical.beneficiary !== undefined, "billing missing beneficiary");
        assert.ok(canonical.bankAccount !== undefined, "billing missing bankAccount");
        assert.ok(canonical.amount !== undefined, "billing missing amount");
      } else {
        assert.ok(canonical.items !== undefined, `${t.type} missing items`);
        assert.ok(canonical.taxes !== undefined, `${t.type} missing taxes`);
        assert.ok(canonical.total !== undefined, `${t.type} missing total`);
      }
      
      console.log(`✅ ${t.func} generates valid canonical object.`);
      passed++;
    } catch(err) {
      console.error(`❌ ${t.func} threw error: ${err.message}`);
    }
  }

  if (passed === filesToTest.length) {
    console.log("\\nAll builders passed cross-document consistency checks.");
  } else {
    process.exit(1);
  }
})();
