# BDB DEV Tool Installer Architecture

## Overview
The installer is a Node.js-based CLI application that uses `enquirer` for interactive multi-stage menus. It reads configuration from a centralized `registry.json`.

## Core Components
- `installer.js`: Main execution loop. Parses `registry.json`, prompts the user using `enquirer`, and handles tool-specific installation logic (e.g. `installMembMcp`, `installOpenWiki`, `installGitClone`).
- `installer.beta.js`: Beta installer designed to support modern OpenWiki environment setups.
- `registry.json`: JSON structure dictating tool metadata, paths, descriptions, and categorized grouping (Core Tools, BDB MCPs, Hybridlabor API Repositories).
- `tools/`: The directory containing raw payloads and source files for the tools to be installed.
    - `tools/openwiki/`: Contains scripts for daemon management (`install_daemon.sh/ps1`), ecosystem wiki synchronization (`sync_ecosystem_wiki.py`), and API key verification (`verify_api_key.py`).
    - `tools/memb-mcp/`: Hybrid engine integration featuring SQLite WAL mode and FTS5 BM25 search.
    - `tools/token-saver/`: BDB MCP token-saver processors.
- `.agents/`: Directory containing agent-based configurations and logic.

## Updating Mechanism
The installer functions seamlessly as an updater. Because it relies heavily on `fs.copyFileSync`, `copyDirRecursiveSync`, and `git clone`, running the installer over an existing installation forcefully pulls the latest files from the payloads or GitHub directly over the old ones.