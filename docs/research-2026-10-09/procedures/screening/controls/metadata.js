async function direct(response) {
  const endpoint = response.resource_metadata;
  // ruleid: mcp-ssrf-unvalidated-metadata
  return fetch(endpoint);
}
async function renamed(payload) {
  const x = payload.authorization_servers[0];
  // ruleid: mcp-ssrf-unvalidated-metadata
  return network.request(x);
}
async function header(response) {
  const header = response.headers.get("WWW-Authenticate");
  const url = parseHeader(header).resourceMetadataUrl;
  // ruleid: mcp-ssrf-unvalidated-metadata
  return fetch(url);
}
async function parseIsNotIPPolicy(response) {
  const url = new URL(response.resource_metadata);
  // ruleid: mcp-ssrf-unvalidated-metadata
  return fetch(url);
}
async function fixedDestination(response) {
  const unused = response.resource_metadata;
  // ok: mcp-ssrf-unvalidated-metadata
  return fetch("https://issuer.example/.well-known/oauth-protected-resource");
}
async function parseOnly(response) {
  return response.resource_metadata;
}
async function handoff(params) {
  // ruleid: mcp-resource-discovery-handoff
  const result = await helper(params.resourceMetadataUrl);
  return result;
}
