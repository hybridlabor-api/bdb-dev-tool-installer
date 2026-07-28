import os
import subprocess

if os.path.exists("add_blender_support.py"):
    os.remove("add_blender_support.py")

# 1. Push heimdall-token-saver
os.chdir("/Users/timrennings/bdb-dev/heimdall-token-saver")
subprocess.run(["git", "add", "-A"])
subprocess.run(["git", "commit", "-m", "feat: add explicit Blender MCP support to BdbCreativeSuiteProcessor"])
subprocess.run(["git", "push", "origin", "main"])

# 2. Push bdb-dev-tool-installer
os.chdir("/Users/timrennings/bdb-dev/bdb-dev-tool-installer")
subprocess.run(["git", "add", "-A"])
subprocess.run(["git", "commit", "-m", "feat: update embedded payload with Blender MCP processor support"])
subprocess.run(["git", "push", "origin", "main"])

print("Pushed Blender updates to both repositories!")
