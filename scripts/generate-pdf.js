// Generates book.pdf from the built site's print-only page (src/print.njk -> /print/index.html).
// Run this AFTER `npm run build` (or just use `npm run build:all`).

const fs = require("fs");
const path = require("path");
const http = require("http");
const puppeteer = require("puppeteer");

const SITE_DIR = path.join(__dirname, "..", "_site");
const OUTPUT_PDF = path.join(SITE_DIR, "book.pdf");

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};

function startServer(rootDir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(rootDir, decodeURIComponent(req.url.split("?")[0]));
      if (filePath.endsWith("/")) filePath = path.join(filePath, "index.html");

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
        res.end(data);
      });
    });

    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

(async () => {
  if (!fs.existsSync(SITE_DIR)) {
    console.error(`Couldn't find ${SITE_DIR}. Run "npm run build" first.`);
    process.exit(1);
  }

  const server = await startServer(SITE_DIR);
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/print/`;

  console.log(`Rendering ${url} -> book.pdf ...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.pdf({
      path: OUTPUT_PDF,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    console.log(`Done: ${OUTPUT_PDF}`);
  } finally {
    await browser.close();
    server.close();
  }
})();
