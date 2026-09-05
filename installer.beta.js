#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { execSync, spawnSync } = require('child_process');
const clack = require('@clack/prompts');

const {
    intro,
    outro,
    note,
    password,
    select,
    multiselect,
    spinner,
    isCancel,
    cancel,
    log
} = clack;

const pkgPath = path.join(__dirname, 'package.json');
let pkg = { name: '@hybridlabor-api/bdb-dev-tool-installer', version: '1.2.1-beta' };
if (fs.existsSync(pkgPath)) {
    try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch (e) {}
}

const DRY_RUN = process.argv.includes('--dry-run');
const LIST_ONLY = process.argv.includes('--list');
const isAutoYes = process.argv.includes('-y') || process.argv.includes('--yes') || !process.stdout.isTTY;
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

const colors = { reset: '\x1b[0m' };

const onlyArgRaw = process.argv.find(a => a.startsWith('--only='));
const onlyFilter = onlyArgRaw ? onlyArgRaw.slice('--only='.length).split(',').map(s => s.trim()).filter(Boolean) : null;

function pick(value) {
    if (isCancel(value)) {
        cancel('Installation aborted.');
        process.exit(0);
    }
    return value;
}

const BACK = Symbol('back');

function logDebug(err, context) {
    if (!VERBOSE) return;
    const msg = err && err.message ? err.message : String(err);
    try {
        log.message(`[debug] ${context}: ${msg}`);
    } catch (e) {
        console.log(`[debug] ${context}: ${msg}`);
    }
}

async function selectWithBack(config) {
    const value = pick(await select({ ...config, options: [...config.options, { value: BACK, label: '← Back', hint: 'one step back' }] }));
    return value === BACK ? BACK : value;
}

async function multiselectWithBack(config) {
    while (true) {
        const res = pick(await multiselect({
            ...config,
            options: [...config.options, { value: '__BACK__', label: '← Back', hint: 'toggle & confirm to go one step back' }],
            required: false
        }));
        if (res.includes('__BACK__')) return BACK;
        if (!config.allowEmpty && res.length === 0) {
            log.warn('Select at least one entry (or choose ← Back).');
            continue;
        }
        return res;
    }
}

async function passwordPrompt(config) {
    return pick(await password(config));
}

function run(cmd, args, opts = {}) {
    if (DRY_RUN) {
        log.step(`[dry-run] ${cmd} ${args.join(' ')}`);
        return { status: 0 };
    }
    const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
    if (res.error) logDebug(res.error, `${cmd} ${args.join(' ')}`);
    return res;
}

function runQuiet(cmd, args, opts = {}) {
    if (DRY_RUN) return { status: 0, stdout: '' };
    const res = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
    if (res.error) logDebug(res.error, `${cmd} ${args.join(' ')}`);
    return res;
}

function shCapture(script) {
    if (DRY_RUN) return '';
    return (spawnSync('sh', ['-c', script], { encoding: 'utf8' }).stdout || '').trim();
}

function checkForUpdates() {
    return new Promise((resolve) => {
        if (DRY_RUN) return resolve(null);
        const req = https.get(`https://registry.npmjs.org/${pkg.name}/latest`, { timeout: 1500 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const latest = JSON.parse(data).version;
                    resolve(latest && latest !== pkg.version ? latest : null);
                } catch (e) {
                    resolve(null);
                }
            });
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}

const homeDir = os.homedir();
const scriptDir = __dirname;

const registryPath = path.join(scriptDir, 'registry.json');
let registry = { categories: {} };
if (fs.existsSync(registryPath)) {
    try {
        registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    } catch (e) {
        logDebug(e, 'parse registry.json');
        console.error('Warning: Failed to load registry.json');
    }
}

let allTools = [];
if (registry.categories) {
    for (const [catName, tools] of Object.entries(registry.categories)) {
        tools.forEach(t => allTools.push({ ...t, category: catName }));
    }
} else if (registry.tools) {
    registry.tools.forEach(t => allTools.push({ ...t, category: 'Default' }));
}

function toolLabel(tool) {
    if (tool.name && !tool.name.startsWith('BDB MCP for ') && tool.name !== tool.id) return tool.name;
    return tool.id;
}

function loadExistingCredentials() {
    const envData = {};
    const envPaths = [
        path.join(homeDir, '.gemini', 'config', '.env'),
        path.join(homeDir, '.agents', '.env'),
        path.join(homeDir, '_local-secrets', 'fleet-master.env'),
        path.join(homeDir, '.openwiki', '.env')
    ];
    for (const ep of envPaths) {
        if (!fs.existsSync(ep)) continue;
        try {
            for (const line of fs.readFileSync(ep, 'utf8').split('\n')) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                    const idx = trimmed.indexOf('=');
                    const k = trimmed.substring(0, idx).trim();
                    const v = trimmed.substring(idx + 1).trim();
                    if (k && v && !envData[k]) envData[k] = v;
                }
            }
        } catch (e) {
            logDebug(e, `read ${ep}`);
        }
    }
    for (const k of ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'OPENROUTER_API_KEY', 'GITHUB_PERSONAL_ACCESS_TOKEN', 'GITHUB_TOKEN']) {
        if (process.env[k] && !envData[k]) envData[k] = process.env[k];
    }
    return envData;
}

function maskApiKey(key) {
    if (!key) return '';
    if (key.length <= 8) return '****';
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
}

const TARGETS = [
    { id: 'universal', label: '🌐 Universal (all detected agent environments)', detect: true },
    { id: 'antigravity', label: 'Google Antigravity', skillDir: path.join(homeDir, '.gemini', 'config', 'skills'), mcpDir: path.join(homeDir, '.gemini', 'config', 'mcps') },
    { id: 'claudecode', label: 'Claude Code CLI', skillDir: path.join(homeDir, '.claude', 'skills'), mcpDir: path.join(homeDir, '.claude', 'skills', 'mcps'), probe: path.join(homeDir, '.claude') },
    { id: 'agentsdir', label: '~/.agents (generic harness)', skillDir: path.join(homeDir, '.agents', 'skills'), mcpDir: path.join(homeDir, '.agents', 'mcps'), probe: path.join(homeDir, '.agents') },
    { id: 'cursor', label: 'Cursor IDE (project-local)', skillDir: path.join(process.cwd(), '.cursor', 'bdb-skills'), mcpDir: path.join(process.cwd(), '.cursor', 'bdb-skills', 'mcps'), probe: path.join(process.cwd(), '.cursor') }
];

function detectedTargets() {
    return TARGETS.filter(t => t.probe && fs.existsSync(t.probe));
}

function resolveTargetPaths(targetIds) {
    let ids = targetIds.filter(id => id !== 'universal');
    if (ids.length === 0) ids = ['antigravity'];
    return ids.map(id => {
        const t = TARGETS.find(x => x.id === id);
        return { id, skillDir: t.skillDir, mcpDir: t.mcpDir };
    });
}

function copyDirRecursiveSync(src, dest) {
    if (!fs.existsSync(src)) return;
    if (DRY_RUN) {
        let count = 0;
        const walk = (dir) => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const p = path.join(dir, entry.name);
                if (entry.isDirectory()) walk(p);
                else count++;
            }
        };
        walk(src);
        log.step(`[dry-run] copy ${count} files: ${src} -> ${dest}`);
        return;
    }
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
    log.info('Setting up memB Long-Term Memory Engine...');
    const srcMemb = path.isAbsolute(toolInfo.path) ? toolInfo.path : path.join(scriptDir, toolInfo.path);
    const destMemb = path.join(targetMcpDir, 'memb-mcp');

    copyDirRecursiveSync(srcMemb, destMemb);

    if (DRY_RUN) {
        log.step('[dry-run] bootstrap memB venv + pip install -r requirements.txt');
        return;
    }

    try {
        const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
        const venvPython = os.platform() === 'win32'
            ? path.join(destMemb, '.venv', 'Scripts', 'python.exe')
            : path.join(destMemb, '.venv', 'bin', 'python');

        if (!fs.existsSync(venvPython)) {
            const uvResult = runQuiet('uv', ['venv', '--seed', '.venv'], { cwd: destMemb });
            if (uvResult.status !== 0) {
                logDebug(new Error(`uv venv exit ${uvResult.status}`), 'memB uv fallback');
                run(pythonCmd, ['-m', 'venv', '.venv'], { cwd: destMemb });
            }
        }

        log.step('Installing dependencies (chromadb, mcp, pydantic)...');
        run(venvPython, ['-m', 'pip', 'install', '--upgrade', 'pip'], { cwd: destMemb });
        run(venvPython, ['-m', 'pip', 'install', '-r', 'requirements.txt'], { cwd: destMemb });
        log.success('memB MCP setup completed successfully.');
    } catch (err) {
        logDebug(err, 'memB venv setup');
        log.warn(`Could not complete memB venv setup: ${err.message}`);
    }
}

async function installOpenWiki(targetSkillDir, apiKey, toolInfo, existingEnv = {}) {
    log.info('Setting up BDB OpenWiki Skill & Configuration...');
    const srcOpenWiki = path.isAbsolute(toolInfo.path) ? toolInfo.path : path.join(scriptDir, toolInfo.path);
    const destOpenWiki = path.join(targetSkillDir, 'openwiki-skill');

    copyDirRecursiveSync(srcOpenWiki, destOpenWiki);

    const openWikiEnvPath = path.join(homeDir, '.openwiki', '.env');
    if (!fs.existsSync(openWikiEnvPath)) {
        try {
            fs.mkdirSync(path.join(homeDir, '.openwiki'), { recursive: true });
            const openrouterKey = existingEnv['OPENROUTER_API_KEY'] || '';
            const geminiKey = apiKey || existingEnv['GEMINI_API_KEY'] || existingEnv['GOOGLE_API_KEY'] || '';
            let content = '# OpenWiki Configuration\n';
            if (openrouterKey) {
                content += `OPENWIKI_PROVIDER=openrouter\nOPENROUTER_API_KEY=${openrouterKey}\nOPENWIKI_MODEL_ID=minimax/minimax-m3:free\n`;
            } else if (geminiKey) {
                content += `OPENWIKI_PROVIDER=gemini\nGEMINI_API_KEY=${geminiKey}\nOPENWIKI_MODEL_ID=gemini-2.5-flash\n`;
            }
            fs.writeFileSync(openWikiEnvPath, content, 'utf8');
            log.success('Initialized ~/.openwiki/.env configuration.');
        } catch (e) {
            logDebug(e, 'write openwiki .env');
        }
    }
}

async function installTokenSaver(toolInfo) {
    log.info('Setting up BDB Token-Saver Context Optimizer...');
    const tokenSaverDir = path.isAbsolute(toolInfo.path) ? toolInfo.path : path.join(scriptDir, toolInfo.path);
    if (!fs.existsSync(tokenSaverDir)) {
        log.warn('Token-Saver payload directory missing.');
        return;
    }

    if (DRY_RUN) {
        log.step(`[dry-run] ${os.platform() === 'win32' ? 'python' : 'python3'} install.py --target both (cwd ${tokenSaverDir})`);
        return;
    }

    try {
        const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
        const res = spawnSync(pythonCmd, ['install.py', '--target', 'both'], { cwd: tokenSaverDir, stdio: 'inherit' });
        if (res.error) throw res.error;
        log.success('BDB Token-Saver registered for Antigravity & Claude Code.');
    } catch (err) {
        logDebug(err, 'token-saver setup');
        log.warn(`Token-Saver setup encountered an issue: ${err.message}`);
    }
}

async function installGenericTool(targetMcpDir, targetSkillDir, toolInfo) {
    log.info(`Setting up ${toolLabel(toolInfo)}...`);
    const srcPath = path.isAbsolute(toolInfo.path) ? toolInfo.path : path.join(scriptDir, toolInfo.path);

    if (!fs.existsSync(srcPath)) {
        log.warn(`Source path missing: ${srcPath}`);
        return;
    }

    const stats = fs.statSync(srcPath);
    if (stats.isFile()) {
        const destFile = path.join(targetMcpDir, toolInfo.name || toolInfo.id);
        if (!DRY_RUN) fs.mkdirSync(path.dirname(destFile), { recursive: true });
        if (DRY_RUN) {
            log.step(`[dry-run] copy file ${srcPath} -> ${destFile}`);
        } else {
            fs.copyFileSync(srcPath, destFile);
            log.step(`Copied ${toolInfo.id} file to ${destFile}`);
        }
    } else {
        const isSkill = toolInfo.type === 'skill';
        const destDir = path.join(isSkill ? targetSkillDir : targetMcpDir, toolInfo.id);
        copyDirRecursiveSync(srcPath, destDir);
        log.step(`Copied ${toolInfo.id} directory to ${destDir}`);
    }
}

async function installGitClone(toolInfo) {
    if (toolInfo.install_method === 'npx') {
        log.info(`Installing ${toolLabel(toolInfo)} via npm...`);
        if (DRY_RUN) {
            log.step(`[dry-run] npm install -g ${toolInfo.package}`);
            return;
        }
        const res = spawnSync('npm', ['install', '-g', toolInfo.package], { stdio: 'inherit' });
        if ((res.status || 0) !== 0 || res.error) {
            if (res.error) logDebug(res.error, `npm install -g ${toolInfo.package}`);
            log.warn(`Could not install via npm (exit ${res.status}).`);
        } else {
            log.success('NPM install completed successfully.');
        }
        return;
    }

    log.info(`Cloning or Updating ${toolLabel(toolInfo)}...`);
    const destDir = path.join(homeDir, toolInfo.id);
    if (DRY_RUN) {
        log.step(fs.existsSync(destDir)
            ? `[dry-run] git -C ${destDir} pull`
            : `[dry-run] git clone ${toolInfo.path} ${destDir}`);
        return;
    }
    if (fs.existsSync(destDir)) {
        log.step(`Directory exists. Pulling latest updates...`);
        const res = spawnSync('git', ['pull'], { cwd: destDir, stdio: 'inherit' });
        if ((res.status || 0) !== 0) log.warn(`Could not update repository (exit ${res.status}).`);
        else log.success('Update completed successfully.');
        return;
    }
    const res = spawnSync('git', ['clone', toolInfo.path, destDir], { stdio: 'inherit' });
    if ((res.status || 0) !== 0) log.warn(`Could not clone repository (exit ${res.status}).`);
    else log.success('Clone completed successfully.');
}

function printRegistryList() {
    for (const [catName, tools] of Object.entries(registry.categories || {})) {
        console.log(`\n${catName}:`);
        for (const t of tools) {
            const flags = [t.default ? 'default' : null, t.status || null].filter(Boolean).join(', ');
            console.log(`  • ${(t.id || '').padEnd(28)} ${toolLabel(t).padEnd(34)} ${flags}${flags ? ' ' : ''}- ${t.description || ''}`);
        }
    }
}

async function promptCredentials(existingEnv) {
    const existingGemini = existingEnv['GEMINI_API_KEY'] || existingEnv['GOOGLE_API_KEY'] || '';
    const entered = await passwordPrompt({
        message: `GEMINI_API_KEY for BDB OpenWiki${existingGemini ? ` (existing detected: ${maskApiKey(existingGemini)}, leave blank to keep)` : ' (leave blank to skip)'}`
    });
    return (((entered || '') + '').trim()) || existingGemini;
}

async function main() {
    const latest = await checkForUpdates();

    const PURPLE = '\x1b[1;38;2;157;78;221m';
    const PURPLE_DIM = '\x1b[2;38;2;157;78;221m';
    intro(`${PURPLE}┌─[ 🛠️  BDB DEV TOOL INSTALLER ]──────────────────────────────────────┐${colors.reset}
${PURPLE}│   Registry-Tools · MCPs · Skills · Standalone Power-Ups             │${colors.reset}
${PURPLE}└─────────────────────────────────────────────────────────────────────┘${colors.reset}
${PURPLE_DIM}v${pkg.version} · ${allTools.length} Tools in der Registry${colors.reset}`);

    if (DRY_RUN) log.warn('DRY-RUN MODE active - no files will be modified, nothing installed.');
    if (isAutoYes && !LIST_ONLY) log.warn('Non-interactive mode (-y): all defaults are accepted automatically.');
    if (latest) log.warn(`Update available: v${pkg.version} ➔ v${latest} — run: npx ${pkg.name}@latest`);

    if (Object.keys(registry.categories || {}).length === 0) {
        log.error('registry.json missing or invalid - cannot continue.');
        process.exitCode = 1;
        return;
    }

    if (LIST_ONLY) {
        printRegistryList();
        outro('Registry listing complete.');
        return;
    }

    let selectedToolIds;

    if (isAutoYes) {
        selectedToolIds = allTools
            .filter(t => !onlyFilter || onlyFilter.includes(t.id))
            .map(t => t.id);
        log.info(`Auto-yes selection: ${selectedToolIds.length} tool(s)`);
    } else {
        let ctx = { targets: null, tools: null, apiKey: '' };

        const stepTargets = async () => {
            const detections = detectedTargets();
            if (detections.length > 0) {
                log.info('Detected agent environments:');
                detections.forEach(d => log.message(`${d.label} (${d.probe})`));
            }
            const options = TARGETS.map(t => ({
                value: t.id,
                label: t.label,
                hint: t.detect ? `includes: ${detections.map(d => d.id).join(', ') || 'antigravity'}` : undefined
            }));
            const sel = await multiselectWithBack({
                message: 'Installation target(s):',
                options,
                initialValues: ['universal']
            });
            if (sel === BACK) return 'back';
            ctx.targets = sel;
        };

        const stepTools = async () => {
            const flatOptions = [];
            for (const [catName, tools] of Object.entries(registry.categories)) {
                for (const tool of tools) {
                    if (!onlyFilter || onlyFilter.includes(tool.id)) {
                        flatOptions.push({
                            value: tool.id,
                            label: toolLabel(tool),
                            hint: `[${catName}] ${tool.description || ''}${tool.status === 'beta' ? ' (Beta/Early Access)' : ''}`
                        });
                    }
                }
            }
            const defaults = allTools.filter(t => t.default && (!onlyFilter || onlyFilter.includes(t.id))).map(t => t.id);
            const sel = await multiselectWithBack({
                message: 'Tools to install:',
                options: flatOptions,
                initialValues: ctx.tools || defaults
            });
            if (sel === BACK) return 'back';
            ctx.tools = sel;
        };

        const stepCredentials = async () => {
            if (!ctx.tools.includes('openwiki')) return;
            const existingEnv = loadExistingCredentials();
            ctx.existingEnv = existingEnv;
            ctx.apiKey = await promptCredentials(existingEnv);
        };

        const stepReview = async () => {
            const targetPaths = resolveTargetPaths(ctx.targets);
            const lines = [
                `Targets:   ${targetPaths.map(t => `${t.skillDir} + ${t.mcpDir}`).join('\n           ')}`,
                `Tools:     ${(ctx.tools || []).join(', ') || '(none)'}`,
                `OpenWiki Key: ${ctx.apiKey ? maskApiKey(ctx.apiKey) : '(none)'}`,
                `Dry Run:   ${DRY_RUN ? 'YES - nothing will be written' : 'no'}`
            ];
            note(lines.join('\n'), '📋 Review your installation');
            const action = await selectWithBack({
                message: 'Start installation?',
                options: [
                    { value: 'go', label: '🚀 Install now' },
                    { value: 'abort', label: '❌ Cancel' }
                ],
                initialValue: 'go'
            });
            if (action === BACK) return 'back';
            if (action === 'abort') return 'exit';
        };

        const steps = [stepTargets, stepTools, stepCredentials, stepReview];
        let i = 0;
        while (i < steps.length) {
            const res = await steps[i]();
            if (res === 'exit') { outro('Cancelled.'); return; }
            if (res === 'back') i = Math.max(0, i - 1);
            else i++;
        }

        selectedToolIds = ctx.tools;
        var chosenApiKey = ctx.apiKey;
        var chosenTargetIds = ctx.targets;
    }

    const targetPaths = resolveTargetPaths(isAutoYes ? ['universal'] : chosenTargetIds);
    for (const t of targetPaths) {
        if (DRY_RUN) {
            log.step(`[dry-run] mkdir -p ${t.skillDir} + ${t.mcpDir}`);
        } else {
            fs.mkdirSync(t.skillDir, { recursive: true });
            fs.mkdirSync(t.mcpDir, { recursive: true });
        }
    }

    const gitCloneTypes = ['git_clone', 'suite', 'workspace', 'config', 'core_skills', 'agent', 'api', 'tool', 'cli'];
    const s = spinner();

    for (const id of selectedToolIds) {
        const toolInfo = allTools.find(t => t.id === id);
        if (!toolInfo) continue;

        s.start(`${toolLabel(toolInfo)}...`);

        if (id === 'memb-mcp') {
            s.stop('');
            await installMembMcp(targetPaths[0].mcpDir, toolInfo);
        } else if (id === 'openwiki') {
            s.stop('');
            await installOpenWiki(targetPaths[0].skillDir, isAutoYes ? '' : chosenApiKey, toolInfo, ctx.existingEnv || loadExistingCredentials());
        } else if (id === 'token-saver') {
            s.stop('');
            await installTokenSaver(toolInfo);
        } else if (gitCloneTypes.includes(toolInfo.type)) {
            if (toolInfo.type === 'config' && id === 'bdb-edge-routing') {
                if (shCapture('gh auth status >/dev/null 2>&1; echo $?') !== '0') {
                    s.stop('⚠️ GitHub Auth missing for bdb-edge-routing - skipped. Run: gh auth login');
                    continue;
                }
            }
            s.stop('');
            await installGitClone(toolInfo);
        } else {
            s.stop('');
            for (const t of targetPaths) {
                await installGenericTool(t.mcpDir, t.skillDir, toolInfo);
            }
        }
    }

    console.log('');
    note([
        `Tools installed: ${selectedToolIds.length}`,
        `Targets:         ${targetPaths.map(t => t.id).join(', ')}`,
        DRY_RUN ? 'MODE: Dry-Run - nichts wurde verändert.' : 'MODE: Live-Installation.'
    ].join('\n'), '🎉 BDB DEV Tools installation completed');
    outro('Fertig.');
}

main().catch(e => {
    log.error(`Fatal: ${(e && e.stack) || e}`);
    process.exitCode = 1;
});
