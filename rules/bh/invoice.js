/**
 * rules/bh/invoice.js
 *
 * Country: Bahrain (BH)
 * Document Type: invoice
 * Authority: National Bureau for Revenue (NBR) — Kingdom of Bahrain
 *
 * VAT rate is 10% (effective 1 January 2022). Tax invoices require seller TRN, sequential numbering, full line-item VAT breakdown. E-invoicing mandate status: OFFICIAL_SPECIFICATION_UNAVAILABLE.
 *
 * DISCLAIMER: Bahrain VAT is 10% (raised from 5% in January 2022). E-invoicing requirements are OFFICIAL_SPECIFICATION_UNAVAILABLE pending NBR mandate publication.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "BH",
        country_name: "Bahrain",
        document_type: "invoice",
        currency: "BHD",
        vat_rate: 0.1,
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
                "code": "BH_INV_EINVOICE",
                "description": "Bahrain structured e-invoice mandate \u2014 specification not yet published",
                "status": "OFFICIAL_SPECIFICATION_UNAVAILABLE",
                "field": "einvoice",
                "test": null
        }
],
        source_registry: [
        {
                "code": "BH_INVOICE_RULES",
                "status": "IMPLEMENTED",
                "authority": "National Bureau for Revenue (NBR) \u2014 Kingdom of Bahrain",
                "sourceTitle": "NBR \u2014 VAT Decree-Law No. 48 of 2018 and NBR VAT Invoicing Guide",
                "sourceUrl": "https://www.nbr.gov.bh/",
                "version": "2026-09",
                "publishedDate": "2018-12-01",
                "effectiveDate": "2019-01-01",
                "lastVerified": "2026-09-01",
                "notes": "VAT rate is 10% (effective 1 January 2022). Tax invoices require seller TRN, sequential numbering, full line-item VAT breakdown. E-invoicing mandate status: OFFICIAL_SPECIFICATION_UNAVAILABLE."
        }
],
        customValidate,
    };
}
