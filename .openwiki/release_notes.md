# Release Notes

## [v1.3.1]
### Changed
- **Git Configuration**: Added `.gitignore` and `.openwikiignore` to untrack `node_modules` and documentation build artifacts.
- **Repository Cleanup**: node_modules files removed from tracked history.

## [v1.3.0]
### Added
- **OpenWiki Sync**: Support for synchronizing the ecosystem wiki.
- **Fleet Secret Detection**: New security features for fleet-wide secret detection.
- **Modern OpenWiki Setup**: Support for modern environment configurations via `installer.beta.js`.

## [v1.2.1] - 2026-08-22
### Added
- **memB v2.3.0 Engine Sync**: Integrated SQLite WAL mode, FTS5 BM25 hybrid search, and SHA-256 deduplication into `tools/memb-mcp`.

## [v1.2.0] - 2026-08-18
### Added
- **NPM Package Support**: Added direct NPX/NPM package installation for standalone power-ups (Heimdall, Synapse, OS Remote, memB).
- **Interactive Multi-Select Hub**: Unified standalone power-up menu.

## [v1.1.0] - 2026-07-28
### Added
- **Multi-stage Menus**: Replaced raw `readline` parsing with `enquirer` for interactive CLI prompts.
- **Hybridlabor Git Clone Logic**: Added ability to clone external Hybridlabor API repositories directly via the installer.
- **Updater Concept**: Redefined the installer to serve as a persistent "General Updater" for BDB DEV Tools.

### Fixed
- Addressed a major bug causing `detectTargetDirectories` to be undefined during the menu loop.
- Optimized target path generation for cross-platform robustness.

