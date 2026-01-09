import colors from "colors/safe";
import { NextFunction, Request, Response } from "express";
import errorLogger from "./error-logger";

const logger = (req: Request, res: Response, next: NextFunction) => {
  let log = "";
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  switch (req.method) {
    case "GET":
      log = colors.green(`${req.method} ${fullUrl}`);
      break;
    case "POST":
      log = colors.yellow(`${req.method} ${fullUrl}`);
      break;
    case "PUT":
      log = colors.blue(`${req.method} ${fullUrl}`);
      break;
    case "PATCH":
      log = colors.magenta(`${req.method} ${fullUrl}`);
      break;
    case "DELETE":
      log = colors.red(`${req.method} ${fullUrl}`);
      break;
    default:
      log = colors.white(`${req.method} ${fullUrl}`);
      break;
  }

  // Show color log in console
  console.log(log);

  // Save structured log with Winston
  errorLogger.info(`${req.method} ${fullUrl}`);

  next();
};

export default logger;
