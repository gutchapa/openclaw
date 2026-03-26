# OpenClaw Infrastructure

This repository contains infrastructure scripts and configurations for deploying OpenClaw on a Dell Mini PC.

## 🖥️ Dell Mini PC Provisioning

### Script: `infrastructure/deploy_dell.sh`

Automated provisioning script for setting up a fresh Ubuntu Server (22.04/24.04) on a Dell Mini PC with OpenClaw and all required dependencies.

### What It Does

1. **System Updates** - Updates packages and installs core dependencies (curl, git, ufw, tmux, etc.)
2. **Firewall Setup** - Configures UFW with secure defaults:
   - Denies incoming traffic by default
   - Allows SSH, Tailscale overlay, and local subnet (192.168.1.0/24)
3. **Docker Installation** - Installs Docker & Docker Compose
4. **Tailscale VPN** - Installs Tailscale for secure remote access
5. **OpenClaw Directories** - Creates `~/.openclaw/{workspace,plugins,data}`
6. **Local AI (Ollama)** - Installs Ollama for local inference
7. **Smart Router Model** - Pulls `tinydolphin` model for the Smart Router plugin

### Usage

```bash
# On a fresh Ubuntu Server install, run:
curl -fsSL https://raw.githubusercontent.com/gutchapa/openclaw/main/infrastructure/deploy_dell.sh | bash
```

Or manually:
```bash
git clone https://github.com/gutchapa/openclaw.git
cd openclaw
./infrastructure/deploy_dell.sh
```

## 📋 Commits Reference

| Commit | Description | File(s) |
|--------|-------------|---------|
| `a62cef0aee` | **Infrastructure as Code** - Dell Mini PC provisioning script | `infrastructure/deploy_dell.sh` |
| `bbd29e5e84` | Infrastructure scripts and utility JS files | Various |
| `8898964330` | Utility scripts, documentation, and browser-auth-fix-plugin | Various |
| `9f3f64e59c` | Dependencies update and custom-router-plugin | Various |
| `5b9d123f86` | Smart Router plugin with Ollama integration | Various |

### To Pull a Specific Commit

```bash
# Pull the specific commit with deploy_dell.sh
git fetch origin a62cef0aee
git checkout a62cef0aee -- infrastructure/deploy_dell.sh

# Or pull the full branch with all changes
git pull origin main
```

## 🔗 Links

- **Deploy Script:** https://github.com/gutchapa/openclaw/blob/main/infrastructure/deploy_dell.sh
- **Repository:** https://github.com/gutchapa/openclaw
