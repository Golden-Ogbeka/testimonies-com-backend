import express from "express";
import AdminRouter from "./admin";
import UserRouter from "./user";

const V1Router = express.Router();

// Admin Routes
V1Router.use("/admin", AdminRouter);

// User Routes
V1Router.use("/user", UserRouter);

export default V1Router;
