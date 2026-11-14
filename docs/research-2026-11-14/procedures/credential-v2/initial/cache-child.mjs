import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
export async function runCache(cfg,mod,creds,metadata){
 const dir=join(process.env.MCP_REMOTE_CONFIG_DIR,'mcp-remote-v1');mkdirSync(dir,{recursive:true});
 const clientFile=join(dir,cfg.hash+'_client_info.json'),tokenFile=join(dir,cfg.hash+'_tokens.json');
 const client={client_id:cfg.cache.otherClient?'other-client':'fixture-client',client_secret:process.env.FIX_SECRET,token_endpoint_auth_method:cfg.method};
 if(cfg.cache.bound)client.issuer=cfg.owner;
 writeFileSync(clientFile,JSON.stringify(client));
 const tokens={access_token:process.env.FIX_AT,refresh_token:process.env.FIX_RT,token_type:'Bearer',expires_in:cfg.cache.expired?1:3600,expires_at:Date.now()+(cfg.cache.expired?-1000:3600000)};
 if(cfg.cache.bound)tokens.issuer=cfg.owner;
 writeFileSync(tokenFile,JSON.stringify(tokens)); const before=readFileSync(tokenFile,'utf8');
 const provider=new mod.NodeOAuthClientProvider({serverUrl:cfg.selected,resourceServerUrl:cfg.resource,serverUrlHash:cfg.hash,host:'127.0.0.1',callbackPort:18001,staticOAuthClientInfo:cfg.cache.static?creds:undefined,staticOAuthClientMetadata:{token_endpoint_auth_method:cfg.method},authorizationServerMetadata:metadata,protectedResourceMetadata:{resource:cfg.resource,authorization_servers:[cfg.selected]}});
 const result={seeded_old_shape:true,seeded_issuer:cfg.cache.bound?'owner-A':'absent'};
 if(cfg.cache.static){
  const info=await provider.clientInformation({issuer:cfg.selected});
  result.returned_issuer_is_selected=info.issuer===cfg.selected;
  result.returned_issuer_is_owner=info.issuer===cfg.owner;
 }else{
  const read=await provider.tokens();
  result.tokens_returned=!!read;
  result.old_access_returned=read?.access_token===process.env.FIX_AT;
  result.refresh_retained=read?.refresh_token===process.env.FIX_RT;
  result.issuer_matches_owner=read?.issuer===cfg.owner;
 }
 result.cached_client_exists=existsSync(clientFile);
 result.token_file_unchanged=readFileSync(tokenFile,'utf8')===before;
 return result;
}
