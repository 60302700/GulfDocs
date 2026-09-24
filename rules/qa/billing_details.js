/**
 * rules/qa/billing_details.js
 *
 * Country: Qatar (QA)
 * Document Type: billing_details
 * Authority: Qatar Tax Authority (QTA) / Ministry of Finance Qatar
 *
 * IBAN standard applies for Qatar (QA + 2 check digits + 25 alphanumeric).
 *
 * DISCLAIMER: Qatar does not currently impose Value Added Tax. Regulatory requirements are based on the Qatar Commercial Law (Law No. 27/2006) and Qatar Tax Authority guidance.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "QA",
        country_name: "Qatar",
        document_type: "billing_details",
        currency: "QAR",
        vat_rate: 0.0,
        has_vat: false,
        engine_status: "IMPLEMENTED",
        transaction_type: transactionType,
        effective_from: issueDate || new Date().toISOString().slice(0, 10),
        required_fields: [
        "beneficiary.name",
        "bankAccount.bankName",
        "currency.code",
        "amount",
        "paymentReference"
],
        warning_fields: [
        "bankAccount.iban",
        "bankAccount.swiftBic"
],
        extra_rules: [],
        source_registry: [
        {
                "code": "QA_BILLING_DETAILS_RULES",
                "status": "IMPLEMENTED",
                "authority": "Qatar Tax Authority (QTA) / Ministry of Finance Qatar",
                "sourceTitle": "Qatar Central Bank \u2014 Payment Systems Regulation",
                "sourceUrl": "https://www.qcb.gov.qa/",
                "version": "2026-09",
                "publishedDate": "2020-01-01",
                "effectiveDate": "2020-01-01",
                "lastVerified": "2026-09-01",
                "notes": "IBAN standard applies for Qatar (QA + 2 check digits + 25 alphanumeric)."
        }
],
        customValidate,
    };
}
