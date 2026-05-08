import colors from "colors/safe";
import compression from "compression";
import cors from "cors";
import * as dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import mongoSanitize from "express-mongo-sanitize";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import { createServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";
import AppRouter from "./api";
import { socketHandler } from "./api/v1/socket";
import { connectMongoDB } from "./config/db";
import { swaggerSpecAdmin } from "./config/swagger-admin";
import { swaggerSpecUser } from "./config/swagger-user";
import { validateEnv } from "./config/validate-env";
import {
  BASE_URL,
  ENFORCE_HTTPS_REDIRECT,
  NODE_ENV,
  PORT as PORT_ENV,
  PRODUCT_NAME,
} from "./functions/env";
import { sendCatchFeedback, sendErrorFeedback } from "./functions/feedback";
import { AgendaControl } from "./jobs";
import logger from "./middleware/logger";
import { requestIdMiddleware } from "./middleware/request-id";
import { multerErrorHandler } from "./utils/cloudinary";
import { corsList } from "./utils/constants";
import { ErrorCodes } from "./utils/error-codes";

process.env.DOTENV_LOG = "false";

dotenv.config();
validateEnv();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: corsList,
    methods: ["GET", "POST"],
  },
  path: "/socket.io",
});

const PORT = PORT_ENV || 5000;

// Security Start

// Enable trust proxy
app.set("trust proxy", 1); // '1' means trust the first proxy in the chain

// In production, optionally redirect HTTP to HTTPS (set ENFORCE_HTTPS_REDIRECT=true when not behind a proxy that does this)
if (NODE_ENV === "production" && ENFORCE_HTTPS_REDIRECT) {
  app.use((req, res, next) => {
    const proto = req.get("x-forwarded-proto");
    if (proto === "https") return next();
    const host = req.get("host") || req.hostname;
    return res.redirect(301, `https://${host}${req.originalUrl}`);
  });
}

// Limit API requests in specified time
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests from this IP. Try again in 15 minutes",
      code: ErrorCodes.RATE_LIMIT_EXCEEDED,
    });
  },
});

app.use(limiter);

// cors
app.use(
  cors({
    origin: corsList,
    credentials: true,
  }),
);

// Use Helmet!
app.use(
  helmet({
    contentSecurityPolicy: NODE_ENV === "production",
    crossOriginEmbedderPolicy: false,
  }),
);

// Prevent parameter pollution
app.use(hpp());

// Remove prohibited user input characters
app.use(mongoSanitize());

// compress all responses
app.use(compression());

// Security end

// Add middlewares for parsing JSON and urlencoded data and populating `req.body`
app.use(express.urlencoded({ extended: false, limit: "5mb" }));

// parse requests of content-type - application/json
app.use(express.json());

// Request ID middleware
app.use(requestIdMiddleware);

// Logger middleware
app.use(logger);

// base route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to " + PRODUCT_NAME });
});

// Health check endpoint
app.get("/health", (req, res) => {
  try {
    const mongoState = mongoose.connection.readyState;
    const mongoStatus =
      mongoState === 1
        ? "connected"
        : mongoState === 2
          ? "connecting"
          : mongoState === 3
            ? "disconnecting"
            : "disconnected";

    const status = mongoState === 1 ? 200 : 503;

    res.status(status).json({
      status: mongoState === 1 ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      mongo: mongoStatus,
      uptimeSeconds: Math.floor(process.uptime()),
    });
  } catch (e) {
    res.status(503).json({
      status: "down",
      timestamp: new Date().toISOString(),
      mongo: "error",
      uptimeSeconds: Math.floor(process.uptime()),
    });
  }
});

// Admin Swagger Documentation
app.use(
  "/docs/admin",
  swaggerUi.serveFiles(swaggerSpecAdmin),
  swaggerUi.setup(swaggerSpecAdmin, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Testimonies.com Admin API Documentation",
  }),
);

// User Swagger Documentation
app.use(
  "/docs/user",
  swaggerUi.serveFiles(swaggerSpecUser),
  swaggerUi.setup(swaggerSpecUser, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Testimonies.com User API Documentation",
  }),
);

// Admin Swagger JSON endpoint
app.get("/api-docs/admin.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpecAdmin);
});

// User Swagger JSON endpoint
app.get("/api-docs/user.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpecUser);
});

// API Routes
app.use("/api", AppRouter);

// Not found route
app.use((req, res) => {
  return sendErrorFeedback(res, 404, "API route not found.", {
    code: ErrorCodes.NOT_FOUND,
  });
});

// Error Handling for multer
app.use(multerErrorHandler);

// General Error Handling
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  sendCatchFeedback(res, err);
});

// Socket connection to express app
socketHandler(io);

const server = httpServer.listen(PORT, async () => {
  const baseUrl = BASE_URL || `http://localhost:${PORT}`;
  console.log("");
  console.log(colors.green(`  Server running on port ${PORT}`));
  console.log("");
  console.log("  Quick links (click to open):");
  console.log(`  • Server:     ${baseUrl}`);
  console.log(`  • Health:     ${baseUrl}/health`);
  console.log(`  • API:        ${baseUrl}/api`);
  console.log(`  • API v1:     ${baseUrl}/api/v1`);
  console.log(`  • Admin Docs: ${baseUrl}/docs/admin`);
  console.log(`  • User Docs:  ${baseUrl}/docs/user`);
  console.log("");
  console.log(
    "  Note: /api and /api/v1 require the x-api-key header. Swagger docs are public.",
  );
  console.log("");
  // Run DB and Agenda in background so the process doesn't freeze if they're slow
  Promise.all([connectMongoDB(), await AgendaControl.start()]).catch((err) => {
    console.error(
      "Startup error (server is up; /health may report down):",
      err,
    );
  });
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the other process or set PORT to a different value.`,
    );
  } else {
    console.error("Server error:", error);
  }
  process.exit(1);
});

async function gracefulShutdown(signal: string) {
  console.log(`${signal} received, closing server...`);
  return new Promise<void>((resolve) => {
    server.close(async () => {
      try {
        await AgendaControl.stop();
        await mongoose.disconnect();
        console.log("Shutdown complete");
      } catch (e) {
        console.error("Shutdown error", e);
      }
      process.exit(0);
      resolve();
    });
  });
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
