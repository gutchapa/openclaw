# Automated Dell Mini PC Provisioning (IaC)

This directory contains the Infrastructure as Code (IaC) setup for deploying OpenClaw and local AI models to a fresh Dell OptiPlex Mini PC.

## Prerequisites
1. Install **Ubuntu Server 22.04 LTS** or **24.04 LTS** (headless, no desktop environment needed) on the Dell Mini PC.
2. Connect it via Ethernet to your home router.
3. SSH into the box.

## The Deployment Script
The `deploy_dell.sh` script completely automates the installation of:
- **Core Dependencies:** Git, curl, UFW (Uncomplicated Firewall).
- **Security:** Locks down the firewall to deny incoming traffic except SSH and the secure Tailscale tunnel.
- **Networking:** Installs Tailscale to connect the Dell back to your phone, iPad, or VPS securely.
- **Containers:** Installs Docker and Docker Compose.
- **Local AI:** Installs Ollama and automatically pulls the `tinydolphin` model required for your Custom Smart Router plugin.
- **OpenClaw Environment:** Scaffolds the `~/.openclaw` directories for your workspace, plugins, and data.

## Execution
Run this single command on the fresh Dell:
```bash
wget -qO- https://raw.githubusercontent.com/gutchapa/openclaw/main/infrastructure/deploy_dell.sh | bash
```

Once the script finishes, you will be prompted to run `sudo tailscale up` to authenticate the device to your Tailnet. After that, your Dell is fully prepared to run the OpenClaw Docker container!
