# BDB DEV Tool Installer Architecture

## Overview
The installer is a Node.js-based CLI application that uses `enquirer` for interactive multi-stage menus. It reads configuration from a centralized `registry.json`.

## Core Components
- `installer.js`: Main execution loop. Parses `registry.json`, prompts the user using `enquirer`, and handles tool-specific installation logic (e.g. `installMembMcp`, `installOpenWiki`, `installGitClone`).
- `registry.json`: JSON structure dictating tool metadata, paths, descriptions, and categorized grouping (Core Tools, BDB MCPs, Hybridlabor API Repositories).
- `tools/`: The directory containing raw payloads and source files for the tools to be installed.

## Updating Mechanism
The installer functions seamlessly as an updater. Because it relies heavily on `fs.copyFileSync`, `copyDirRecursiveSync`, and `git clone`, running the installer over an existing installation forcefully pulls the latest files from the payloads or GitHub directly over the old ones.
