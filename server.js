const http = require("http");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const DEMO_SECRET = process.env.DEMO_SECRET || "to";
const MAX_ATTEMPTS = 676; // Two lowercase letters: 26 x 26
let failedAttempts = 0;
let locked = false;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200);
    return res.end("ONLINE");
  }

  if (req.method !== "POST" || req.url !== "/login") {
    res.writeHead(404);
    return res.end("NOT_FOUND");
  }

  let body = "";
  req.on("data", chunk => {
    body += chunk;
    if (body.length > 1024) {
      res.writeHead(413);
      res.end("TOO_LARGE");
      req.destroy();
    }
  });

  req.on("end", () => {
    const params = new URLSearchParams(body);
    const guess = params.get("password") || "";

    // This endpoint is deliberately restricted to the fake two-letter demo.
    if (!/^[a-z]{2}$/.test(guess)) {
      res.writeHead(400);
      return res.end("INVALID_DEMO_GUESS");
    }

    if (locked) {
      res.writeHead(429);
      return res.end("LOCKED");
    }

    if (guess === DEMO_SECRET) {
      res.writeHead(200);
      return res.end("OK");
    }

    failedAttempts += 1;
    if (failedAttempts >= MAX_ATTEMPTS) {
      locked = true;
    }

    res.writeHead(200);
    return res.end(locked ? "LOCKED" : "FAIL");
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Mock demo server listening on port ${PORT}`);
});
