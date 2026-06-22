import Agenda from "agenda";
import colors from "colors/safe";
import jwt from "jsonwebtoken";
import AuthSessionModel from "../../models/auth-session.model";
import JobResultModel from "../../models/job-result.model";
import OrganizationModel, {
  IOrganization,
} from "../../models/organization.model";
import UserModel, { IUser } from "../../models/user.model";
import { getGoogleUser } from "../../utils/authentication/google";
import { JWT_SECRET, PRODUCT_NAME } from "../../functions/env";
import { parseUserAgent } from "../../functions/auth";
import { notifyUser } from "../../api/v1/services/notification";
import { AuthOpsCronSchedules } from "../schedules/auth-ops";
import { CRON_JOB_NAMES } from "../data";

export const OAuthCronDefinitions = (agenda: Agenda) => {
  agenda.define(CRON_JOB_NAMES.PROCESS_GOOGLE_OAUTH, async (job, done) => {
    try {
      const { attrs } = job;
      const data = attrs.data as {
        code: string;
        ip: string;
        userAgent: string;
        jobToken: string;
      };

      const oauthUser = await getGoogleUser(data.code);

      if (!oauthUser) {
        await JobResultModel.findOneAndUpdate(
          { token: data.jobToken },
          { status: "failed", errorData: { message: "Login unsuccessful" } },
        );
        done();
        return;
      }

      const { email, firstName, lastName, phoneNumber, picture } = oauthUser;

      if (!email) {
        await JobResultModel.findOneAndUpdate(
          { token: data.jobToken },
          {
            status: "failed",
            errorData: {
              message:
                "Could not retrieve email from google account. Please authenticate manually",
            },
          },
        );
        done();
        return;
      }

      const existingUser: IUser | IOrganization | null =
        (await UserModel.findOne({ email })) ||
        (await OrganizationModel.findOne({ businessEmail: email }));

      if (existingUser) {
        if (!existingUser.active || existingUser.isFlagged) {
          await JobResultModel.findOneAndUpdate(
            { token: data.jobToken },
            {
              status: "failed",
              errorData: { message: "Access Denied. Contact support" },
            },
          );
          done();
          return;
        }

        existingUser.emailIsVerified = true;
        existingUser.triedLogin = false;
        await existingUser.save();

        const token = jwt.sign(
          {
            email:
              (existingUser as IUser).email ||
              (existingUser as IOrganization).businessEmail,
            _id: existingUser._id,
            domain: PRODUCT_NAME,
          },
          JWT_SECRET!,
          { expiresIn: "30d" },
        );

        await notifyUser({
          userDetails: existingUser,
          title: "Login Successful",
          message:
            "You have successfully logged into your account. If you did not perform this action, please contact support immediately.",
          sendEmailNotification: true,
          sendInAppNotification: true,
          type: "general-notification",
        });

        const deviceInfo = data.userAgent
          ? parseUserAgent(data.userAgent)
          : null;

        const session = await AuthSessionModel.create({
          userId: existingUser._id,
          token,
          ipAddress: data.ip,
          userAgent: data.userAgent,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          deviceType: deviceInfo?.deviceType,
          deviceOS: deviceInfo?.os,
          deviceOSVersion: deviceInfo?.osVersion,
          deviceModel: deviceInfo?.model,
          deviceManufacturer: deviceInfo?.manufacturer,
        });

        AuthOpsCronSchedules.resolveIPLocationNow(
          session._id.toString(),
          data.ip,
        );

        await JobResultModel.findOneAndUpdate(
          { token: data.jobToken },
          {
            status: "completed",
            resultData: {
              user: existingUser.toObject(),
              token,
              sessionId: session._id,
            },
          },
        );

        done();
      } else {
        if (phoneNumber) {
          const phoneUser =
            (await UserModel.findOne({ phoneNumber })) ||
            (await OrganizationModel.findOne({
              businessPhoneNumber: phoneNumber,
            }));
          if (phoneUser && phoneUser.email !== email) {
            await JobResultModel.findOneAndUpdate(
              { token: data.jobToken },
              {
                status: "failed",
                errorData: {
                  message:
                    "Phone number is already being used by another account",
                },
              },
            );
            done();
            return;
          }
        }

        const newUser = await UserModel.create({
          email,
          firstName,
          lastName,
          phoneNumber,
          profileImage: picture,
          phoneNumberIsVerified: true,
          emailIsVerified: true,
        });

        const token = jwt.sign(
          { email: newUser.email, _id: newUser._id, domain: PRODUCT_NAME },
          JWT_SECRET!,
          { expiresIn: "30d" },
        );

        await notifyUser({
          userDetails: newUser,
          title: "Login Successful",
          message:
            "You have successfully logged into your account. If you did not perform this action, please contact support immediately.",
          sendEmailNotification: true,
          sendInAppNotification: true,
          type: "general-notification",
        });

        const deviceInfo = data.userAgent
          ? parseUserAgent(data.userAgent)
          : null;

        const session = await AuthSessionModel.create({
          userId: newUser._id,
          token,
          ipAddress: data.ip,
          userAgent: data.userAgent,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          deviceType: deviceInfo?.deviceType,
          deviceOS: deviceInfo?.os,
          deviceOSVersion: deviceInfo?.osVersion,
          deviceModel: deviceInfo?.model,
          deviceManufacturer: deviceInfo?.manufacturer,
        });

        AuthOpsCronSchedules.resolveIPLocationNow(
          session._id.toString(),
          data.ip,
        );

        await JobResultModel.findOneAndUpdate(
          { token: data.jobToken },
          {
            status: "completed",
            resultData: {
              user: newUser.toObject(),
              token,
              sessionId: session._id,
            },
          },
        );

        done();
      }
    } catch (error) {
      console.log("CRON:", colors.red(JSON.stringify(error)));
    }
  });
};
