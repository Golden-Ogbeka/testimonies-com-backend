import colors from "colors/safe";
import mongoose from "mongoose";
import { MONGO_URI } from "../functions/env";

const CONNECT_TIMEOUT_MS = 10000;
const SERVER_SELECTION_TIMEOUT_MS = 10000;

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URI!, {
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      connectTimeoutMS: CONNECT_TIMEOUT_MS,
    });
    console.log(colors.green("MongoDB Connected"));
  } catch (error) {
    console.log(colors.red("Couldn't connect to Mongo DB"));
    console.log(error);
  }
};
