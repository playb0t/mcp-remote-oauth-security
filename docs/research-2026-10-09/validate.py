"""Validate this dated research package offline; never run target procedures."""
from __future__ import annotations
import hashlib,json,re,sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote,urlsplit

ROOT=Path(__file__).resolve().parent
class ValidationError(Exception):pass
def require(ok:bool,message:str)->None:
    if not ok:raise ValidationError(message)
def read(name:str,root:Path=ROOT)->dict|list:
    return json.loads((root/name).read_text(encoding="utf-8"))
def digest(path:Path)->str:
    return hashlib.sha256(path.read_bytes()).hexdigest()
class Links(HTMLParser):
    def __init__(self)->None:super().__init__();self.links:list[str]=[]
    def handle_starttag(self,tag:str,attrs:list[tuple[str,str|None]])->None:
        fields=dict(attrs)
        if tag=="a" and fields.get("href"):self.links.append(fields["href"] or "")
def validate_content(root:Path=ROOT)->dict:
    claims=read("data/claims.json",root);cli=read("data/cli-scenarios.json",root)
    history=read("data/release-history.json",root);npm=read("data/npm-48.json",root);git=read("data/git-232.json",root)
    limits=read("data/analysis-limitations.json",root);lineage=read("data/evidence-lineage.json",root);cohorts=read("data/screening-cohorts.json",root)
    cases=cli["cases"];releases=history["releases"]
    require(len(cases)==claims["whole_cli_cases"]==3,"CLI case count")
    require(sum(len(x["http_events"]) for x in cases)==claims["cli_http_events"]==43,"CLI HTTP event count")
    require(sum(len(x["rpc_replies"]) for x in cases)==claims["cli_rpc_replies"]==9,"CLI RPC count")
    require(sum(x["canary_event_count"] for x in cases)==claims["cli_canary_events"]==15,"CLI canary count")
    for case in cases:
        require(case["http_event_count"]==len(case["http_events"]),"CLI per-case event count")
        require(case["configuration"]=={"transport":"http-only","client_credentials":True,"synthetic_client_info":True},"CLI fixture mode")
        require(case["canary_event_count"]==sum(x["role"]=="canary" for x in case["http_events"]),"Canary event derivation")
        require(case["authorization_header_count"]==sum(bool(x["authorization_present"]) for x in case["http_events"]),"Authorization event derivation")
    require(len(releases)==claims["static_releases"]==74,"Release count")
    require(len({r["version"] for r in releases})==74,"Duplicate release rows")
    selected=[r for r in releases if r["first_party_route_present"]]
    require(len(selected)==claims["helper_runtime_releases"]==58,"Helper release count")
    require(selected[0]["version"]=="0.1.32" and selected[-1]["version"]=="0.14.3","Helper range")
    require(sum(len(r["helper_http_events"]) for r in releases)==claims["helper_http_events"]==290,"Helper events")
    require(all(r["integrity_verified_in_acquisition"] for r in releases),"Release acquisition integrity flags")
    require([r["version"] for r in releases if r["whole_cli_tested"]]==["0.14.3"],"Whole-client coverage")
    require(len(npm["records"])==claims["npm_archives"]==48,"npm count")
    positive=[r for r in npm["records"] if r["reference_matches"] or r["namespace_matches"]]
    require(len(positive)==claims["npm_signature_candidates_including_upstream"]==13,"npm candidate count")
    require(sum(r["reference_matches"]>0 for r in positive)==9,"Reference match records")
    require(sum(r["reference_matches"]==0 for r in positive)==4,"Namespace-only records")
    require(sum(r["name"]=="mcp-remote" for r in positive)==1,"Upstream control count")
    require(len(git["records"])==claims["github_file_records"]==232,"Git file records")
    require(len({r["repository"] for r in git["records"]})==claims["git_repositories"]==221,"Git repository count")
    require(len({r["blob_sha"] for r in git["records"]})==225,"Git unique blobs")
    require(Counter(r["category"] for r in git["records"])==Counter(git["summary"]["categories"]),"Git categories")
    require(all(r["git_blob_verified"] for r in git["records"]),"Git blob verification flags")
    records=limits["marketplace_file_records"]
    timeouts=[r for r in records if r["timed_out_flag"]]
    require(len(timeouts)==6,"Timeout flag count")
    require(dict(Counter(str(r["exit_code"]) for r in timeouts))=={"0":1,"-9":5},"Timeout exit-code split")
    require(next(r for r in timeouts if r["exit_code"]==0)["artifact_id"]=="anthropic.claude-code","Zero-exit timeout identity")
    failures=[r for r in records if r["status"]=="UNRESOLVED_SEMGREP"]
    require(dict(Counter(r["error_kind"] for r in failures))=={"Out of memory":1,"Syntax error":2,"PartialParsing":1},"Memory/parser distinction")
    require(limits["termination_evidence"]["signal_delivery_independently_confirmed"] is False,"Unestablished signal proof")
    require(limits["termination_evidence"]["all_descendants_confirmed_exited"] is False,"Unestablished descendant proof")
    require(limits["forced_parser_controls"]=={"total":24,"partial":21,"complete":3,"exit_zero":24},"Forced parser controls")
    scope=read("data/search-scope.json",root)
    require(scope["documentation_unit"]=="KB" and scope["documented_file_condition"]=="Files smaller than 384 KB","Documented search boundary")
    require(scope["local_counter"]["unit"]=="384 KiB" and scope["local_counter"]["threshold_bytes"]==393216,"Local counter units")
    require(scope["modern_web_code_search"]["threshold_bytes"]==358400,"Modern Code Search units")
    require(scope["modern_web_code_search"]["generated_and_vendored_code_excluded"] is True,"Documented generated/vendor policy")
    require("unsupported_threshold_removed" not in scope,"Stale rejection of modern search threshold")
    require(limits["corporate_comparison"]["false_positive_rate"] is None,"Unsupported false-positive rate")
    require(limits["corporate_comparison"]["categories"]=={"A":0,"B":1,"C":32,"UNRESOLVED":0},"Corporate categories")
    require(claims["observed_stable_versions"]=={"first":"0.1.32","last":"0.14.3"},"Bounded observation interval")
    require(claims["qualification"]=="Missing Defense","Unsupported prior-fix classification")
    groups=lineage["result_groups"]
    require(len({g["id"] for g in groups})==len(groups)==7,"Canonical result group uniqueness")
    require(all(g["counted_occurrences"]==1 for g in groups),"Reused source counted more than once")
    require(lineage["global_product_or_installation_total"] is None,"Unsupported global total")
    artifact_rows=sum([cohorts[name]["artifact_records"] for name in ["calibration","corporate","marketplace"]],[])
    require(len(artifact_rows)==63,"Cohort observation count")
    require(len({r["identity_key"] for r in artifact_rows})==lineage["cohort_artifact_identities"],"Artifact identity deduplication")
    require(sum(cohorts[k]["files"] for k in ["calibration","corporate","marketplace"])==8057,"Source instances")
    shared=set(r["archive_sha256"] for r in releases)&set(r["archive_sha256"] for r in npm["records"])
    require(shared=={x["archive_sha256"] for x in lineage["cross_view_shared_archives"]},"Cross-view archive reuse")
    receipts=read("data/input-receipts.json",root)["files"]
    require(len({r["sha256"] for r in receipts})==len(receipts),"Duplicate input receipts")
    source_receipt_hashes={r["sha256"] for r in receipts}
    require(all(s in source_receipt_hashes for g in groups for s in g["source_sha256"]),"Result group provenance")
    link_count=0
    for name in ["README.md","RESEARCH_DOSSIER.md","REPRODUCIBILITY.md","EVIDENCE.md"]:
        text=(root/name).read_text(encoding="utf-8")
        require(not re.search(r"(?i)(?:[A-Z]:[\\/](?:Users|Projects)|/mnt/[a-z]/Projects/|/Users/|/home/)",text),"Host path in public document "+name)
        if name.endswith(".md"):
            urls=re.findall(r"\[[^\]]*\]\(([^)]+)\)",text)
        else:
            p=Links();p.feed(text);urls=p.links
        for url in urls:
            u=urlsplit(url.strip("<>"))
            if u.scheme or not u.path:continue
            target=(root/unquote(u.path)).resolve()
            require(target.is_relative_to(root),"Package link escapes its root: "+url)
            require(target.exists(),"Broken package link: "+url);link_count+=1
    for name in ["README.md","RESEARCH_DOSSIER.md"]:
        text=(root/name).read_text(encoding="utf-8")
        intro=text[:text.index("\n## 1.")] if name=="RESEARCH_DOSSIER.md" else text
        require("http-only" in intro and "client-credentials" in intro,"CLI conditions missing beside lead result")
    return {"status":"passed","release_rows":74,"helper_runtime_rows":58,"cli_http_events_recounted":43,"helper_events_recounted":290,"npm_archives":48,"git_file_records":232,"canonical_result_groups":7,"cohort_observations":63,"local_links_checked":link_count,"timeout_flags":6,"engine_errors":{"memory":1,"syntax":2,"partial_parsing":1},"new_runtime_execution":False}
def validate_manifest(root:Path=ROOT)->dict:
    manifest=read("MANIFEST.json",root);rows=manifest["files"]
    require(len({r["path"] for r in rows})==len(rows),"Duplicate manifest path")
    expected={p.relative_to(root).as_posix() for p in root.rglob("*") if p.is_file() and "__pycache__" not in p.parts and p.name not in {"MANIFEST.json","MANIFEST.sha256"}}
    require(expected=={r["path"] for r in rows},"Manifest coverage")
    for r in rows:
        p=(root/r["path"]).resolve()
        require(p.is_relative_to(root) and p.is_file(),"Unsafe manifest path")
        require(p.stat().st_size==r["bytes"] and digest(p)==r["sha256"],"Manifest mismatch: "+r["path"])
    require((root/"MANIFEST.sha256").read_text().split()[0]==digest(root/"MANIFEST.json"),"Manifest seal")
    return {"manifest_files":len(rows),"manifest_sha256":digest(root/"MANIFEST.json")}
def main()->None:
    try:
        from validate_r3 import validate as validate_r3
        result=validate_content();result["r3"]=validate_r3(ROOT);result.update(validate_manifest());print(json.dumps(result,sort_keys=True))
    except (ValidationError,KeyError,ValueError,OSError) as err:
        print(json.dumps({"status":"failed","error":str(err)}));raise SystemExit(1)
if __name__=="__main__":main()
