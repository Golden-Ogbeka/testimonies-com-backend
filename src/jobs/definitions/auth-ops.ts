import Agenda from "agenda";
import colors from "colors/safe";
import { getLocationFromIP } from "../../functions/auth";
import AuthSessionModel from "../../models/auth-session.model";
import { CRON_JOB_NAMES } from "../data";

type ResolveIPLocationJobData = {
  sessionId: string;
  ip: string;
};

export const AuthOpsCronDefinitions = (agenda: Agenda) => {
  agenda.define(CRON_JOB_NAMES.RESOLVE_IP_LOCATION, async (job, done) => {
    try {
      const { attrs } = job;
      const data = attrs.data as ResolveIPLocationJobData;

      const location = await getLocationFromIP(data.ip);
      if (!location) {
        done();
        return;
      }

      await AuthSessionModel.findByIdAndUpdate(data.sessionId, {
        city: location.city,
        region: location.region,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      done();
    } catch (error) {
      console.log("CRON:", colors.red(JSON.stringify(error)));
    }
  });
};
