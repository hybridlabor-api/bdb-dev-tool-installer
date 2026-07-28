# 🔌 BDB Model Context Protocol (MCP) Architecture & Directory

The **Model Context Protocol (MCP)** is an open standard that allows AI coding assistants and LLM agents (such as Google Antigravity, Claude Code, and Gemini CLI) to securely connect to external data sources, desktop software APIs, and specialized local automation environments.

---

## 🏗️ Architectural Overview

In the BDB DEV ecosystem, MCP servers bridge AI reasoning with hardware controllers, 3D engines, visual synthesis software, and persistent memory engines.

```
┌─────────────────────────────────────────────────────────────┐
│                 AI Agent / Coding Assistant                 │
│         (Google Antigravity / Claude Code / Gemini)         │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON-RPC (stdio / WebSockets)
┌──────────────────────────────▼──────────────────────────────┐
│                    MCP Integration Layer                    │
│             (~/.gemini/config/mcps/ & mcp_config.json)       │
└──────┬──────────────┬──────────────┬──────────────┬─────────┘
       │              │              │              │
┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐
│  3D & CAD   ││ Media / VJ  ││ Lighting /  ││  System &  │
│ Automation  ││ Synthesis   ││ DMX Control ││   Memory   │
│(Rhino/Unreal││(TouchDesigner│(grandMA3 /  ││ (memB /    │
│  /Blender)  ││ /Resolume)  │ Resolume)   ││ OS Control)│
└─────────────┘└─────────────┘└─────────────┘└────────────┘
```

### Key Components:
1. **Deployment Location:** MCP servers deployed by the BDB DEV Tool Installer reside in `~/.gemini/config/mcps/` (or `~/.config/` depending on the platform).
2. **Registration:** Server definitions are registered in `~/.gemini/antigravity-cli/mcp_config.json`.
3. **Transport Mechanism:** 
   - **stdio:** Local Python/Node.js scripts executed directly by the client process.
   - **HTTP / WebSockets / OSC:** Used for real-time control software like TouchDesigner, grandMA3, and Resolume Arena.
4. **Environment Isolation:** Complex Python-based MCPs (like `memB`) build isolated virtual environments (`.venv`) during deployment to avoid dependency collisions.

---

## 📋 Available BDB MCP Servers

Below is the complete list of specialized MCP servers managed by the **BDB DEV Tool Installer**:

### 🧠 System & Memory
* **`memb-mcp` (memB Hybrid Long-Term Memory Engine):** Provides persistent recall, vector storage (ChromaDB), and project preference tracking across sessions.
* **`computer-use-mcp` & `windows-computer-use-mcp`:** OS-level UI automation, screen inspection, click/type actions, and window control.

### 🎨 3D, CAD & Real-Time Engines
* **`unreal_mcp`:** Unreal Engine 5 integration for actor spawning, level management, blueprint control, and environment building.
* **`RhinoMCP` & `golem-rhino-mcp`:** Rhino 7/8 3D modeling, Grasshopper workflow integration, and parametric geometry manipulation.
* **`blender-mcp` & `blender-mcp-server`:** Blender 3D scene creation, Python API execution, rendering control, and material generation.
* **`vectorworks-mcp`:** Vectorworks CAD automation and BIM dataset querying.

### 🎥 Video Editing & VFX
* **`davinci-mcp-professional`, `davinci-resolve-mcp`, `davinci-resolve-mcp-free`:** DaVinci Resolve timeline editing, color grading, Fusion composition script automation, and sequence rendering.
* **`after-effects-mcp` & `ae-mcp`:** Adobe After Effects composition rendering, expression injection, keyframe animation, and asset management.
* **`adobe_mcp.py` & `adobe_uxp_mcp`:** Adobe Creative Cloud UXP integration for Photoshop and Premiere Pro.

### 🎭 Live Visuals, Lighting & VJ Software
* **`touchdesigner-mcp` / `tdmcp`:** Real-time visual synthesis in TouchDesigner, CHOP/TOP network manipulation, GLSL shader creation, and operator wiring.
* **`grandma3_mcp.py`:** MA Lighting grandMA3 console control via WebSockets/OSC for sequence triggering, cue creation, and fixture mapping.
* **`resolume_mcp.py`:** Resolume Arena/Avenue VJ software control, layer mixing, effect parameter control, and clip launching.

---

## 🚀 Quick Setup & Usage

To install or update any of these MCPs:
```bash
node installer.js
```
1. Select **BDB MCPs** when prompted.
2. Choose the specific MCP servers required for your workflow.
3. The installer will copy binaries/scripts to `~/.gemini/config/mcps/` and register them automatically.
