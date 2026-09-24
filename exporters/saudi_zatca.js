export function exportZATCA(canonical, opts = {}) {
  // Minimal mapping skeleton to ZATCA-like XML (no signing, no submission)
  // This function returns a simple XML string for demonstration and tests.
  const invoiceNumber = canonical.invoice_number || "INV-000";
  const issueDate =
    canonical.issue_date || new Date().toISOString().slice(0, 10);
  const sellerName = canonical.seller?.legal_name || "";
  const sellerTax = canonical.seller?.tax_id || "";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<ZATCAInvoice>\n  <InvoiceNumber>${escapeXml(invoiceNumber)}</InvoiceNumber>\n  <IssueDate>${escapeXml(issueDate)}</IssueDate>\n  <Seller>\n    <Name>${escapeXml(sellerName)}</Name>\n    <TaxNumber>${escapeXml(sellerTax)}</TaxNumber>\n  </Seller>\n`;

  xml += `  <LineItems>\n`;
  (canonical.line_items || []).forEach((li) => {
    xml += `    <Item><Description>${escapeXml(li.description || "")}</Description><Quantity>${li.quantity || 0}</Quantity><UnitPrice>${li.unit_price || 0}</UnitPrice></Item>\n`;
  });
  xml += `  </LineItems>\n  <GrandTotal>${canonical.grand_total || 0}</GrandTotal>\n</ZATCAInvoice>`;

  return { format: "xml", data: xml };
}

function escapeXml(s) {
  if (s == null) return "";
  return String(s).replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
}

export default { exportZATCA };
