function renamed(address, resource, headers) {
  const fragments = [address];
  if (resource) fragments.push(resource);
  if (headers && Object.keys(headers).length > 0) {
    const keys = Object.keys(headers).sort();
    fragments.push(JSON.stringify(headers, keys));
  }
  // ruleid: mcp-session-hash-collision
  return c.createHash("md5").update(fragments.join("|")).digest("hex");
}
function strongerHash(address) {
  const fragments = [address];
  // ok: mcp-session-hash-collision
  return c.createHash("sha256").update(fragments.join("|")).digest("hex");
}
function unrelatedMD5(bytes) {
  // ok: mcp-session-hash-collision
  return c.createHash("md5").update(bytes).digest("hex");
}
