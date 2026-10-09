"""Run the historical Semgrep candidate stage with a 15-second wall-clock budget.

POSIX only: a new process group is signalled on timeout. Scanned files are data.
No A/B/C inference is performed. Raw engine output stays in the chosen output folder.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
import re
import signal
import subprocess
import time
from pathlib import Path
from typing import Any


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def source_path(root: Path, relative: str) -> Path:
    if not isinstance(relative, str) or not relative or relative.startswith(("/", "\\")) or re.match(r"^[A-Za-z]:", relative):
        raise ValueError("Relative source path required")
    root = root.resolve(strict=True)
    value = (root / relative.replace("\\", "/")).resolve(strict=True)
    if not value.is_relative_to(root):
        raise ValueError("Source path escapes input root")
    return value


def limited(command: list[str], stdout_path: Path, stderr_path: Path,
            budget: float = 15.0) -> dict[str, Any]:
    if os.name != "posix":
        raise RuntimeError("Use POSIX or WSL/Linux for process-group supervision")
    if not 0 < budget <= 15:
        raise ValueError("Wall-clock budget must be positive and at most 15 seconds")
    started = time.monotonic()
    timed_out = False
    signal_sent = False
    with stdout_path.open("xb") as out, stderr_path.open("xb") as err:
        proc = subprocess.Popen(command, stdout=out, stderr=err,
                                stdin=subprocess.DEVNULL, start_new_session=True)
        try:
            code = proc.wait(timeout=max(0, budget - (time.monotonic() - started)))
        except subprocess.TimeoutExpired:
            timed_out = True
            try:
                os.killpg(proc.pid, signal.SIGKILL)
                signal_sent = True
            except ProcessLookupError:
                pass
            try:
                code = proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                code = None
    return {"exit_code": code, "timed_out": timed_out,
            "wall_seconds": time.monotonic() - started, "budget_seconds": budget,
            "status": "UNRESOLVED_TIMEOUT" if timed_out else "PROCESS_FINISHED",
            "termination_scope": "process-group-signal-attempt",
            "signal_sent": signal_sent, "leader_reaped": code is not None,
            "descendant_exit_confirmed": False}


def public_error(error: Any) -> dict[str, str | None]:
    """Project engine variants to scalar labels; nested locations remain in raw output."""
    def label(value: Any) -> str:
        # Semgrep variants may be encoded as [kind, payload-with-locations].
        if isinstance(value, list):
            value = value[0] if value else None
        if isinstance(value, str) and re.fullmatch(r"[A-Za-z][A-Za-z0-9 _-]{0,79}", value):
            return value
        return "unknown"
    if not isinstance(error, dict):
        return {"type": "unknown", "severity": None}
    severity = error.get("severity")
    return {"type": label(error.get("error_type", error.get("type"))),
            "severity": label(severity) if severity is not None else None}


def verify_core(core: Path) -> str:
    result = subprocess.run([str(core), "-version"], capture_output=True, timeout=5, check=False)
    version = result.stdout.decode("utf-8", errors="replace").strip()
    if result.returncode or not re.search(r"(?<![\d.])1\.180\.0(?![\d.])", version):
        raise ValueError("Expected Semgrep core 1.180.0")
    return "1.180.0"


def scan(plan: dict[str, Any], source_root: Path, output: Path, core: Path,
         rules: Path) -> dict[str, Any]:
    version = verify_core(core)
    output.mkdir(parents=True, exist_ok=False)
    rows: list[dict[str, Any]] = []
    for number, entry in enumerate(plan["files"], 1):
        row: dict[str, Any] = {"artifact": entry["artifact"], "path": entry["path"],
            "member": entry.get("member", entry["path"]), "sha256": entry["sha256"],
            "ast_status": entry["status"], "ast_matches": entry.get("matches", []),
            "candidate_reasons": entry.get("reasons", []), "classification": None}
        if entry["status"] not in {"CANDIDATE", "UNRESOLVED", "AST_NOT_SELECTED"}:
            row.update(status="UNRESOLVED_PLAN", completeness="incomplete")
            rows.append(row)
            continue
        if entry["status"] != "CANDIDATE":
            row["status"] = "UNRESOLVED_AST" if entry["status"] == "UNRESOLVED" else "NOT_RUN_AST_FILTERED"
            row["completeness"] = "incomplete" if entry["status"] == "UNRESOLVED" else "ast-only"
            rows.append(row)
            continue
        try:
            source = source_path(source_root, entry["path"])
            if sha256(source) != entry["sha256"]:
                raise ValueError("Input integrity mismatch")
        except (OSError, ValueError):
            row.update(status="UNRESOLVED_INPUT", completeness="incomplete")
            rows.append(row)
            continue
        raw = output / f"{number:05}.raw.json"
        stderr = output / f"{number:05}.stderr.log"
        language = "typescript" if source.suffix.lower() in {".ts", ".tsx", ".mts", ".cts"} else "javascript"
        command = [str(core), "-rules", str(rules), "-lang", language, "-json_nodots", "-j", "1",
                   "-timeout", "15", "-timeout_threshold", "1", "-max_memory", "3072", str(source)]
        row.update(limited(command, raw, stderr))
        row.update(raw_sha256=sha256(raw), stderr_sha256=sha256(stderr), completeness="incomplete")
        if not row["timed_out"]:
            try:
                result = json.loads(raw.read_text(encoding="utf-8"))
                # Public summary excludes engine snippets and absolute paths. Raw files retain them locally.
                row["matches"] = [{"rule_id": item["check_id"], "line": item["start"]["line"],
                                   "end_line": item["end"]["line"], "member": row["member"]}
                                  for item in result.get("results", [])]
                errors = result.get("errors", [])
                row["errors"] = [public_error(error) for error in errors]
                paths = result.get("paths", {}).get("scanned")
                complete_paths = isinstance(paths, list) and str(source) in paths
                row["status"] = "UNRESOLVED_SEMGREP" if row["exit_code"] or errors or not complete_paths else "SCANNED"
                row["completeness"] = "selected-file-complete" if row["status"] == "SCANNED" else "incomplete"
            except (ValueError, UnicodeError, KeyError, TypeError):
                row["status"] = "UNRESOLVED_OUTPUT"
        rows.append(row)
    report = {"schema_version": 1, "method": "ast-first-semgrep-candidates-only",
        "file_budget_seconds": 15, "budget_basis": "wall-clock", "semgrep_version": version,
        "core_sha256": sha256(core), "rules_sha256": sha256(rules), "files": rows,
        "semgrep_invocations": sum("exit_code" in r for r in rows),
        "unresolved": sum(r["status"].startswith("UNRESOLVED") for r in rows),
        "coverage_note": "AST_NOT_SELECTED files were not checked by Semgrep. No A/B/C classification is inferred. Historical parser gaps are not retroactively resolved."}
    (output / "report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8", newline="\n")
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--plan", type=Path, required=True)
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--core", type=Path, required=True)
    parser.add_argument("--rules", type=Path, default=Path(__file__).resolve().parents[2] / "rules/mcp_shadow_fingerprint.yaml")
    args = parser.parse_args()
    report = scan(json.loads(args.plan.read_text(encoding="utf-8")), args.source_root,
                  args.output, args.core.resolve(strict=True), args.rules.resolve(strict=True))
    print(json.dumps({"semgrep_invocations": report["semgrep_invocations"],
                      "unresolved": report["unresolved"], "files": len(report["files"])}))
    if report["unresolved"]:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
