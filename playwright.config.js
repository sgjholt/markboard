const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://localhost:3123",
    browserName: "chromium",
  },
  webServer: {
    command: "npx serve . -l 3123 --no-clipboard",
    port: 3123,
    reuseExistingServer: !process.env.CI,
  },
});
