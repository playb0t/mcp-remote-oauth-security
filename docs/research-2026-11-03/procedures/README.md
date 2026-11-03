# Procedures for the 3 November 2026 follow-up

These are complete source procedures, not only a pin-table diff. They accompany the results in `../data/`. Publishing the previously recovered release checker, AST normalizer and sanitizer fixture closes the procedure-source gap in the 15 October follow-up.

The recorded runs used the original local layouts. The portable entry points below replace local path and version-label bindings with explicit inputs. They have been packaged and syntax-checked; **the portable copies were not independently rerun against the target packages during publication preparation**. `PROVENANCE.json` gives original and published source SHA-256 values and adaptation scope. Do not treat a syntax check as a new measurement.

## Files and provenance

- `release_checks.original.cjs`: exact recovered 9 October source, SHA-256 `8822838d9f323534e20fae80ed3657bc44c2b4533b0d1a647c85e5d3ffec7b1f`.
- `release_checks.applied.cjs`: exact four-version checker actually used in the accepted bench, SHA-256 `2f95fc42e899b8058844ef62432c02d8eef54cb6eb50ae11058fa9c26211044c`. `release_checks.pins-2026-11-03.diff` is a unified diff of LF-normalized text projections; it shows only the PINS table. The distributed original and applied files remain byte-identical to their recorded inputs, including their respective line endings. Comparing their text outside PINS after newline normalization gives exact equality. It checks 0.14.3, 0.15.1, 0.15.2 and 0.16.0 twice (48 checks in total).
- `release_checks.cjs`: same applied checker with the normalizer require changed to the sibling `normalize_ast.cjs`. Use this entry point with the published layout. Its separate `.portable.diff` records that path-only change.
- `normalize_ast.cjs` and `fixtures/strict-url-sanitise-0.0.1.js`: byte-identical recovered tooling and fixture. The checker pins and verifies the fixture hash. The normalizer requires trusted TypeScript 5.9.3 and parses target JavaScript as data.
- `verify_stdio.original.mjs`: complete original 9 October procedure. `recorded/verify_stdio-0.15.2.mjs` and `recorded/verify_stdio-0.16.0.mjs` preserve the exact accepted version copies. Their path/version diffs are supplied separately and concatenated in `verify_stdio.path-version.diff`. The 0.16.0 copy also separates the `resolve` import; this is visible in the diff, not an assertion change.
- `verify_stdio.mjs`: portable entry point based on the accepted 0.15.2 source. Its `.portable.diff` changes only runtime/source/output bindings, output-directory preparation and the version label. It retains the original scenario logic, assertions, exit handling and trace collection. Failed and successful historical attempts remain separate data; this source is not a newly corrected interpretation of those attempts.
- `inspect.cjs`: full static extraction/continuity procedure. Explicit parser, acquisition-root and prior-continuity inputs replace machine-specific bindings. `baseline-helper-continuity-2026-10-15.json` is the exact public baseline input. This script parses target source and writes extraction results; it does not import or execute target code.
- `f08-cli.mjs`, `f08-method.mjs`, `f08-preload.cjs`, `f11.mjs`: full accepted runtime procedures. Portable copies change root/Node bindings and recorder prerequisites; `.portable.diff` files expose those changes. Provider/transport/scenario logic is retained. These distinguish full CLI execution, direct provider-method instrumentation and actual transport execution with a synthetic provider.
- `opener-recorder.rs`: exact source of the controlled Windows child recorder. No recorder executable or debug-symbol binary is distributed.
- `runtime/package.json` and `runtime/package-lock.json`: exact manifest/lock of the shared runtime graph used for the measurements. Direct versions include `strict-url-sanitise@0.0.1`, `open@10.2.0`, `express@4.22.3` and `undici@7.30.0`.
- `prepare_runtime.cjs`: packaging helper that copies extracted, verified dist files without importing them. It refuses an existing destination version directory. It was added for portable preparation and was syntax-checked only.

The `original` and `recorded` sources document history; their old relative directory assumptions are intentionally preserved. Use the portable entry points for the layout below. The original release checker still names its original version set, including 0.1.38; use the four-version portable checker for this follow-up.

## Required layout and preparation

Use a dedicated empty verification workspace. Do not point output or cache variables at an existing user profile or real bridge store. Acquire the official npm tarballs separately and verify their registry SRI and file hashes against the acquisition receipts before execution. This package does not install or execute them automatically.

Logical layout:

```text
work/
  source/<version>/package/dist/*        # extracted official packages
  releases/<version>/package/dist/*      # same verified files for release_checks
  runtime/
    package.json
    package-lock.json
    node_modules/                       # installed locked dependencies
    <version>/package.json              # {"type":"module","private":true}
    <version>/dist/*                     # byte-identical copied official dist
  parser/node_modules/typescript/        # trusted 5.9.3
  output/                               # new run outputs and synthetic state
  fake-systemroot/                      # F08 recorder only, described below
```

The release checker needs 0.14.3, 0.15.1, 0.15.2 and 0.16.0. Static inspection needs 0.15.1, 0.15.2 and 0.16.0. Runtime checks below use 0.15.2 and 0.16.0. Keeping `source` and `releases` as separately verified copies or a deliberate local alias is a preparation choice, not a test result.

Copy `runtime/package*.json` into the workspace runtime root. In that root run `npm ci --ignore-scripts --omit=dev --no-audit --no-fund`. Install the trusted parser separately with the supplied `tooling/package.json` (`npm install --ignore-scripts --no-audit --no-fund` in a fresh parser directory). Inspect the resulting dependency versions; runtime use of a different graph is a different experiment.

For example, after setting shell variables `PROCEDURES`, `WORK` and `NODE` to your checkout, dedicated workspace and verified Node executable:

```sh
"$NODE" "$PROCEDURES/prepare_runtime.cjs" "$WORK/source" "$WORK/runtime" 0.15.2 0.16.0
"$NODE" "$PROCEDURES/release_checks.cjs" "$WORK" "$WORK/parser/node_modules/typescript/lib/typescript.js" "$WORK/output/release-checks.json"
MCP_TYPESCRIPT_MODULE="$WORK/parser/node_modules/typescript/lib/typescript.js" MCP_SOURCE_ROOT="$WORK/source" \
  "$NODE" "$PROCEDURES/inspect.cjs"
```

`inspect.cjs` defaults to the supplied 15 October baseline. Set `MCP_PRIOR_CONTINUITY` only if intentionally supplying another compatible baseline. It writes `<source>/<version>/FUNCTIONS.json` and `<source>/evidence/FUNCTION-CONTINUITY.json`; create the `source/evidence` directory first. The parser module must be the explicitly trusted TypeScript package, not JavaScript from a scanned target.

The accepted runtime was Windows with Node 24.20.0. Set up the real Windows environment before starting Node: preserve system environment names case-insensitively, including `SYSTEMROOT`. A previous case-sensitive minimal-environment filter omitted that variable and caused a local CSPRNG setup error; this was an environment-preparation error, not evidence that Node 26 was defective.

## Original stdio scenarios

For each runtime version, point at its prepared dist and a separate expected official extraction:

```sh
mkdir -p "$WORK/output/stdio-0.15.2"
MCP_VERSION=0.15.2 MCP_STDIO_RUN_ROOT="$WORK/output/stdio-0.15.2" \
MCP_STDIO_RUNTIME_DIST="$WORK/runtime/0.15.2/dist" \
MCP_STDIO_EXPECTED_DIST="$WORK/source/0.15.2/package/dist" \
  "$NODE" "$PROCEDURES/verify_stdio.mjs"
```

Repeat with 0.16.0 and its paths. This executes the official proxy CLI through stdio against owned loopback fixtures; it is not a Desktop-host test. The script compares the installed dist against the expected extraction first. It writes `audit.json`, `logs/raw_trace.log` and temporary synthetic state beneath its run root. Trace files append; use a fresh run directory to avoid mixing attempts. The test's synthetic client credentials and any synthetic Authorization observations do not establish real-account authorization. Retain failures rather than changing assertions to force historical outcomes.

## F08: controlled Windows recorder, never a real browser

F08 is Windows-specific. The portable entry points fail on another OS or when the recorder path is absent. Compile **only the supplied source** into the dedicated fake root; do not copy a real PowerShell executable there. The recorder writes its argv to `MCP_RECORDER_OUTPUT` and exits. It does not interpret `-EncodedCommand`, run the decoded string, open a browser or perform HTTP requests.

PowerShell preparation example:

```powershell
$Procedures = (Resolve-Path ./procedures).Path
$Work = (Resolve-Path ./work).Path
$RecorderDir = Join-Path $Work 'fake-systemroot/System32/WindowsPowerShell/v1.0'
New-Item -ItemType Directory -Path $RecorderDir -Force | Out-Null
rustc --edition=2021 -O (Join-Path $Procedures 'opener-recorder.rs') -o (Join-Path $RecorderDir 'powershell.exe')
$env:MCP_FAKE_SYSTEMROOT = Join-Path $Work 'fake-systemroot'
$env:MCP_RUNTIME_ROOT = Join-Path $Work 'runtime'
$env:MCP_CASE_ROOT = Join-Path $Work 'output/f08-f11'
New-Item -ItemType Directory -Path (Join-Path $env:MCP_CASE_ROOT 'runs'), (Join-Path $env:MCP_CASE_ROOT 'test-state') -Force | Out-Null
$env:MCP_NODE_BINARY = (Get-Command node).Source
& $env:MCP_NODE_BINARY (Join-Path $Procedures 'f08-cli.mjs')
& $env:MCP_NODE_BINARY (Join-Path $Procedures 'f08-method.mjs')
```

Run the method procedure on the same verified Node executable. Never set the launching shell's real `SYSTEMROOT` to the fake root before Node starts. For the full CLI cases the test-only preload changes it only inside the already-started child. The method case changes and restores it inside its own process. Use paths without spaces for this inherited `NODE_OPTIONS=--require` setup, or make a separately reviewed quoting-only adaptation; quoting behavior was not separately rerun for this publication package.

The link-local-looking URL is a metadata value forwarded to the recorder. It is **not** an instruction to request a metadata service. All HTTP fixture listeners and actual fixture requests are owned loopback endpoints. `javascript:` and mapped-IPv6 negatives remain in the exact procedures. F08 does not establish browser-mediated effects or arbitrary code execution.

## F11: actual SSE transport, synthetic provider

Use the same locked runtime and a fresh case root containing `runs/`. `f11.mjs` imports the official bundle export and supplies the synthetic provider through its function argument:

```powershell
& $env:MCP_NODE_BINARY (Join-Path $Procedures 'f11.mjs')
```

This measures cross-origin and same-origin redirects, cross-origin endpoint rejection and the no-token control with two owned loopback origins. It does not perform a real OAuth sign-in. Recorded negative results are scoped to this graph and these controlled flows; the existence of a source path is not a claim of observed bearer transfer.

## Verification during publication preparation

Preparation only performed file copying, declared path/label substitutions and syntax/parse checks. No dependency installation, target CLI, HTTP fixture, OS recorder or browser was executed as part of adapting these public files. Rust recorder source was copied and inspected, not compiled during publication preparation. The package manifest and `PROVENANCE.json` identify the source bytes. The independent review of the final report/data mapping is separate from these syntax checks.
