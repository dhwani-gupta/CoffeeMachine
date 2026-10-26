import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox", "--font-render-hinting=none"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
});
page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const assert = (condition, message) => {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
  console.log(`ok · ${message}`);
};
const text = (selector) =>
  page.$eval(selector, (el) => el.textContent.replace(/\s+/g, " ").trim());
const count = (selector) =>
  page.$$eval(selector, (els) => els.length);
const click = async (selector) => {
  await page.waitForSelector(selector, { visible: true, timeout: 5000 });
  await page.click(selector);
  await sleep(280);
};
const clickText = async (needle) => {
  const found = await page.evaluate((t) => {
    const button = [...document.querySelectorAll("button")].find((b) =>
      b.textContent?.replace(/\s+/g, " ").includes(t),
    );
    if (!button) return false;
    button.click();
    return true;
  }, needle);
  assert(found, `button text "${needle}" exists`);
  await sleep(280);
};
const sectionButton = async (inputSelector, needle) => {
  const found = await page.evaluate(
    (sel, t) => {
      const input = document.querySelector(sel);
      const section = input?.closest(".pad-section");
      const button = section
        ? [...section.querySelectorAll("button")].find((b) =>
            b.textContent?.replace(/\s+/g, " ").includes(t),
          )
        : null;
      if (!button) return false;
      button.click();
      return true;
    },
    inputSelector,
    needle,
  );
  assert(found, `section button "${needle}" exists in ${inputSelector}`);
  await sleep(280);
};
const sectionMeta = (inputSelector) =>
  page.evaluate((sel) => {
    const input = document.querySelector(sel);
    const section = input?.closest(".pad-section");
    return section?.querySelector(".pad-meta")?.textContent.trim() ?? "";
  }, inputSelector);
const setCustom = async (inputSelector, minutes) => {
  const input = await page.$(inputSelector);
  assert(Boolean(input), `${inputSelector} exists`);
  await page.$eval(inputSelector, (el) => {
    el.focus();
    el.select();
  });
  await page.keyboard.press("Backspace");
  await page.keyboard.type(String(minutes));
  await page.keyboard.press("Enter");
  await sleep(300);
};
const clockSeconds = async () => {
  const value = await text(".clock-time");
  const [m, s] = value.split(":").map(Number);
  return m * 60 + s;
};
const cupLiquidHeight = () =>
  page.$eval(".cup .cup-liquid", (el) => el.style.height);

await page.goto("http://localhost:4173", { waitUntil: "networkidle0" });
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem("cm.duration", JSON.stringify(10000));
  localStorage.setItem("cm.preset", JSON.stringify("demo"));
  localStorage.setItem("cm.breakDuration", JSON.stringify(10000));
  localStorage.setItem("cm.breakPreset", JSON.stringify("breakdemo"));
  localStorage.setItem("cm.cup", JSON.stringify("sage"));
});
await page.reload({ waitUntil: "networkidle0" });
await sleep(300);
await clickText("Enter the café");

/* ---------------------------------------------------- initial + cup choice */
assert((await text(".pad-primary")).includes("Load the mug"), "idle asks to load the mug");
await click('.rack-cup[aria-label="Choose the terracotta cup"]');
assert((await text(".cup-rack__selected")) === "Terracotta in hand", "wall cup can be selected");
assert((await text(".pad-order__meta")).includes("terracotta cup"), "order pad reflects cup choice");

/* -------------------------------------------------------------- focus flow */
await click(".pad-primary");
assert((await text(".pad-primary")).includes("Start focus · 10 sec"), "loaded mug offers start focus");
await click(".pad-primary");
assert((await text(".pad-primary")).includes("Pause focus"), "focus starts and can be paused");
assert((await count(".rack-cup:disabled")) === 6, "cup choice locks during focus");
assert((await count(".cup.is-disabled")) === 1, "mug is not draggable during focus");

await sleep(10300);
assert((await text(".pad-primary")).includes("Start break · 10 sec"), "focus completion offers a break");
assert((await text(".session-chip__count")) === "1", "session counter increments");
assert((await text(".ready-toast")).includes("Your Cappuccino is served"), "coffee toast appears");
assert((await text(".reward-note")).includes("5 sips left"), "fresh cup starts with five sips");

await click(".ready-toast .toast-ghost");
await click(".ready-toast .toast-ghost");
assert((await text(".reward-note")).includes("3 sips left"), "sipping before break lowers the cup");

/* ------------------------------------------------------------ break flow */
await click(".ready-toast .btn--small");
assert((await count(".service-ticket")) === 1, "break shows the café service ticket");
assert((await text(".pad-mode")) === "Break", "order pad switches to break mode");
assert(
  (await text(".lcd-main")).toUpperCase().includes("ON BREAK"),
  "LCD switches to break",
);
assert((await text(".sip-meter__label")) === "3 sips left", "break keeps the pre-sipped level");
assert((await text(".break-ritual")).includes("Sip slowly"), "break ritual is shown");

await click(".extend-button");
assert((await clockSeconds()) >= 300, "extend break adds five minutes");

await click(".pad-primary");
assert((await text(".pad-primary")) === "Resume break", "break can be paused");
assert(
  (await text(".lcd-main")).toUpperCase() === "BREAK PAUSED",
  "LCD reflects paused break",
);
const frozen = await clockSeconds();
await sleep(1200);
assert((await clockSeconds()) === frozen, "paused break clock is frozen");
await click(".pad-primary");
assert((await text(".pad-primary")) === "Pause break", "break resumes");

await click(".cup");
assert((await text(".sip-meter__label")) === "2 sips left", "tapping the mug takes a sip");
await page.keyboard.press("s");
await sleep(250);
assert((await text(".sip-meter__label")) === "1 sip left", "S key takes a sip");

await click(".pad-stop");
assert((await text(".pad-primary")).includes("Start focus · 10 sec"), "ending a break returns to focus");
assert((await count(".service-ticket")) === 0, "service ticket disappears after ending break");
assert((await cupLiquidHeight()) === "0%", "ending break clears the cup");
assert((await text(".session-chip__count")) === "1", "ending a break does not change the session count");

/* ----------------------------------------------------- full break complete */
await sectionButton("#break-custom", "10 sec");
assert((await sectionMeta("#break-custom")) === "10 sec", "break preset can be re-selected");

await click(".pad-primary");
await sleep(10300);
await click(".ready-toast .btn--small");
assert((await text(".pad-mode")) === "Break", "second break starts");
await click(".cup");
assert((await text(".sip-meter__label")) === "4 sips left", "second cup sip works");
await page.keyboard.press("s");
await sleep(250);
assert((await text(".sip-meter__label")) === "3 sips left", "second cup keyboard sip works");

await sleep(10600);
assert((await text(".ready-toast")).includes("Break complete"), "break completion toast appears");
assert((await text(".session-chip__count")) === "2", "second focus increments sessions");
assert((await cupLiquidHeight()) === "0%", "cup is cleared when break completes");
assert((await text(".pad-primary")).includes("Start focus · 10 sec"), "break completion offers next focus");

/* ------------------------------------------------------------ custom times */
await setCustom("#break-custom", 7);
assert((await sectionMeta("#break-custom")) === "7 min", "custom break length applies");
await setCustom("#focus-custom", 15);
assert((await sectionMeta("#focus-custom")) === "15 min", "custom focus length applies");

/* -------------------------------------------------------------- persistence */
await page.reload({ waitUntil: "networkidle0" });
await sleep(300);
await clickText("Enter the café");
assert((await text(".cup-rack__selected")) === "Terracotta in hand", "cup choice persists");
assert((await text(".session-chip__count")) === "2", "session count persists");
assert((await sectionMeta("#focus-custom")) === "15 min", "custom focus persists");
assert((await sectionMeta("#break-custom")) === "7 min", "custom break persists");
assert((await text(".pad-primary")) === "Load the mug", "reload returns to standby with the mug on the coaster");

/* --------------------------------------------------------------- mobile UX */
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await sleep(300);
const mobileOverflow = await page.evaluate(
  () => document.documentElement.scrollWidth - window.innerWidth,
);
assert(mobileOverflow <= 0, "no horizontal overflow at 390px");
await page.screenshot({
  path: "/tmp/barista-mobile-final-idle.png",
  fullPage: true,
});

await sectionButton("#focus-custom", "10 sec");
await click(".pad-primary");
await click(".pad-primary");
await sleep(10300);
await click(".ready-toast .btn--small");
await sleep(400);
const mobileBreakOverflow = await page.evaluate(
  () => document.documentElement.scrollWidth - window.innerWidth,
);
assert(mobileBreakOverflow <= 0, "no horizontal overflow during mobile break");
await page.screenshot({
  path: "/tmp/barista-mobile-final-break.png",
  fullPage: true,
});

await page.setViewport({ width: 320, height: 700, deviceScaleFactor: 1 });
await sleep(300);
const smallOverflow = await page.evaluate(
  () => document.documentElement.scrollWidth - window.innerWidth,
);
assert(smallOverflow <= 0, "no horizontal overflow at 320px");
await page.screenshot({
  path: "/tmp/barista-320-break.png",
  fullPage: true,
});

assert(errors.length === 0, `no console or page errors (${errors.length})`);
if (errors.length) console.log(errors);

await browser.close();
console.log("all checks passed");
