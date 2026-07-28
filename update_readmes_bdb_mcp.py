import os
import subprocess

doc_text = """
### 🔌 Specialized BDB MCP Processors (70–95% Token Savings)
Heimdall includes 6 dedicated, zero-latency processors specifically tailored for BDB creative technology and memory MCP servers:

- **BdbTouchdesignerProcessor (`bdb_td_*`, `mcp_td_*`, `touchdesigner_*`, `tdmcp_*`):** Compresses node graph dumps, cooking logs, and DAT scripts. Preserves cook errors, failing scripts, and parameter overrides while stripping unchanged defaults and ticker frames.
- **BdbUnrealProcessor (`bdb_unreal_*`, `mcp_unreal_*`, `unreal_*`):** Compresses Unreal Engine 5 log dumps, PCG graph outputs, and actor transforms. Preserves `LogUnrealEngine` errors, PCG warnings, and Blueprint failures while filtering asset registry spam.
- **BdbAfterEffectsProcessor (`bdb_after_effects_*`, `ae-mcp_*`, `mcp_aftereffects_*`):** Compresses ExtendScript errors and layer state arrays. Preserves line numbers, layer indexes, and keyframe deltas while filtering frame-by-frame progress updates.
- **BdbDavinciProcessor (`bdb_davinci_*`, `resolve_mcp_*`, `davinci_*`):** Compresses timeline cut dumps and render job states. Preserves offline media paths, render failures, and cut markers while removing empty metadata keys.
- **BdbCreativeSuiteProcessor (`bdb_resolume_*`, `bdb_rhino_*`, `adobe_uxp_*`, `vectorworks_*`):** Compresses Resolume clip states, Rhino 3D geometry errors, Photoshop layers, and Vectorworks CAD queries while stripping zeroed matrix transforms and OpenAPI schemas.
- **BdbMembProcessor (`memb_mcp_*`, `memb-skill_*`, `memb_*`):** Compresses memB vector memory responses. Preserves high-relevance memory text, categories, and memory IDs while stripping 30MB ONNX float embedding arrays (`[0.123, -0.456, ...]`).
"""

# 1. Update heimdall-token-saver README.md
heimdall_readme = "/Users/timrennings/bdb-dev/heimdall-token-saver/README.md"
if os.path.exists(heimdall_readme):
    with open(heimdall_readme, "r") as f:
        content = f.read()
    if "Specialized BDB MCP Processors" not in content:
        content = content.replace("## Processors", "## Processors\n" + doc_text)
        with open(heimdall_readme, "w") as f:
            f.write(content)

# 2. Update bdb-dev-tool-installer README.md
installer_readme = "/Users/timrennings/bdb-dev/bdb-dev-tool-installer/README.md"
if os.path.exists(installer_readme):
    with open(installer_readme, "r") as f:
        content = f.read()
    if "Specialized BDB MCP Processors" not in content:
        content = content.replace("#### Key Features & Technical Specifications:", "#### Key Features & Technical Specifications:\n- **6 Dedicated BDB MCP Processors:** Tailored compactors for TouchDesigner, Unreal Engine, After Effects, DaVinci Resolve, Resolume, Rhino, Adobe UXP, and memB vector memory.")
        with open(installer_readme, "w") as f:
            f.write(content)

# Remove temporary python scripts before commit
for tmp in ["create_bdb_processors.py", "fix_tests_and_priorities.py", "update_test_engine.py", "create_bdb_unit_tests.py", "rename_bdb_pkg.py", "fix_test_imports.py", "fix_final_bugs.py", "fix_test_installers_final.py"]:
    f = os.path.join("/Users/timrennings/bdb-dev/bdb-dev-tool-installer", tmp)
    if os.path.exists(f):
        os.remove(f)

# 3. Commit and push heimdall-token-saver
os.chdir("/Users/timrennings/bdb-dev/heimdall-token-saver")
subprocess.run(["git", "add", "-A"])
subprocess.run(["git", "commit", "-m", "feat: add 6 specialized BDB MCP processors with unit tests and docs"])
subprocess.run(["git", "push", "origin", "main"])

# 4. Commit and push bdb-dev-tool-installer
os.chdir("/Users/timrennings/bdb-dev/bdb-dev-tool-installer")
subprocess.run(["git", "add", "-A"])
subprocess.run(["git", "commit", "-m", "feat: integrate BDB MCP processors in Heimdall Token Saver payload"])
subprocess.run(["git", "push", "origin", "main"])

print("All changes committed and pushed to GitHub successfully!")
