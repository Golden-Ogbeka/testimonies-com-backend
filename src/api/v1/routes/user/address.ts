import { Router } from "express";
import { query } from "express-validator";
import { AddressController } from "../../controllers/user/address";

const UserAddressRouter = Router();
const Controller = AddressController();

// Get all addresses
UserAddressRouter.get(
  "/",
  [
    query("address", "Address is required")
      .exists({ checkFalsy: true, checkNull: true })
      .trim(),
  ],
  Controller.GetAddresses,
);

export default UserAddressRouter;
