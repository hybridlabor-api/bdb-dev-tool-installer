const fs = require('fs');
const path = require('path');

const mcpsDir = path.join(__dirname, '..', 'bdb-dev-optimized-agent-skills', 'mcps');
let bdbMcps = [];
if (fs.existsSync(mcpsDir)) {
  const items = fs.readdirSync(mcpsDir, { withFileTypes: true });
  for (const item of items) {
    if (item.name === '__pycache__' || item.name === '.git') continue;
    let name = item.name;
    let id = item.name;
    
    bdbMcps.push({
      id: id,
      name: name,
      description: `BDB MCP for ${name}`,
      type: "mcp",
      path: `../bdb-dev-optimized-agent-skills/mcps/${name}`,
      default: false
    });
  }
}

const registry = {
  version: "2.0.0",
  categories: {
    "Core Tools": [
      {
        "id": "memb-mcp",
        "name": "memB Long-Term Memory Engine",
        "description": "Local-first hybrid vector memory engine for AI coding agents",
        "type": "mcp",
        "path": "tools/memb-mcp",
        "default": true
      },
      {
        "id": "openwiki",
        "name": "BDB OpenWiki",
        "description": "Autonomous documentation management & release notes daemon",
        "type": "skill_daemon",
        "path": "tools/openwiki",
        "default": true
      },
      {
        "id": "token-saver",
        "name": "BDB Token-Saver",
        "description": "CLI output context window compressor engine (60-99% token savings)",
        "type": "plugin_hooks",
        "path": "tools/token-saver",
        "default": true
      }
    ],
    "BDB MCPs": bdbMcps
  }
};

fs.writeFileSync(path.join(__dirname, 'registry.json'), JSON.stringify(registry, null, 2));
