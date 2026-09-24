import assert from "assert";
import { validate } from "../compliance/validator.js";
import { routeExport } from "../exporters/router.js";

// Simple smoke tests
(async function () {
  // 1. Validation blocks export when missing required field
  const minimal = {
    seller: { legal_name: "" },
    buyer: {},
    invoice_number: "",
    issue_date: "",
    line_items: [],
    grand_total: 0,
  };
  const rules = { required_fields: ["seller.legal_name", "invoice_number"] };
  const v = validate(minimal, rules);
  assert.strictEqual(
    v.valid,
    false,
    "Validator should mark minimal as invalid",
  );

  // 2. Router returns validation_failed when validation fails
  const r1 = await routeExport(minimal, {
    country: "generic",
    docType: "invoice",
    format: "json",
    rules,
  });
  assert.strictEqual(
    r1.error,
    "validation_failed",
    "Router should block export if validation fails",
  );

  // 3. Router can export JSON when valid
  const good = {
    seller: { legal_name: "ACME" },
    buyer: { legal_name: "Client" },
    invoice_number: "INV-1",
    issue_date: "2026-01-01",
    line_items: [{ description: "x", quantity: 1, unit_price: 10 }],
    grand_total: 10,
  };
  const r2 = await routeExport(good, {
    country: "generic",
    docType: "invoice",
    format: "json",
    rules,
  });
  assert.strictEqual(r2.format, "json");

  // 4. Unsupported exporter returns exporter_not_implemented
  const r3 = await routeExport(good, {
    country: "uae",
    docType: "invoice",
    format: "xml",
    rules,
  });
  assert.strictEqual(r3.error, "exporter_not_implemented");

  console.log("All tests passed");
})();
