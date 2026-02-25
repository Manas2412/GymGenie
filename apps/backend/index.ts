import express from "express";
import cors from "cors";
import v1Router from "./api/v1"


const port = process.env.BACKEND_PORT;

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


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});