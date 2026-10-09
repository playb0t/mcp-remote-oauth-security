"""Recount the saved download snapshot and selected file registry offline."""
from __future__ import annotations
import argparse,hashlib,json,re,sys
from collections import Counter
from datetime import date,timedelta
from pathlib import Path
from typing import Any
ROOT=Path(__file__).resolve().parent
RULES={'reference-function-match','md5-config-namespace','md5-input-with-oauth-storage-context'}
def load(path:Path)->Any:return json.loads(path.read_text(encoding='utf-8'))
def sha(path:Path)->str:return hashlib.sha256(path.read_bytes()).hexdigest()
def require(ok:bool,message:str)->None:
 if not ok:raise ValueError(message)
def version(value:str)->tuple[int,int,int]:return tuple(map(int,value.split('.')))
def calculate(root:Path=ROOT)->dict[str,Any]:
 summary=load(root/'summary.json');daily=load(root/'daily.json');point=load(root/'point.json')
 latest=load(root/'last-day.json');week=load(root/'last-week.json')
 versions=load(root/'versions-week.json');recent=load(root/'recent-version-counts.json')
 footprint=load(root/'signature-footprint.json');selection=load(root/'version-selection.json')
 receipts=load(root/'receipts.json')
 for receipt in receipts:
  file=root/(receipt['id']+'.json')
  require(file.is_file() and sha(file)==receipt['sha256'] and file.stat().st_size==receipt['bytes'],'Acquisition receipt mismatch: '+receipt['id'])
  require(receipt['http_status']==200 and receipt['read_at_utc'].endswith('+00:00'),'Acquisition receipt metadata')
 rows=daily['downloads'];start=date.fromisoformat(daily['start']);end=date.fromisoformat(daily['end'])
 expected_days=[(start+timedelta(days=i)).isoformat() for i in range((end-start).days+1)]
 require([x['day'] for x in rows]==expected_days,'Daily coverage or ordering')
 require(all(type(x['downloads']) is int and x['downloads']>=0 for x in rows),'Invalid download count')
 require(daily['package']==point['package']==latest['package']==week['package']=='mcp-remote','Package identity')
 require((daily['start'],daily['end'])==(point['start'],point['end']),'Point/range dates')
 total=sum(x['downloads'] for x in rows);available=[x for x in rows if x['day']<=latest['end']]
 unavailable=[x['day'] for x in rows if x['day']>latest['end']]
 available_total=sum(x['downloads'] for x in available)
 require(total==point['downloads']==summary['raw_requested_period_total'],'Point/range total agreement')
 require(available_total==summary['available_period_snapshot_total'],'Available period total')
 require(summary['last_available_day_from_point_api']==latest['end'] and len(available)==summary['days_count'],'Availability boundary')
 require(all(x['downloads']==0 for x in rows if x['day']>latest['end']),'Unexpected values beyond availability boundary')
 zeros=[x['day'] for x in available if x['downloads']==0]
 require(zeros==summary['zero_valued_dates_in_available_period'],'Zero-valued days')
 monthly={}
 for row in available:monthly[row['day'][:7]]=monthly.get(row['day'][:7],0)+row['downloads']
 require(monthly==summary['by_month'],'Monthly totals')
 require(summary['last_available_rows']==available[-5:],'Last available rows')
 require(latest['downloads']==available[-1]['downloads']==summary['last_available_day_downloads'],'Latest available day count')
 require(summary['since_publication_2026_07_31']==sum(x['downloads'] for x in available if x['day']>='2026-07-31'),'Publication-date subtotal')
 require(summary['since_cve_publication_2026_09_24']==sum(x['downloads'] for x in available if x['day']>='2026-09-24'),'CVE-date subtotal')
 require('start' not in versions and 'end' not in versions,'Unexpected version API dates')
 counts=versions['downloads'];stable={k:n for k,n in counts.items() if re.fullmatch(r'\d+\.\d+\.\d+',k)}
 require(all(type(n) is int and n>=0 for n in counts.values()),'Invalid version count')
 bands=selection['recorded_cve_description_stable_ranges'];band_counts={};union=set()
 for cve,band in bands.items():
  labels={v for v in stable if version(band['first'])<=version(v)<=version(band['last'])}
  band_counts[cve]=sum(stable[v] for v in labels);union|=labels
 require(band_counts==recent['counts_by_published_cve_description_stable_ranges'],'Recorded CVE-description band totals')
 evidence=root.parent
 for name,expected_hash in selection['evidence_inputs'].items():require(sha(evidence/name)==expected_hash,'Pinned evidence ledger changed: '+name)
 history=load(evidence/'release-history.json')
 studied={r['version'] for r in history['releases'] if r['helper_runtime_status']=='passed'}
 require(studied=={r['version'] for r in history['releases'] if r['first_party_route_present']},'Static/runtime release selections differ')
 require(len(studied)==58 and studied==set(selection['studied_stable_versions']),'Studied release set')
 version_total=sum(counts.values());union_total=sum(counts[x] for x in union);studied_total=sum(n for v,n in counts.items() if v in studied)
 require(version_total==recent['total_counter'],'Version snapshot total')
 require(union_total==recent['union_published_ranges_stable_downloads'],'Stable union total')
 require(studied_total==recent['selected_58_stable_release_downloads'],'58-release subtotal')
 require(sorted(set(counts)-set(stable))==sorted(recent['skipped_nonstable_labels']),'Nonstable labels')
 require(recent['daily_week_counter']==week and recent['same_total_as_daily_week']==(version_total==week['downloads']),'Separate weekly counter comparison')
 require(sum(x['downloads'] for x in rows if week['start']<=x['day']<=week['end'])==week['downloads'],'Dated weekly sum')
 npm=load(evidence/'code-distribution.json')['npm'];git=load(evidence/'git-232.json')
 records=[]
 for package in npm:
  for f in package['files']:
   matches=[m for m in f['matches'] if m['rule'] in RULES]
   if not matches:continue
   records.append({'corpus':'48-npm-archives','package':package['package'],'version':package['version'],'member':f['member'],
   'file_sha256':f['sha256'],'file_bytes':f['bytes'],'archive_sha256':package['archive_sha256'],'locator':package['artifact_url'],
   'upstream_control':package['package']=='mcp-remote',
   'matches':[{'rule':m['rule'],'function':m.get('function'),'reference':m.get('reference',{}).get('name')} for m in matches],
   'cve_applicability':'NOT_ESTABLISHED_BY_THIS_COUNT'})
 for f in git['md5_matches']:
  records.append({'corpus':'232-github-file-records','repository':f['repository'],'commit':f['commit'],'member':f['path'],
  'file_sha256':f['sha256'],'locator':f"https://github.com/{f['repository']}/blob/{f['commit']}/{f['path']}",
  'upstream_control':f['repository']=='punkpeye/mcp-remote','function_similarity':f['md5_function_similarity'],
  'cve_applicability':'NOT_ESTABLISHED_BY_THIS_COUNT'})
 # Compare full rows without depending on presentation order.
 key=lambda row:json.dumps(row,sort_keys=True,separators=(',',':'))
 require(sorted(map(key,records))==sorted(map(key,footprint['records'])),'Footprint registry differs from public source ledgers')
 require(set(footprint['criteria'])==RULES,'Selected npm inclusion rules')
 require(len(npm)==48 and len(git['records'])==232,'Corpus denominators')
 third=[r for r in records if not r['upstream_control']]
 recounted={'file_occurrences':len(records),'unique_file_sha256':len({r['file_sha256'] for r in records}),
 'occurrences_by_corpus':dict(Counter(r['corpus'] for r in records)),
 'upstream_control_occurrences':sum(r['upstream_control'] for r in records),
 'third_party_file_occurrences':len(third),'third_party_unique_file_sha256':len({r['file_sha256'] for r in third}),
 'npm_identities_with_matches':len({r['package'] for r in records if r['corpus']=='48-npm-archives'}),
 'git_repositories_with_selected_md5_matches':len({r['repository'] for r in records if r['corpus']=='232-github-file-records'})}
 for key_name,value in recounted.items():require(footprint[key_name]==value,'Footprint subtotal: '+key_name)
 return {'status':'passed','snapshot_date':footprint['snapshot_date'],'package':'mcp-remote',
 'downloads':{'all_versions_available_period':available_total,'raw_requested_period_sum':total,'point_agrees':True,
 'first_day':daily['start'],'last_available_day':latest['end'],'unavailable_dates':unavailable,'zero_valued_available_days':len(zeros)},
 'recent_versions':{'all_versions':version_total,'recorded_cve_stable_union':union_total,'studied_58_stable_versions':studied_total,
 'union_intersection_studied':sum(counts[v] for v in union&studied),'dates_supplied_by_version_api':False},
 'footprint':recounted,'api_payload_receipts_verified':len(receipts),'network_requests':0,'target_execution':False}
def main()->None:
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--snapshot',type=Path,default=ROOT)
 parser.add_argument('--output',type=Path);args=parser.parse_args()
 try:
  result=calculate(args.snapshot.resolve());text=json.dumps(result,indent=2)+'\n'
  if args.output:
   with args.output.open('x',encoding='utf-8',newline='\n') as stream:stream.write(text)
  else:print(text,end='')
 except (OSError,ValueError,KeyError,TypeError) as exc:
  print(json.dumps({'status':'failed','error':str(exc)}),file=sys.stderr);raise SystemExit(1)
if __name__=='__main__':main()
