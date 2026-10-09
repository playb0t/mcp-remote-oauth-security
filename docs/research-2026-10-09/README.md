# mcp-remote research, 9 October 2026

Researcher: Alex Gercog (playb0t)

The [research dossier](RESEARCH_DOSSIER.md) presents three connected results.

- **Published CLI 0.14.3:** the unchanged CLI completed three local stdio scenarios,
  recording 43 HTTP events. The fixture used `http-only` transport,
  `client-credentials` mode and synthetic static client information. Mock GET requests
  received a challenge; mock POST requests permitted synthetic MCP operations.
  A real OAuth login and desktop UI session were not tested.
- **History of 58 stable releases:** selected first-party discovery helpers were traced
  and executed locally from 0.1.32 through 0.14.3, producing 290 HTTP events within
  an inventory of 74 integrity-checked stable archives.
- **Code distribution:** selected implementation fragments occur under other package
  names and inside bundles. The [distribution map](CODE_DISTRIBUTION.md) separates
  published package copies, declared adapters, recorded Git forks and shared helpers.
  Code presence alone establishes no deployment or complete downstream request route.

The research combines source-level review, custom static analysis, integrity checks
and isolated dynamic fixtures. The npm selection, Git file selection and subsequent
screening cohorts keep their own counting units and method limits.

- [Primary research dossier](RESEARCH_DOSSIER.md)
- [Code distribution map](CODE_DISTRIBUTION.md) and [file evidence](data/code-distribution.json)
- [Evidence identities and accounting](EVIDENCE.md)
- [Reproduction inputs](REPRODUCIBILITY.md)
- [Portable AST-shingle and Semgrep pipeline](procedures/screening/README.md)
- [Machine-readable findings](data/claims.json)
- [Release matrix](data/release-history.json) and [CSV](data/release-history.csv)
- [48-package selection](data/npm-48.json) and [232-file repository selection](data/git-232.json)
- [Package validation](VALIDATION.json) and [checksums](MANIFEST.json)

The observed stable interval belongs to the selected first-party path. It does not
automatically change the affected range of any original CVE record.
