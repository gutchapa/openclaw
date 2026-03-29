# OpenClaw Sessions

## 2026-03-29: Telegram Gateway Crash Loop & Multi-Instance Conflict Fix

### Problem Summary
Telegram bot (@gutch1234Bot) stopped receiving messages. Gateway logs showed:
- `409 Conflict: terminated by other getUpdates request` errors
- Multiple `starting provider` attempts with no successful polling
- Session lock files blocking writes
- Telegram channel hanging after initialization

### Root Causes Identified
1. **Duplicate Bot Instances**: Multiple `openclaw-gateway` processes running simultaneously
2. **Expired Telegram Token**: Bot token was stale/revoked, causing 401 Unauthorized errors
3. **Stale Session Locks**: Lock files from crashed processes blocking session writes
4. **Missing Control UI Assets**: Gateway couldn't serve control interface

### Fixes Applied

#### 1. Kill Duplicate Processes
```bash
# Find all openclaw processes
ps aux | grep openclaw

# Kill all instances
pkill -9 -f openclaw

# Verify only one instance after restart
systemctl --user restart openclaw-gateway.service
```

#### 2. Update Telegram Bot Token
Updated `~/.openclaw/openclaw.json`:
```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "8607012506:AAF0d-nyeZNTi3TuqnILQkJ53q_Zb5bgD-0"
    }
  }
}
```

**Note**: Token is also in `.env` file, but `openclaw.json` takes precedence.

#### 3. Clear Stale Lock Files
```bash
# Remove session lock files
rm -f ~/.openclaw/agents/main/sessions/*.jsonl.lock

# Remove gateway lock
rm -f /tmp/openclaw-1000/gateway.*.lock
```

#### 4. Build Control UI Assets
```bash
cd /home/dell/openclaw
pnpm ui:build
```

#### 5. Lower Context Window Minimum (For tinydolphin)
Modified `src/agents/context-window-guard.ts`:
```typescript
export const CONTEXT_WINDOW_HARD_MIN_TOKENS = 8_000;  // Was 16_000
```

This allows `ollama/tinydolphin` (8192 ctx) to be used.

#### 6. Set Up Auto-Monitoring
Created `~/.openclaw/scripts/monitor-gateway.sh` cron job to auto-restart on crash loops.

### Verification Steps
1. Check single process: `ps aux | grep openclaw | grep -v grep`
2. Check Telegram API: `curl https://api.telegram.org/bot<token>/getMe`
3. Check gateway health: `curl http://localhost:18789/__openclaw__/health`
4. Check logs: `tail -f /tmp/openclaw/openclaw-$(date +%Y-%m-%d).log`

### Key Lessons
- **Always kill all instances** before restarting (Telegram allows only one getUpdates poll per bot)
- **Check token validity** with direct API call before troubleshooting deeper
- **Lock files persist** after crashes and block new sessions
- **409 Conflict = duplicate instance**, not a network error

---

## 2026-03-28: Migration from VPS to Dell Mini PC (Host-Only)

### Summary
Migrated the "brain" and custom setup from the VPS (`openclaw-hacks`) to the new Dell Mini PC. Shifted from a Docker-based environment to a host-only setup to eliminate sandboxing overhead and simplify local AI integration with Ollama.

### Tasks Completed
1. **File Migration**: Copied `.md`, `.js`, `.ts`, `.mjs`, and `.sh` files from `../openclaw-hacks`.
2. **Infrastructure Setup**: Restored `infrastructure/` directory with `deploy_dell.sh`.
3. **Smart Router Configuration**:
   - Fixed `custom-router-plugin.ts` to use `localhost:11434` for Ollama (tinydolphin model).
   - Removed `host.docker.internal` references.
4. **Environment Path Fixes**:
   - Replaced all hardcoded `/home/node` paths with `/home/dell` in config files (`openclaw.json`, `.env`, `sessions.json`) and scripts.
   - Fixed `EACCES` permission errors caused by incorrect home directory references.
5. **Gateway Activation**:
   - Created a system-wide symlink: `/usr/local/bin/openclaw -> /home/dell/openclaw/openclaw.mjs`.
   - Verified background execution with `nohup`.
6. **Local AI**:
   - Pulled Ollama models: `tinydolphin`, `llama3.2:1b`, and `deepseek-r1:1.5b`.
7. **Git Management**:
   - Switched remote to `https://github.com/gutchapa/openclaw.git`.
   - Created and pushed to a new branch `dell-mini-pc-setup-v3` to preserve work and handle workflow permission constraints.

### Authentication
- Configured git `user.name` as "RamEsh" and `user.email` as "gutchapa@gmail.com".
