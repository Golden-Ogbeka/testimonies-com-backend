import { CORS_ORIGINS } from "../functions/env";

export const corsList: string[] = CORS_ORIGINS
  ? CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : [
      "http://localhost:3000",
      "http://localhost:56266", // flutter web
      "https://testimonies-com-web-admin.vercel.app/", // admin
      "https://testimonies-com-web.vercel.app/", // user
    ]; // fallback if CORS_ORIGINS is not set
