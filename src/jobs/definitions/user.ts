import Agenda from "agenda";
import colors from "colors/safe";
import { generateRandomNumbers } from "../../functions";
import OrganizationModel from "../../models/organization.model";
import UserModel from "../../models/user.model";
import { CRON_JOB_NAMES } from "../data";

export const UserCronDefinitions = (agenda: Agenda) => {
  // Reset OTP
  agenda.define(
    CRON_JOB_NAMES.RESET_USER_VERIFICATION_CODE,
    async (job, done) => {
      try {
        const { attrs } = job;
        const data = attrs.data as { email: string };
        const userEmail = data.email;

        const existingUser =
          (await UserModel.findOne({ email: userEmail })) ||
          (await OrganizationModel.findOne({ businessEmail: userEmail }));
        if (existingUser) {
          const verificationCode = generateRandomNumbers();

          existingUser.verificationCode = verificationCode;

          existingUser.save();
        }

        done();
      } catch (error) {
        console.log("CRON:", colors.red(JSON.stringify(error)));
      }
    },
  );

  // Reset Tried Signup Status
  agenda.define(CRON_JOB_NAMES.RESET_TRIED_SIGNUP_STATUS, async (job, done) => {
    try {
      const { attrs } = job;
      const data = attrs.data as { email: string };
      const userEmail = data.email;

      const existingUser =
        (await UserModel.findOne({ email: userEmail })) ||
        (await OrganizationModel.findOne({ businessEmail: userEmail }));
      if (existingUser) {
        existingUser.triedSignup = false;

        existingUser.save();
      }

      done();
    } catch (error) {
      console.log("CRON:", colors.red(JSON.stringify(error)));
    }
  });

  // Reset Tried Login Status
  agenda.define(CRON_JOB_NAMES.RESET_TRIED_LOGIN_STATUS, async (job, done) => {
    try {
      const { attrs } = job;
      const data = attrs.data as { email: string };
      const userEmail = data.email;

      const existingUser =
        (await UserModel.findOne({ email: userEmail })) ||
        (await OrganizationModel.findOne({ businessEmail: userEmail }));
      if (existingUser) {
        existingUser.triedLogin = false;

        existingUser.save();
      }

      done();
    } catch (error) {
      console.log("CRON:", colors.red(JSON.stringify(error)));
    }
  });

  // Reset Tried Password Reset Status
  agenda.define(
    CRON_JOB_NAMES.RESET_TRIED_PASSWORD_RESET_STATUS,
    async (job, done) => {
      try {
        const { attrs } = job;
        const data = attrs.data as { email: string };
        const userEmail = data.email;

        const existingUser =
          (await UserModel.findOne({ email: userEmail })) ||
          (await OrganizationModel.findOne({ businessEmail: userEmail }));
        if (existingUser) {
          existingUser.triedPasswordReset = false;

          existingUser.save();
        }

        done();
      } catch (error) {
        console.log("CRON:", colors.red(JSON.stringify(error)));
      }
    },
  );
};
