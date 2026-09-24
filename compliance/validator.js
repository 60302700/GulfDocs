// Server-compatible validator for canonical invoice + rules
export function validate(canonical, rules = {}) {
  const errors = [];
  const warnings = [];

  const required = rules.required_fields || [];
  required.forEach((path) => {
    const parts = path.split(".");
    let cur = canonical;
    let ok = true;
    for (const p of parts) {
      if (
        cur &&
        Object.prototype.hasOwnProperty.call(cur, p) &&
        cur[p] !== "" &&
        cur[p] != null
      ) {
        cur = cur[p];
      } else {
        ok = false;
        break;
      }
    }
    if (!ok) {
      errors.push({
        field: path,
        code: "MISSING_FIELD",
        message: `${path} is required`,
        category: path.startsWith("seller.")
          ? "Seller"
          : path.startsWith("buyer.")
            ? "Buyer"
            : "Document",
      });
    }
  });

  if (!canonical.line_items || canonical.line_items.length === 0) {
    warnings.push({
      field: "line_items",
      code: "NO_ITEMS",
      message: "No invoice line items added.",
      category: "Document",
    });
  }
  if ((canonical.grand_total || 0) <= 0) {
    warnings.push({
      field: "grand_total",
      code: "ZERO_TOTAL",
      message: "Invoice total is zero.",
      category: "Document",
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

export default { validate };
