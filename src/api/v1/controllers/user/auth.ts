import bcryptjs from "bcryptjs";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { generateRandomNumbers } from "../../../../functions";
import {
  getLocationFromIP,
  getUserDetails,
  parseUserAgent,
} from "../../../../functions/auth";
import {
  JWT_SECRET,
  OTP_EXPIRY,
  PRODUCT_NAME,
} from "../../../../functions/env";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import { UserCronSchedules } from "../../../../jobs/schedules/user";
import AuthSessionModel from "../../../../models/auth-session.model";
import OrganizationModel, {
  IOrganization,
} from "../../../../models/organization.model";
import UserModel, { IUser } from "../../../../models/user.model";
import {
  getGoogleAuthURL,
  getGoogleUser,
} from "../../../../utils/authentication/google";
import { getPaginationOptions } from "../../../../utils/pagination";
import { notifyUser } from "../../services/notification";

export const UserAuthController = () => {
  const CheckUsername = async (
    req: Request<{ username: string }>,
    res: Response,
  ) => {
    try {
      const { username } = req.params;
      const existingUser =
        (await UserModel.findOne({ username }).lean()) ||
        (await OrganizationModel.findOne({ username }).lean());
      if (existingUser) {
        return sendErrorFeedback(res, 409, "Username already exists.");
      }
      return sendSuccessFeedback(res, "Username is available.", {
        available: true,
        username,
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const SignupOrganization = async (
    req: Request<never, never, IOrganization>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const {
        businessAddress,
        businessEmail,
        businessName,
        businessPhoneNumber,
        username,
        password,
      } = req.body;

      let existingUser =
        (await UserModel.findOne({
          $or: [
            { email: businessEmail },
            { phoneNumber: businessPhoneNumber },
            { username },
          ],
        })) ||
        (await OrganizationModel.findOne({
          $or: [{ businessEmail }, { businessPhoneNumber }, { username }],
        }));

      if (existingUser) {
        const conflictField =
          existingUser.email === businessEmail
            ? "email"
            : existingUser.phoneNumber === businessPhoneNumber
              ? "phoneNumber"
              : "username";
        return sendErrorFeedback(
          res,
          409,
          `An account with this ${conflictField} already exists.`,
        );
      }

      // Hash password
      bcryptjs.hash(password!, 8, async function (err, hash) {
        // let geocodedAddress;
        // let geographicLocationCoordinates: number[] = [];
        // geocodedAddress = await geocodeAddress(businessAddress);

        // if (geocodedAddress && geocodedAddress.length > 0) {
        //   geographicLocationCoordinates = [
        //     geocodedAddress[0].geometry.location.lat,
        //     geocodedAddress[0].geometry.location.lng,
        //   ];
        // }
        let newOrganization = await OrganizationModel.create({
          password: hash,
          businessAddress,
          businessEmail,
          businessName,
          businessPhoneNumber,
          username,
          // businessLocationGeographicCoordinates: geographicLocationCoordinates,
          triedSignup: true,
        });

        await UserCronSchedules.resetTriedSignup(businessEmail);

        return sendSuccessFeedback(
          res,
          "Registration Successful. Verify your account to continue",
          {
            organization: newOrganization,
          },
          201,
        );
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const SignupIndividual = async (
    req: Request<never, never, IUser>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { username, password, email, phoneNumber, firstName, lastName } =
        req.body;

      let existingUser =
        (await UserModel.findOne({
          $or: [{ email }, { phoneNumber }, { username }],
        })) ||
        (await OrganizationModel.findOne({
          $or: [
            { businessEmail: email },
            { businessPhoneNumber: phoneNumber },
            { username },
          ],
        }));

      if (existingUser) {
        const conflictField =
          existingUser.email === email
            ? "email"
            : existingUser.phoneNumber === phoneNumber
              ? "phoneNumber"
              : "username";
        return sendErrorFeedback(
          res,
          409,
          `An account with this ${conflictField} already exists.`,
        );
      }

      // Hash password
      bcryptjs.hash(password!, 8, async function (err, hash) {
        let newUser = await UserModel.create({
          password: hash,
          email,
          phoneNumber,
          username,
          firstName,
          lastName,
          triedSignup: true,
        });

        await UserCronSchedules.resetTriedSignup(email);

        return sendSuccessFeedback(
          res,
          "Registration Successful. Verify your account to continue",
          {
            user: newUser,
          },
          201,
        );
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const SendSignupOTP = async (
    req: Request<never, never, { email: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { email } = req.body;

      // find user
      const existingUser =
        (await UserModel.findOne({
          email,
          active: true,
          isFlagged: false,
        })) ||
        (await OrganizationModel.findOne({
          businessEmail: email,
          active: true,
          isFlagged: false,
        }));
      if (!existingUser)
        return sendErrorFeedback(res, 404, "User doesn't exist");

      if (!existingUser.triedSignup) {
        return sendErrorFeedback(res, 400, "An error occurred. Try logging in");
      }

      if (existingUser.emailIsVerified) {
        return sendErrorFeedback(res, 400, "Email is already verified");
      }

      // change Token
      const verificationCode = generateRandomNumbers();

      existingUser.verificationCode = verificationCode;

      await existingUser.save();

      // Send OTP
      await notifyUser({
        sendEmailNotification: true,
        title: "Verify Account",
        userDetails: existingUser,
        message: `Use <b>${existingUser.verificationCode}</b> as your OTP<br />OTP expires ${OTP_EXPIRY}`,
      });

      await UserCronSchedules.resetOTP(email);

      return sendSuccessFeedback(res, "Verification code sent to email");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const VerifySignupOTP = async (
    req: Request<never, never, { verificationCode: string; email: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { verificationCode, email } = req.body;

      // find user
      const existingUser =
        (await UserModel.findOne({
          email,
          active: true,
          isFlagged: false,
          verificationCode,
        })) ||
        (await OrganizationModel.findOne({
          businessEmail: email,
          active: true,
          isFlagged: false,
          verificationCode,
        }));
      if (!existingUser)
        return sendErrorFeedback(res, 400, "Invalid or expired OTP");

      if (!existingUser.triedSignup) {
        return sendErrorFeedback(res, 400, "An error occurred. Try logging in");
      }

      // change Token
      const newVerificationCode = generateRandomNumbers();

      existingUser.verificationCode = newVerificationCode;
      existingUser.emailIsVerified = true;
      existingUser.triedSignup = false;

      await existingUser.save();
      // Generate JWT Token
      return sendSuccessFeedback(
        res,
        "Verification Successful. Proceed to login",
        {
          user: existingUser,
        },
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ResendSignupOTP = async (
    req: Request<never, never, { email: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { email } = req.body;

      // find user
      const existingUser =
        (await UserModel.findOne({
          email,
          active: true,
          isFlagged: false,
        })) ||
        (await OrganizationModel.findOne({
          businessEmail: email,
          active: true,
          isFlagged: false,
        }));
      if (!existingUser)
        return sendErrorFeedback(res, 404, "User doesn't exist");

      if (!existingUser.triedSignup) {
        return sendErrorFeedback(res, 400, "An error occurred. Try logging in");
      }

      if (existingUser.emailIsVerified)
        return sendErrorFeedback(res, 400, "Email is already verified");

      // change Token
      const verificationCode = generateRandomNumbers();

      existingUser.verificationCode = verificationCode;

      await existingUser.save();

      // Send OTP
      await notifyUser({
        sendEmailNotification: true,
        title: "Verify Account",
        userDetails: existingUser,
        message: `Use <b>${existingUser.verificationCode}</b> as your OTP<br />OTP expires ${OTP_EXPIRY}`,
      });

      await UserCronSchedules.resetOTP(email);

      return sendSuccessFeedback(res, "Verification code sent to email");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const Signin = async (
    req: Request<never, never, { password: string; email: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { password, email } = req.body;
      let existingUser: IUser | null = null;

      // find user
      existingUser =
        (await UserModel.findOne({
          email,
          active: true,
          isFlagged: false,
        })) ||
        (await OrganizationModel.findOne({
          businessEmail: email,
          active: true,
          isFlagged: false,
        }));

      if (!existingUser)
        return sendErrorFeedback(res, 400, "Invalid user details");

      // compare passwords
      bcryptjs.compare(
        password,
        existingUser.password!,
        async function (err, matched) {
          if (!matched)
            return sendErrorFeedback(res, 400, "Invalid user details");

          // Check for unverified users
          if (!existingUser.emailIsVerified) {
            // Send OTP
            await notifyUser({
              sendEmailNotification: true,
              title: "Verify Account",
              userDetails: existingUser,
              message: `Use <b>${existingUser.verificationCode}</b> as your OTP<br />OTP expires ${OTP_EXPIRY}`,
            });
            existingUser.triedLogin = true;
            existingUser.lastLoginAttempt = new Date();

            await existingUser.save();

            await UserCronSchedules.resetTriedLogin(existingUser.email);

            await UserCronSchedules.resetOTP(existingUser.email);

            return sendErrorFeedback(
              res,
              401,
              "You need to verify your account to continue",
              {
                user: existingUser,
              },
            );
          }

          existingUser.triedLogin = true;
          await existingUser.save();

          await UserCronSchedules.resetTriedLogin(existingUser.email);

          return sendSuccessFeedback(
            res,
            "Login Successful. Enter the OTP sent to your email to continue",
            {
              user: existingUser,
            },
          );
        },
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const SendSigninOTP = async (
    req: Request<never, never, { email: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { email } = req.body;

      // find user
      const existingUser =
        (await UserModel.findOne({
          email,
          active: true,
          isFlagged: false,
        })) ||
        (await OrganizationModel.findOne({
          businessEmail: email,
          active: true,
          isFlagged: false,
        }));
      if (!existingUser)
        return sendErrorFeedback(res, 404, "User doesn't exist");

      if (!existingUser.triedLogin) {
        return sendErrorFeedback(
          res,
          400,
          "An error occurred. Try logging in again",
        );
      }

      // change Token
      const verificationCode = generateRandomNumbers();

      existingUser.verificationCode = verificationCode;

      await existingUser.save();

      // Send OTP
      await notifyUser({
        sendEmailNotification: true,
        title: "Verify Account",
        userDetails: existingUser,
        message: `Use <b>${existingUser.verificationCode}</b> as your OTP<br />OTP expires ${OTP_EXPIRY}`,
      });

      await UserCronSchedules.resetOTP(email);

      return sendSuccessFeedback(res, "Verification code sent to email");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const VerifySigninOTP = async (
    req: Request<never, never, { verificationCode: string; email: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { verificationCode, email } = req.body;

      // find user
      const existingUser: IUser | IOrganization | null =
        (await UserModel.findOne({
          email,
          active: true,
          isFlagged: false,
          verificationCode,
        })) ||
        (await OrganizationModel.findOne({
          businessEmail: email,
          active: true,
          isFlagged: false,
          verificationCode,
        }));
      if (!existingUser)
        return sendErrorFeedback(res, 400, "Invalid or expired OTP");

      if (!existingUser.triedLogin) {
        return sendErrorFeedback(
          res,
          400,
          "An error occurred. Try logging in again",
        );
      }

      // change Token
      const newVerificationCode = generateRandomNumbers();

      existingUser.verificationCode = newVerificationCode;
      existingUser.emailIsVerified = true;
      existingUser.triedLogin = false;

      await existingUser.save();
      // Generate JWT Token
      jwt.sign(
        {
          email:
            existingUser.toJSON().email || existingUser.toJSON().businessEmail,
          _id: existingUser.toJSON()._id,
          domain: PRODUCT_NAME,
        },
        JWT_SECRET!,
        { expiresIn: "30d" },
        async (err, token) => {
          await notifyUser({
            userDetails: existingUser,
            title: "Login Successful",
            message: `You have successfully logged into your account. If you did not perform this action, please contact support immediately.`,
            sendEmailNotification: true,
            sendInAppNotification: true,
            type: "general-notification",
          });

          // Create a new session for user
          const deviceInfo = req.headers["user-agent"]
            ? parseUserAgent(req.headers["user-agent"])
            : null;
          const locationInfo = await getLocationFromIP(req.ip);

          const session = await AuthSessionModel.create({
            userId: existingUser._id,
            token,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            city: locationInfo?.city,
            region: locationInfo?.region,
            country: locationInfo?.country,
            latitude: locationInfo?.latitude,
            longitude: locationInfo?.longitude,
            deviceType: deviceInfo?.deviceType,
            deviceOS: deviceInfo?.os,
            deviceOSVersion: deviceInfo?.osVersion,
            deviceModel: deviceInfo?.model,
            deviceManufacturer: deviceInfo?.manufacturer,
          });

          // Set login time variables
          existingUser.lastSuccessfulLogin = new Date();
          existingUser.lastLoginAttempt = new Date();

          await existingUser.save();
          return sendSuccessFeedback(res, "Login Successful", {
            user: existingUser,
            token,
            sessionId: session._id,
          });
        },
      );
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ResendSigninOTP = async (
    req: Request<never, never, { email: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { email } = req.body;

      // find user
      const existingUser =
        (await UserModel.findOne({
          email,
          active: true,
          isFlagged: false,
        })) ||
        (await OrganizationModel.findOne({
          businessEmail: email,
          active: true,
          isFlagged: false,
        }));
      if (!existingUser)
        return sendErrorFeedback(res, 404, "User doesn't exist");

      if (!existingUser.triedLogin) {
        return sendErrorFeedback(
          res,
          400,
          "An error occurred. Try logging in again",
        );
      }

      // change Token
      const verificationCode = generateRandomNumbers();

      existingUser.verificationCode = verificationCode;

      await existingUser.save();

      // Send OTP
      await notifyUser({
        sendEmailNotification: true,
        title: "Verify Account",
        userDetails: existingUser,
        message: `Use <b>${existingUser.verificationCode}</b> as your OTP<br />OTP expires ${OTP_EXPIRY}`,
      });

      await UserCronSchedules.resetOTP(email);

      return sendSuccessFeedback(res, "Verification code sent to email");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const ResetPassword = async (
    req: Request<never, never, { email: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { email } = req.body;

      // check if user exists
      let existingUser =
        (await UserModel.findOne({
          email,
          active: true,
          isFlagged: false,
        })) ||
        (await OrganizationModel.findOne({
          businessEmail: email,
          active: true,
          isFlagged: false,
        }));
      if (!existingUser) return sendErrorFeedback(res, 400, "Invalid Email");

      const verificationCode = generateRandomNumbers();

      existingUser.verificationCode = verificationCode;
      existingUser.triedPasswordReset = true;

      await existingUser.save();

      await UserCronSchedules.resetTriedPasswordReset(existingUser.email);

      await notifyUser({
        sendEmailNotification: true,
        title: "Reset Password",
        userDetails: existingUser,
        message: `Use <b>${existingUser.verificationCode}</b> as your OTP<br />OTP expires ${OTP_EXPIRY}`,
      });

      await UserCronSchedules.resetOTP(email);

      return sendSuccessFeedback(res, "Reset password request successful");
    } catch (error: any) {
      sendCatchFeedback(res, error);
    }
  };

  const ResendResetPasswordOTP = async (
    req: Request<never, never, { email: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { email } = req.body;

      // check if user exists
      let existingUser =
        (await UserModel.findOne({
          email,
          active: true,
          isFlagged: false,
        })) ||
        (await OrganizationModel.findOne({
          businessEmail: email,
          active: true,
          isFlagged: false,
        }));
      if (!existingUser) return sendErrorFeedback(res, 400, "Invalid Email");

      if (!existingUser.triedPasswordReset) {
        return sendErrorFeedback(
          res,
          400,
          "An error occurred. Try resetting your password again",
        );
      }

      const verificationCode = generateRandomNumbers();

      existingUser.verificationCode = verificationCode;

      await existingUser.save();

      await notifyUser({
        sendEmailNotification: true,
        title: "Reset Password",
        userDetails: existingUser,
        message: `Use <b>${existingUser.verificationCode}</b> as your OTP<br />OTP expires ${OTP_EXPIRY}`,
      });

      await UserCronSchedules.resetOTP(email);

      return sendSuccessFeedback(res, "OTP resent successfully");
    } catch (error: any) {
      sendCatchFeedback(res, error);
    }
  };

  const ResetPasswordUpdate = async (
    req: Request<
      never,
      never,
      { email: string; newPassword: string; verificationCode: string }
    >,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { email, newPassword, verificationCode } = req.body;

      // check if user exists
      let existingUser =
        (await UserModel.findOne({
          email,
          verificationCode,
          active: true,
          isFlagged: false,
        })) ||
        (await OrganizationModel.findOne({
          businessEmail: email,
          verificationCode,
          active: true,
          isFlagged: false,
        }));

      if (!existingUser)
        return sendErrorFeedback(res, 400, "Invalid email or OTP");

      if (!existingUser.triedPasswordReset)
        return sendErrorFeedback(
          res,
          400,
          "An error occurred. Try resetting your password again",
        );

      // Hash password
      bcryptjs.hash(newPassword, 8, async function (err, hash) {
        const verificationCode = generateRandomNumbers();

        existingUser.password = hash!;
        existingUser.verificationCode = verificationCode; //resetting the verification code also
        await existingUser.save();

        await notifyUser({
          sendEmailNotification: true,
          title: "Reset password update",
          userDetails: existingUser,
          message:
            "You have successfully reset your password. If you did not request a password reset, please contact support",
        });

        return sendSuccessFeedback(res, "Password updated successfully");
      });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GoogleAuth = async (req: Request, res: Response) => {
    try {
      const URL = getGoogleAuthURL();
      return sendSuccessFeedback(res, "OAuth URL Retrieved", { URL });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GoogleOAuthCallback = async (req: Request, res: Response) => {
    try {
      const oauthUser = await getGoogleUser(req.body.code);

      if (!oauthUser) return sendErrorFeedback(res, 400, "Login unsuccessful");

      const { email, firstName, lastName, phoneNumber, picture } = oauthUser;
      // Check for required fields
      if (!email)
        return sendErrorFeedback(
          res,
          400,
          "Could not retrieve email from google account. Please authenticate manually",
        );

      const existingUser: IUser | IOrganization | null =
        (await UserModel.findOne({ email })) ||
        (await OrganizationModel.findOne({ businessEmail: email }));

      // Login
      if (existingUser) {
        // Check if user is activated
        if (!existingUser.active || existingUser.isFlagged) {
          return sendErrorFeedback(res, 400, "Access Denied. Contact support");
        }

        // Login
        if (existingUser) {
          // Check if user is activated
          if (!existingUser.active || existingUser.isFlagged) {
            return sendErrorFeedback(
              res,
              400,
              "Access Denied. Contact support",
            );
          }

          // Update user details email
          existingUser.emailIsVerified = true;
          existingUser.triedLogin = false;

          await existingUser.save();

          // If user already exists
          jwt.sign(
            {
              email:
                (existingUser as IUser).email ||
                (existingUser as IOrganization).businessEmail,
              _id: existingUser._id,
              domain: PRODUCT_NAME,
            },
            JWT_SECRET!,
            { expiresIn: "30d" },
            async (err, token) => {
              await notifyUser({
                userDetails: existingUser,
                title: "Login Successful",
                message: `You have successfully logged into your account. If you did not perform this action, please contact support immediately.`,
                sendEmailNotification: true,
                sendInAppNotification: true,
                type: "general-notification",
              });

              // Create a new session for user
              const deviceInfo = req.headers["user-agent"]
                ? parseUserAgent(req.headers["user-agent"])
                : null;
              const locationInfo = await getLocationFromIP(req.ip);

              const session = await AuthSessionModel.create({
                userId: existingUser._id,
                token,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                city: locationInfo?.city,
                region: locationInfo?.region,
                country: locationInfo?.country,
                latitude: locationInfo?.latitude,
                longitude: locationInfo?.longitude,
                deviceType: deviceInfo?.deviceType,
                deviceOS: deviceInfo?.os,
                deviceOSVersion: deviceInfo?.osVersion,
                deviceModel: deviceInfo?.model,
                deviceManufacturer: deviceInfo?.manufacturer,
              });

              return sendSuccessFeedback(res, "Login Successful", {
                user: existingUser,
                token,
                sessionId: session._id,
              });
            },
          );
        }
        // Register
        else {
          if (phoneNumber) {
            const existingUser =
              (await UserModel.findOne({ phoneNumber })) ||
              (await OrganizationModel.findOne({
                businessPhoneNumber: phoneNumber,
              }));
            if (existingUser && existingUser.email !== email)
              return sendErrorFeedback(
                res,
                400,
                "Phone number is already being used by another account",
              );
          }

          let newUser = await UserModel.create({
            email,
            firstName,
            lastName,
            phoneNumber,
            profileImage: picture,
            phoneNumberIsVerified: true,
            emailIsVerified: true,
          });

          jwt.sign(
            { email: newUser.email, _id: newUser._id, domain: PRODUCT_NAME },
            JWT_SECRET!,
            { expiresIn: "30d" },
            async (err, token) => {
              await notifyUser({
                userDetails: newUser,
                title: "Login Successful",
                message: `You have successfully logged into your account. If you did not perform this action, please contact support immediately.`,
                sendEmailNotification: true,
                sendInAppNotification: true,
                type: "general-notification",
              });

              // Create a new session for user
              const deviceInfo = req.headers["user-agent"]
                ? parseUserAgent(req.headers["user-agent"])
                : null;
              const locationInfo = await getLocationFromIP(req.ip);

              const session = await AuthSessionModel.create({
                userId: newUser._id,
                token,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                city: locationInfo?.city,
                region: locationInfo?.region,
                country: locationInfo?.country,
                latitude: locationInfo?.latitude,
                longitude: locationInfo?.longitude,
                deviceType: deviceInfo?.deviceType,
                deviceOS: deviceInfo?.os,
                deviceOSVersion: deviceInfo?.osVersion,
                deviceModel: deviceInfo?.model,
                deviceManufacturer: deviceInfo?.manufacturer,
              });
              return sendSuccessFeedback(res, "Registration Successful", {
                user: newUser,
                token,
                sessionId: session._id,
              });
            },
          );
        }
      }
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetSessions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const paginationOptions = getPaginationOptions(req as any);

      const userDetails = await getUserDetails(req as any);
      const sessions = await AuthSessionModel.paginate(
        {
          userId: userDetails._id,
        },
        paginationOptions,
      );

      return sendSuccessFeedback(res, "Sessions retrieved", { sessions });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const GetSession = async (
    req: Request<{ sessionId: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);
      const session = await AuthSessionModel.findOne({
        userId: userDetails._id,
        _id: req.params.sessionId,
      }).lean();

      return sendSuccessFeedback(res, "Sessions retrieved", { session });
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteAllOtherSessions = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);
      const userDetails = await getUserDetails(req as any);

      const token = req.headers.authorization as string | undefined;

      if (!token) return sendErrorFeedback(res, 400, "Unauthorized");

      await AuthSessionModel.deleteMany({
        userId: userDetails._id,
        token: { $ne: token },
      });

      return sendSuccessFeedback(res, "All other sessions have been deleted");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const DeleteSession = async (
    req: Request<{ sessionId: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);
      const token = req.headers.authorization as string | undefined;

      if (!token) return sendErrorFeedback(res, 400, "Unauthorized");

      const { sessionId } = req.params;

      const sessionDetails = await AuthSessionModel.findOne({
        userId: userDetails._id,
        _id: sessionId,
      }).lean();

      if (!sessionDetails)
        return sendErrorFeedback(res, 400, "Session not found");

      if (sessionDetails.token === token)
        return sendErrorFeedback(res, 400, "Cannot delete current session");

      await AuthSessionModel.deleteOne({
        userId: userDetails._id,
        _id: req.params.sessionId,
      });

      return sendSuccessFeedback(res, "Session deleted");
    } catch (error) {
      return sendCatchFeedback(
        res,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  return {
    SignupOrganization,
    SignupIndividual,
    SendSignupOTP,
    VerifySignupOTP,
    ResendSignupOTP,
    Signin,
    SendSigninOTP,
    VerifySigninOTP,
    ResendSigninOTP,
    ResetPassword,
    ResetPasswordUpdate,
    GoogleAuth,
    GoogleOAuthCallback,
    GetSessions,
    DeleteAllOtherSessions,
    DeleteSession,
    CheckUsername,
    GetSession,
    ResendResetPasswordOTP,
  };
};
