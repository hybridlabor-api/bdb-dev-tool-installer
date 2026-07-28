import os
import glob
import subprocess

def replace_in_files(directory, replacements):
    for root, _, files in os.walk(directory):
        if '.git' in root or '__pycache__' in root:
            continue
        for file in files:
            filepath = os.path.join(root, file)
            # Skip binary files
            if filepath.endswith(('.jpg', '.png', '.pyc')):
                continue
                
            try:
                with open(filepath, 'r') as f:
                    content = f.read()
                    
                original = content
                for old, new in replacements.items():
                    content = content.replace(old, new)
                    
                if original != content:
                    with open(filepath, 'w') as f:
                        f.write(content)
                    print(f"Updated content in {filepath}")
            except UnicodeDecodeError:
                pass

# 1. Update the installer embedded payload
installer_payload = "tools/token-saver"
if os.path.exists(installer_payload):
    # Rename bin files
    if os.path.exists(f"{installer_payload}/bin/token-saver"):
        os.rename(f"{installer_payload}/bin/token-saver", f"{installer_payload}/bin/heimdall")
    if os.path.exists(f"{installer_payload}/bin/token-saver.cmd"):
        os.rename(f"{installer_payload}/bin/token-saver.cmd", f"{installer_payload}/bin/heimdall.cmd")

    replace_in_files(installer_payload, {
        "token-saver command": "heimdall command",
        "token-saver version": "heimdall version",
        "token-saver stats": "heimdall stats",
        "token-saver benchmark": "heimdall benchmark",
        "token-saver update": "heimdall update",
        "bin/token-saver": "bin/heimdall",
        "bin/heimdall.cmd": "bin/heimdall.cmd", # just in case
        "prog='token-saver'": "prog='heimdall'",
        "prog=\"token-saver\"": "prog=\"heimdall\"",
        "[token-saver]": "[heimdall]",
        "~/.local/bin/token-saver": "~/.local/bin/heimdall"
    })

# 2. Clone and update the standalone heimdall-token-saver repo
repo_dir = "/Users/timrennings/bdb-dev/heimdall-token-saver"
if not os.path.exists(repo_dir):
    subprocess.run(["git", "clone", "https://github.com/hybridlabor-api/heimdall-token-saver.git", repo_dir], check=True)

if os.path.exists(repo_dir):
    # Rename bin files in standalone repo
    if os.path.exists(f"{repo_dir}/bin/token-saver"):
        os.rename(f"{repo_dir}/bin/token-saver", f"{repo_dir}/bin/heimdall")
    if os.path.exists(f"{repo_dir}/bin/token-saver.cmd"):
        os.rename(f"{repo_dir}/bin/token-saver.cmd", f"{repo_dir}/bin/heimdall.cmd")

    # Apply ppgranger replacements that were missing here
    replace_in_files(repo_dir, {
        "ppgranger/token-saver": "hybridlabor-api/heimdall-token-saver",
        "ppgranger": "hybridlabor-api",
        "token-saver command": "heimdall command",
        "token-saver version": "heimdall version",
        "token-saver stats": "heimdall stats",
        "token-saver benchmark": "heimdall benchmark",
        "token-saver update": "heimdall update",
        "bin/token-saver": "bin/heimdall",
        "prog='token-saver'": "prog='heimdall'",
        "prog=\"token-saver\"": "prog=\"heimdall\"",
        "[token-saver]": "[heimdall]",
        "~/.local/bin/token-saver": "~/.local/bin/heimdall"
    })
    
    # Push changes to standalone repo
    os.chdir(repo_dir)
    subprocess.run(["git", "add", "-A"])
    subprocess.run(["git", "commit", "-m", "fix: replace ppgranger with hybridlabor-api and rename token-saver command to heimdall"])
    subprocess.run(["git", "push", "origin", "main"])
    os.chdir("/Users/timrennings/bdb-dev/bdb-dev-tool-installer")

# 3. Commit changes in installer repo
subprocess.run(["git", "add", "-A"])
subprocess.run(["git", "commit", "-m", "fix: rename token-saver command to heimdall in payload"])
subprocess.run(["git", "push", "origin", "main"])
print("All done!")
