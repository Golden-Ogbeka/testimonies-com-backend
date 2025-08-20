import colors from "colors/safe";
import { NextFunction, Request, Response } from "express";

const logger = (req: Request, res: Response, next: NextFunction) => {
  let log = "";
  switch (req.method) {
    case "GET":
      log = colors.green(
        `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`,
      );
      break;
    case "POST":
      log = colors.yellow(
        `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`,
      );
      break;
    case "PUT":
      log = colors.blue(
        `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`,
      );
      break;
    case "PATCH":
      log = colors.magenta(
        `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`,
      );
      break;
    case "DELETE":
      log = colors.red(
        `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`,
      );
      break;
    default:
      log = colors.white(
        `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`,
      );
      break;
  }

  console.log(log);
  next();
};

export default logger;
