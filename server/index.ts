import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["http://localhost:5000", "http://localhost:3000"];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".replit.dev") || origin.endsWith(".replit.app")) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  }));

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  }));

  app.use(express.json({ limit: "10mb" }));

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath, {
    maxAge: process.env.NODE_ENV === "production" ? "1y" : 0,
    etag: true,
  }));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Lumina Voyage server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
