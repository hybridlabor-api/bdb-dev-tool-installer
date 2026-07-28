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
