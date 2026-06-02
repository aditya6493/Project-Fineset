# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Protected dashboard routes >> admin overview redirects unauthenticated users to login
- Location: e2e/smoke.spec.ts:31:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at /var/folders/7j/1jcr9g0n3jn6zk09b32pbr780000gn/T/cursor-sandbox-cache/3531fc83ef101552afa9a1fe1bcc06e3/playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     npx playwright install                                 ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```