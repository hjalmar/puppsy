import puppeteer from "puppeteer";
import { URL } from "url";
import config from "./config.js";

// In-memory cache of rendered pages.
// Note: this will be cleared whenever the server process stops.
const RENDER_CACHE = new Map();

const prefetch = async (url) => {
  try {
    const response = await loadURL(url);
    return { json: response.json };
  } catch (e) {
    return { json: { error: e } };
  }
};

const loadURL = async ({ url, options = {}, ssr, dev }) => {
  // handle caching if defined
  if (RENDER_CACHE.has(url) && ssr.cache) {
    const data = RENDER_CACHE.get(url);
    const elapsed = Date.now() - data.time;
    if (elapsed / 1000 < ssr.cache) {
      return data;
    }
  }

  // where to store the markup
  let html = "";

  // Why launching a new browser on each request?? apparantly having a long lived
  // chrome instance running would eat away memory so launching a new browser on
  // individual request should be the preferred way, just make sure to kill
  // the child process.
  options = {
    headless: true,
    ...config.puppeteer,
  };
  // launch the puppeteer browser
  const browser = await puppeteer.launch(options);
  // launch new page and wait for puppsy client-side
  const page = await browser.newPage();

  // intercept the request
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    // lets leave a snipped to validate the sameOrigin of the request
    const requestOrigin = new URL(request.url()).origin;
    // const targetOrigin = new URL(url).origin;
    let allowOrigin;
    // alidate the origin of the request
    if (
      ssr.allowOrigin.some((req) =>
        new RegExp(`^${req.replace(/\*/g, ".*")}\/?$`, "i").test(
          requestOrigin + "/"
        )
      )
    ) {
      allowOrigin = true;
    }
    // Ignore requests for resources that don't produce DOM (stylesheets, media).
    if (!ssr.allowlist.includes(request.resourceType()) || !allowOrigin) {
      if (dev) {
        console.log(
          "Blocked requests :",
          request.url(),
          `(${request.resourceType()})`
        );
      }
      return request.abort();
    }

    // set custom ssr header
    const headers = request.headers();
    headers[config.id] = Date.now();
    request.continue({
      headers,
    });
  });

  // goto page and wait for puppsy preload state
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("body[data-puppsystate]");

  // grab the current state
  let state = await page.evaluate(() => {
    return document.querySelector("body").dataset.puppsystate;
  });

  // if state is 2 ('waitingforready') we need to wait for the page
  // to finish preloading which is a state of 3
  if (state == 2) {
    state = 3;
    await page.waitForSelector('body[data-puppsystate="3"]');
  }

  // grab the current state
  let json;
  if (state == 3) {
    json = await page.evaluate(() => {
      // grab the preloaded comment data
      const comment = document.documentElement.lastChild;
      let jsonString = "";
      if (comment.nodeType == 8) {
        jsonString = comment.nodeValue;
      }
      return JSON.parse(jsonString);
    });
  }

  // get the html
  html = await page.content();
  // store cache
  RENDER_CACHE.set(url, { time: Date.now(), html, json });

  // kill the browser process
  await browser.close();
  await browser.process().kill("SIGINT");

  return { html, json };
};

// export initialization
export { prefetch, loadURL };
