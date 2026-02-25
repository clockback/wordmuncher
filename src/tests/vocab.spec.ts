import { expect, test } from "./fixtures";

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
