#!/bin/bash
echo "Testing Latency to Telegram API..."
curl -o /dev/null -s -w "Connect: %{time_connect}s | TTFB: %{time_starttransfer}s | Total: %{time_total}s\n" https://api.telegram.org

echo -e "\nTesting Latency to OpenRouter API..."
curl -o /dev/null -s -w "Connect: %{time_connect}s | TTFB: %{time_starttransfer}s | Total: %{time_total}s\n" https://openrouter.ai/api/v1/models

echo -e "\nChecking for local model servers (Smart Router)..."
ss -tlnp | grep -E '11434|8000|8080|1234'
