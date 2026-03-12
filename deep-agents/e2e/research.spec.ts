import { test, expect } from "@playwright/test";

test("research plan — todos appear in workspace", async ({ page }) => {
  await page.goto("/");
  await page.fill(
    '[placeholder="Ask me to research any topic..."]',
    "research quantum computing",
  );
  await page.click('button[aria-label="Send"]');

  await expect(page.getByText("Research quantum computing basics")).toBeVisible(
    {
      timeout: 30000,
    },
  );
});

test("write_file — report file appears in workspace", async ({ page }) => {
  await page.goto("/");
  await page.fill(
    '[placeholder="Ask me to research any topic..."]',
    "research quantum computing",
  );
  await page.click('button[aria-label="Send"]');

  await expect(page.getByText("final_report.md", { exact: true })).toBeVisible({
    timeout: 60000,
  });
});

test("agent completion — final message appears in chat", async ({ page }) => {
  await page.goto("/");
  await page.fill(
    '[placeholder="Ask me to research any topic..."]',
    "research quantum computing",
  );
  await page.click('button[aria-label="Send"]');

  await expect(
    page.getByText("I've completed your research on quantum computing"),
  ).toBeVisible({ timeout: 60000 });
});
