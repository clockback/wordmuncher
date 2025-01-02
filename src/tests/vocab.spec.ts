import { Page, expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

let page: Page;
test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
});
test.afterAll(async () => {
    await page.close();
});

test("Change language", async ({ page }) => {
    await page.goto("/vocab");
    await expect(page.getByTitle("Current language")).toHaveText(
        "Learning Chinese!",
    );
    await page.getByText("Change language").click({ delay: 500 });
    await page.getByTitle("German").click();

    await expect(page.getByTitle("Current language")).toHaveText(
        "Learning German!",
    );
    await page.reload();
    await expect(page.getByTitle("Current language")).toHaveText(
        "Learning German!",
    );
    await page.getByText("Change language").click({ delay: 500 });
    await page.getByTitle("Chinese").click();
    await expect(page.getByTitle("Current language")).toHaveText(
        "Learning Chinese!",
    );
});

test("Select sheet", async ({ page }) => {
    await page.goto("/vocab");
    await expect(page.getByTitle("Current language")).toHaveText(
        "Learning Chinese!",
    );
    await expect(page.getByTitle("Current language")).toHaveText(
        "Learning Chinese!",
    );
    await page.getByTitle("Edit Sheet 1").click();
    await expect(page).toHaveURL("/vocab/1");
});
