/**
 * rules/ae/invoice.js
 *
 * Country: United Arab Emirates (AE)
 * Document Type: invoice
 * Authority: Federal Tax Authority (FTA) — UAE
 *
 * Tax invoice (full) required for B2B above AED 10,000. Simplified tax invoice allowed for B2C or below AED 10,000. UAE structured e-invoicing (Haytek) is a separate future requirement.
 *
 * DISCLAIMER: UAE VAT was introduced on 1 January 2018 at 5%. E-invoicing (Haytek) is under development. Rules reflect FTA published VAT invoice requirements.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(canonical) {
        const errors = [];
        const warnings = [];
        const trn = canonical?.seller?.taxIdentity?.taxId || "";
        if (trn && !/^\d{15}$/.test(trn)) {
            errors.push({
                field: "seller.taxIdentity.taxId",
                code: "AE_TRN_FORMAT",
                message: "UAE TRN must be exactly 15 digits.",
                severity: "error",
                source: "AE"
            });
        }
        return { errors, warnings };
    }

    return {
        country: "AE",
        country_name: "United Arab Emirates",
        document_type: "invoice",
        currency: "AED",
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
        "buyer.taxIdentity.taxId",
        "payment.terms"
],
        extra_rules: [
        {
                "code": "AE_INV_TRN_FORMAT",
                "description": "Seller TRN must be 15 digits",
                "status": "IMPLEMENTED",
                "field": "seller.taxIdentity.taxId",
                "test": "trn_15_digits"
        }
],
        source_registry: [
        {
                "code": "AE_INVOICE_RULES",
                "status": "IMPLEMENTED",
                "authority": "Federal Tax Authority (FTA) \u2014 UAE",
                "sourceTitle": "FTA \u2014 VAT Invoice Requirements (Cabinet Decision No. 52 of 2017 and Cabinet Decision No. 3 of 2018)",
                "sourceUrl": "https://tax.gov.ae/",
                "version": "2026-09",
                "publishedDate": "2017-11-26",
                "effectiveDate": "2018-01-01",
                "lastVerified": "2026-09-01",
                "notes": "Tax invoice (full) required for B2B above AED 10,000. Simplified tax invoice allowed for B2C or below AED 10,000. UAE structured e-invoicing (Haytek) is a separate future requirement."
        }
],
        customValidate,
    };
}
