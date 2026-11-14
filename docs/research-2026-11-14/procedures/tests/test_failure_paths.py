"""Regression controls for procedure failure paths.

The tests evaluate the published caller health expression and criterion. Collector
controls launch only a benign Python fixture in a temporary directory.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import types
from typing import Any
import unittest
from unittest.mock import patch

PACKAGE_ROOT = Path(
    os.environ.get("RESEARCH_PACKAGE_ROOT", str(Path(__file__).resolve().parents[2]))
).resolve()
FAMILIES = ("initial", "cache-r2", "cache-r3")
TIMEOUT_SECONDS = 0.75

COVERAGE_PROBE = r"""
const fs = require('node:fs');
const oracle = require(process.argv[1]);
const source = fs.readFileSync(process.argv[2], 'utf8');
const policy = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const forced = process.argv[4] === 'true';
const forbidden = process.argv[5] === 'true';
const match = source.match(/observation_complete:([^,]+),stimulus_observed/);
if (!match) throw Error('Harness observation-complete expression not found');
const constructHealth = new Function(
  'closedEvent', 'captureErrors', 'sa', 'sb', 'sm', 'forcedStop',
  'return ' + match[1]
);
const observationComplete = constructHealth(
  true, 0, {listening: false}, {listening: false}, {listening: false}, forced
);
const fields = Object.fromEntries(
  ['client_secret', 'refresh_token', 'device_code', 'code', 'code_verifier', 'access_token']
    .map(key => [key, false])
);
const event = {
  type: 'request',
  address: forbidden ? 'http://127.0.0.1:29999/forbidden' : policy.receivers[0].address,
  method: 'POST',
  context_id: policy.context_id,
  authorization_present: true,
  authorization_scheme: 'Basic',
  credential_observation_complete: true,
  credential_fields: fields,
  fixture_matches: {client_auth: true}
};
const result = oracle.evaluate(
  policy, [event],
  {target_started: true, observation_complete: observationComplete, stimulus_observed: true},
  oracle.policyHash(policy)
);
console.log(JSON.stringify({
  observation_complete: observationComplete,
  verdict: result.verdict
}));
"""


class ForcedStopTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        executable = os.environ.get("MCP_NODE_BINARY") or shutil.which("node")
        if not executable:
            raise RuntimeError("Set MCP_NODE_BINARY to a Node executable")
        cls.node = executable
        cls.policy = (
            PACKAGE_ROOT / "procedures/credential-v2/initial/inputs/policies/"
            "expected-token-basic.json"
        )
        if not cls.policy.is_file():
            raise RuntimeError("RESEARCH_PACKAGE_ROOT does not name the research package")

    def check_outcome(self, forced: bool, forbidden: bool, expected: str) -> None:
        for family in FAMILIES:
            with self.subTest(family=family, forced=forced, forbidden=forbidden):
                folder = PACKAGE_ROOT / "procedures/credential-v2" / family
                result = subprocess.run(
                    [
                        self.node,
                        "-e",
                        COVERAGE_PROBE,
                        str(folder / "auth-destination-v2.cjs"),
                        str(folder / "harness-v2.mjs"),
                        str(self.policy),
                        str(forced).lower(),
                        str(forbidden).lower(),
                    ],
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    check=True,
                    timeout=10,
                )
                observed = json.loads(result.stdout)
                self.assertEqual(observed["verdict"], expected)
                self.assertEqual(observed["observation_complete"], not forced)

    def test_complete_permitted_capture_stays_pass(self) -> None:
        self.check_outcome(False, False, "PASS")

    def test_forced_permitted_capture_is_inconclusive(self) -> None:
        self.check_outcome(True, False, "INCONCLUSIVE")

    def test_forced_forbidden_receipt_stays_fail(self) -> None:
        self.check_outcome(True, True, "FAIL")


class CollectorFailureTests(unittest.TestCase):
    def setUp(self) -> None:
        source_path = PACKAGE_ROOT / "procedures/legacy/collector.py"
        self.source = source_path.read_text(encoding="utf-8")

    def fixture(
        self, root: Path, child_source: str
    ) -> tuple[types.ModuleType, dict[str, str], Path]:
        source_path = root / "collector.py"
        source_path.write_text(self.source, encoding="utf-8")
        (root / "f11.mjs").write_text(child_source, encoding="utf-8")
        runtime = root / "runtime"
        artifact = runtime / "0.1.38/dist/chunk-65X3S4HB.js"
        artifact.parent.mkdir(parents=True)
        artifact.write_bytes(b"Benign unit-test artifact; never imported.\n")
        recorder = root / "recorder"
        recorder.mkdir()
        output = root / "output"
        env = {
            "MCP_NODE_BINARY": sys.executable,
            "MCP_LEGACY_OUTPUT": str(output),
            "MCP_RUNTIME_0138": str(runtime),
            "MCP_RUNTIME_0166": str(runtime),
            "MCP_FAKE_SYSTEMROOT": str(recorder),
        }
        module = types.ModuleType("collector_under_test")
        module.__file__ = str(source_path)
        with patch.dict(os.environ, env):
            exec(compile(self.source, str(source_path), "exec"), module.__dict__)
        return module, env, output / "f11-old"

    def timeout_case(self, child_source: str) -> tuple[bytes, bytes, dict[str, Any]]:
        real_run = subprocess.run

        def bounded_run(*args: Any, **kwargs: Any) -> subprocess.CompletedProcess[bytes]:
            self.assertEqual(kwargs["timeout"], 100)
            kwargs["timeout"] = TIMEOUT_SECONDS
            return real_run(*args, **kwargs)

        with tempfile.TemporaryDirectory(prefix="research-failure-") as directory:
            module, env, output = self.fixture(Path(directory), child_source)
            with patch.dict(os.environ, env):
                with patch.object(module.subprocess, "run", side_effect=bounded_run):
                    with self.assertRaises(subprocess.TimeoutExpired) as raised:
                        module.execute("f11-old")
            error = raised.exception
            self.assertTrue((output / "stdout.log").is_file(), "Timed-out collector did not preserve stdout")
            self.assertTrue((output / "stderr.log").is_file(), "Timed-out collector did not preserve stderr")
            self.assertTrue((output / "INCOMPLETE.json").is_file(), "Timeout state was not recorded")
            stdout = (output / "stdout.log").read_bytes()
            stderr = (output / "stderr.log").read_bytes()
            self.assertEqual(stdout, error.stdout or b"")
            self.assertEqual(stderr, error.stderr or b"")
            incomplete = json.loads((output / "INCOMPLETE.json").read_bytes())
            self.assertEqual(incomplete["execution"], "timed_out")
            self.assertEqual(incomplete["timeout_seconds"], TIMEOUT_SECONDS)
            self.assertFalse((output.parent / "f11-old.json").exists())
            return stdout, stderr, incomplete

    def test_timeout_preserves_both_partial_streams_and_propagates(self) -> None:
        stdout, stderr, _ = self.timeout_case(
            "import sys,time\n"
            "print('partial-stdout',flush=True)\n"
            "print('partial-stderr',file=sys.stderr,flush=True)\n"
            "time.sleep(5)\n"
        )
        self.assertIn(b"partial-stdout", stdout)
        self.assertIn(b"partial-stderr", stderr)

    def test_timeout_without_output_records_empty_streams(self) -> None:
        stdout, stderr, _ = self.timeout_case("import time\ntime.sleep(5)\n")
        self.assertEqual(stdout, b"")
        self.assertEqual(stderr, b"")

    def test_nonzero_exit_retains_logs_and_exit_status(self) -> None:
        with tempfile.TemporaryDirectory(prefix="research-failure-") as directory:
            module, env, output = self.fixture(
                Path(directory),
                "import sys\n"
                "print('ordinary-stdout',flush=True)\n"
                "print('ordinary-stderr',file=sys.stderr,flush=True)\n"
                "raise SystemExit(3)\n",
            )
            with patch.dict(os.environ, env):
                with self.assertRaises(SystemExit) as raised:
                    module.execute("f11-old")
            self.assertEqual(raised.exception.code, 3)
            self.assertIn(b"ordinary-stdout", (output / "stdout.log").read_bytes())
            self.assertIn(b"ordinary-stderr", (output / "stderr.log").read_bytes())
            self.assertFalse((output / "INCOMPLETE.json").exists())


SETTLEMENT_PROBE = r"""
const fs = require('node:fs');
const settlement = require(process.argv[1]);
const source = fs.readFileSync(process.argv[2], 'utf8');
const policy = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const oracle = require(process.argv[4]);
const forced = process.argv[5] === 'true';
const coverageLine = source.match(/const coverage=(\{[^\n]+\});/);
const finalLine = source.match(/const security=settlement\.finalize\(([^\n]+)\);/);
if (!coverageLine || !finalLine) throw Error('Legacy coverage/finalization call not found');
const fields = Object.fromEntries(
  ['client_secret','refresh_token','device_code','code','code_verifier','access_token']
    .map(key => [key, false])
);
const events = [
  {type:'request',address:policy.receivers[0].address,method:'POST',
   context_id:policy.context_id,role:'A',path:'/token',
   authorization_present:true,authorization_scheme:'Basic',
   credential_observation_complete:true,credential_fields:fields,
   fixture_matches:{client_auth:true}},
  {type:'request',address:policy.expected_issuer+'/prm',method:'GET',
   context_id:policy.context_id,role:'MCP',path:'/prm',
   authorization_present:false,authorization_scheme:null,
   credential_observation_complete:true,credential_fields:fields}
];
const closed = {listening:false};
const coverage = new Function(
  'child','closedEvent','captureErrors','sa','sb','sm','scenarioReached','events',
  'return ' + coverageLine[1]
)({pid:1},true,0,closed,closed,closed,true,events);
const actualFinalization = new Function(
  'settlement','trustedPolicy','events','coverage','closedEvent',
  'sa','sb','sm','serverCloses','forcedShutdown','sealed','postcloseQuiet',
  'pending','captureErrors','pinnedPolicyHash',
  'return settlement.finalize(' + finalLine[1] + ');'
);
const result = actualFinalization(
  settlement,policy,events,coverage,true,closed,closed,closed,3,forced,true,true,
  new Set(),0,oracle.policyHash(policy)
);
console.log(JSON.stringify({
  intermediate_observation_complete:coverage.observation_complete,
  verdict:result.verdict,
  finalization_ready:result.finalization_ready,
  final_observation_complete:result.coverage.observation_complete,
  missing_finalization:result.missing_finalization ?? [],
  exports_final_coverage:/security,coverage:security\.coverage/.test(source)
}));
"""


class OlderSettlementTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        executable = os.environ.get("MCP_NODE_BINARY") or shutil.which("node")
        if not executable:
            raise RuntimeError("Set MCP_NODE_BINARY to a Node executable")
        cls.node = executable
        cls.older = Path(
            os.environ.get(
                "RESEARCH_OLD_V2_PROCEDURES",
                str(PACKAGE_ROOT.parent / "research-2026-11-07-v2/procedures"),
            )
        ).resolve()
        if not (cls.older / "settle-trace-v2.cjs").is_file():
            raise RuntimeError(
                "Older settlement regression needs the sibling research-2026-11-07-v2 "
                "directory or RESEARCH_OLD_V2_PROCEDURES"
            )

    def check_settlement(self, forced: bool) -> dict[str, Any]:
        criterion = (
            PACKAGE_ROOT / "procedures/credential-v2/initial/auth-destination-v2.cjs"
        )
        policy = (
            PACKAGE_ROOT / "procedures/credential-v2/initial/inputs/policies/"
            "expected-token-basic.json"
        )
        result = subprocess.run(
            [
                self.node,
                "-e",
                SETTLEMENT_PROBE,
                str(self.older / "settle-trace-v2.cjs"),
                str(self.older / "oauth-controls-v2.mjs"),
                str(policy),
                str(criterion),
                str(forced).lower(),
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
            timeout=10,
        )
        observed = json.loads(result.stdout)
        self.assertTrue(observed["intermediate_observation_complete"])
        self.assertTrue(observed["exports_final_coverage"])
        return observed

    def test_older_settlement_preserves_complete_permitted_pass(self) -> None:
        observed = self.check_settlement(False)
        self.assertEqual(observed["verdict"], "PASS")
        self.assertTrue(observed["finalization_ready"])
        self.assertTrue(observed["final_observation_complete"])

    def test_older_settlement_blocks_forced_capture_despite_intermediate_true(self) -> None:
        observed = self.check_settlement(True)
        self.assertEqual(observed["verdict"], "INCONCLUSIVE")
        self.assertFalse(observed["finalization_ready"])
        self.assertFalse(observed["final_observation_complete"])
        self.assertIn("forced_shutdown", observed["missing_finalization"])


if __name__ == "__main__":
    unittest.main()
