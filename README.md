# GulfDocs

> Free, no-signup business document generator for Qatar, UAE, Saudi Arabia and the wider GCC.

GulfDocs lets small businesses, freelancers and HR teams generate professional business documents in seconds — entirely in the browser. No account. No cloud upload. No cost.

---

## ✨ Features

- **6 document types** — Invoice, Payslip, Purchase Order, Quotation, Billing Details, and Custom HTML Templates
- **Live WYSIWYG preview** — an in-page iframe updates in real time as you type
- **GCC-ready defaults** — QAR currency, 5 % VAT, IBAN / SWIFT fields, WPS-compliant payslip layout
- **Client-side only** — all data stays in your browser; nothing is sent to any server
- **Theme customization** — pick accent colors, text colors and border styles via the built-in theme sidebar
- **Custom templates** — upload your own HTML template with `{{placeholder}}` syntax, fill in the form, and print to PDF
- **PDF export** — one-click browser print-to-PDF, no server rendering required
- **Profile persistence** — company details saved to `localStorage` so you never re-enter them
- **Privacy-first** — no tracking cookies; optional cookie-consent banner for when AdSense is enabled

---

## 🗂 Document Types

| Page | File | Description |
|---|---|---|
| Invoice Generator | `invoice.html` | VAT-compliant tax invoices with TRN, QAR, IBAN fields |
| Payslip Generator | `payslip.html` | WPS-compliant employee payslips with earnings & deductions |
| Quotation Generator | `quotation.html` | Professional price quotes with VAT and approval signature |
| Purchase Order | `purchase-order.html` | Supplier POs with vendor details and VAT breakdown |
| Billing Details | `billing-details.html` | Bank settlement instructions with IBAN & SWIFT |
| Custom Template | `custom-template.html` | Upload any HTML template, fill placeholders, print PDF |

---

## 🏗 Architecture

GulfDocs is a **serverless static site** in production. The Express server (`server.js`) exists purely as a local development convenience — it is never used on Netlify.

```
Browser  ──► HTML / CSS / JS (static files)
                │
                ├── localStorage  (profile & theme data)
                └── iframe srcdoc (live document preview)
```

### Key files

```
site-1/
├── index.html                  # Landing page
├── invoice.html                # Invoice generator
├── payslip.html                # Payslip generator
├── quotation.html              # Quotation generator
├── purchase-order.html         # Purchase order generator
├── billing-details.html        # Billing details generator
├── custom-template.html        # Custom HTML template tool
├── template-guide.html         # Guide: how to build custom templates
├── style.css                   # Shared styles & CSS custom properties
├── scripts.js                  # Invoice generator logic
├── payslip.js                  # Payslip generator logic
├── quotation.js                # Quotation generator logic
├── purchase-order.js           # Purchase order logic
├── billing-details.js          # Billing details logic
├── custom-template.js          # Custom template logic
├── theme-manager.js            # Real-time CSS variable theming
├── cookie-consent.js           # GDPR-style cookie consent banner
├── 404.html                    # Custom 404 page
├── privacy-policy.html         # Privacy policy
├── terms-of-use.html           # Terms of use
├── server.js                   # Express dev server (local only)
├── netlify.toml                # Netlify build config & security headers
├── templates/                  # Handlebars templates (dev server views)
│   ├── index.hbs
│   ├── invoice.hbs
│   ├── payslip.hbs
│   ├── quotation.hbs
│   ├── purchase-order.hbs
│   └── billing-details.hbs
└── html/                       # Additional static HTML assets
```

---

## 🚀 Local Development

The dev server serves the static files with security headers (CSP, X-Frame-Options, etc.) via [Helmet](https://helmetjs.github.io/), mirroring the Netlify production headers.

### Prerequisites

- Node.js ≥ 18

### Install & run

```bash
# Install dependencies
npm install

# Start the dev server (default: http://localhost:3000)
npm run dev
```

The site is plain HTML/CSS/JS — you can also open `index.html` directly in your browser without the dev server if you don't need the security-header simulation.

---

## ☁️ Deployment (Netlify)

The site deploys as a zero-build static site.

1. Push the repo to GitHub / GitLab.
2. Connect the repo to Netlify.
3. Set **Publish directory** to `.` (root) — or let `netlify.toml` handle it automatically.
4. Deploy. No build command needed.

Security headers (CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) are configured in `netlify.toml` and kept in sync with the `<meta http-equiv="Content-Security-Policy">` tag in every HTML file and the `helmet()` config in `server.js`.

### Enabling Google AdSense

When AdSense is approved:
1. Paste the AdSense verification `<meta>` tag and the `<script async>` tag in each HTML `<head>` (see the comment blocks already in the files).
2. Extend `script-src`, `frame-src`, `connect-src` and `img-src` in `netlify.toml` with the required AdSense origins.
3. Update the matching `<meta http-equiv="Content-Security-Policy">` tags in every HTML page.

---

## 🎨 Theming

GulfDocs uses CSS custom properties (`--doc-*`) for all document colors. The `ThemeManager` (`theme-manager.js`) reads user preferences from `localStorage` and injects them as inline CSS variables on page load and whenever the theme sidebar is changed.

To reset to defaults, clear the site's `localStorage`.

---

## 📄 Custom Templates

Users can upload their own HTML document templates. Placeholders use double-curly-brace syntax:

```html
<span>{{company_name}}</span>
<span>{{invoice_date}}</span>
<span>{{total_amount}}</span>
```

GulfDocs auto-detects all placeholders, generates a form for them, and merges the values into the template for printing. See `template-guide.html` for the full placeholder reference.

---

## 📜 Legal

- [Privacy Policy](privacy-policy.html)
- [Terms of Use](terms-of-use.html)

GulfDocs formats documents for convenience and is **not** a substitute for professional tax, legal or accounting advice. Verify compliance with local GCC regulations before official use.

---

## 🤝 Contact

Questions or feedback → [abdullah123bin@gmail.com](mailto:abdullah123bin@gmail.com)
