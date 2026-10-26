import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox", "--font-render-hinting=none"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));
await page.goto("http://localhost:4173", { waitUntil: "networkidle0" });

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
  await new Promise((r) => setTimeout(r, 300));
};

await clickByText("Enter the café");
await page.screenshot({ path: "/tmp/v2-desk.png" });
await clickByText("10 sec");
await clickByText("Load the mug");
await clickByText("Start Cappuccino");
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: "/tmp/v2-pour.png" });
await new Promise((r) => setTimeout(r, 9500));
await page.screenshot({ path: "/tmp/v2-complete.png" });

const toast = await page.$(".ready-toast");
if (toast) await toast.screenshot({ path: "/tmp/v2-toast.png" });
const bezel = await page.$(".clock-bezel");
if (bezel) await bezel.screenshot({ path: "/tmp/v2-clock.png" });

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await new Promise((r) => setTimeout(r, 400));
console.log(
  await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    toast: document.querySelector(".ready-toast")?.getBoundingClientRect().toJSON(),
  })),
);
await page.screenshot({ path: "/tmp/v2-mobile.png", fullPage: true });
await page.screenshot({ path: "/tmp/v2-mobile-viewport.png" });

await browser.close();
console.log("done");
