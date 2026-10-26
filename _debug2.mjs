import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:4173", { waitUntil: "networkidle0" });
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem("cm.duration", JSON.stringify(10000));
  localStorage.setItem("cm.preset", JSON.stringify("demo"));
});
await page.reload({ waitUntil: "networkidle0" });
await page.evaluate(() => {
  [...document.querySelectorAll("button")]
    .find((b) => b.textContent.includes("Enter the café"))
    .click();
});
await new Promise((r) => setTimeout(r, 400));

const read = () =>
  page.evaluate(() => {
    const input = document.querySelector("#break-custom");
    const section = input?.closest(".pad-section");
    return {
      value: input?.value,
      meta: section?.querySelector(".pad-meta")?.textContent,
      active: section?.querySelector(".custom-apply")?.className,
      disabled: input?.disabled,
    };
  });

console.log("before", await read());
await page.click("#break-custom");
await page.keyboard.down("Meta");
await page.keyboard.press("a");
await page.keyboard.up("Meta");
await page.keyboard.press("Backspace");
console.log("after clear", await read());
await page.keyboard.type("7");
console.log("after type", await read());
await page.keyboard.press("Enter");
await new Promise((r) => setTimeout(r, 400));
console.log("after enter", await read());

await page.evaluate(() => {
  const input = document.querySelector("#break-custom");
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  ).set;
  setter.call(input, "9");
  input.dispatchEvent(new Event("input", { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 200));
console.log("after native", await read());
await page.keyboard.press("Enter");
await new Promise((r) => setTimeout(r, 400));
console.log("after native enter", await read());

await browser.close();
