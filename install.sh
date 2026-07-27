#!/usr/bin/env bash

set -e

echo "========================================================="
echo " 🚀 BDB DEV Tool Installer (macOS & Linux)"
echo "========================================================="

if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node.js is required to run the installer. Please install Node.js."
    exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
    echo "Error: Python 3.10+ is required for BDB tools. Please install Python 3."
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/installer.js" "$@"
