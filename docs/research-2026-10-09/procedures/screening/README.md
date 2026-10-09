# Historical source-screening toolkit

Researcher: Alex Gercog (playb0t).

This directory packages the AST-shingle and Semgrep pipeline used for the calibration, corporate and Marketplace screening. It is a portable adaptation of the saved research procedures. The earlier `ast.mjs` used for the 48-package npm slice implements a separate method. Its reference-match counts are not Dice scores from this toolkit.

The scanner parses source as data. It does not import the files being checked, install a target package, contact a target, or assign A/B/C classifications. Every result retains the artifact identity, version or commit, member path, source SHA-256, matching function or rule, and analysis status.

## Included files

| File | Role |
| --- | --- |
| `stream_ast.cjs` | Historical streaming function normalizer and five-token multiset comparison. |
| `structure.cjs` | Historical metadata/network and delimiter-MD5 candidate routes. |
| `candidate_filter.cjs` | Portable manifest reader and corporate/Marketplace threshold selection. |
| `references/baseline-reference-functions.json` | Original 14 reference token sequences and normalized fingerprints, unchanged. |
| `references/source-functions.json` | Readable source slices with original bundle hashes, member and UTF-16 offsets. |
| `../../rules/mcp_shadow_fingerprint.yaml` | Corrected historical Semgrep rules, unchanged. |
| `semgrep_candidates.py` | POSIX per-file Semgrep supervisor with a 15-second wall-clock scan budget. |
| `controls/` | Positive, negative and deliberately malformed static source controls. |
| `check_controls.cjs` | AST and candidate-gate checks. |
| `verify_semgrep_controls.py` | Exact Semgrep expectations and synthetic process-supervision checks. |
| `CONTROL-VERIFICATION.json` | Recorded checks from a separate clean working directory. |
| `../../data/screening-toolkit.json` | Source hashes, adaptation map, method contracts and verification limits. |

## Method and scope

TypeScript **5.9.3** binds local identifiers in an in-memory program with `noResolve` and `noLib`. Functions are normalized independently. Bound local names are replaced consistently; property names and literal values remain significant. The declaration name is omitted. Async and generator distinctions are retained.

Each normalized function produces overlapping sequences of five tokens. The score is multiset Sørensen–Dice, `2 * shared_count / (candidate_count + reference_count)`, with repeated sequences counted up to their minimum occurrence count. The reported score is a function-level comparison against the 14 references. It is not a whole-file or whole-product similarity score.

The corporate profile selects reference matches **strictly greater than 0.85**. The Marketplace profile uses **strictly greater than 0.80**. Both profiles also retain delimiter-joined MD5 constructions and files containing selected metadata names together with network-call syntax. These additional routes are broad candidate filters and do not establish dataflow or a missing control.

Semgrep **1.180.0** runs only on selected candidates. A rule result requires review of callers, destination policy and reachable behavior. The corrected rule file preserves its original candidate-only messages and `security_verdict: false` metadata. CVE identifiers in rule metadata are research pointers, not an automatic assertion that an input is affected by those records.

`AST_NOT_SELECTED` means no selected route was found in the completed AST pass. Semgrep did not check that file. `UNRESOLVED` and `UNRESOLVED_*` retain syntax, input, resource, timeout and incomplete-output gaps. The tool never turns these into a clean result. A fully completed selected-file pass also does not certify the safety of a product. Accuracy, precision and recall have not been measured against a labeled population.

The 15-second budget applies to one Semgrep process invocation, measured with `time.monotonic()`. It is wall-clock time, not CPU time. On expiry the runner attempts to signal the process group and waits briefly to reap its leader. Cleanup can extend total supervisor elapsed time. The receipt records timeout, exit code and signal delivery separately; it does not claim all descendants were observed exiting. The AST pass has no separate 15-second deadline. Process-level interruption of that pass must be retained as missing coverage.

## Dependencies and preparation

The checked environment used Node **v24.19.0**, TypeScript **5.9.3**, Semgrep core **1.180.0**, and Python **3.10.12**. The AST stage runs on Windows or POSIX. The Semgrep supervisor requires POSIX process groups; use Linux or WSL/Linux. No installed runtime, dependency directory or cache is included here.

The commands below are preparation instructions for a reader who chooses to install the pinned tools. They were **not executed during the r3 packaging work**. The npm lock pins the TypeScript tarball integrity. The Semgrep requirement pins its version, not every transitive Python dependency.

From this directory on Linux or WSL:

```sh
npm ci --ignore-scripts --no-audit --no-fund
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
CORE="$(.venv/bin/python -c 'from pathlib import Path; import semgrep; print(Path(semgrep.__file__).parent / "bin" / "semgrep-core")')"
```

An existing trusted TypeScript installation can be selected with `SCREENING_TYPESCRIPT_MODULE`, pointing to its `lib/typescript.js`. Otherwise Node resolves the pinned local `typescript` dependency. The loader rejects a version other than 5.9.3. The runner accepts `--core` and verifies version 1.180.0. No machine-specific path is embedded in either tool.

## Reproduce the small controls

Copy this directory and the sibling `rules/` directory into a fresh work folder, retaining `procedures/screening/` and `rules/`. Keep dependencies available through the preparation above or an existing trusted runtime. From `procedures/screening/`:

```sh
node check_controls.cjs out
.venv/bin/python -B semgrep_candidates.py --plan out/plan-corporate.json --source-root . --output out-semgrep --core "$CORE"
.venv/bin/python -B verify_semgrep_controls.py --report out-semgrep/report.json --output out-supervisor
```

The Semgrep runner intentionally exits **2** for this fixture plan because one malformed control remains unresolved. Continue with the last verification command explicitly; do not chain it using `&&` after that expected exit. Output folders must not already exist for the Semgrep and supervisor checks. Repeated AST runs also require new plan output filenames.

An additional static boundary fixture scores between 0.80 and 0.85 and verifies that only the Marketplace profile selects it. It is checked separately from the five-file pipeline.

The expected result is three candidate files with seven rule matches, one AST-filtered negative file, and one deliberately malformed unresolved file. The original `hash.js` and `metadata.js` fixtures include both expected rule hits and negative positions; exact comparison rejects extra hits. The supervisor check starts only harmless local Python processes to test normal completion and a short wall-clock expiry. Fixture functions are never called.

## Screen a local manifest

A manifest identifies already acquired, trusted-to-read source bytes. The file paths are relative to the manifest directory and must remain within it, including after resolving symlinks. Example:

```json
{
  "schema_version": 1,
  "files": [
    {
      "artifact": {"kind": "npm", "name": "example-package", "version": "1.0.0"},
      "path": "sources/example.js",
      "member": "package/dist/example.js",
      "sha256": "replace-with-the-64-character-source-sha256"
    }
  ]
}
```

Use a `commit` field for Git source when a version is unavailable. The path/member distinction allows an extracted file to retain its original archive member. The expected SHA-256 is required and verified before analysis.

```sh
node candidate_filter.cjs INPUT/manifest.json out-corporate.json corporate
node candidate_filter.cjs INPUT/manifest.json out-marketplace.json marketplace
.venv/bin/python -B semgrep_candidates.py --plan out-corporate.json --source-root INPUT --output out-selected --core "$CORE"
```

The runner writes a concise `report.json` and raw engine files into the chosen local output directory. Raw files can contain absolute runtime paths and source excerpts; they are not publication artifacts. Keep those files out of Git. A nonzero unresolved count returns exit code 2 and remains visible in the report.

## Provenance and adaptation

`stream_ast.cjs` preserves the historical `analyze` implementation. Its fixed parser/reference paths and archive-specific command entry point were replaced with local dependencies and a portable manifest adapter. `structure.cjs` preserves the original structural detector. The candidate adapter combines the saved corporate and Marketplace entry points while retaining their separate thresholds.

The Semgrep runner preserves candidate-only selection, rule parameters, time measurement and process-group supervision. The portable adaptation adds explicit runtime arguments, version checks, relative source paths, integrity checks, public result projection and separate termination fields. It performs no artifact classification. Original research sources and previous publication archives were left unchanged.

Reference token data, corrected YAML and the two original Semgrep fixtures are byte-identical copies of the saved evidence. Readable reference slices preserve the original text and offsets. Their fingerprints came from the full bundle's binding context; a standalone slice can have different free-identifier bindings. The small `reference-hash.js` control supplies a local placeholder binding to test an exact selected reference without loading the bundle. The references include code from mcp-remote 0.1.38, @modelcontextprotocol/sdk 1.25.3 and pkce-challenge 5.0.1. [Third-party source notices](references/THIRD-PARTY-NOTICES.md) map the retained functions to their components. Their copyright and permission notices are preserved in [LICENSE.mcp-remote](references/LICENSE.mcp-remote), [LICENSE.typescript-sdk](references/LICENSE.typescript-sdk) and [LICENSE.pkce-challenge](references/LICENSE.pkce-challenge). These notices do not assign a license to the original research tools or prose.

The clean-directory check reused existing runtimes. It confirms local execution after moving the packaged files, but not a fresh dependency installation, every operating system, every input size, or a rerun of the historical full cohorts. Historical results and unresolved coverage remain as recorded in the dossier.
