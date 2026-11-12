const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "welcome123"; // Dummy demo credential only
let failedAttempts = 0;
let lockedUntil = 0;

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;

  if (req.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    return fs.createReadStream(path.join(__dirname, "public", "index.html")).pipe(res);
  }

  if (req.method === "GET" && pathname === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("ONLINE");
  }

  if (req.method === "POST" && pathname === "/login") {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 2048) {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, message: "Request too large." }));
        req.destroy();
      }
    });

    req.on("end", () => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");

      if (Date.now() < lockedUntil) {
        res.writeHead(429);
        return res.end(JSON.stringify({ ok: false, message: "Demo temporarily locked. Try again later." }));
      }

      let data;
      try {
        data = JSON.parse(body || "{}");
      } catch {
        res.writeHead(400);
        return res.end(JSON.stringify({ ok: false, message: "Invalid request." }));
      }

      const username = typeof data.username === "string" ? data.username : "";
      const password = typeof data.password === "string" ? data.password : "";

      if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        failedAttempts = 0;
        res.writeHead(200);
        return res.end(JSON.stringify({ ok: true, message: "Demo login successful. No account or personal data was created." }));
      }

      failedAttempts += 1;
      if (failedAttempts >= 10) {
        failedAttempts = 0;
        lockedUntil = Date.now() + 60_000;
      }
      res.writeHead(401);
      return res.end(JSON.stringify({ ok: false, message: "Incorrect demo username or password." }));
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("NOT_FOUND");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Demo login server listening on port ${PORT}`);
});
