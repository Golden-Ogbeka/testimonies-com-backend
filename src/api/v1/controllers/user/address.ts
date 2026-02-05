import { Client } from "@googlemaps/google-maps-services-js";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { GOOGLE_MAPS_API_KEY } from "../../../../functions/env";
import {
  sendCatchFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";

export const AddressController = () => {
  const GetAddresses = async (
    req: Request<never, never, never, { address: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const googleMapClient = new Client({});

      const response = await googleMapClient.placeAutocomplete({
        params: {
          key: GOOGLE_MAPS_API_KEY!,
          input: req.query.address,
        },
      });

      return sendSuccessFeedback(res, "Addresses retrieved", {
        addresses: response.data.predictions.map((item) => ({
          address: item.description,
          id: item.place_id,
        })),
      });
    } catch (error) {
      return sendCatchFeedback(res, error instanceof Error ? error : new Error(String(error)));
    }
  };

  return {
    GetAddresses,
  };
};
