const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    slowMo: 10,
  });

  const page = await browser.newPage();

  await page.goto("http://www.bolsadesantiago.com/detalle_indice/SP%20IPSA", {
    waitUntil: "domcontentloaded",
    timeout: 0,
  });
  await page.screenshot({ path: "CheckItIsNotCaptcha.png" });

  await page.waitForSelector("[ng-if=boxEmpresasIndice] table tbody a");

  //Retrieve the list of companies of our interest
  let companiesList = await page.evaluate(() => {
    const elements = document.querySelectorAll(
      "[ng-if=boxEmpresasIndice] td a"
    );

    let listResult = [];
    for (let element of elements) {
      listResult.push({
        name: element.innerText,
        linkRef: element.href.replace("https", "http"),
      });
    }
    return listResult;
  });

  //Retrieve the stock price of each company in the list
  for (let company of companiesList) {
    await page.goto(company.linkRef, {
      waitUntil: "networkidle0",
    });

    await page.waitForSelector(".row.mb-3 .col-lg-6.border-right h4");
    const stockValue = await page.evaluate(() => {
      let price = document.querySelectorAll(".row.mb-3 h4")[0].innerText;
      price = parseFloat(price.replace(".", "").replace(",", "."));
      return price;
    });
    company.price = stockValue;
  }

  //Descending order
  companiesList.sort((a, b) =>
    a.price > b.price ? -1 : b.price > a.price ? 1 : 0
  );
  //Print just the five ones with highest price.
  for (let i = 0; i < 5; i++) {
    console.log(companiesList[i]);
  }
  // Print The whole list of companies
  // console.log(companiesList);

  await browser.close();
})();
