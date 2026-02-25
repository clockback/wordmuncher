import { Page } from "@playwright/test";

import { ExportSheetJSON } from "../app/vocab/[sheet]/export-sheet/api";
import { expect, test } from "./fixtures";

async function addQuestion(
    page: Page,
    questionText: string,
    answerText: string,
) {
    await page.getByTitle("Add new question").click();
    await page.getByRole("textbox", { name: "Question" }).fill(questionText);
    await page.getByRole("textbox", { name: "Main answer" }).fill(answerText);
    await page.getByRole("button", { name: "Save question" }).click();
    await page.waitForLoadState("networkidle");
}

test("Export sheet", async ({ page }) => {
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

    expect(download.suggestedFilename()).toBe("Sheet 1.json");

    const content = await download.path();
    const fs = await import("fs/promises");
    const json: ExportSheetJSON = JSON.parse(
        await fs.readFile(content, "utf-8"),
    );

    expect(json.sheetName).toBe("Sheet 1");
    expect(json.nativeTongue).toBe("English");
    expect(json.studyingTongue).toBe("Chinese");
    expect(json.questions.length).toBeGreaterThan(0);
});

test("Delete sheet", async ({ page }) => {
    await page.goto("/vocab");
    await expect(page.getByTitle("Current language")).toHaveText(
        "Learning Chinese!",
    );
    await page.getByTitle("Edit Sheet 2").click();
    await expect(page).toHaveURL("/vocab/2");
    await expect(page.getByRole("heading")).toHaveText("Sheet 2");
    await page.getByRole("button", { name: "Delete" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/vocab");
    await expect(page.getByTitle("Edit Sheet 2")).not.toBeVisible();
});

test("Add question", async ({ page }) => {
    await page.goto("/vocab");
    await expect(page.getByTitle("Current language")).toHaveText(
        "Learning Chinese!",
    );
    await page.getByTitle("Edit Sheet 1").click();
    await expect(page).toHaveURL("/vocab/1");
    await expect(page.getByRole("heading")).toHaveText("Sheet 1");
    await page.getByTitle("Add new question").click();
    await page.getByRole("textbox", { name: "Question" }).fill("New question");
    await page.getByRole("textbox", { name: "Main answer" }).fill("New answer");
    const addNewAnswer = page.getByText("Add new answer");
    await addNewAnswer.click();
    const otherAnswer = page.getByRole("textbox", { name: "Other answer" });
    await otherAnswer.fill("Another answer 1");
    await otherAnswer.press("Enter");
    await addNewAnswer.click();
    await otherAnswer.fill("Another answer 2");
    await otherAnswer.press("Enter");
    await page.getByRole("button", { name: "Save question" }).click();
    await page.waitForLoadState("networkidle");
    let tableRow = page
        .locator("table tr", { hasText: "New question" })
        .locator("td", { hasText: "New answer" });
    await expect(tableRow).toBeVisible();
    await tableRow.click();
    await expect(page.getByRole("heading", { name: "Question" })).toHaveText(
        "New question",
    );
    await expect(
        page.getByRole("textbox", { name: "Main answer" }),
    ).toHaveValue("New answer");
    tableRow = page
        .locator("table", { hasText: "Another answer 1" })
        .locator("tr", { hasText: "Another answer 2" });
    await expect(tableRow).toBeVisible();
});

test("Delete question", async ({ page }) => {
    await page.goto("/vocab");
    await expect(page.getByTitle("Current language")).toHaveText(
        "Learning Chinese!",
    );
    await page.getByTitle("Edit Sheet 1").click();
    await expect(page).toHaveURL("/vocab/1");
    await expect(page.getByRole("heading")).toHaveText("Sheet 1");
    const tableRow = page
        .locator("table tr", { hasText: "Question 1" })
        .locator("td", { hasText: "hello world" });
    await tableRow.click();
    await expect(page.getByRole("heading", { name: "Question" })).toHaveText(
        "Question 1",
    );
    await expect(
        page.getByRole("textbox", { name: "Main answer" }),
    ).toHaveValue("hello world");
    await page.getByRole("button", { name: "Delete question" }).click();
    await page.waitForLoadState("networkidle");
    await expect(tableRow).not.toBeVisible();
});

test("Modify question", async ({ page }) => {
    await page.goto("/vocab");
    await expect(page.getByTitle("Current language")).toHaveText(
        "Learning Chinese!",
    );
    await page.getByTitle("Edit Sheet 1").click();
    await expect(page).toHaveURL("/vocab/1");
    await expect(page.getByRole("heading")).toHaveText("Sheet 1");
    let tableRow = page
        .locator("table tr", { hasText: "Question 2" })
        .locator("td", { hasText: "why" });
    await tableRow.click();
    const question = page.getByRole("heading", { name: "Question" });
    await expect(question).toHaveText("Question 2");
    question.click();
    await page
        .getByRole("textbox", { name: "Question" })
        .fill("Question 2 modified");
    const mainAnswer = page.getByRole("textbox", { name: "Main answer" });
    await expect(mainAnswer).toHaveValue("why");
    await mainAnswer.fill("why modified");
    const addNewAnswer = page.getByText("Add new answer");
    await addNewAnswer.click();
    const otherAnswer = page.getByRole("textbox", { name: "Other answer" });
    await otherAnswer.fill("why modified also");
    await otherAnswer.press("Enter");
    await page.getByRole("cell", { name: "⤴" }).click();
    await page.getByRole("button", { name: "Save question" }).click();
    await page.waitForLoadState("networkidle");
    tableRow = page
        .locator("table tr", { hasText: "Question 2 modified" })
        .locator("td", { hasText: "why modified also" });
    await expect(tableRow).toBeVisible();
});

test("Search ignores diacritics when setting is enabled", async ({ page }) => {
    await page.goto("/vocab");
    await page.getByTitle("Edit Sheet 1").click();
    await expect(page).toHaveURL("/vocab/1");

    // Add a question with diacritics.
    await addQuestion(page, "résumé", "summary");

    const searchInput = page.getByRole("textbox", { name: "Search" });
    const diacriticRow = page.locator("table tr", { hasText: "résumé" });

    // Ignore diacritics is enabled by default.
    // Searching without diacritics should still match.
    await searchInput.fill("resume");
    await expect(diacriticRow).toBeVisible();
});

test("Search respects diacritics when setting is disabled", async ({
    page,
}) => {
    // Disable ignore diacritics.
    await page.goto("/settings");
    const checkbox = page.getByTitle("Diacritics").getByRole("checkbox");
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();

    await page.goto("/vocab");
    await page.getByTitle("Edit Sheet 1").click();
    await expect(page).toHaveURL("/vocab/1");

    // Add the same question with diacritics.
    await addQuestion(page, "résumé", "summary");

    const searchInput = page.getByRole("textbox", { name: "Search" });
    const diacriticRow = page.locator("table tr", { hasText: "résumé" });

    // Searching without diacritics should NOT match.
    await searchInput.fill("resume");
    await expect(diacriticRow).not.toBeVisible();

    // Searching with diacritics should match.
    await searchInput.fill("résumé");
    await expect(diacriticRow).toBeVisible();
});
