# Key Design Decisions

## Installation & Deployment
### Beta Installation Path
- **Decision**: Introduced `installer.beta.js` as a separate entry point for modern OpenWiki environment setups.
- **Trade-off**: This allows testing of new environment configurations and modern setup logic without risking the stability of the primary `installer.js` used for standard tool deployments.

### Repository Hygiene: Untrack node_modules
- **Decision**: Added `.gitignore` and `.openwikiignore` to untrack `node_modules` from the repository.
- **Trade-off**: Eliminates tracking of large, auto-generated dependency files. Developers must run `npm install` after cloning. Enables cleaner git history and smaller repository footprint.
- **Constraint**: New contributors must ensure `node_modules` is installed via `npm install` before running the installer.

## Security & Tooling
### Fleet Secret Detection
- **Decision**: Integrated fleet secret detection capabilities directly into the OpenWiki toolset.
- **Constraint**: Ensures that security scanning is a first-class citizen in the ecosystem synchronization workflow.
*Auto-updated via git commit 2bb7d3e*