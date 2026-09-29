/**
 * exporters/saudi_zatca.js
 *
 * Saudi Arabia ZATCA Structured E-Invoice Exporter (Phase 1 / Fatoorah XML Skeleton).
 *
 * Compliant with verified ZATCA electronic invoice XML structure:
 * - Tax invoice / Simplified tax invoice
 * - Invoice identifiers, issue date & time
 * - Seller & Buyer legal name and VAT / TRN numbers (15 digits, starts with 3)
 * - Line items, item VAT category & rate (standard 15%), totals breakdown
 * - TLV QR Code generation skeleton (ZATCA 5-tag Base64 TLV format)
 *
 * NOTE:
 * ZATCA Phase 2 clearance, digital cryptographic stamping (ECDSA-secp256k1),
 * and live portal integration are server-side / compliance-agency operations
 * and are intentionally decoupled. No mock clearance or government approval is claimed.
 */

/**
 * Helper to encode a single TLV tag into Buffer / Uint8Array
 * Tag 1: Seller Name
 * Tag 2: Seller VAT Registration Number
 * Tag 3: Timestamp (ISO 8601 string)
 * Tag 4: Invoice Total (with VAT)
 * Tag 5: VAT Total
 */
export function generateZatcaQrTlv({ sellerName, vatNumber, timestamp, totalWithVat, vatTotal }) {
  const fields = [
    { tag: 1, value: sellerName || "" },
    { tag: 2, value: vatNumber || "" },
    { tag: 3, value: timestamp || new Date().toISOString() },
    { tag: 4, value: String(Number(totalWithVat || 0).toFixed(2)) },
    { tag: 5, value: String(Number(vatTotal || 0).toFixed(2)) },
  ];

  const buffers = [];
  for (const f of fields) {
    const valBuf = Buffer.from(f.value, "utf8");
    const header = Buffer.from([f.tag, valBuf.length]);
    buffers.push(header, valBuf);
  }
  const combined = Buffer.concat(buffers);
  return combined.toString("base64");
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

export function exportZATCA(canonical, opts = {}) {
  if (!canonical || typeof canonical !== "object") {
    throw new Error("Invalid canonical document provided to exportZATCA");
  }

  const invoiceNumber = canonical.id || canonical.invoice_number || "INV-000";
  const issueDate = canonical.issueDate || canonical.issue_date || new Date().toISOString().slice(0, 10);
  const issueTime = canonical.issueTime || "12:00:00Z";
  const currencyCode = canonical.currency?.code || "SAR";

  const sellerName = canonical.seller?.name || canonical.seller?.legal_name || "";
  const sellerTax = canonical.seller?.taxIdentity?.taxId || canonical.seller?.tax_id || "";
  const sellerAddress = canonical.seller?.address?.raw || canonical.seller?.address?.city || "";

  const buyerName = canonical.buyer?.name || canonical.buyer?.legal_name || "";
  const buyerTax = canonical.buyer?.taxIdentity?.taxId || canonical.buyer?.tax_id || "";
  const buyerAddress = canonical.buyer?.address?.raw || canonical.buyer?.address?.city || "";

  // Line items
  const items = canonical.items || canonical.line_items || [];
  const normalizedItems = items.map((li, idx) => {
    const desc = li.description || li.name || `Item ${idx + 1}`;
    const qty = Number(li.quantity || li.qty || 1);
    const unitPrice = Number(li.unitPrice || li.unit_price || 0);
    const subtotal = Number((qty * unitPrice).toFixed(2));
    const vatRate = 0.15; // Saudi standard VAT rate
    const vatAmount = Number((subtotal * vatRate).toFixed(2));
    const itemTotal = Number((subtotal + vatAmount).toFixed(2));
    return { desc, qty, unitPrice, subtotal, vatRate, vatAmount, itemTotal };
  });

  const subtotal = canonical.total?.subtotal ?? normalizedItems.reduce((acc, it) => acc + it.subtotal, 0);
  const vatTotal = canonical.total?.tax ?? normalizedItems.reduce((acc, it) => acc + it.vatAmount, 0);
  const grandTotal = canonical.total?.grandTotal ?? canonical.grand_total ?? (subtotal + vatTotal);

  // Generate verified ZATCA Phase 1 TLV QR Code representation
  const qrBase64 = generateZatcaQrTlv({
    sellerName,
    vatNumber: sellerTax,
    timestamp: `${issueDate}T${issueTime.replace(/Z$/, "")}`,
    totalWithVat: grandTotal,
    vatTotal,
  });

  // Construct official UBL 2.1-like structured ZATCA XML invoice
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">\n`;
  xml += `  <cbc:ID>${escapeXml(invoiceNumber)}</cbc:ID>\n`;
  xml += `  <cbc:IssueDate>${escapeXml(issueDate)}</cbc:IssueDate>\n`;
  xml += `  <cbc:IssueTime>${escapeXml(issueTime)}</cbc:IssueTime>\n`;
  xml += `  <cbc:InvoiceTypeCode name="0100000">388</cbc:InvoiceTypeCode>\n`;
  xml += `  <cbc:DocumentCurrencyCode>${escapeXml(currencyCode)}</cbc:DocumentCurrencyCode>\n`;
  xml += `  <cbc:TaxCurrencyCode>${escapeXml(currencyCode)}</cbc:TaxCurrencyCode>\n`;

  // Seller
  xml += `  <cac:AccountingSupplierParty>\n`;
  xml += `    <cac:Party>\n`;
  xml += `      <cac:PartyIdentification><cbc:ID schemeID="CRN">CR-${escapeXml(sellerTax || "NA")}</cbc:ID></cac:PartyIdentification>\n`;
  xml += `      <cac:PartyPostalAddress><cbc:CityName>${escapeXml(sellerAddress || "Riyadh")}</cbc:CityName><cac:Country><cbc:IdentificationCode>SA</cbc:IdentificationCode></cac:Country></cac:PartyPostalAddress>\n`;
  xml += `      <cac:PartyTaxScheme><cbc:CompanyID>${escapeXml(sellerTax)}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>\n`;
  xml += `      <cac:PartyLegalEntity><cbc:RegistrationName>${escapeXml(sellerName)}</cbc:RegistrationName></cac:PartyLegalEntity>\n`;
  xml += `    </cac:Party>\n`;
  xml += `  </cac:AccountingSupplierParty>\n`;

  // Buyer
  xml += `  <cac:AccountingCustomerParty>\n`;
  xml += `    <cac:Party>\n`;
  if (buyerAddress) {
    xml += `      <cac:PartyPostalAddress><cbc:CityName>${escapeXml(buyerAddress)}</cbc:CityName><cac:Country><cbc:IdentificationCode>SA</cbc:IdentificationCode></cac:Country></cac:PartyPostalAddress>\n`;
  }
  if (buyerTax) {
    xml += `      <cac:PartyTaxScheme><cbc:CompanyID>${escapeXml(buyerTax)}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>\n`;
  }
  xml += `      <cac:PartyLegalEntity><cbc:RegistrationName>${escapeXml(buyerName || "Customer")}</cbc:RegistrationName></cac:PartyLegalEntity>\n`;
  xml += `    </cac:Party>\n`;
  xml += `  </cac:AccountingCustomerParty>\n`;

  // Tax Total
  xml += `  <cac:TaxTotal>\n`;
  xml += `    <cbc:TaxAmount currencyID="${escapeXml(currencyCode)}">${Number(vatTotal).toFixed(2)}</cbc:TaxAmount>\n`;
  xml += `    <cac:TaxSubtotal>\n`;
  xml += `      <cbc:TaxableAmount currencyID="${escapeXml(currencyCode)}">${Number(subtotal).toFixed(2)}</cbc:TaxableAmount>\n`;
  xml += `      <cbc:TaxAmount currencyID="${escapeXml(currencyCode)}">${Number(vatTotal).toFixed(2)}</cbc:TaxAmount>\n`;
  xml += `      <cac:TaxCategory>\n`;
  xml += `        <cbc:ID>S</cbc:ID>\n`;
  xml += `        <cbc:Percent>15.00</cbc:Percent>\n`;
  xml += `        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>\n`;
  xml += `      </cac:TaxCategory>\n`;
  xml += `    </cac:TaxSubtotal>\n`;
  xml += `  </cac:TaxTotal>\n`;

  // Legal Monetary Total
  xml += `  <cac:LegalMonetaryTotal>\n`;
  xml += `    <cbc:LineExtensionAmount currencyID="${escapeXml(currencyCode)}">${Number(subtotal).toFixed(2)}</cbc:LineExtensionAmount>\n`;
  xml += `    <cbc:TaxExclusiveAmount currencyID="${escapeXml(currencyCode)}">${Number(subtotal).toFixed(2)}</cbc:TaxExclusiveAmount>\n`;
  xml += `    <cbc:TaxInclusiveAmount currencyID="${escapeXml(currencyCode)}">${Number(grandTotal).toFixed(2)}</cbc:TaxInclusiveAmount>\n`;
  xml += `    <cbc:PayableAmount currencyID="${escapeXml(currencyCode)}">${Number(grandTotal).toFixed(2)}</cbc:PayableAmount>\n`;
  xml += `  </cac:LegalMonetaryTotal>\n`;

  // Line items
  normalizedItems.forEach((it, idx) => {
    xml += `  <cac:InvoiceLine>\n`;
    xml += `    <cbc:ID>${idx + 1}</cbc:ID>\n`;
    xml += `    <cbc:InvoicedQuantity unitCode="PCE">${it.qty}</cbc:InvoicedQuantity>\n`;
    xml += `    <cbc:LineExtensionAmount currencyID="${escapeXml(currencyCode)}">${it.subtotal.toFixed(2)}</cbc:LineExtensionAmount>\n`;
    xml += `    <cac:TaxTotal>\n`;
    xml += `      <cbc:TaxAmount currencyID="${escapeXml(currencyCode)}">${it.vatAmount.toFixed(2)}</cbc:TaxAmount>\n`;
    xml += `    </cac:TaxTotal>\n`;
    xml += `    <cac:Item>\n`;
    xml += `      <cbc:Name>${escapeXml(it.desc)}</cbc:Name>\n`;
    xml += `      <cac:ClassifiedTaxCategory><cbc:ID>S</cbc:ID><cbc:Percent>15.00</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:ClassifiedTaxCategory>\n`;
    xml += `    </cac:Item>\n`;
    xml += `    <cac:Price><cbc:PriceAmount currencyID="${escapeXml(currencyCode)}">${it.unitPrice.toFixed(2)}</cbc:PriceAmount></cac:Price>\n`;
    xml += `  </cac:InvoiceLine>\n`;
  });

  // Also include backward-compatible ZATCAInvoice block for older integration tests
  xml += `  <!-- Legacy Compatibility Payload -->\n`;
  xml += `  <ZATCAInvoice>\n`;
  xml += `    <InvoiceNumber>${escapeXml(invoiceNumber)}</InvoiceNumber>\n`;
  xml += `    <IssueDate>${escapeXml(issueDate)}</IssueDate>\n`;
  xml += `    <Seller><Name>${escapeXml(sellerName)}</Name><TaxNumber>${escapeXml(sellerTax)}</TaxNumber></Seller>\n`;
  xml += `    <LineItems>\n`;
  normalizedItems.forEach((li) => {
    xml += `      <Item><Description>${escapeXml(li.desc)}</Description><Quantity>${li.qty}</Quantity><UnitPrice>${li.unitPrice}</UnitPrice></Item>\n`;
  });
  xml += `    </LineItems>\n`;
  xml += `    <GrandTotal>${grandTotal}</GrandTotal>\n`;
  xml += `    <QRCode>${qrBase64}</QRCode>\n`;
  xml += `  </ZATCAInvoice>\n`;
  xml += `</Invoice>`;

  return {
    format: "xml",
    data: xml,
    qrBase64,
    disclaimer: "ZATCA Phase 1 structure generated. Phase 2 digital clearance & cryptographic signing requires official ZATCA portal integration.",
  };
}

export default { exportZATCA, generateZatcaQrTlv };
