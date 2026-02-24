import { Page, expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

let page: Page;
test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
});
test.afterAll(async () => {
    await page.close();
});

test("Navigate to settings from sidebar", async () => {
    await page.goto("/");
    await page.getByText("Settings").click();
    await expect(page).toHaveURL("/settings");
});

test("Settings page shows native language", async () => {
    await page.goto("/settings");
    await expect(page.getByTitle("Native language")).toContainText(
        "Native language: English",
    );
});

test("Change native language", async () => {
    await page.goto("/settings");
    await page.getByText("Change native language").click({ delay: 500 });
    await page.getByTitle("French").click();

    await expect(page.getByTitle("Native language")).toContainText(
        "Native language: French",
    );

    // Verify persistence across reload.
    await page.reload();
    await expect(page.getByTitle("Native language")).toContainText(
        "Native language: French",
    );

    // Reset back to English for other tests.
    await page.getByText("Change native language").click({ delay: 500 });
    await page.getByTitle("English").click();
    await expect(page.getByTitle("Native language")).toContainText(
        "Native language: English",
    );
});

test("Navigate to add tongue page", async () => {
    await page.goto("/settings");
    await page.getByText("Change native language").click({ delay: 500 });
    await page.getByText("Add new language!").click();
    await expect(page).toHaveURL("/settings/add-tongue?for=native");
});

test("Duplicate tongue name shows warning", async () => {
    await page.goto("/settings/add-tongue");
    await page.getByPlaceholder("Language name").fill("English");
    await expect(page.getByText("Tongue already exists!")).toBeVisible();
});

test("Create a new tongue", async () => {
    await page.goto("/settings/add-tongue");
    await page.getByPlaceholder("Language name").fill("TestLanguage");
    await page.getByPlaceholder("Flag emoji").fill("🏴");
    await page.getByText("Create").click();
    await expect(page).toHaveURL("/settings");
});

test("Delete a tongue", async () => {
    await page.goto("/settings");
    await page.getByText("Change native language").click({ delay: 500 });

    // Verify TestLanguage exists in the popup.
    await expect(page.getByTitle("TestLanguage")).toBeVisible();

    // Click the delete button on TestLanguage.
    const tongueButton = page.getByTitle("TestLanguage");
    await tongueButton.locator("div").first().click();

    // Verify TestLanguage is removed from the popup.
    await expect(page.getByTitle("TestLanguage")).not.toBeVisible();
});

test("Toggle ignore diacritics", async () => {
    await page.goto("/settings");
    const checkbox = page.getByTitle("Diacritics").getByRole("checkbox");

    // Default is checked (ignore diacritics = true).
    await expect(checkbox).toBeChecked();

    // Uncheck it.
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();

    // Verify persistence across reload.
    await page.reload();
    const reloadedCheckbox = page
        .getByTitle("Diacritics")
        .getByRole("checkbox");
    await expect(reloadedCheckbox).not.toBeChecked();

    // Reset back to checked.
    await reloadedCheckbox.check();
    await expect(reloadedCheckbox).toBeChecked();
});

test("Cannot delete tongue in use", async () => {
    await page.goto("/settings");
    await page.getByText("Change native language").click({ delay: 500 });

    // Try to delete English (current native language).
    const tongueButton = page.getByTitle("English");
    page.on("dialog", (dialog) => dialog.accept());
    await tongueButton.locator("div").first().click();

    // English should still be visible (deletion prevented).
    await expect(page.getByTitle("English")).toBeVisible();
});
