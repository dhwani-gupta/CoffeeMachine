import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));
await page.goto("http://localhost:4173", { waitUntil: "networkidle0" });

const button = (text) => page.evaluate((t) => {
  const b = [...document.querySelectorAll("button")].find((el) =>
    el.textContent?.toLowerCase().includes(t.toLowerCase()),
  );
  if (!b) throw new Error(`Missing button: ${t}`);
  b.click();
}, text);

const state = () => page.evaluate(() => ({
  lcd: document.querySelector(".lcd-main")?.textContent,
  clock: document.querySelector(".clock-state")?.textContent,
  time: document.querySelector(".clock-time")?.textContent,
  phase: document.querySelector(".machine")?.getAttribute("data-phase"),
  primary: document.querySelector(".brew-button")?.textContent?.trim(),
  toastText: document.querySelector(".ready-toast")?.textContent?.replace(/\s+/g, " ").trim(),
  buttons: [...document.querySelectorAll("button")].map((b) => b.textContent?.replace(/\s+/g, " ").trim()),
  fill: document.querySelector(".cup-liquid")?.style.height,
  sessions: localStorage.getItem("cm.sessions"),
  serving: document.body.innerText.includes("Sip & reset"),
}));

await button("Enter the café");
await button("10 sec");
await button("Load the mug");
await button("Start Cappuccino");
await new Promise((r) => setTimeout(r, 1200));
await button("Pause brewing");
await button("Resume brewing");
await new Promise((r) => setTimeout(r, 700));
await button("Stop");
await new Promise((r) => setTimeout(r, 300));
console.log("after stop:", await state());
await button("Start Cappuccino");
await new Promise((r) => setTimeout(r, 10800));
console.log("after wait:", await state());
await browser.close();
