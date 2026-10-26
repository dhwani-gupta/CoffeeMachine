import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox", "--font-render-hinting=none"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });

page.on("console", (msg) => {
  if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text());
});
page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));

await page.goto("http://localhost:4173", { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: "/tmp/cm-welcome.png" });

const clickByText = async (text) => {
  const found = await page.evaluate((t) => {
    const button = [...document.querySelectorAll("button")].find((b) =>
      b.textContent?.includes(t),
    );
    if (!button) return false;
    button.click();
    return true;
  }, text);
  if (!found) throw new Error(`Button not found: ${text}`);
  await new Promise((r) => setTimeout(r, 350));
};

await clickByText("Enter the café");
await page.screenshot({ path: "/tmp/cm-desk.png" });

await clickByText("10 sec");
await clickByText("Load the mug");
await page.screenshot({ path: "/tmp/cm-loaded.png" });
await clickByText("Start Cappuccino");
await new Promise((r) => setTimeout(r, 3800));
await page.screenshot({ path: "/tmp/cm-brewing.png" });
await new Promise((r) => setTimeout(r, 7500));
await page.screenshot({ path: "/tmp/cm-complete.png" });

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: "/tmp/cm-mobile.png", fullPage: true });

await browser.close();
console.log("screenshots done");
