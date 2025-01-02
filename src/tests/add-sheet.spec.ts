import { expect, test } from "@playwright/test";

test("Add sheet", async ({ page }) => {
    await page.goto("/vocab");
    await expect(page.getByTitle("Current language")).toHaveText(
        "Learning Chinese!",
    );
    await page.getByRole("link", { name: "Add sheet" }).click();
    await expect(page.getByRole("button", { name: "Create" })).toBeDisabled();
    await page.waitForLoadState("networkidle");
    await page.getByRole("textbox").fill("Added sheet");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "Create" })).toBeEnabled();
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page).toHaveURL(/\/vocab\/\d+/);
});
