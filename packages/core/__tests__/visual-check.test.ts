// @ts-nocheck
import { test } from '@playwright/test';
import path from 'node:path';

import manifest from '../../../storybook-static/index.json' with { type: 'json' };

const screenshotDir = './__tests__/screenshots/';

const targetComponent =
    process.env.COMPONENT ||
    process.argv.find((arg) => arg.startsWith('--component='))?.split('=')[1];

const filterStories = (stories) => {
    let filtered = stories.filter((story) => story.name === 'Test Bed');

    if (targetComponent) {
        filtered = filtered.filter((story) =>
            story.title.toLowerCase().includes(targetComponent.toLowerCase()),
        );
    }

    return filtered;
};

function getStoryUrl(storybookUrl: string, id: string): string {
    const params = new URLSearchParams({ id, viewMode: 'story' });

    return `${storybookUrl}/iframe.html?${params.toString()}`;
}

async function navigate(page, storybookUrl, id) {
    try {
        const url = getStoryUrl(storybookUrl, id);

        await page.goto(url);
        await page.waitForFunction(() => document.fonts.ready);
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('#storybook-root');
    } catch (error) {
        console.error(`Failed to navigate to story: ${id}`, error);
    }
}

const visualStories = filterStories(Object.values(manifest.entries));
const BASE_URL = 'http://localhost:9999';

visualStories.forEach((story) => {
    test(story.id, async ({ page }, meta) => {
        await navigate(page, BASE_URL, meta.title);

        const screenshotName = meta.snapshotPath().split('/').pop();
        const screenshotPath = path.resolve(screenshotDir, `${screenshotName}.png`);

        await page.screenshot({ path: screenshotPath, type: 'png' });
    });
});
