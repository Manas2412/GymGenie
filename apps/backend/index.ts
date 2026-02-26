import express from "express";
import cors from "cors";
import v1Router from "./api/v1";

const port = Number(process.env.BACKEND_PORT);
if(!port) {
  throw new Error("BACKEND_URL not present, check .env file.")
}

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  console.log("[backend] GET /health");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ status: "ok" }));
});

app.use("/api/v1", v1Router);

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Either stop the other process (e.g. \`lsof -ti :${port} | xargs kill\`) or set BACKEND_PORT to a different port in .env`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});