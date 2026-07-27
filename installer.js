#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');
const { execSync, spawn } = require('child_process');

const colors = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
    dim: "\x1b[2m"
};

console.log(`\n${colors.cyan}${colors.bold}=========================================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bold} 🛠️ Starting BDB DEV Tool Installer (memB, OpenWiki, Token-Saver)${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}=========================================================${colors.reset}\n`);

const homeDir = os.homedir();
const scriptDir = __dirname;
const isAutoYes = process.argv.includes('-y') || process.argv.includes('--yes');

const registryPath = path.join(scriptDir, 'registry.json');
let registry = { tools: [] };
if (fs.existsSync(registryPath)) {
    try {
        registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    } catch (e) {
        console.error("Warning: Failed to load registry.json");
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function detectTargetDirectories() {
    const geminiDir = path.join(homeDir, '.gemini');
    const skillDir = path.join(geminiDir, 'config', 'skills');
    const mcpDir = path.join(geminiDir, 'config', 'mcps');
    const mcpConfigPath = path.join(geminiDir, 'antigravity-cli', 'mcp_config.json');

    return { geminiDir, skillDir, mcpDir, mcpConfigPath };
}

async function promptToolSelection() {
    if (isAutoYes) {
        return registry.tools.map(t => t.id);
    }

    console.log(`${colors.magenta}${colors.bold}--- Select BDB-DEV Tools to Install ---${colors.reset}`);
    const selections = registry.tools.map(tool => ({ ...tool, selected: tool.default }));

    const displayMenu = () => {
        console.log("");
        selections.forEach((tool, index) => {
            const check = tool.selected ? `${colors.green}x${colors.reset}` : ' ';
            console.log(` ${colors.cyan}${index + 1}.${colors.reset} [${check}] ${colors.bold}${tool.name}${colors.reset} - ${colors.dim}${tool.description}${colors.reset}`);
        });
        console.log(`\n${colors.dim}Type a number to toggle, 'all' to select all, 'none' to clear, or press ENTER/done to proceed:${colors.reset}`);
    };

    return new Promise((resolve) => {
        const ask = () => {
            displayMenu();
            rl.question('\n> ', (answer) => {
                const input = answer.trim().toLowerCase();
                if (input === 'done' || input === '') {
                    resolve(selections.filter(s => s.selected).map(s => s.id));
                    return;
                }
                if (input === 'all') { selections.forEach(s => s.selected = true); }
                else if (input === 'none') { selections.forEach(s => s.selected = false); }
                else {
                    const num = parseInt(input, 10);
                    if (!isNaN(num) && num > 0 && num <= selections.length) { selections[num - 1].selected = !selections[num - 1].selected; }
                    else { console.log('Invalid input. Please try again.'); }
                }
                ask();
            });
        };
        ask();
    });
}

async function promptCredentials() {
    if (isAutoYes) return { gemini: "", github: "" };
    return new Promise((resolve) => {
        console.log(`\n${colors.magenta}${colors.bold}--- API Keys & Integrations ---${colors.reset}`);
        rl.question(`${colors.yellow}Enter your GEMINI_API_KEY for BDB OpenWiki${colors.reset} ${colors.dim}(leave blank to skip):${colors.reset} `, (gemini) => {
            rl.question(`${colors.yellow}Enter your GITHUB_PERSONAL_ACCESS_TOKEN for GitHub tools${colors.reset} ${colors.dim}(leave blank to skip):${colors.reset} `, (github) => {
                resolve({ gemini: gemini.trim(), github: github.trim() });
            });
        });
    });
}

function copyDirRecursiveSync(src, dest) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursiveSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

async function installMembMcp(targetMcpDir) {
    console.log(`\n${colors.cyan}1. Setting up memB Long-Term Memory Engine...${colors.reset}`);
    const srcMemb = path.join(scriptDir, 'tools', 'memb-mcp');
    const destMemb = path.join(targetMcpDir, 'mcps', 'memb-mcp');

    copyDirRecursiveSync(srcMemb, destMemb);
    console.log(` -> Copied memB files to ${destMemb}`);

    try {
        const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
        console.log(` -> Bootstrapping Python virtual environment for memB...`);
        execSync(`${pythonCmd} -m venv .venv`, { cwd: destMemb, stdio: 'ignore' });
        const pipPath = os.platform() === 'win32' ? path.join(destMemb, '.venv', 'Scripts', 'pip.exe') : path.join(destMemb, '.venv', 'bin', 'pip');
        console.log(` -> Installing dependencies (chromadb, mcp, pydantic)...`);
        execSync(`"${pipPath}" install --upgrade pip`, { cwd: destMemb, stdio: 'ignore' });
        execSync(`"${pipPath}" install -r requirements.txt`, { cwd: destMemb, stdio: 'ignore' });
        console.log(`${colors.green} -> memB MCP setup completed successfully.${colors.reset}`);
    } catch (err) {
        console.warn(` -> Warning: Could not complete memB venv setup: ${err.message}`);
    }
}

async function installOpenWiki(targetSkillDir, apiKey) {
    console.log(`\n${colors.cyan}2. Setting up BDB OpenWiki Daemon & Skill...${colors.reset}`);
    const srcOpenWiki = path.join(scriptDir, 'tools', 'openwiki');
    const destOpenWiki = path.join(targetSkillDir, 'openwiki-skill');

    copyDirRecursiveSync(srcOpenWiki, destOpenWiki);
    console.log(` -> Copied OpenWiki skill definition to ${destOpenWiki}`);

    if (apiKey) {
        const scriptBase = path.join(destOpenWiki, 'scripts');
        const scriptPath = path.join(scriptBase, os.platform() === 'win32' ? 'install_daemon.ps1' : 'install_daemon.sh');
        if (fs.existsSync(scriptPath)) {
            try {
                if (os.platform() !== 'win32') fs.chmodSync(scriptPath, '755');
                console.log(` -> Installing OpenWiki daemon service...`);
                const env = Object.assign({}, process.env, { GEMINI_API_KEY: apiKey });
                const command = os.platform() === 'win32' ? 'powershell.exe' : 'sh';
                const args = os.platform() === 'win32' ? ['-ExecutionPolicy', 'Bypass', '-File', scriptPath] : [scriptPath];
                execSync(`${command} ${args.join(' ')}`, { env, stdio: 'ignore' });
                console.log(`${colors.green} -> BDB OpenWiki daemon installed.${colors.reset}`);
            } catch (err) {
                console.warn(` -> Could not auto-install daemon: ${err.message}`);
            }
        }
    } else {
        console.log(` -> Skipping OpenWiki daemon background service (GEMINI_API_KEY omitted).`);
    }
}

async function installTokenSaver() {
    console.log(`\n${colors.cyan}3. Setting up BDB Token-Saver Context Optimizer...${colors.reset}`);
    const tokenSaverDir = path.join(scriptDir, 'tools', 'token-saver');
    if (!fs.existsSync(tokenSaverDir)) {
        console.warn(` -> Token-Saver payload directory missing.`);
        return;
    }

    try {
        const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
        console.log(` -> Running Token-Saver installer (--target both)...`);
        execSync(`${pythonCmd} install.py --target both`, {
            cwd: tokenSaverDir,
            stdio: 'inherit'
        });
        console.log(`${colors.green} -> BDB Token-Saver registered for Antigravity & Claude Code.${colors.reset}`);
    } catch (err) {
        console.warn(` -> Warning: Token-Saver setup encountered an issue: ${err.message}`);
    }
}

(async () => {
    const targets = detectTargetDirectories();
    const selectedToolIds = await promptToolSelection();
    const creds = await promptCredentials();

    fs.mkdirSync(targets.skillDir, { recursive: true });
    fs.mkdirSync(targets.mcpDir, { recursive: true });

    if (selectedToolIds.includes('memb-mcp')) {
        await installMembMcp(targets.geminiDir);
    }

    if (selectedToolIds.includes('openwiki')) {
        await installOpenWiki(targets.skillDir, creds.gemini);
    }

    if (selectedToolIds.includes('token-saver')) {
        await installTokenSaver();
    }

    console.log(`\n${colors.green}${colors.bold}=========================================================${colors.reset}`);
    console.log(`${colors.green}${colors.bold} 🎉 BDB DEV Tools installation completed!${colors.reset}`);
    console.log(`${colors.green}${colors.bold}=========================================================${colors.reset}\n`);

    rl.close();
})();
