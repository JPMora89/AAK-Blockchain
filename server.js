const express = require("express");
const next = require("next");
const cors = require("cors");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Define your CORS options
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.prepare().then(() => {
  const server = express();

  server.use(cors(corsOptions));

  server.all("*", (req, res) => {
    handle(req, res);
  });
  console.log("Server is starting...");

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log(" started on http://localhost:3000");
  });
});
