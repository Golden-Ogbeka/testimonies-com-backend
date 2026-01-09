import compression from "compression";
import cors from "cors";
import * as dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import mongoSanitize from "express-mongo-sanitize";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import { createServer } from "http";
import { Server } from "socket.io";
import AppRouter from "./api";
import { socketHandler } from "./api/v1/socket";
import { connectMongoDB } from "./config/db";
import { PRODUCT_NAME } from "./functions/env";
import { sendCatchFeedback, sendErrorFeedback } from "./functions/feedback";
import { AgendaControl } from "./jobs";
import logger from "./middleware/logger";
import { isValidAPI } from "./middleware/shared";
import { multerErrorHandler } from "./utils/cloudinary";
import { corsList } from "./utils/constants";
process.env.DOTENV_LOG = "false";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: corsList,
    methods: ["GET", "POST"],
  },
  path: "/socket.io",
});

const PORT = process.env.PORT || 5000;

// Security Start

// Enable trust proxy
app.set("trust proxy", 1); // '1' means trust the first proxy in the chain

// Limit API requests in specified time
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP. Try again in 15 minutes",
});

app.use(limiter);

// cors
app.use(
  cors({
    origin: corsList,
  }),
);

// Use Helmet!
app.use(helmet());

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

// Logger middleware
app.use(logger);

// base route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to " + PRODUCT_NAME });
});

// API Routes
app.use("/api", isValidAPI, AppRouter);

// Not found route
app.use((req, res) => {
  return sendErrorFeedback(res, 404, "API route not found.");
});

// Error Handling for multer
app.use(multerErrorHandler);

// General Error Handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  sendCatchFeedback(res, err);
});

// Socket connection to express app
socketHandler(io);

httpServer
  .listen(PORT, async () => {
    console.log("Server running at PORT:", PORT);
    await connectMongoDB();
    await AgendaControl.start();
  })
  .on("error", (error) => {
    // gracefully handle error
    console.error("Server failed to start:", error);
    throw new Error(error.message);
  });
