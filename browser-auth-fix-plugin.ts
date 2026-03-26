import { definePlugin } from "@openclaw/plugin-sdk";

export default definePlugin({
  id: "browser-auth-fix-plugin",
  name: "Browser Env Variable Auth Fix",
  description: "Fixes the native browser tool sending literal 'env:VAR' strings instead of the actual environment variable token.",

  async setup(app) {
    console.log("[browser-auth-fix-plugin] Booting up interceptor...");

    // Intercept outbound tool calls BEFORE they are sent to the Gateway/Daemon
    app.hooks.tap("beforeToolExecute", async (context) => {
      // We only care about the browser tool
      if (context.tool.name === "browser") {
        
        // If the tool's connection config uses an "env:" string
        if (context.config && context.config.gatewayToken === "env:OPENCLAW_AUTH_TOKEN") {
          
          // Look up the actual environment variable
          const actualToken = process.env.OPENCLAW_AUTH_TOKEN;
          
          if (actualToken) {
            console.log("[browser-auth-fix-plugin] Intercepted browser call. Swapping 'env:OPENCLAW_AUTH_TOKEN' with actual secret token.");
            context.config.gatewayToken = actualToken;
          } else {
            console.warn("[browser-auth-fix-plugin] Attempted to swap token, but process.env.OPENCLAW_AUTH_TOKEN is undefined in this context.");
          }
        }
      }
    });
  }
});
