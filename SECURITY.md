# Security and correction policy

This repository publishes defensive research about
[`geelen/mcp-remote`](https://github.com/geelen/mcp-remote). It is not the
upstream project and cannot ship a product fix.

## Reporting a factual correction

Open a GitHub issue in this repository when a published record contains a
factual, versioning, citation, or reproduction error. Include the finding ID and
the smallest public source that demonstrates the correction.

Do not include credentials, private correspondence, personal data, or
weaponized exploit material.

## Reporting a product vulnerability

Report new `mcp-remote` product vulnerabilities through the upstream
repository's current security-reporting channel. Verify that the private
reporting form is actually enabled before transmitting sensitive details.

## Evidence policy

Each advisory distinguishes:

- localhost-PoC verification;
- source-review evidence;
- conditional defense-in-depth analysis.

Corrections may narrow or withdraw a claim when new evidence refutes its
mechanism. Research IDs remain stable so downstream references do not silently
change meaning.

The complete correction record for the current research release is available in
[`CORRECTIONS.md`](CORRECTIONS.md).
