import { expect, test } from "@playwright/test";

import { updateResultStars } from "src/cron/update-db";

test("Star promotion", async ({ page }) => {
    await page.goto("/tests");
    const tableRow = page.locator("table tr", { hasText: "Sheet 3" });
    await expect(tableRow.locator("td", { hasText: "100%" })).toBeVisible();
    await updateResultStars();
    await page.reload();
    await expect(tableRow.locator("td", { hasText: "75%" })).toBeVisible();
});
