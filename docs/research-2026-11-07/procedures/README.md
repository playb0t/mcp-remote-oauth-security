# Procedures for the 7 November 2026 follow-up

Complete sources accompany the recorded data. Original and applied files document the measured procedure; portable entry points change configuration bindings. The portable runtime copies were syntax-checked during publication preparation, not rerun against the target. The portable static extractor was run on copied source as data and matched the accepted function hashes. No dependencies were installed and no recorder was compiled for packaging.

## Files and identities

- `release_checks.original.cjs`: exact 9 October source, SHA-256 `8822838d9f323534e20fae80ed3657bc44c2b4533b0d1a647c85e5d3ffec7b1f`.
- `release_checks.applied.cjs`: exact six-version applied checker. Only PINS differs from the original after newline normalization. `release_checks.pins-2026-11-07.diff` is the normalized-LF projection; original/applied bytes are preserved.
- `release_checks.cjs`: normalizer require changed to the sibling file; separate portable diff.
- `normalize_ast.cjs` and `fixtures/strict-url-sanitise-0.0.1.js`: exact retained tooling/fixture; trusted TypeScript 5.9.3 required.
- `verify_stdio.original.mjs`: exact October source. `recorded/verify_stdio-0.16.3.mjs` and `-0.16.4.mjs`: exact version copies used in the accepted runs. Path/version diffs are supplied separately and together.
- `verify_stdio.mjs`: explicit version, runtime, expected-source and output inputs; same scenario body and original assertions. Use a fresh run directory per attempt.
- `inspect.recorded.cjs`: exact static extractor used for the accepted source analysis. `inspect.cjs` adds explicit source/parser inputs; its scanner/AST function extraction and normalization are retained. It parses target JS as data and never imports it.
- `f08-cli.mjs`, `f08-method.mjs`, `f08-preload.cjs`, `f11.mjs`: portable path/version bindings for the recorded runtime procedures, with diffs.
- `opener-recorder.rs`: exact controlled Windows recorder source. No executable/debug-symbol file is distributed.
- `runtime/package*.json`: exact measured dependency manifest/lock. `tooling/package.json` pins TypeScript 5.9.3.
- `prepare_runtime.cjs`: copies verified dist files into new runtime directories; refuses overwrite and never imports targets.
- `PROVENANCE.json` and `PROCEDURES-VALIDATION.json`: source hashes, declared transformations and actual preparation checks.

## Layout and preparation

Use an empty isolated workspace and synthetic credentials only. Acquire official archives separately; verify SRI/file hashes using the receipts before execution.

```text
work/
  source/<version>/package/dist/*
  releases/<version>/package/dist/*
  runtime/package.json
  runtime/package-lock.json
  runtime/node_modules/
  runtime/<version>/package.json
  runtime/<version>/dist/*
  parser/node_modules/typescript/
  output/
  fake-systemroot/
```

The helper needs 0.14.3, 0.15.1, 0.15.2, 0.16.0, 0.16.3 and 0.16.4. The static extractor needs 0.16.0, 0.16.3 and 0.16.4; runtime targets are 0.16.3/0.16.4. Older helper archive pins are retained in the checker and prior published receipts.

Copy runtime/package*.json into work/runtime and run `npm ci --ignore-scripts --omit=dev --no-audit --no-fund` there. Prepare the parser in a separate fresh directory with tooling/package.json and scripts disabled. These are reproduction instructions; packaging did not perform these installations.

```sh
"$NODE" "$PROCEDURES/prepare_runtime.cjs" "$WORK/source" "$WORK/runtime" 0.16.3 0.16.4
"$NODE" "$PROCEDURES/release_checks.cjs" "$WORK" "$WORK/parser/node_modules/typescript/lib/typescript.js" "$WORK/output/release-checks.json"
mkdir -p "$WORK/source/evidence"
MCP_TYPESCRIPT_MODULE="$WORK/parser/node_modules/typescript/lib/typescript.js" MCP_SOURCE_ROOT="$WORK/source" "$NODE" "$PROCEDURES/inspect.cjs"
```

The TypeScript parser must be trusted tooling, not JavaScript obtained from a scanned target. A different dependency graph or OS is a different experiment.

## Original CLI scenarios

```sh
MCP_VERSION=0.16.3 MCP_STDIO_RUN_ROOT="$WORK/output/stdio-0.16.3-attempt-1" MCP_STDIO_RUNTIME_DIST="$WORK/runtime/0.16.3/dist" MCP_STDIO_EXPECTED_DIST="$WORK/source/0.16.3/package/dist"   "$NODE" "$PROCEDURES/verify_stdio.mjs"
```

Repeat with 0.16.4 and fresh attempt paths. Runtime/source dist parity is checked first. Traces append and audit is replaced, so preserve attempt identity. Retain original assertion failures. No observer alteration or different token response belongs to this published result.

## F08: Windows recorder only

Compile only the supplied Rust source into the dedicated fake root; never put a real PowerShell there. Preserve real SYSTEMROOT while starting Node. The CLI preload changes it only inside the started test process; the direct method temporarily changes/restores it in its own process. Required recorder prerequisite checks prevent fallback to a real browser.

```powershell
$Procedures = (Resolve-Path ./procedures).Path
$Work = (Resolve-Path ./work).Path
$RecorderDir = Join-Path $Work 'fake-systemroot/System32/WindowsPowerShell/v1.0'
New-Item -ItemType Directory -Path $RecorderDir -Force | Out-Null
rustc --edition=2021 -O (Join-Path $Procedures 'opener-recorder.rs') -o (Join-Path $RecorderDir 'powershell.exe')
$env:MCP_FAKE_SYSTEMROOT = Join-Path $Work 'fake-systemroot'
$env:MCP_RUNTIME_ROOT = Join-Path $Work 'runtime'
$env:MCP_CASE_ROOT = Join-Path $Work 'output/f08-f11'
$env:MCP_NODE_BINARY = (Get-Command node).Source
& $env:MCP_NODE_BINARY (Join-Path $Procedures 'f08-cli.mjs')
& $env:MCP_NODE_BINARY (Join-Path $Procedures 'f08-method.mjs')
```

Use paths without spaces for the inherited NODE_OPTIONS require binding, or separately review quoting-only adaptation. The recorder writes argv and exits; it does not interpret the encoded command or contact the URL. The link-local-looking metadata value is not an instruction to access a metadata service. Browser navigation and internal-service effects are outside this replay.

## F11

With the same prepared runtime/case-root bindings:

```powershell
& $env:MCP_NODE_BINARY (Join-Path $Procedures 'f11.mjs')
```

This imports the real bundled connection export, supplies a synthetic provider through its public parameter and runs two loopback origins. Four mode outcomes per release are recorded. The original script checks export availability but does not assert every expected mode result; read actual events/outcomes and controls. No real OAuth account is used.

## Publication checks

Node syntax checks, JSON parsing, source hashes and configuration diffs are recorded. The static extractor was executed as a source parser only. Target CLI/HTTP/recorder/browser runtime was not repeated while creating portable copies. MANIFEST identifies the exact distributed bytes; `.gitattributes` preserves those bytes through Git checkout.


## Distribution-only 0.16.5 supplement

`compare_distribution.cjs` parses two verified extracted packages using the trusted TypeScript parser. It compares five function declarations, client markers and explicitly delimited SDK source sections. It never imports or evaluates target code. Raw and identifier-suffix-normalized equality are distinct; the recorded emitted shorthand difference remains in data and its diff.

```sh
"$NODE" "$PROCEDURES/compare_distribution.cjs" "$WORK/parser/node_modules/typescript/lib/typescript.js" "$WORK/source/0.16.4" "$WORK/source/0.16.5" "$WORK/output/distribution-0.16.5.json"
```

This static comparison is separate from the original five-record CLI procedure, which was not run on 0.16.5 in this folder. No 0.16.5 pin was added to the six-version runtime helper checker.
