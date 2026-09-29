/**
 * rules/om/payslip.js
 *
 * Country: Oman (OM)
 * Document Type: payslip
 * Authority: Ministry of Labour (Oman)
 *
 * Oman Wage Protection System (WPS) mandates electronic salary transfer via Central Bank of Oman (CBO) clearing system. PDF generation alone does not constitute WPS file submission.
 *
 * DISCLAIMER: Oman payroll requirements are governed by Oman Labour Law (Royal Decree No. 53/2023) and Ministry of Labour WPS regulations.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "OM",
        country_name: "Oman",
        document_type: "payslip",
        currency: "OMR",
        vat_rate: 0.0,
        has_vat: false,
        engine_status: "PARTIALLY_IMPLEMENTED",
        transaction_type: transactionType,
        effective_from: issueDate || new Date().toISOString().slice(0, 10),
        required_fields: [
            "employer.name",
            "employee.name",
            "employee.id",
            "payPeriod",
            "grossPay",
            "netPay",
            "currency.code"
        ],
        warning_fields: [
            "payment.bankAccount.bankName"
        ],
        extra_rules: [
            {
                code: "OM_WPS_FILE_REQUIREMENT",
                description: "Oman WPS mandates electronic salary disbursement through approved banking channels",
                status: "NOT_YET_IMPLEMENTED",
                field: "payment",
                authority: "Ministry of Labour (Oman)",
                sourceTitle: "Ministry of Labour Circular on Wage Protection System (Decision 299/2023)",
                sourceUrl: "https://mol.gov.om/",
                effectiveDate: "2023-07-26",
                notes: "Standard PDF payslip does not substitute for CBO-cleared WPS salary files."
            }
        ],
        source_registry: [
            {
                "code": "OM_PAYSLIP_RULES",
                "status": "PARTIALLY_IMPLEMENTED",
                "authority": "Ministry of Labour (Oman)",
                "sourceTitle": "Oman Labour Law (Royal Decree No. 53/2023) and Ministry of Labour WPS Directives",
                "sourceUrl": "https://mol.gov.om/",
                "version": "2026-09",
                "publishedDate": "2023-07-25",
                "effectiveDate": "2023-07-26",
                "lastVerified": "2026-09-01",
                "notes": "Oman WPS requires salary payment through approved channels. Full WPS electronic integration not implemented."
            }
        ],
        customValidate,
    };
}
