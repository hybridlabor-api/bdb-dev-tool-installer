#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');
const https = require('https');
const { execSync } = require('child_process');
const { MultiSelect, Confirm } = require('enquirer');

const pkgPath = path.join(__dirname, 'package.json');
let pkg = { name: '@hybridlabor-api/bdb-dev-tool-installer', version: '1.0.0' };
if (fs.existsSync(pkgPath)) {
    try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch (e) {}
}

const colors = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
    dim: "\x1b[2m"
};

function checkForUpdates() {
    return new Promise((resolve) => {
        const req = https.get(`https://registry.npmjs.org/${pkg.name}/latest`, { timeout: 1500 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const latest = JSON.parse(data).version;
                    if (latest && latest !== pkg.version) {
                        console.log(`${colors.yellow}${colors.bold}╭───────────────────────────────────────────────────────────╮${colors.reset}`);
                        console.log(`${colors.yellow}${colors.bold}│  💡 Update available: ${colors.dim}${pkg.version}${colors.reset}${colors.yellow}${colors.bold} ➔ ${colors.green}${latest}${colors.reset}                   │${colors.reset}`);
                        console.log(`${colors.yellow}${colors.bold}│  Run: ${colors.cyan}npx ${pkg.name}@latest${colors.reset}                       │${colors.reset}`);
                        console.log(`${colors.yellow}${colors.bold}╰───────────────────────────────────────────────────────────╯${colors.reset}\n`);
                    }
                } catch (e) {}
                resolve();
            });
        });
        req.on('error', () => resolve());
        req.on('timeout', () => { req.destroy(); resolve(); });
    });
}

console.log(`\n${colors.cyan}${colors.bold}=========================================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bold} 🛠️ Starting BDB DEV Tool Installer (v${pkg.version})${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}=========================================================${colors.reset}\n`);

checkForUpdates();

const homeDir = os.homedir();
const scriptDir = __dirname;
const isAutoYes = process.argv.includes('-y') || process.argv.includes('--yes');

const registryPath = path.join(scriptDir, 'registry.json');
let registry = { categories: {} };
if (fs.existsSync(registryPath)) {
    try {
        registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    } catch (e) {
        console.error("Warning: Failed to load registry.json");
    }
}

// Extract all tools to reference their config
let allTools = [];
if (registry.categories) {
    for (const [catName, tools] of Object.entries(registry.categories)) {
        tools.forEach(t => allTools.push({...t, category: catName}));
    }
} else if (registry.tools) {
    registry.tools.forEach(t => allTools.push({...t, category: 'Default'}));
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
        return allTools.map(t => t.id);
    }

    let selectedIds = [];

    // Core Tools
    if (registry.categories && registry.categories['Core Tools']) {
        const coreTools = registry.categories['Core Tools'];
        const corePrompt = new MultiSelect({
            name: 'core',
            message: 'Select Core Tools to install (Space to toggle, Enter to confirm):',
            choices: coreTools.map(tool => ({
                name: tool.id,
                message: tool.name,
                hint: tool.description,
                initial: tool.default
            }))
        });
        
        try {
            const coreAnswers = await corePrompt.run();
            selectedIds = selectedIds.concat(coreAnswers);
        } catch (err) {
            console.log('\nInstallation cancelled.');
            process.exit(0);
        }
    }

    // BDB MCPs
    if (registry.categories && registry.categories['BDB MCPs']) {
        let wantMcps = false;
        try {
            const wantMcpsPrompt = new Confirm({
                name: 'wantMcps',
                message: 'Do you want to install any BDB MCPs?'
            });
            wantMcps = await wantMcpsPrompt.run();
        } catch (err) {
            console.log('\nInstallation cancelled.');
            process.exit(0);
        }

        if (wantMcps) {
            const mcpTools = registry.categories['BDB MCPs'];
            const mcpPrompt = new MultiSelect({
                name: 'mcps',
                message: 'Select BDB MCPs to install (Space to toggle, Enter to confirm):',
                limit: 15,
                choices: mcpTools.map(tool => ({
                    name: tool.id,
                    message: tool.name,
                    hint: tool.description,
                    initial: tool.default
                }))
            });
            
            try {
                const mcpAnswers = await mcpPrompt.run();
                selectedIds = selectedIds.concat(mcpAnswers);
            } catch (err) {
                console.log('\nInstallation cancelled.');
                process.exit(0);
            }
        }
    }

    // Hybridlabor API Repositories
    if (registry.categories && registry.categories['Hybridlabor API Repositories']) {
        let wantRepos = false;
        try {
            const wantReposPrompt = new Confirm({
                name: 'wantRepos',
                message: 'Do you want to clone any Hybridlabor API Repositories?'
            });
            wantRepos = await wantReposPrompt.run();
        } catch (err) {
            console.log('\nInstallation cancelled.');
            process.exit(0);
        }

        if (wantRepos) {
            const repoTools = registry.categories['Hybridlabor API Repositories'];
            const repoPrompt = new MultiSelect({
                name: 'repos',
                message: 'Select repositories to clone (Space to toggle, Enter to confirm):',
                limit: 15,
                choices: repoTools.map(tool => ({
                    name: tool.id,
                    message: tool.name,
                    hint: tool.description,
                    initial: tool.default
                }))
            });
            
            try {
                const repoAnswers = await repoPrompt.run();
                selectedIds = selectedIds.concat(repoAnswers);
            } catch (err) {
                console.log('\nInstallation cancelled.');
                process.exit(0);
            }
        }
    }

    // Fallback if no categories
    if (!registry.categories && registry.tools) {
        const fallbackPrompt = new MultiSelect({
            name: 'tools',
            message: 'Select tools to install:',
            choices: registry.tools.map(tool => ({
                name: tool.id,
                message: tool.name,
                hint: tool.description,
                initial: tool.default
            }))
        });
        try {
            const fallbackAnswers = await fallbackPrompt.run();
            selectedIds = selectedIds.concat(fallbackAnswers);
        } catch (err) {
            console.log('\nInstallation cancelled.');
            process.exit(0);
        }
    }

    return selectedIds;
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

async function installMembMcp(targetMcpDir, toolInfo) {
    console.log(`\n${colors.cyan}Setting up memB Long-Term Memory Engine...${colors.reset}`);
    const srcMemb = path.isAbsolute(toolInfo.path) ? toolInfo.path : path.join(scriptDir, toolInfo.path);
    const destMemb = path.join(targetMcpDir, 'memb-mcp'); // nested for isolated env

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

async function installOpenWiki(targetSkillDir, apiKey, toolInfo) {
    console.log(`\n${colors.cyan}Setting up BDB OpenWiki Daemon & Skill...${colors.reset}`);
    const srcOpenWiki = path.isAbsolute(toolInfo.path) ? toolInfo.path : path.join(scriptDir, toolInfo.path);
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

async function installTokenSaver(toolInfo) {
    console.log(`\n${colors.cyan}Setting up BDB Token-Saver Context Optimizer...${colors.reset}`);
    const tokenSaverDir = path.isAbsolute(toolInfo.path) ? toolInfo.path : path.join(scriptDir, toolInfo.path);
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

async function installGenericTool(targetMcpDir, targetSkillDir, toolInfo) {
    console.log(`\n${colors.cyan}Setting up ${toolInfo.name}...${colors.reset}`);
    const srcPath = path.isAbsolute(toolInfo.path) ? toolInfo.path : path.join(scriptDir, toolInfo.path);
    
    if (!fs.existsSync(srcPath)) {
        console.warn(` -> Source path missing: ${srcPath}`);
        return;
    }

    const stats = fs.statSync(srcPath);
    if (stats.isFile()) {
        const destFile = path.join(targetMcpDir, toolInfo.name);
        fs.copyFileSync(srcPath, destFile);
        console.log(` -> Copied ${toolInfo.name} file to ${destFile}`);
    } else {
        const isSkill = toolInfo.type === 'skill';
        const destDir = path.join(isSkill ? targetSkillDir : targetMcpDir, toolInfo.id);
        copyDirRecursiveSync(srcPath, destDir);
        console.log(` -> Copied ${toolInfo.name} directory to ${destDir}`);
    }
}

async function installGitClone(targetDir, toolInfo) {
    console.log(`\n${colors.cyan}Cloning or Updating ${toolInfo.name}...${colors.reset}`);
    const destDir = path.join(targetDir, toolInfo.id);
    if (fs.existsSync(destDir)) {
        console.log(` -> Directory exists. Pulling latest updates from ${toolInfo.path}...`);
        try {
            execSync(`git pull`, { cwd: destDir, stdio: 'inherit' });
            console.log(`${colors.green} -> Update completed successfully.${colors.reset}`);
        } catch (err) {
            console.warn(` -> Warning: Could not update repository: ${err.message}`);
        }
        return;
    }
    try {
        console.log(` -> git clone ${toolInfo.path}`);
        execSync(`git clone ${toolInfo.path} ${destDir}`, { stdio: 'inherit' });
        console.log(`${colors.green} -> Clone completed successfully.${colors.reset}`);
    } catch (err) {
        console.warn(` -> Warning: Could not clone repository: ${err.message}`);
    }
}

(async () => {
    const targets = detectTargetDirectories();
    const selectedToolIds = await promptToolSelection();
    
    let creds = { gemini: "", github: "" };
    if (selectedToolIds.includes('openwiki')) {
        creds = await promptCredentials();
    }
    
    fs.mkdirSync(targets.skillDir, { recursive: true });
    fs.mkdirSync(targets.mcpDir, { recursive: true });

    for (const id of selectedToolIds) {
        const toolInfo = allTools.find(t => t.id === id);
        if (!toolInfo) continue;

        if (id === 'memb-mcp') {
            await installMembMcp(targets.mcpDir, toolInfo);
        } else if (id === 'openwiki') {
            await installOpenWiki(targets.skillDir, creds.gemini, toolInfo);
        } else if (id === 'token-saver') {
            await installTokenSaver(toolInfo);
        } else if (toolInfo.type === 'git_clone') {
            await installGitClone(homeDir, toolInfo);
        } else {
            await installGenericTool(targets.mcpDir, targets.skillDir, toolInfo);
        }
    }

    console.log(`\n${colors.green}${colors.bold}=========================================================${colors.reset}`);
    console.log(`${colors.green}${colors.bold} 🎉 BDB DEV Tools installation completed!${colors.reset}`);
    console.log(`${colors.green}${colors.bold}=========================================================${colors.reset}\n`);

    rl.close();
})();
