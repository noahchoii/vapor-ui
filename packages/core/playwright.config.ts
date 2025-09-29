import { createArgosReporterOptions } from '@argos-ci/playwright/reporter';
import { defineConfig, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:9999';

export default defineConfig({
    snapshotPathTemplate: './__tests__/screenshots/{arg}-{projectName}-{platform}-{ext}',
    testMatch: '__tests__/visual-check.test.ts',
    outputDir: `./__tests__/results/`,

    reporter: [
        ['html', { outputFolder: './__tests__/report' }],
        ['json', { outputFile: './__tests__/report/index.json' }],
        [
            '@argos-ci/playwright/reporter',
            createArgosReporterOptions({
                uploadToArgos: !!process.env.CI,
                token: process.env.ARGOS_TOKEN,
            }),
        ],
    ],
    use: { baseURL: BASE_URL, trace: 'on' },
    projects: [
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'Microsoft Edge', use: { ...devices['Desktop Edge'] } },
    ],

    workers: process.env.CI ? 1 : undefined,

    fullyParallel: true,

    webServer: {
        command: 'cd ../../ && npx http-server -p 9999 ./storybook-static',
        url: BASE_URL,
        reuseExistingServer: false,
    },
});
