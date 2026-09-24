/**
 * rules/sa/invoice.js
 *
 * Country: Saudi Arabia (SA)
 * Document Type: invoice
 * Authority: Zakat, Tax and Customs Authority (ZATCA)
 *
 * Standard tax invoice requires VAT number, invoice type code, XML data, QR code, and digital signature under ZATCA Phase 2. PDF generation alone does not satisfy ZATCA Phase 2 clearance. B2B simplified invoices allowed below SAR 1,000. VAT rate is 15%.
 *
 * DISCLAIMER: Saudi Arabia operates ZATCA e-invoicing (Fatoorah). Phase 1 (generation) and Phase 2 (integration) are progressive requirements. This application generates PDF-level invoices only. Government clearance/reporting is NOT implemented.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(canonical) {
        const errors = [];
        const warnings = [];
        const vatNum = canonical?.seller?.taxIdentity?.taxId || "";
        if (vatNum && !/^3\d{14}$/.test(vatNum)) {
            errors.push({
                field: "seller.taxIdentity.taxId",
                code: "SA_VAT_NUMBER_FORMAT",
                message: "Saudi VAT number must be 15 digits and start with 3 (ZATCA requirement).",
                severity: "error",
                source: "SA"
            });
        }
        // Warn if tax rate is not 15%
        const taxes = canonical?.taxes || [];
        taxes.forEach((t, i) => {
            if (t.taxableAmount > 0 && t.amount > 0) {
                const rate = t.amount / t.taxableAmount;
                if (Math.abs(rate - 0.15) > 0.001) {
                    warnings.push({
                        field: `taxes[${i}].amount`,
                        code: "SA_VAT_RATE_CHECK",
                        message: `Effective tax rate (${(rate * 100).toFixed(1)}%) differs from Saudi standard rate (15%). Verify if zero-rate or exemption applies.`,
                        severity: "warning",
                        source: "SA"
                    });
                }
            }
        });
        return { errors, warnings };
    }

    return {
        country: "SA",
        country_name: "Saudi Arabia",
        document_type: "invoice",
        currency: "SAR",
        vat_rate: 0.15,
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
                "code": "SA_INV_VAT_NUMBER",
                "description": "Seller VAT number must be 15 digits starting with 3",
                "status": "IMPLEMENTED",
                "field": "seller.taxIdentity.taxId",
                "test": "sa_vat_15_digits_start3"
            },
            {
                "code": "SA_INV_ZATCA_PHASE2",
                "description": "ZATCA Phase 2 requires cryptographic stamp, XML generation, and government clearance \u2014 not yet implemented",
                "status": "FUTURE_REQUIREMENT",
                "field": "zatca",
                "test": null
            }
        ],
        source_registry: [
            {
                "code": "SA_INVOICE_RULES",
                "status": "IMPLEMENTED",
                "authority": "Zakat, Tax and Customs Authority (ZATCA)",
                "sourceTitle": "ZATCA E-Invoicing Regulations \u2014 Decision RM-43-2021 and Technical Standards",
                "sourceUrl": "https://zatca.gov.sa/",
                "version": "2026-09",
                "publishedDate": "2021-12-04",
                "effectiveDate": "2021-12-04",
                "lastVerified": "2026-09-01",
                "notes": "Standard tax invoice requires VAT number, invoice type code, XML data, QR code, and digital signature under ZATCA Phase 2. PDF generation alone does not satisfy ZATCA Phase 2 clearance. B2B simplified invoices allowed below SAR 1,000. VAT rate is 15%."
            }
        ],
        customValidate,
    };
}
