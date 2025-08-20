import { Client } from "@googlemaps/google-maps-services-js";
import { GOOGLE_MAPS_API_KEY } from "./env";

export const geocodeAddress = async (address: string) => {
  const googleMapClient = new Client({});

  const response = await googleMapClient.geocode({
    params: {
      key: GOOGLE_MAPS_API_KEY!,
      address,
    },
  });

  return response.data.results;
};
