"""Verify static Semgrep fixtures and the supervisor using local synthetic processes."""
from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path
from typing import Any
from semgrep_candidates import limited, public_error


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    report = json.loads(args.report.read_text(encoding="utf-8"))
    expected = json.loads((Path(__file__).parent / "controls/expected-semgrep.json").read_text(encoding="utf-8"))
    expected["reference-hash.js"] = [["mcp-session-hash-collision", 10]]
    rows = {row["member"]: row for row in report["files"]}
    checks: list[dict[str, Any]] = []
    for member, matches in expected.items():
        row = rows[member]
        actual = [[item["rule_id"], item["line"]] for item in row.get("matches", [])]
        assert row["status"] == "SCANNED" and not row.get("errors"), member
        assert sorted(actual) == sorted(matches), member
        assert row["budget_seconds"] == 15 and row["timed_out"] is False, member
        checks.append({"id": "exact-semgrep-fixture:" + member, "passed": True})
    assert rows["negative.js"]["status"] == "NOT_RUN_AST_FILTERED"
    assert rows["malformed.js.txt"]["status"] == "UNRESOLVED_AST"
    assert all(row["classification"] is None for row in rows.values())
    assert report["semgrep_invocations"] == 3 and report["unresolved"] == 1
    checks.append({"id": "negative-and-unresolved-preserved", "passed": True})
    nested = {"error_type": ["PartialParsing", [{"path": "/mock-private/source.js", "line": 4}]],
              "severity": "Warning"}
    projected = public_error(nested)
    assert projected == {"type": "PartialParsing", "severity": "Warning"}
    assert "/mock-private/" not in json.dumps(projected) and "source.js" not in json.dumps(projected)
    assert public_error({"error_type": "Out of memory"})["type"] == "Out of memory"
    assert public_error({"error_type": "C" + ":/mock-private/source.js", "severity": {"path": "/mock-private"}}) == {"type": "unknown", "severity": "unknown"}
    assert public_error({"error_type": []})["type"] == "unknown"
    checks.append({"id": "nested-engine-error-locations-excluded", "passed": True})
    normal = limited([sys.executable, "-c", "pass"], args.output / "normal.out", args.output / "normal.err", 1)
    assert normal["exit_code"] == 0 and not normal["timed_out"]
    checks.append({"id": "supervisor-normal-exit", "passed": True})
    expired = limited([sys.executable, "-c", "import time; time.sleep(2)"],
                      args.output / "timeout.out", args.output / "timeout.err", 0.1)
    assert expired["timed_out"] and expired["leader_reaped"]
    assert expired["status"] == "UNRESOLVED_TIMEOUT"
    assert expired["descendant_exit_confirmed"] is False
    checks.append({"id": "supervisor-wall-clock-expiry", "passed": True})
    for budget in (0, 15.1):
        try:
            limited([sys.executable, "-c", "pass"], args.output / "unused.out", args.output / "unused.err", budget)
        except ValueError:
            continue
        raise AssertionError("invalid budget accepted")
    checks.append({"id": "supervisor-budget-contract", "passed": True})
    receipt = {"passed": True, "checks": checks, "normal": normal, "expired": expired,
               "scope": "Static source fixtures and synthetic supervisor processes only; no target execution or network collection."}
    (args.output / "verification.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"passed": True, "checks": len(checks)}))


if __name__ == "__main__":
    main()
