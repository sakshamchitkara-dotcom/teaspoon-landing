import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:4173/" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // Zero-build static site: any file server will do.
  webServer: { command: "python3 -m http.server 4173", url: "http://localhost:4173/", reuseExistingServer: !process.env.CI, stderr: "ignore" },
});
