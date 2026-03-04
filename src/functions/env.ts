/**
 * Environment variables loaded from .env via dotenv.
 * All exports are raw process.env values (or derived). Use for PORT, JWT_SECRET, API keys, etc.
 */
import * as dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const JWT_SECRET = process.env.JWT_SECRET;
export const API_KEY = process.env.API_KEY;
export const MONGO_URI = process.env.MONGO_URI;
export const PAGE_LIMIT = process.env.PAGE_LIMIT;
export const OTP_EXPIRY = process.env.OTP_EXPIRY;
export const DEFAULT_JOB_TIMER = process.env.DEFAULT_JOB_TIMER;
export const PRODUCT_NAME = process.env.PRODUCT_NAME;
export const APP_THEME = process.env.APP_THEME;
export const NODE_ENV = process.env.NODE_ENV;

// Email
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT || "587";
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM;
export const EMAIL_API_KEY = process.env.EMAIL_API_KEY;

// Frontend URLs
export const ADMIN_DASHBOARD_URL = process.env.ADMIN_DASHBOARD_URL;
export const WEBSITE_URL = process.env.WEBSITE_URL;
export const CORS_ORIGINS = process.env.CORS_ORIGINS?.trim() ?? "";

/** Public base URL of this API server (e.g. https://api.example.com). Used for startup console links and any absolute URLs. If unset, falls back to http://localhost:PORT. */
export const BASE_URL = (() => {
  const raw = process.env.BASE_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : undefined;
})();

// SMS / Twilio
export const SMS_BASE_URL = process.env.SMS_BASE_URL;
export const SMS_SENDER_ID = process.env.SMS_SENDER_ID;
export const SMS_API_KEY = process.env.SMS_API_KEY;
export const TWILIO_SMS_SENDER_ID = process.env.TWILIO_SMS_SENDER_ID;
export const TWILIO_SMS_API_KEY = process.env.TWILIO_SMS_API_KEY;
export const TWILIO_SMS_PHONE_NUMBER = process.env.TWILIO_SMS_PHONE_NUMBER;

// Cloudinary (profile image upload)
export const CLOUD_NAME = process.env.CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Google APIS
export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// MongoDB Atlas for Search Indexing
export const MONGODB_ATLAS_PROJECT_ID = process.env.MONGODB_ATLAS_PROJECT_ID;
export const MONGODB_ATLAS_CLUSTER = process.env.MONGODB_ATLAS_CLUSTER;
export const MONGODB_ATLAS_PUBLIC_KEY = process.env.MONGODB_ATLAS_PUBLIC_KEY;
export const MONGODB_ATLAS_PRIVATE_KEY = process.env.MONGODB_ATLAS_PRIVATE_KEY;
export const MONGODB_DATABASE = process.env.MONGODB_DATABASE;
export const MONGODB_TEAM_COLLECTION = process.env.MONGODB_TEAM_COLLECTION;
export const MONGODB_SEARCH_INDEX_LIMIT =
  process.env.MONGODB_SEARCH_INDEX_LIMIT;

// OAUTH
export const GOOGLE_OATH_API_KEY = process.env.GOOGLE_OATH_API_KEY;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_AUTH_REDIRECT = process.env.GOOGLE_AUTH_REDIRECT;

// Clock in Distance
export const MAX_CLOCK_IN_DISTANCE = process.env.MAX_CLOCK_IN_DISTANCE;

/** When true and NODE_ENV=production, redirect HTTP to HTTPS (use when not behind a proxy that does this). */
export const ENFORCE_HTTPS_REDIRECT =
  process.env.ENFORCE_HTTPS_REDIRECT === "true" ||
  process.env.ENFORCE_HTTPS_REDIRECT === "1";
