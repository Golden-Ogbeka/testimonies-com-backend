import Agenda from "agenda";
import colors from "colors/safe";
import { generateRandomNumbers } from "../../functions";
import AdminModel from "../../models/admin.model";
import { CRON_JOB_NAMES } from "../data";

export const AdminCronDefinitions = (agenda: Agenda) => {
  // Reset OTP
  agenda.define(
    CRON_JOB_NAMES.RESET_ADMIN_VERIFICATION_CODE,
    async (job, done) => {
      try {
        const { attrs } = job;
        const data = attrs.data as { email: string };
        const userEmail = data.email;

        let existingAdmin = await AdminModel.findOne({ email: userEmail });
        if (existingAdmin) {
          const verificationCode = generateRandomNumbers();

          existingAdmin.verificationCode = verificationCode;

          existingAdmin.save();
        }

        done();
      } catch (error) {
        console.log("CRON:", colors.red(JSON.stringify(error)));
      }
    },
  );
};
