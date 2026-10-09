# Reproduction inputs and recorded procedures

The procedures are source records of the saved experiments. This compact publication does not bundle installed dependencies or all downloaded archives, and assembly did not rerun the target program.

## Verify the publication

MANIFEST.json records SHA-256 and size for every distributed document, data file and procedure. MANIFEST.sha256 records the manifest hash. JSON projections identify the original input hashes and retain the exact observed counts; they do not masquerade as byte-identical copies of full private working logs.

## Full CLI fixture

The exact recorded program is procedures/cve-signature-sweep-20261009/verify_stdio.mjs. It expects the adjacent cve-signature-20261009 directory with the published 0.14.3 dist files at both evidence/latest/package/dist and runtime-install/dist. Obtain the archive using the URL and integrity in data/release-history.json, verify it, and restore those two copies. The recorded procedure compares the dist bytes before launching proxy.js.

The runtime-install package.json and package-lock.json pin the runtime dependencies used by the original test. Restore them with lifecycle scripts disabled. Node v24.19.0 was recorded. Create an empty logs directory in cve-signature-sweep-20261009 and run the procedure only in a fresh disposable workspace; it writes audit.json, a local trace and temporary fixture state. Its temporary-state cleanup is confined by the checks in the source. It launches the known upstream CLI against two researcher-owned loopback servers. Do not substitute unknown packages.

## Historical helper fixture

The recorded procedure is procedures/cve-history-enterprise-20261009/verify_history_runtime.mjs. It expects the adjacent cve-signature-20261009/ast.mjs and TypeScript 5.9.3 at cve-signature-20261009/vendor/typescript/package. Obtain that parser from its official distribution and retain its license and integrity receipt.

Restore each verified release under cve-history-enterprise-20261009/history/npm/VERSION/package/dist. Build history/artifacts.json from the release-history rows with version, gitHead (the git_commit value), and artifact_sha256 (the archive_sha256 value). Create an empty logs directory. The procedure executes selected helpers from verified upstream releases in a constructed context with a fetch wrapper limited to the local fixture server. Its output is not a full-CLI test for each version.

## Scope of assembly validation

Assembly checks data counts, input identities, file parity, local links and absence of machine-specific paths. They do not establish fresh reproducibility, outside runtime reproduction, downstream installation exposure or a changed official CVE range.

## Portable static screening pipeline

The separate [screening toolkit](procedures/screening/README.md) supplies the actual
AST-shingle analyzer and candidate filter, corrected Semgrep rules, reference functions
and fingerprints, a 15-second wall-clock runner, and positive and negative controls.
Its README gives pinned dependency versions and exact preparation and execution commands.
Installed dependencies and caches are excluded from this package.

The retained ast.mjs is the earlier reference-family method; it is not a substitute
for this toolkit. The small control check uses the screening tools to parse source as
data, without executing the candidate functions or the target program. See the
[toolkit receipt](data/screening-toolkit.json) for the clean-directory result and
remaining portability limits.
