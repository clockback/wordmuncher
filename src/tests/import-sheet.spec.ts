import { ExportSheetJSON } from "../app/vocab/[sheet]/export-sheet/api";
import { expect, test } from "./fixtures";

test("Import sheet (round-trip)", async ({ page }) => {
    // Export Sheet 1.
    await page.goto("/vocab");
    await expect(page.getByTitle("Current language")).toHaveText(
        "Learning Chinese!",
    );
    await page.getByTitle("Edit Sheet 1").click();
    await expect(page).toHaveURL("/vocab/1");
    await expect(page.getByRole("heading")).toHaveText("Sheet 1");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export" }).click();
    const download = await downloadPromise;

    const content = await download.path();
    const fs = await import("fs/promises");
    const json: ExportSheetJSON = JSON.parse(
        await fs.readFile(content, "utf-8"),
    );

    // Modify the sheet name to avoid conflict.
    json.sheetName = "Imported Sheet";

    // Navigate back and import.
    await page.goto("/vocab");
    await expect(page.getByTitle("Current language")).toHaveText(
        "Learning Chinese!",
    );

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
        name: "Imported Sheet.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(json)),
    });

    // Should navigate to the imported sheet.
    await page.waitForURL(/\/vocab\/\d+/);
    await expect(page.getByRole("heading")).toHaveText("Imported Sheet");

    // Verify questions are present.
    for (const question of json.questions) {
        await expect(
            page.getByRole("cell", {
                name: question.questionText,
                exact: true,
            }),
        ).toBeVisible();
    }
});

test("Import sheet with duplicate name", async ({ page }) => {
    await page.goto("/vocab");
    await expect(page.getByTitle("Current language")).toHaveText(
        "Learning Chinese!",
    );

    const json: ExportSheetJSON = {
        sheetName: "Sheet 1",
        nativeTongue: "English",
        studyingTongue: "Chinese",
        inflectionTypes: [],
        questions: [
            {
                questionText: "Test",
                mainAnswer: "Test answer",
                otherAnswers: [],
            },
        ],
    };

    page.on("dialog", async (dialog) => {
        expect(dialog.message()).toContain("Sheet 1");
        await dialog.accept();
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
        name: "Sheet 1.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(json)),
    });

    // Should remain on the vocab page (no navigation).
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL("/vocab");
});
