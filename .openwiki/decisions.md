# Key Design Decisions

## Installation & Deployment
### Beta Installation Path
- **Decision**: Introduced `installer.beta.js` as a separate entry point for modern OpenWiki environment setups.
- **Trade-off**: This allows testing of new environment configurations and modern setup logic without risking the stability of the primary `installer.js` used for standard tool deployments.

## Security & Tooling
### Fleet Secret Detection
- **Decision**: Integrated fleet secret detection capabilities directly into the OpenWiki toolset.
- **Constraint**: Ensures that security scanning is a first-class citizen in the ecosystem synchronization workflow.