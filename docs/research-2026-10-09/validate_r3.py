"""Offline consistency checks for the r3 publication; no target program execution."""
from __future__ import annotations
import hashlib,json,re
from collections import Counter
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
class R3ValidationError(Exception):pass
def check(ok:bool,message:str)->None:
 if not ok:raise R3ValidationError(message)
def read(root:Path,name:str):
 return json.loads((root/name).read_text(encoding="utf-8"))
def digest(p:Path)->str:return hashlib.sha256(p.read_bytes()).hexdigest()
class Markup(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.tables=0;self.headings=0;self.text=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='a' and a.get('href'):self.links.append(a['href'])
  if tag=='table':self.tables+=1
  if tag in {'h1','h2','h3'}:self.headings+=1
 def handle_data(self,data):self.text.append(data)
def validate(root:Path)->dict:
 data=read(root,'data/code-distribution.json');npm=read(root,'data/npm-48.json')
 check(len(data['npm'])==48,'r3 npm record count')
 check(len(data['git'])==232,'r3 Git record count')
 lookup={(r['name'],r['version']):r for r in npm['records']}
 for r in data['npm']:
  base=lookup[(r['package'],r['version'])]
  check(r['archive_sha256']==base['archive_sha256'],'r3 npm archive identity')
  check(r['category'] is None,'r3 unclassified npm must remain unclassified')
  check(r['recorded_result']==base['status'],'r3 npm status preservation')
  check(r['files_scanned']==len(r['files'])==base['files_scanned'],'r3 npm file count')
  flat=[m for f in r['files'] for m in f['matches']]
  check(sum(m['rule']=='reference-function-match' for m in flat)==base['reference_matches'],'r3 reference match count')
  check(sum(m['rule'] in {'md5-config-namespace','md5-input-with-oauth-storage-context'} for m in flat)==base['namespace_matches'],'r3 namespace count')
  for f in r['files']:
   check(bool(re.fullmatch('[0-9a-f]{64}',f['sha256'])),'r3 missing member checksum')
   for m in f['matches']:
    check(bool(m['function']) and bool(m['rule']) and bool(re.fullmatch('[0-9a-f]{64}',m['fingerprint'])),'r3 function evidence')
 git=read(root,'data/git-232.json')['records'];gitlookup={r['id']:r for r in git}
 for r in data['git']:
  check(all(r[k]==v for k,v in gitlookup[r['id']].items()),'r3 Git projection drift')
 rows=data['subsequent_cohorts'];coh=read(root,'data/screening-cohorts.json')
 check(len(rows)==63,'r3 cohort identity count')
 check(Counter(r['category'] for r in rows)==Counter({'A':0,'B':4,'C':51,'UNRESOLVED':8}),'r3 cohort categories')
 for name in ['calibration','corporate','marketplace']:
  part=[r for r in rows if r['cohort']==name]
  check(len(part)==len(coh[name]['artifact_records']),'r3 cohort artifact count')
  check(sum(len(r['files']) for r in part)==coh[name]['files'],'r3 source instance count')
  expected={(x['name'],x['version'],x['commit'],x['archive_sha256']) for x in coh[name]['artifact_records']}
  check({(x['name'],x['version'],x['commit'],x['archive_sha256']) for x in part}==expected,'r3 cohort pinned identity')
  for r in part:
   if r['category']=='UNRESOLVED':check(not r['coverage_complete_within_method'],'r3 unresolved coverage')
   for f in r['files']:
    check(bool(re.fullmatch('[0-9a-f]{64}',f['sha256'])),'r3 missing cohort member checksum')
    check('matches' in f and 'coverage_complete_within_method' in f,'r3 file evidence fields')
 toolkit=read(root,'data/screening-toolkit.json')
 verification=toolkit['verification'];receipt=read(root,verification['receipt'])
 check(digest(root/verification['receipt'])==verification['sha256'],'r3 toolkit receipt hash')
 check(verification['passed'] is True and verification['fresh_directory'] is True,'r3 clean directory controls')
 check(verification['fresh_dependency_install'] is False,'r3 fresh install overclaim')
 check(verification['target_execution'] is False and verification['dependencies_installed'] is False,'r3 operation scope')
 check(toolkit['method']['classifications_generated'] is False,'r3 scanner classification overclaim')
 check(toolkit['method']['semgrep_budget_seconds']==15 and toolkit['method']['budget_basis']=='wall-clock','r3 watchdog units')
 check(toolkit['method']['corporate_threshold_exclusive']==.85 and toolkit['method']['marketplace_threshold_exclusive']==.80,'r3 strict thresholds')
 dossier=(root/'RESEARCH_DOSSIER.md').read_text(encoding='utf-8')
 for r in read(root,'data/ecosystem-lineage.json')['npm_records']:
  expected='| '+r['package']+' | '+r['version']+' | '+r['artifact_role']+' | '+str(r['reference_matches'])+' |'
  check(expected in dossier,'r3 npm table mismatch')
 for line in ['| Calibration | 10 | 3033 | 0 | 0 | 9 | 1 |','| Corporate pilot, after targeted review | 33 | 1325 | 0 | 1 | 32 | 0 |','| Marketplace | 20 | 3699 | 0 | 3 | 10 | 7 |','| Total | 63 | 8057 | 0 | 4 | 51 | 8 |']:
  check(line in dossier,'r3 cohort table mismatch')
 links=0;html_checks=[]
 for p in root.rglob('*'):
  if not p.is_file():continue
  check(not any(x in p.parts for x in ['node_modules','__pycache__','.venv','.cache']),'r3 installed runtime or cache')
  text=p.read_text(encoding='utf-8')
  check(not re.search(r'(?i)(?:[A-Z]:[\\/](?:Projects|Users)|/mnt/[a-z]/Projects/)',text),'r3 host path')
  if p.suffix=='.md':
   # Ignore fenced shell commands and their bracket notation.
   cleaned=re.sub(r'^(\x60{3,}|~{3,}).*?^\1[ \t]*$', '',text,flags=re.M|re.S)
   urls=re.findall(r'\[[^\]]*\]\(([^)]+)\)',cleaned)
  elif p.suffix=='.html':
   parser=Markup();parser.feed(text);urls=parser.links
   html_checks.append({'file':p.name,'tables':parser.tables,'headings':parser.headings,'source_sha256_present':'Source SHA-256:' in text})
   check(parser.headings>0 and 'Source SHA-256:' in text,'r3 HTML source binding')
  else:continue
  for url in urls:
   u=urlsplit(url.strip('<>'))
   if u.scheme or not u.path:continue
   target=(p.parent/unquote(u.path)).resolve()
   check(target.is_relative_to(root.resolve()) and target.is_file(),'r3 broken package link: '+p.name+' -> '+url);links+=1
 return {'status':'passed','npm_file_records':sum(len(r['files']) for r in data['npm']),'git_file_records':232,'cohort_file_instances':8057,'cohort_artifacts':63,'all_local_document_links':links,'html_structure':html_checks,'visual_browser_review':False,'target_program_executed':False}
