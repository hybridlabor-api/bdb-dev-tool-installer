# Release Notes

## [v1.1.0] - 2026-07-28
### Added
- **Multi-stage Menus**: Replaced raw `readline` parsing with `enquirer` for interactive CLI prompts.
- **Hybridlabor Git Clone Logic**: Added ability to clone external Hybridlabor API repositories directly via the installer.
- **Updater Concept**: Redefined the installer to serve as a persistent "General Updater" for BDB DEV Tools.

### Fixed
- Addressed a major bug causing `detectTargetDirectories` to be undefined during the menu loop.
- Optimized target path generation for cross-platform robustness.
