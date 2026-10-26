import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
const errors = [];
page.on("pageerror", (err) => errors.push(err.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto("http://localhost:4173", { waitUntil: "networkidle0" });

const $text = (selector) =>
  page.$eval(selector, (el) => el.textContent?.replace(/\s+/g, " ").trim() ?? "");
const button = (text) => page.evaluate((t) => {
  const b = [...document.querySelectorAll("button")].find((el) =>
    el.textContent?.includes(t),
  );
  if (!b) throw new Error(`Missing button: ${t}`);
  b.click();
}, text);
const state = () =>
  page.evaluate(() => ({
    lcd: document.querySelector(".lcd-main")?.textContent,
    sub: document.querySelector(".lcd-sub")?.textContent,
    clock: document.querySelector(".clock-state")?.textContent,
    time: document.querySelector(".clock-time")?.textContent,
    phase: document.querySelector(".machine")?.getAttribute("data-phase"),
    primary: document.querySelector(".brew-button")?.textContent?.trim(),
    stopDisabled: document.querySelector(".stop-button")?.disabled,
    toast: Boolean(document.querySelector(".ready-toast")),
    cupSpot: Boolean(document.querySelector(".tray .cup")),
    fill: document.querySelector(".cup-liquid")?.style.height,
    sessions: localStorage.getItem("cm.sessions"),
  }));

const checks = [];
const check = (label, condition, detail) => {
  checks.push({ label, ok: Boolean(condition), detail });
};

await button("Enter the café");
check("initial LCD", (await state()).lcd?.includes("STANDBY"), await state());

await button("Load the mug");
let s = await state();
check("mug loaded", s.cupSpot, s);
check("ready LCD", s.lcd?.includes("READY FOR EXTRACTION"), s.lcd);
check("start CTA", s.primary?.includes("Start Cappuccino"), s.primary);

await button("Start Cappuccino");
await new Promise((r) => setTimeout(r, 1200));
await button("Pause brewing");
s = await state();
check("paused phase", s.phase === "paused", s.phase);
check("paused clock", s.clock?.includes("Paused"), s.clock);
check("paused CTA", s.primary?.includes("Resume brewing"), s.primary);
check("stop enabled", s.stopDisabled === false, s.stopDisabled);

await button("Resume brewing");
await new Promise((r) => setTimeout(r, 700));
await button("Stop");
s = await state();
check("stopped phase", s.phase === "idle", s.phase);
check("stopped stop disabled", s.stopDisabled === true, s.stopDisabled);
check("stopped CTA", s.primary?.includes("Start Cappuccino"), s.primary);
check("stopped cup empty", s.fill === "0%" || s.fill === "0px" || !s.fill, s.fill);

await button("Start Cappuccino");
await new Promise((r) => setTimeout(r, 10800));
s = await state();
check("complete phase", s.phase === "complete", s.phase);
check("complete time", s.time === "00:00", s.time);
check("complete toast", s.toast === true, s.toast);
check("session increment", s.sessions === "1", s.sessions);
check("cup full", s.fill === "100%", s.fill);

await button("Sip & reset");
await new Promise((r) => setTimeout(r, 300));
s = await state();
check("after sip phase", s.phase === "idle", s.phase);
check("after sip time", s.time === "00:10", s.time);
check("after sip toast", s.toast === false, s.toast);
check("after sip cup empty", s.fill === "0%", s.fill);
check("after sip CTA", s.primary?.includes("Start Cappuccino"), s.primary);

await page.evaluate(() => {
  document.body.focus();
});
await page.keyboard.press("m");
const muted = await page.$eval(".icon-button", (el) => ({
  pressed: el.getAttribute("aria-pressed"),
  cls: el.className,
}));
check("M mutes", muted.pressed === "true" && muted.cls.includes("is-muted"), muted);

await page.keyboard.press("?");
await new Promise((r) => setTimeout(r, 250));
check("help opens", (await page.$(".shortcut-list")) !== null);
await page.keyboard.press("Escape");
await new Promise((r) => setTimeout(r, 250));
check("help closes", (await page.$(".shortcut-list")) === null);

check("stored drink", (await page.evaluate(() => localStorage.getItem("cm.drink"))) === '"cappuccino"');
check("stored preset", (await page.evaluate(() => localStorage.getItem("cm.preset"))) === '"demo"');
check("stored muted", (await page.evaluate(() => localStorage.getItem("cm.muted"))) === "true");

await page.setViewport({ width: 390, height: 844 });
check(
  "no horizontal overflow",
  (await page.evaluate(() => document.documentElement.scrollWidth)) === 390,
);

console.log(checks.map((c) => `${c.ok ? "PASS" : "FAIL"}  ${c.label}${c.ok ? "" : ` => ${JSON.stringify(c.detail)}`}`).join("\n"));
console.log("\nRuntime errors:", errors.length ? errors : "none");
console.log(checks.every((c) => c.ok) && errors.length === 0 ? "\nALL CHECKS PASSED" : "\nSOME CHECKS FAILED");

await page.screenshot({ path: "/tmp/v3-flow.png" });
await browser.close();
