#!/bin/bash
echo "🔍 Starting OpenClaw Security Audit..."
echo "----------------------------------------"

echo "[1] Checking Running Node Processes..."
ps aux | grep node | grep -v grep | awk '{print $11, $12, $13, $14}' | head -n 5
echo "✅ Process check complete."
echo ""

echo "[2] Checking Open Ports (Listening Services)..."
netstat -tulpn 2>/dev/null | grep LISTEN || ss -tulpn 2>/dev/null | grep LISTEN || echo "⚠️ Could not check ports (missing netstat/ss or insufficient permissions)."
echo "✅ Port check complete."
echo ""

echo "[3] Auditing Configuration File for Exposed Secrets..."
if [ -f ~/.openclaw/openclaw.json ]; then
    echo "Found openclaw.json. Scanning..."
    # Check for raw API keys (basic regex for common key formats)
    grep -E -i "sk-[a-zA-Z0-9]{20,}|xai-[a-zA-Z0-9]{20,}|eyJhbGciOi" ~/.openclaw/openclaw.json > /dev/null
    if [ $? -eq 0 ]; then
        echo "🚨 WARNING: Potential raw API keys or JWTs found in openclaw.json!"
        echo "It is recommended to use environment variables (e.g., OPENAI_API_KEY) instead of hardcoding keys in the JSON config."
    else
        echo "✅ No obvious raw API keys found in the config file."
    fi
    
    # Check for dangerous tools settings
    grep -E -i '"ask": "off"|"security": "deny"' ~/.openclaw/openclaw.json > /dev/null
    if [ $? -eq 0 ]; then
        echo "🚨 WARNING: Exec tool security is potentially set to unsafe levels ('ask': 'off')."
    else
        echo "✅ Exec tool security settings appear safe."
    fi
else
    echo "⚠️ Configuration file (~/.openclaw/openclaw.json) not found."
fi
echo "----------------------------------------"
echo "🏁 Audit Complete."
