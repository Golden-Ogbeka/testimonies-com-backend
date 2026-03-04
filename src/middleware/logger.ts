import colors from "colors/safe";
import { NextFunction, Request, Response } from "express";
import errorLogger from "./error-logger";

const logger = (req: Request, res: Response, next: NextFunction) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const reqId = req.requestId ? ` [${req.requestId}]` : "";
  let log = "";
  switch (req.method) {
    case "GET":
      log = colors.green(`${req.method} ${fullUrl}${reqId}`);
      break;
    case "POST":
      log = colors.yellow(`${req.method} ${fullUrl}${reqId}`);
      break;
    case "PUT":
      log = colors.blue(`${req.method} ${fullUrl}${reqId}`);
      break;
    case "PATCH":
      log = colors.magenta(`${req.method} ${fullUrl}${reqId}`);
      break;
    case "DELETE":
      log = colors.red(`${req.method} ${fullUrl}${reqId}`);
      break;
    default:
      log = colors.white(`${req.method} ${fullUrl}${reqId}`);
  }
  console.log(log);
  errorLogger.info(`${req.method} ${fullUrl}${reqId}`);
  next();
};

export default logger;
