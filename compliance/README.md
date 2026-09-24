Compliance engine

Folder structure:

- compliance/
  - country_code/
    - version/
      - rules.yaml (versioned rule package)
      - schema.json (country-specific schema)
      - tests/ (validation tests)

Guidelines:

- Each country module is versioned by date.
- Rules must include authority, source_url, effective_from and last_verified.
- The compliance engine loads rules by country + effective date.
