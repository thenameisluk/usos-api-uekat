// Import Astral
import { launch } from "jsr:@astral/astral";

export async function tryfetchplan(login: string, password: string,path="./") {
  const d = new Date();
  const tok = d.getDate() + "-" + d.getMonth();

  let out = "";
  try {
    out = Deno.readTextFileSync("lastfetch");
  } catch {
    out;
  }

  if (out == tok) {
    console.log("plan already fetched today");
    return;
  }

  const browser = await launch({
    // debian/raspberry pi os specific path option
    // requires sudo apt install chromium
    path: "/usr/bin/chromium",
    args: [
      "--remote-debugging-port=9222",
      "--headless=new",
      "--no-first-run",
      "--password-store=basic",
      "--use-mock-keychain",
      "--hide-scrollbars",
      "--no-sandbox",
    ],
  });

  try {
    // Open a new page
    const page = await browser.newPage(
      "https://usosweb.ue.katowice.pl/kontroler.php?_action=logowaniecas/index",
    );

    // #username
    let input = await page.$("#username");
    await input!.type(login, { delay: 10 });
    // #password
    input = await page.$("#password");
    await input!.type(password, { delay: 10 });

    let button = await page.$("button.form-button");
    await button!.click();

    await page.waitForNavigation();

    button = await page.$("div.plan");
    await button!.click();

    await page.waitForNavigation();

    const planNow = "<div>" +
      (await (await page.$("usos-timetable"))!.innerHTML()) + "</div>";

    const buttonNext = await page.$(
      'b>usos-link[icon-location="right"]>a[onclick]',
    );
    await buttonNext!.click();

    await page.waitForNavigation();

    const planNext = "<div>" +
      (await (await page.$("usos-timetable"))!.innerHTML()) + "</div>";

    Deno.writeTextFileSync(path+"plannow.html", planNow);
    Deno.writeTextFileSync(path+"plannext.html", planNext);

    Deno.writeTextFileSync("lastfetch", tok);
  } catch {
    console.log("plan fetch failed");
  }
  await browser.close();
}
