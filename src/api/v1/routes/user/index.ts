import { Router } from "express";
import { UserController } from "../../controllers/user";

const UserRouter = Router();
const Controller = UserController();

export default UserRouter;
