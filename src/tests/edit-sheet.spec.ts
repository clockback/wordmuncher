import { expect, test } from "@playwright/test";

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
    let tableRow = page
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
