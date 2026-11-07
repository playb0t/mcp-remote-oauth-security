
import {pathToFileURL} from 'node:url';
const cfg=JSON.parse(process.argv[2]);
const mod=await import(pathToFileURL(cfg.bundle).href);
const creds={client_id:'fixture-client',client_secret:process.env.FIX_SECRET,issuer:cfg.owner,token_endpoint_auth_method:cfg.method};
const metadata={issuer:cfg.selected,authorization_endpoint:cfg.selected+'/authorize',token_endpoint:cfg.selected+'/token',device_authorization_endpoint:cfg.selected+'/device',token_endpoint_auth_methods_supported:[cfg.method],response_types_supported:['code'],grant_types_supported:['authorization_code','refresh_token','client_credentials','urn:ietf:params:oauth:grant-type:device_code']};
let result={mode:cfg.mode,module_loaded:true};
let client;
try{
 if(cfg.mode==='sdk'){
  const provider={
   clientMetadata:{redirect_uris:[],grant_types:['client_credentials'],response_types:['code'],token_endpoint_auth_method:cfg.method},
   clientInformation:async()=>creds,
   tokens:async()=>undefined,
   prepareTokenRequest:async()=>new URLSearchParams({grant_type:'client_credentials'}),
   saveTokens:async(t)=>{result.sdk_saved=true;result.sdk_saved_issuer_matches_owner=t.issuer===cfg.owner;}
  };
  client=new mod.Client({name:'own-sdk-control',version:'1'},{capabilities:{}});
  await mod.connectToRemoteServer(client,cfg.resource,provider,{},async()=>{throw new Error('fixture auth initializer stop');},'http-only');
 }else{
  const provider=new mod.NodeOAuthClientProvider({
   serverUrl:cfg.selected,resourceServerUrl:cfg.resource,serverUrlHash:cfg.hash,host:'127.0.0.1',callbackPort:18001,
   staticOAuthClientInfo:creds,staticOAuthClientMetadata:{token_endpoint_auth_method:cfg.method},
   authorizationServerMetadata:metadata,protectedResourceMetadata:{resource:cfg.resource,authorization_servers:[cfg.selected]},
   useClientCredentials:cfg.mode!=='device',useDeviceCode:cfg.mode==='device'
  });
  if(cfg.mode==='stamp'){
   const a=await provider.clientInformation({issuer:cfg.selected});
   result.returned_issuer_is_owner=a.issuer===cfg.owner;
   result.returned_issuer_is_selected=a.issuer===cfg.selected;
  }else if(cfg.mode==='refresh'){
   await provider.saveTokens({access_token:process.env.FIX_AT,refresh_token:process.env.FIX_RT,token_type:'Bearer',expires_in:3600,expires_at:Date.now()+3600000,issuer:cfg.owner,scope:'fixture.read'});
   const before=await provider.tokens();result.stored_issuer_preserved=before?.issuer===cfg.owner;
   await provider.saveTokens({access_token:process.env.FIX_AT,refresh_token:process.env.FIX_RT,token_type:'Bearer',expires_in:1,expires_at:Date.now()-1000,issuer:cfg.owner,scope:'fixture.read'});
   const after=await provider.tokens();result.tokens_returned=!!after;
  }else{
   if(cfg.mode==='device')await provider.authorizeWithDeviceCode();else await provider.authorizeWithClientCredentials();
   const t=await provider.tokens();result.fresh_tokens_present=!!t;result.fresh_issuer_present=typeof t?.issuer==='string';result.fresh_issuer_matches_selected=t?.issuer===cfg.selected;
  }
 }
 result.returned=true;
}catch(e){result.returned=false;result.error_type=e?.constructor?.name;result.error_message=String(e.message).slice(0,300);}
finally{if(client)try{await client.close();}catch{}}
console.log('DRIVER_RESULT '+JSON.stringify(result));
