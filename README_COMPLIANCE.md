Compliance engine README

This project scaffold adds:

- `schema/canonical-invoice.schema.json`: a JSON Schema for a canonical invoice model.
- `compliance/`: folder with country-specific versioned rule packages.
  - `compliance/saudi_arabia/2026-01/rules.yaml` (skeleton)
  - `compliance/saudi_arabia/2026-01/schema.json` (skeleton)
  - `compliance/engine.py`: minimal loader + validator
- `exporters/`: exporter stubs for JSON and country exporters.

Next steps

- Implement full country rule sets and mappings from the canonical model to country schemas.
- Implement cryptographic signing and secure submission flows for each country.
- Add test suites under `compliance/<country>/<version>/tests`.

Notes

- Rules must be versioned and referenced by effective date.
- The canonical model is the single source of truth; exporters translate to external formats.
