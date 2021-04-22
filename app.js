const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("console", msg => console.log("PAGE LOG:", msg.text()));
  await page.goto("https://www.bolsadesantiago.com/detalle_indice/SP%20IPSA");

  const bodyHandle = await page.$("body");
  const html = await page.evaluate(body => body.innerHTML, bodyHandle);
  console.log(html);
  await bodyHandle.dispose();

  await browser.close();
})();
