import { chromium, type Browser, type Page } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import fs from "fs";
import path from "path";

let _browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!_browser || !_browser.isConnected()) {
    _browser = await chromium.launch({ headless: true });
  }
  return _browser;
}

export async function closeBrowser() {
  if (_browser) { await _browser.close(); _browser = null; }
}

export interface PageCapture {
  screenshot: string;     // base64 PNG
  screenshotPath: string; // absolute path saved to disk
  pageOutline: string;    // compact accessibility-tree text
  axeRaw: unknown;        // raw axe results
}

export async function capturePage(
  page: Page,
  auditId: string,
  stepIdx: number
): Promise<PageCapture> {
  const dir = path.join(process.cwd(), "screenshots", auditId);
  fs.mkdirSync(dir, { recursive: true });
  const screenshotPath = path.join(dir, `step-${stepIdx}.png`);

  const screenshotBuf = await page.screenshot({ path: screenshotPath, type: "png", fullPage: false });
  const screenshot = screenshotBuf.toString("base64");

  const pageOutline = await extractPageOutline(page);
  const axeRaw = await runAxe(page);

  return { screenshot, screenshotPath, pageOutline, axeRaw };
}

async function extractPageOutline(page: Page): Promise<string> {
  return page.evaluate(() => {
    function walk(el: Element, depth: number): string {
      const tag = el.tagName.toLowerCase();
      const role = el.getAttribute("role") || "";
      const label = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || "";
      const text = (el as HTMLElement).innerText?.trim().slice(0, 60) || "";
      const href = (el as HTMLAnchorElement).href ? ` href="${(el as HTMLAnchorElement).href.slice(0, 60)}"` : "";
      const indent = "  ".repeat(depth);

      const attrs = [role && `role="${role}"`, label && `aria-label="${label}"`, href].filter(Boolean).join(" ");
      const line = `${indent}<${tag}${attrs ? " " + attrs : ""}>${text ? " " + text : ""}`;

      const interesting = ["a","button","input","select","textarea","nav","main","header","footer","h1","h2","h3","form","img","svg"];
      if (!interesting.includes(tag)) {
        return Array.from(el.children).map(c => walk(c, depth)).join("\n");
      }

      const children = Array.from(el.children).map(c => walk(c, depth + 1)).filter(Boolean).join("\n");
      return line + (children ? "\n" + children : "");
    }
    return walk(document.body, 0).split("\n").filter(Boolean).slice(0, 120).join("\n");
  });
}

async function runAxe(page: Page): Promise<unknown> {
  try {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "best-practice"])
      .analyze();
    return results.violations;
  } catch {
    return [];
  }
}
