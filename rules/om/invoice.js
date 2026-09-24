/**
 * rules/om/invoice.js
 *
 * Country: Oman (OM)
 * Document Type: invoice
 * Authority: Oman Tax Authority (OTA)
 *
 * Tax invoices require seller VAT registration number, sequential invoice number, line-item VAT. Fawtara e-invoicing (structured XML exchange) is a separate system not implemented here.
 *
 * DISCLAIMER: Oman VAT is 5% (effective April 2021). Oman's Fawtara e-invoicing system is under development. PDF generation alone does not satisfy Fawtara structured e-invoice exchange.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "OM",
        country_name: "Oman",
        document_type: "invoice",
        currency: "OMR",
        vat_rate: 0.05,
        has_vat: true,
        engine_status: "IMPLEMENTED",
        transaction_type: transactionType,
        effective_from: issueDate || new Date().toISOString().slice(0, 10),
        required_fields: [
        "seller.name",
        "seller.taxIdentity.taxId",
        "seller.address.raw",
        "id",
        "issueDate",
        "buyer.name",
        "items",
        "taxes",
        "total.grandTotal",
        "currency.code"
],
        warning_fields: [
        "buyer.taxIdentity.taxId"
],
        extra_rules: [
        {
                "code": "OM_INV_FAWTARA",
                "description": "Fawtara structured e-invoice exchange \u2014 separate from PDF generation, not yet implemented",
                "status": "FUTURE_REQUIREMENT",
                "field": "fawtara",
                "test": null
        }
],
        source_registry: [
        {
                "code": "OM_INVOICE_RULES",
                "status": "IMPLEMENTED",
                "authority": "Oman Tax Authority (OTA)",
                "sourceTitle": "Oman Value Added Tax Law (Royal Decree No. 121/2020) and OTA Implementing Regulations",
                "sourceUrl": "https://taa.gov.om/",
                "version": "2026-09",
                "publishedDate": "2020-10-18",
                "effectiveDate": "2021-04-16",
                "lastVerified": "2026-09-01",
                "notes": "Tax invoices require seller VAT registration number, sequential invoice number, line-item VAT. Fawtara e-invoicing (structured XML exchange) is a separate system not implemented here."
        }
],
        customValidate,
    };
}
