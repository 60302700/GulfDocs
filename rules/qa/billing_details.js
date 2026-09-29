/**
 * rules/qa/billing_details.js
 *
 * Country: Qatar (QA)
 * Document Type: billing_details
 * Authority: Qatar Central Bank (QCB)
 *
 * Qatar IBAN standard requires 29 characters: QA + 2 check digits + 4 letter bank identifier + 21 account characters.
 *
 * DISCLAIMER: Billing Details is a payment instruction document. Requirements reflect Qatar Central Bank (QCB) standards. This is not a tax invoice.
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
                "authority": "Qatar Central Bank (QCB)",
                "sourceTitle": "Qatar Central Bank — IBAN Standard and Payment Systems Regulation",
                "sourceUrl": "https://www.qcb.gov.qa/",
                "version": "2026-09",
                "publishedDate": "2014-01-01",
                "effectiveDate": "2014-01-01",
                "lastVerified": "2026-09-01",
                "notes": "Qatar IBAN format requires 29 characters: QA + 2 check digits + 4 letter bank code + 21 account characters."
            }
        ],
        customValidate,
    };
}
