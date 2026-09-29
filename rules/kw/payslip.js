/**
 * rules/kw/payslip.js
 *
 * Country: Kuwait (KW)
 * Document Type: payslip
 * Authority: Public Authority for Manpower (PAM) — State of Kuwait
 *
 * [CURRENT] Kuwait Wage Protection System mandates salary transfers via local banks. Full electronic WPS file integration requires PAM-approved banking format.
 *
 * DISCLAIMER: Kuwait payroll requirements are governed by Kuwait Labour Law in the Private Sector (Law No. 6 of 2010) and Public Authority for Manpower regulations.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "KW",
        country_name: "Kuwait",
        document_type: "payslip",
        currency: "KWD",
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
                code: "KW_WPS_BANK_REQUIREMENT",
                description: "Kuwait WPS requires salary transfer into local bank accounts verified by PAM",
                status: "NOT_YET_IMPLEMENTED",
                field: "payment",
                authority: "Public Authority for Manpower (PAM) — State of Kuwait",
                sourceTitle: "PAM Resolution on Wage Protection and Bank Salary Transfers",
                sourceUrl: "https://www.manpower.gov.kw/",
                effectiveDate: "2010-02-21",
                notes: "Standard PDF payslip does not substitute for PAM-mandated electronic bank transfer file."
            }
        ],
        source_registry: [
            {
                "code": "KW_PAYSLIP_RULES",
                "status": "PARTIALLY_IMPLEMENTED",
                "authority": "Public Authority for Manpower (PAM) — State of Kuwait",
                "sourceTitle": "Kuwait Labour Law in the Private Sector (Law No. 6 of 2010) and PAM Executive Regulations",
                "sourceUrl": "https://www.manpower.gov.kw/",
                "version": "2026-09",
                "publishedDate": "2010-02-21",
                "effectiveDate": "2010-02-21",
                "lastVerified": "2026-09-01",
                "notes": "[CURRENT] Kuwait WPS requires salary payment through approved financial channels. Full electronic WPS integration requires approved bank format."
            }
        ],
        customValidate,
    };
}
