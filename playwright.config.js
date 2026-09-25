import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:4173/" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    // Playwright's Firefox UA override breaks the service worker's cross-origin font fetches; real Firefox is fine.
    { name: "firefox", use: { ...devices["Desktop Firefox"], userAgent: undefined } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 13"] } },
  ],
  // Zero-build static site: any file server will do.
  webServer: { command: "python3 -m http.server 4173", url: "http://localhost:4173/", reuseExistingServer: !process.env.CI, stderr: "ignore" },
});
