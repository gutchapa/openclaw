#!/bin/bash
set -e

echo "Starting Dell Mini PC Automated Provisioning..."
echo "This script assumes a fresh Ubuntu Server 22.04/24.04 install."

# 1. Update System & Install Core Dependencies
echo "Updating packages..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git jq ufw htop tmux software-properties-common apt-transport-https ca-certificates

# 2. Secure the Firewall (UFW)
echo "Securing firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
# Tailscale uses an encrypted overlay, but if we need direct local access to ports:
sudo ufw allow in on tailscale0
# Optional: Allow local subnet access (192.168.1.0/24) for OpenClaw web UI if needed
sudo ufw allow from 192.168.1.0/24
echo "y" | sudo ufw enable

# 3. Install Docker & Docker Compose
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
else
    echo "Docker already installed."
fi

# 4. Install Tailscale
echo "Installing Tailscale..."
if ! command -v tailscale &> /dev/null; then
    curl -fsSL https://tailscale.com/install.sh | sh
    echo "Tailscale installed. Please run 'sudo tailscale up' manually after this script finishes."
else
    echo "Tailscale already installed."
fi

# 5. Setup OpenClaw Directories
echo "Setting up OpenClaw directories..."
mkdir -p ~/.openclaw/workspace
mkdir -p ~/.openclaw/plugins
mkdir -p ~/.openclaw/data

# 6. Install Local AI (Ollama)
echo "Installing Ollama for local inference..."
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "Ollama already installed."
fi

# 7. Pull the Smart Router Model (tinydolphin or llama3.2:1b)
echo "Pulling local LLM (tinydolphin) for Smart Router..."
ollama pull tinydolphin

echo "Provisioning complete! Please log out and back in for Docker permissions to apply."
echo "Next Steps:"
echo "1. Run 'sudo tailscale up' to connect to your network."
echo "2. Deploy OpenClaw via Docker."
