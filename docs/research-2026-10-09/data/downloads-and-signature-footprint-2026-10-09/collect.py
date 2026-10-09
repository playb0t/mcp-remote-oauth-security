"""Read public aggregate and recent-version counters; never infer historical version shares."""
from __future__ import annotations
from datetime import datetime,timezone,date,timedelta
from pathlib import Path
import argparse,hashlib,json,time,urllib.request
ROOT=Path(__file__).resolve().parent

def main()->None:
    global ROOT
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,required=True,help='New dated snapshot directory; must not exist')
    args=parser.parse_args();ROOT=args.output.resolve()
    ROOT.mkdir(parents=True,exist_ok=False);receipts=[];docs={}
    requests=[('last-day','https://api.npmjs.org/downloads/point/last-day/mcp-remote'),
              ('daily','https://api.npmjs.org/downloads/range/2026-02-17:2026-10-09/mcp-remote'),
              ('point','https://api.npmjs.org/downloads/point/2026-02-17:2026-10-09/mcp-remote'),
              ('last-week','https://api.npmjs.org/downloads/point/last-week/mcp-remote'),
              ('versions-week','https://api.npmjs.org/versions/mcp-remote/last-week')]
    for name,url in requests:
        record={'id':name,'url':url,'read_at_utc':datetime.now(timezone.utc).isoformat()}
        try:
            req=urllib.request.Request(url,headers={'Accept':'application/json','User-Agent':'mcp-research-download-audit'})
            with urllib.request.urlopen(req,timeout=40) as response:raw=response.read(8*1024*1024+1);record['http_status']=response.status
            if len(raw)>8*1024*1024:raise ValueError('response budget exceeded')
            p=ROOT/(name+'.json');p.write_bytes(raw);record.update({'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
            docs[name]=json.loads(raw)
        except Exception as exc:record['error']=type(exc).__name__+': '+str(exc)
        receipts.append(record);print(json.dumps({'id':name,'status':record.get('http_status'),'error':record.get('error')}),flush=True);time.sleep(.5)
    (ROOT/'receipts.json').write_text(json.dumps(receipts,indent=2)+'\n')
    missing=sorted(name for name,_url in requests if name not in docs)
    if missing:
        print(json.dumps({'status':'incomplete','missing_responses':missing}),flush=True)
        raise SystemExit(2)
    latest=docs['last-day']
    if not isinstance(latest,dict) or latest.get('package')!='mcp-remote' or not latest.get('end'):
        raise ValueError('Invalid latest-available-day response')
    date.fromisoformat(latest['end'])
    if latest.get('start')!=latest['end'] or type(latest.get('downloads')) is not int or latest['downloads']<0:
        raise ValueError('Invalid latest-day count or interval')
    daily=docs['daily'];point=docs['point'];rows=daily['downloads'];total=sum(x['downloads'] for x in rows)
    days=[x['day'] for x in rows];assert len(days)==len(set(days));assert daily['package']==point['package']=='mcp-remote'
    assert total==point['downloads'] and daily['start']==point['start'] and daily['end']==point['end']
    start=date.fromisoformat(daily['start']);end=date.fromisoformat(daily['end'])
    assert days==[(start+timedelta(days=i)).isoformat() for i in range((end-start).days+1)]
    latest_complete=latest['end'];complete_rows=[x for x in rows if latest_complete and x['day']<=latest_complete]
    monthly={}
    for row in complete_rows:monthly[row['day'][:7]]=monthly.get(row['day'][:7],0)+row['downloads']
    summary={'schema_version':1,'read_at_utc':datetime.now(timezone.utc).isoformat(),'package':'mcp-remote',
             'start_basis':'First recorded discovery/research date in the case: 2026-02-17; not first vulnerable release date or CVE publication date.',
             'requested_start':'2026-02-17','requested_end':'2026-10-09','api_returned_start':daily['start'],'api_returned_end':daily['end'],
             'raw_requested_period_total':total,'last_available_day_from_point_api':latest_complete,
             'last_available_day_downloads':docs.get('last-day',{}).get('downloads'),
             'available_period_snapshot_total':sum(x['downloads'] for x in complete_rows),
             'days_count':len(complete_rows),'last_available_rows':complete_rows[-5:],
             'by_month':monthly,'since_publication_2026_07_31':sum(x['downloads'] for x in complete_rows if x['day']>='2026-07-31'),
             'since_cve_publication_2026_09_24':sum(x['downloads'] for x in complete_rows if x['day']>='2026-09-24'),
             'point_range_agreement':True,'historical_vulnerable_version_total':None,
             'interpretation':'All versions of the npm package. Not unique installs, users, affected installations, or a per-CVE version-specific download count. Per-version endpoint is recent-week only.'}
    summary['as_of_date']=datetime.now(timezone.utc).date().isoformat()
    summary['availability_note']='Latest available day does not imply finalized historical values. Zero-valued days may represent zero activity or delayed aggregation.'
    summary['zero_valued_dates_in_available_period']=[x['day'] for x in complete_rows if x['downloads']==0]
    (ROOT/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary))
if __name__=='__main__':main()
