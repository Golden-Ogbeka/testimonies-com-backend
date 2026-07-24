import { CORS_ORIGINS } from "../functions/env";

export const corsList: string[] = CORS_ORIGINS
  ? CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : [
      "http://localhost:3000",
      "http://localhost:56266", // flutter web
    ]; // fallback if CORS_ORIGINS is not set
