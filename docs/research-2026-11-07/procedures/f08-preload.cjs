'use strict';
if (!process.env.MCP_FAKE_SYSTEMROOT || !process.env.MCP_RECORDER_OUTPUT) throw Error('Missing recorder scope');
process.env.SYSTEMROOT = process.env.MCP_FAKE_SYSTEMROOT;
