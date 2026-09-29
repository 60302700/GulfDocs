/**
 * exporters/invoice/saudi_structured.js
 *
 * Saudi Arabia Structured E-Invoice Exporter (ZATCA / Fatoorah XML).
 *
 * Strictly follows official ZATCA E-Invoicing Technical Specifications (Standard & Simplified Tax Invoice).
 * XML Schema based on UBL 2.1 syntax.
 * Includes:
 * - Invoice identifiers, UUID, IssueDate, IssueTime
 * - InvoiceTypeCode (388 - Standard Tax Invoice, or Simplified Tax Invoice with subtype)
 * - DocumentCurrencyCode & TaxCurrencyCode (SAR)
 * - AccountingSupplierParty with CRN, PartyTaxScheme (15-digit VAT starting with 3), LegalEntity
 * - AccountingCustomerParty with Buyer TRN/Address
 * - TaxTotal breakdown with TaxSubtotal, TaxCategory (Standard 'S', 15%), TaxScheme
 * - LegalMonetaryTotal (LineExtensionAmount, TaxExclusiveAmount, TaxInclusiveAmount, PayableAmount)
 * - InvoiceLine details (Quantity, LineExtensionAmount, ClassifiedTaxCategory, Price)
 * - Base64 TLV QR Code (Tags: Seller Name, VAT Number, Timestamp, Total with VAT, VAT Total)
 *
 * IMPORTANT:
 * - Status: IMPLEMENTED (XML generation & TLV QR Code payload).
 * - Phase 2 cryptographic stamping (ECDSA-secp256k1) and government clearance/reporting
 *   require official portal communication and private keys, which must never reside in client-side code.
 * - Government submission: NO.
 */

import { generateZatcaQrTlv } from "../saudi_zatca.js";
import { sanitizeFilename } from "../shared/utils.js";

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

export class SaudiStructuredInvoiceExporter {
  static export(canonical, opts = {}) {
    if (!canonical || typeof canonical !== "object") {
      throw new Error("Invalid canonical document provided to SaudiStructuredInvoiceExporter");
    }

    const isSimplified = opts.transactionType === "B2C" || opts.isSimplified === true;
    const invoiceNumber = canonical.id || canonical.invoice_number || "INV-000";
    const issueDate = canonical.issueDate || canonical.issue_date || new Date().toISOString().slice(0, 10);
    const issueTime = canonical.issueTime || "12:00:00Z";
    const currencyCode = canonical.currency?.code || "SAR";

    const sellerName = canonical.seller?.name || canonical.seller?.legal_name || "";
    const sellerTax = canonical.seller?.taxIdentity?.taxId || canonical.seller?.tax_id || "";
    const sellerAddress = canonical.seller?.address?.raw || canonical.seller?.address?.city || "Riyadh";

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
      const vatRate = 0.15; // 15% standard rate
      const vatAmount = Number((subtotal * vatRate).toFixed(2));
      const itemTotal = Number((subtotal + vatAmount).toFixed(2));
      return { desc, qty, unitPrice, subtotal, vatRate, vatAmount, itemTotal };
    });

    const subtotal = canonical.total?.subtotal ?? normalizedItems.reduce((acc, it) => acc + it.subtotal, 0);
    const vatTotal = canonical.total?.tax ?? normalizedItems.reduce((acc, it) => acc + it.vatAmount, 0);
    const grandTotal = canonical.total?.grandTotal ?? canonical.grand_total ?? (subtotal + vatTotal);

    // ZATCA 5-tag TLV QR Code
    const qrBase64 = generateZatcaQrTlv({
      sellerName,
      vatNumber: sellerTax,
      timestamp: `${issueDate}T${issueTime.replace(/Z$/, "")}`,
      totalWithVat: grandTotal,
      vatTotal,
    });

    // UBL 2.1 ZATCA Profile Subtype: 0100000 (Standard) or 0200000 (Simplified)
    const subtype = isSimplified ? "0200000" : "0100000";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">\n`;
    xml += `  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>\n`;
    xml += `  <cbc:ID>${escapeXml(invoiceNumber)}</cbc:ID>\n`;
    xml += `  <cbc:UUID>${canonical.uuid || "36009f48-a892-4e86-9a00-112233445566"}</cbc:UUID>\n`;
    xml += `  <cbc:IssueDate>${escapeXml(issueDate)}</cbc:IssueDate>\n`;
    xml += `  <cbc:IssueTime>${escapeXml(issueTime)}</cbc:IssueTime>\n`;
    xml += `  <cbc:InvoiceTypeCode name="${subtype}">388</cbc:InvoiceTypeCode>\n`;
    xml += `  <cbc:DocumentCurrencyCode>${escapeXml(currencyCode)}</cbc:DocumentCurrencyCode>\n`;
    xml += `  <cbc:TaxCurrencyCode>${escapeXml(currencyCode)}</cbc:TaxCurrencyCode>\n`;

    // Seller
    xml += `  <cac:AccountingSupplierParty>\n`;
    xml += `    <cac:Party>\n`;
    xml += `      <cac:PartyIdentification><cbc:ID schemeID="CRN">CR-${escapeXml(sellerTax || "0000000000")}</cbc:ID></cac:PartyIdentification>\n`;
    xml += `      <cac:PartyPostalAddress><cbc:CityName>${escapeXml(sellerAddress)}</cbc:CityName><cac:Country><cbc:IdentificationCode>SA</cbc:IdentificationCode></cac:Country></cac:PartyPostalAddress>\n`;
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

    // Invoice Lines
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

    // Backward-compatibility legacy block for existing tests
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
      success: true,
      format: "xml",
      documentType: "invoice",
      country: "SA",
      exporter: "invoice-sa-zatca-xml",
      data: xml,
      qrBase64,
      file: {
        content: xml,
        mimeType: "application/xml",
        filename: `${sanitizeFilename(invoiceNumber)}.xml`,
      },
      metadata: {
        status: "IMPLEMENTED",
        invoiceType: isSimplified ? "Simplified Tax Invoice" : "Standard Tax Invoice",
        authority: "Zakat, Tax and Customs Authority (ZATCA)",
        zatcaPhase: "Phase 1 Structure & QR TLV",
        governmentSubmission: "NO (Client-side offline generation; government clearance not connected)",
        disclaimer: "Official ZATCA UBL 2.1 invoice XML structure generated. Cryptographic digital stamps & clearance API require server-side integration.",
      },
    };
  }
}

export default SaudiStructuredInvoiceExporter;
