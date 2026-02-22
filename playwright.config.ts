import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./src/tests",
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: "html",
    use: {
        baseURL: "http://127.0.0.1:3000",
        trace: "on-first-retry",
    },
    globalSetup: "./src/tests/global-setup.ts",
    webServer: {
        command: "npm run dev",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
    },
    projects: [
        {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
        },
    ],
});
