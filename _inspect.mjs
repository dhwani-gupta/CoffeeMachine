import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
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
  await new Promise((r) => setTimeout(r, 350));
};

await clickByText("Enter the café");
await page.screenshot({ path: "/tmp/cm-mobile-desk.png", fullPage: true });

const metrics = await page.evaluate(() => ({
  innerWidth: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  bodyScrollWidth: document.body.scrollWidth,
  desk: document.querySelector(".desk")?.getBoundingClientRect().toJSON(),
  sceneBefore: getComputedStyle(document.querySelector(".scene"), "::before").inset,
  ringStroke: getComputedStyle(
    document.querySelector(".clock-ring__progress"),
  ).stroke,
  ringClass: document.querySelector(".clock-ring__progress")?.className.baseVal,
  needle: getComputedStyle(document.querySelector(".gauge-needle")).transform,
  toastWidth: document.querySelector(".ready-toast"),
}));
console.log(JSON.stringify(metrics, null, 2));

await clickByText("10 sec");
await clickByText("Load the mug");
await clickByText("Start Cappuccino");
await new Promise((r) => setTimeout(r, 10500));

const ringStrokeAfter = await page.evaluate(() => {
  const ring = document.querySelector(".clock-ring__progress");
  return {
    stroke: ring ? getComputedStyle(ring).stroke : null,
    cls: ring ? ring.getAttribute("class") : null,
    needle: getComputedStyle(document.querySelector(".gauge-needle")).transform,
    toast: document.querySelector(".ready-toast")?.getBoundingClientRect().toJSON(),
    scrollWidth: document.documentElement.scrollWidth,
  };
});
console.log(JSON.stringify(ringStrokeAfter, null, 2));

const bezel = await page.$(".clock-bezel");
if (bezel) await bezel.screenshot({ path: "/tmp/cm-clock.png" });
const toast = await page.$(".ready-toast");
if (toast) await toast.screenshot({ path: "/tmp/cm-toast.png" });
const gauge = await page.$(".gauge");
if (gauge) await gauge.screenshot({ path: "/tmp/cm-gauge.png" });
await browser.close();
