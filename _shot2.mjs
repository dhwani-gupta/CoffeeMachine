import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox", "--font-render-hinting=none"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

page.on("console", (msg) => {
  if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text());
});
page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));

await page.goto("http://localhost:4173", { waitUntil: "networkidle0" });
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem("cm.duration", JSON.stringify(10000));
  localStorage.setItem("cm.preset", JSON.stringify("demo"));
  localStorage.setItem("cm.breakDuration", JSON.stringify(10000));
  localStorage.setItem("cm.breakPreset", JSON.stringify("breakdemo"));
  localStorage.setItem("cm.cup", JSON.stringify("cobalt"));
});
await page.reload({ waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 500));

const shot = async (name) => {
  await page.screenshot({ path: `/tmp/barista-${name}.png` });
  console.log("shot", name);
};

const clickClass = async (selector, index = 0) => {
  const ok = await page.evaluate(
    (sel, i) => {
      const el = document.querySelectorAll(sel)[i];
      if (!el) return false;
      el.click();
      return true;
    },
    selector,
    index,
  );
  if (!ok) throw new Error(`Not found: ${selector}[${index}]`);
  await new Promise((r) => setTimeout(r, 350));
};

const clickText = async (text) => {
  const ok = await page.evaluate((t) => {
    const button = [...document.querySelectorAll("button")].find((b) =>
      b.textContent?.includes(t),
    );
    if (!button) return false;
    button.click();
    return true;
  }, text);
  if (!ok) throw new Error(`Button not found: ${text}`);
  await new Promise((r) => setTimeout(r, 350));
};

const metrics = async (label) => {
  const m = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    bodyHeight: document.body.scrollHeight,
    innerHeight: window.innerHeight,
  }));
  console.log(label, JSON.stringify(m));
};

await shot("welcome");
await clickText("Enter the café");
await new Promise((r) => setTimeout(r, 500));
await shot("desk");
await metrics("desktop");

// cup selection is possible while idle
await clickClass('.rack-cup[aria-label="Choose the cobalt cup"]');
await shot("cup-selected");

// load the mug
await clickClass(".pad-primary");
await shot("loaded");

// start focus
await clickClass(".pad-primary");
await new Promise((r) => setTimeout(r, 3300));
await shot("brewing");
await new Promise((r) => setTimeout(r, 7600));
await shot("served");
await metrics("desktop-served");

// start break
await clickClass(".ready-toast .btn--small");
await new Promise((r) => setTimeout(r, 500));
await shot("break");

// two sips
await clickClass(".sip-button");
await clickClass(".sip-button");
await new Promise((r) => setTimeout(r, 900));
await shot("break-sipped");

// finish break
await new Promise((r) => setTimeout(r, 8200));
await shot("break-complete");

// mobile
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await new Promise((r) => setTimeout(r, 400));
await shot("mobile-complete");
await metrics("mobile");
await page.screenshot({
  path: "/tmp/barista-mobile-full.png",
  fullPage: true,
});

// reset to idle for mobile idle shot
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle0" });
await clickText("Enter the café");
await new Promise((r) => setTimeout(r, 400));
await shot("mobile-idle");
await page.screenshot({
  path: "/tmp/barista-mobile-idle-full.png",
  fullPage: true,
});

await browser.close();
console.log("done");
