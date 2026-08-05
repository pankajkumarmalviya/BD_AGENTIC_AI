#!/usr/bin/env bash
# Bridge CLI Skill Installer for macOS/Linux/WSL/Git Bash

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Bridge CLI Skill Installer${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18 or higher: https://nodejs.org/"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js version 18 or higher is required${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${YELLOW}Detected Node.js $(node -v)${NC}"
echo ""

# Determine if running from local clone or remote
if [ -f "$(dirname "$0")/cli/install.js" ]; then
    echo -e "${YELLOW}Running from local clone${NC}"
    node "$(dirname "$0")/cli/install.js" "$@"
else
    echo -e "${YELLOW}Downloading and running installer...${NC}"
    npx -y github:YOUR-USERNAME/bridge-cli-skill "$@"
fi
