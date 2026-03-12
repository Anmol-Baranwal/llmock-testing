import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  webServer: [
    {
      command:
        "bash -c 'cd agent && uv run uvicorn main:app --host 0.0.0.0 --port 8123'",
      url: "http://localhost:8123/health",
      reuseExistingServer: true,
      timeout: 100000,
    },
    {
      command: "npm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: true,
      timeout: 100000,
    },
  ],
  use: { baseURL: "http://localhost:3000" },
});
