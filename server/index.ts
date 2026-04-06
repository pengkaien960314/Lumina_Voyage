import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // 安全標頭
  app.set("trust proxy", 1);
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  // CORS
  app.use(cors({
    origin: process.env.NODE_ENV === "production"
      ? ["https://luminavoyage.app"]
      : ["http://localhost:5000", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }));

  // Rate limiting — 每個 IP 每 15 分鐘最多 100 次請求
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "請求過於頻繁，請稍後再試" },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // JSON body parser
  app.use(express.json({ limit: "10kb" }));

  // Static files
  const staticPath = path.resolve(__dirname, "public");
  app.use(express.static(staticPath));

  // Client-side routing
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
