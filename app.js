const puppeteer = require("puppeteer");

(async () => {
  // const browser = await puppeteer.launch({
  //   headless: false,
  //   devtools: true,
  //   defaultViewport: null,
  // });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  //page.on("console", msg => console.log("PAGE LOG:", msg.text()));
  await page.goto("http://www.bolsadesantiago.com/detalle_indice/SP%20IPSA", {
    waitUntil: "domcontentloaded",
    timeout: 0,
  });

  await page.waitForSelector("[ng-if=boxEmpresasIndice] table tbody a");

  let companiesList = await page.evaluate(() => {
    const elements = document.querySelectorAll(
      "[ng-if=boxEmpresasIndice] td a"
    );

    let listResult = [];
    for (let element of elements) {
      listResult.push({ name: element.innerText, linkRef: element.href });
    }
    return listResult;
  });

  for (let company of companiesList) {
    await page.goto(company.linkRef, {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    await page.waitForTimeout("5000");
    await page.waitForSelector(".row.mb-3 .col-lg-6.border-right h4");
    const stockValue = await page.evaluate(() => {
      let price = document.querySelectorAll(".row.mb-3 h4")[0].innerText;
      price = parseFloat(price.replace(".", "").replace(",", "."));
      return price;
    });
    company.price = stockValue;
  }

  companiesList.sort((a, b) =>
    a.price > b.price ? 1 : b.price > a.price ? -1 : 0
  );

  for (let i = 0; i < 5; i++) {
    console.log(companiesList[i]);
  }
  //console.log("--------------------");
  //console.log(companiesList);

  await browser.close();
})();
