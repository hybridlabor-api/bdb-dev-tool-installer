# BDB DEV Tool Installer - Quickstart

This installer provides a centralized, interactive way to deploy, manage, and update all BDB DEV tools across macOS, Linux, and Windows.

## Basic Usage
```bash
node installer.js
```
Follow the interactive prompts to install Core Tools, MCPs, and clone Hybridlabor API Repositories.

## Automated / Unattended Installation
```bash
node installer.js -y
```

## Updating Existing Tools
The installer acts as a general updater. Simply re-run `node installer.js` and select the tools you want to update. The script uses `copyDirRecursiveSync` and `git clone` to overwrite or fetch the latest updates into the target directories (`~/.gemini/config/...` and `~/`).

## Workspace Orientation
Upon first clone, the repository includes `.gitignore` and `.openwikiignore` files that untrack `node_modules` and documentation build artifacts. These files ensure a clean git history and are automatically applied when the project is set up. The `.agents/` directory contains agent-based configurations that are also applied on setup.
*Auto-updated via git commit 87e3800*