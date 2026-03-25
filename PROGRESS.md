# OpenClaw Project Progress

## 2026-03-25: Smart Router & Home Network Audit

### 1. The Smart Router Plugin
* **Issue:** Massive 170k+ token HTML payloads (from headless browser scraping) were burning through OpenRouter API credits ($5/day) because OpenClaw was sending the entire conversation history to Mistral Large.
* **Resolution:** 
  * Wrote `custom-router-plugin.ts` using the new OpenClaw SDK (`definePluginEntry`).
  * Implemented an emergency token bloat firewall that automatically strips history for any message over 50,000 characters.
  * Configured Semantic Triage using your local Ollama server (`tinydolphin` model at `host.docker.internal:11434`). The local model evaluates if the query requires history. If it replies "YES", we drop the 170k token payload before routing to the cloud.

### 2. Home Network & Airtel Diagnostic Setup
* **Goal:** Use OpenClaw from the VPS to diagnose frequent Airtel Wi-Fi disconnects by monitoring the router's Optical Rx/Tx power levels.
* **Architecture:** Tailscale Subnet Routing bridging the VPS container to the `192.168.1.x` home network.
* **Findings:**
  * Samsung Android phone failed to hold the bridge open due to OS battery optimizations restricting IP forwarding. 
  * Port scanned the subnet and mapped the active topology:
    * `192.168.1.1` - Airtel Router (Boa Web Server). Reached successfully over the tunnel. Returned `401 Unauthorized` for `admin/admin`. (Needs physical sticker password).
    * `192.168.1.4` - HP Smart Tank Printer.
    * `192.168.1.7` - Google Cast Device.
    * `192.168.1.8` - TP-Link Wi-Fi Extender. (This is acting as a secondary NAT and hiding the Smart TV and IoT devices behind an invisible subnet).
    * `192.168.1.9` - OpenWrt Router.
    * `192.168.1.14` - Windows PC (Microsoft IIS 10). Remote administration ports (RDP/SSH/WinRM) are blocked by Windows Firewall.
  
### 3. Tomorrow's Action Items
1. Install Tailscale on the Windows PC/Laptop and turn on "Advertise Subnet" to create a permanent, non-sleeping tunnel.
2. Get the Airtel router password from the sticker to build the optical fiber health scraper.
3. Potentially remap the TP-Link extender to Access Point (AP) mode so the Smart TV and Alexa plug sit on the main `192.168.1.x` subnet.
