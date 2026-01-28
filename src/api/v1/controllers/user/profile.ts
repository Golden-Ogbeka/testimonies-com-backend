import bcryptjs from "bcryptjs";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { escapeRegex, generateRandomNumbers } from "../../../../functions";
import {
  getLocationFromIP,
  getUserDetails,
  parseUserAgent,
} from "../../../../functions/auth";
import {
  JWT_SECRET,
  OTP_EXPIRY,
  PRODUCT_NAME,
  WEBSITE_URL,
} from "../../../../functions/env";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../../functions/feedback";
import { UserCronSchedules } from "../../../../jobs/schedules/user";
import AuthSessionModel from "../../../../models/auth-session.model";
import FollowRequestModel from "../../../../models/follow-request.model";
import OrganizationModel, {
  IOrganization,
} from "../../../../models/organization.model";
import UserBlockModel from "../../../../models/user-block.model";
import UserModel, { IUser } from "../../../../models/user.model";
import { getPaginationOptions } from "../../../../utils/pagination";
import { notifyUser } from "../../services/notification";

export const UserProfileController = () => {
  const GetProfile = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req);

      if (!userDetails) return sendErrorFeedback(res, 400, "Profile not found");

      return sendSuccessFeedback(res, "Profile retrieved", { userDetails });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateProfile = async (
    req: Request<never, never, IUser>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = (await getUserDetails(req as any)) as IUser;

      const { firstName, lastName, bio, address } = req.body;

      userDetails.firstName = firstName || userDetails.firstName;
      userDetails.lastName = lastName || userDetails.lastName;
      userDetails.bio = bio || userDetails.bio;
      userDetails.address = address || userDetails.address;

      await userDetails.save();

      return sendSuccessFeedback(res, "Profile updated", { user: userDetails });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateUserEmail = async (
    req: Request<never, never, { email: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { email } = req.body;

      if (
        (userDetails.accountType === "user" && email === userDetails?.email) ||
        (userDetails.accountType === "organization" &&
          email === userDetails?.businessEmail)
      )
        return sendErrorFeedback(res, 400, "Enter a different email to update");

      const user =
        (await UserModel.findOne({
          email,
          _id: { $ne: userDetails?._id },
        })) ||
        (await OrganizationModel.findOne({
          businessEmail: email,
          _id: { $ne: userDetails?._id },
        }));

      if (user) {
        return sendErrorFeedback(res, 400, "Email is already in use");
      }

      const existingUser: IUser | IOrganization | null =
        (await UserModel.findById(userDetails?._id)) ||
        (await OrganizationModel.findById(userDetails?._id));
      if (!existingUser)
        return sendErrorFeedback(res, 400, "Profile not found");

      if (existingUser.accountType === "user") {
        existingUser.email = email;
      } else {
        existingUser.businessEmail = email;
      }

      existingUser.emailIsVerified = false;
      existingUser.triedLogin = true; // use login variable for new email verification flow
      const verificationCode = generateRandomNumbers();

      existingUser.verificationCode = verificationCode;

      await existingUser.save();

      await UserCronSchedules.resetOTP(email);
      await UserCronSchedules.resetTriedLogin(email);

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

          await notifyUser({
            sendEmailNotification: true,
            title: "Email Change Verification",
            userDetails: existingUser,
            message: `Use <b>${existingUser.verificationCode}</b> as your OTP<br />OTP expires ${OTP_EXPIRY}`,
          });

          return sendSuccessFeedback(
            res,
            "Email updated successfully.Verification code sent",
            {
              user: existingUser,
              token,
              sessionId: session._id,
            },
          );
        },
      );
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const ResendUpdateEmailOTP = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      if (!userDetails.triedLogin) {
        return sendErrorFeedback(
          res,
          400,
          "An error occurred. Try logging in again",
        );
      }

      // change Token
      const verificationCode = generateRandomNumbers();

      userDetails.verificationCode = verificationCode;

      await userDetails.save();

      // Send OTP
      await notifyUser({
        sendEmailNotification: true,
        title: "Email Change Verification",
        userDetails: userDetails,
        message: `Use <b>${userDetails.verificationCode}</b> as your OTP<br />OTP expires ${OTP_EXPIRY}`,
      });

      await UserCronSchedules.resetOTP(
        (userDetails as IUser).email ||
          (userDetails as IOrganization).businessEmail,
      );

      return sendSuccessFeedback(res, "Verification code sent to email");
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const VerifyUpdateEmail = async (
    req: Request<never, never, { verificationCode: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { verificationCode } = req.body;

      const userDetails = await getUserDetails(req as any);

      if (!userDetails.triedLogin) {
        return sendErrorFeedback(
          res,
          400,
          "An error occurred. Try logging in again",
        );
      }

      if (verificationCode !== userDetails.verificationCode) {
        return sendErrorFeedback(res, 400, "Invalid OTP");
      }

      // change Token
      const newVerificationCode = generateRandomNumbers();

      userDetails.verificationCode = newVerificationCode;
      userDetails.emailIsVerified = true;
      userDetails.triedLogin = false;

      await userDetails.save();

      await notifyUser({
        userDetails,
        title: "Email Change Successful",
        message: `Your email has been successfully changed to ${(userDetails as IUser).email || (userDetails as IOrganization).businessEmail}.`,
        sendEmailNotification: true,
        sendInAppNotification: true,
        type: "general-notification",
      });

      return sendSuccessFeedback(res, "Email verified successfully", {
        user: userDetails,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateUserUsername = async (
    req: Request<never, never, { username: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { username } = req.body;

      if (userDetails.username === username) {
        return sendErrorFeedback(
          res,
          400,
          "Enter a different username to update",
        );
      }

      const existingUser =
        (await UserModel.findOne({
          username,
          _id: { $ne: userDetails?._id },
        })) ||
        (await OrganizationModel.findOne({
          username,
          _id: { $ne: userDetails?._id },
        }));

      if (existingUser) {
        return sendErrorFeedback(res, 400, "Username already exists");
      }

      userDetails.username = username;

      await userDetails.save();

      return sendSuccessFeedback(res, "Username updated successfully", {
        user: userDetails,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };
  const UpdateUserPhoneNumber = async (
    req: Request<never, never, { phoneNumber: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { phoneNumber } = req.body;

      if (
        (userDetails as IUser).phoneNumber === phoneNumber ||
        (userDetails as IOrganization).businessPhoneNumber === phoneNumber
      ) {
        return sendErrorFeedback(
          res,
          400,
          "Enter a different phone number to update",
        );
      }

      const existingUser =
        (await UserModel.findOne({
          phoneNumber,
          _id: { $ne: userDetails?._id },
        })) ||
        (await OrganizationModel.findOne({
          businessPhoneNumber: phoneNumber,
          _id: { $ne: userDetails?._id },
        }));

      if (existingUser) {
        return sendErrorFeedback(res, 400, "Phone number already exists");
      }

      if (userDetails.accountType === "user") {
        userDetails.phoneNumber = phoneNumber;
      } else {
        userDetails.businessPhoneNumber = phoneNumber;
      }

      userDetails.phoneNumberIsVerified = false;
      await userDetails.save();

      return sendSuccessFeedback(res, "Phone number updated successfully", {
        user: userDetails,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateOrganizationProfile = async (
    req: Request<never, never, IOrganization>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = (await getUserDetails(req as any)) as IOrganization;

      const { businessName, businessAddress, businessWebsite, businessBio } =
        req.body;

      userDetails.businessName = businessName || userDetails.businessName;
      userDetails.businessWebsite =
        businessWebsite || userDetails.businessWebsite;
      userDetails.businessBio = businessBio || userDetails.businessBio;
      userDetails.businessAddress =
        businessAddress || userDetails.businessAddress;

      await userDetails.save();

      return sendSuccessFeedback(res, "Profile updated", { user: userDetails });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdatePassword = async (
    req: Request<
      never,
      never,
      {
        oldPassword: string;
        newPassword: string;
      }
    >,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { oldPassword, newPassword } = req.body;

      if (!(await bcryptjs.compare(oldPassword, userDetails.password!))) {
        return sendErrorFeedback(res, 400, "Old password is incorrect");
      }

      const hashedNewPassword = await bcryptjs.hash(newPassword, 10);

      userDetails.password = hashedNewPassword;

      await userDetails.save();

      return sendSuccessFeedback(res, "Password updated successfully", {
        user: userDetails,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const DeleteProfile = async (
    req: Request<never, never, { password: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { password } = req.body;

      const userDetails = await getUserDetails(req as any);

      const dbUserDetails =
        (await UserModel.findById(userDetails._id)) ||
        (await OrganizationModel.findById(userDetails._id));

      if (!dbUserDetails)
        return sendErrorFeedback(res, 400, "Profile not found");

      if (!(await bcryptjs.compare(password, dbUserDetails.password!))) {
        return sendErrorFeedback(res, 400, "Password is incorrect");
      }

      if (dbUserDetails.accountType === "user") {
        await UserModel.findByIdAndDelete(userDetails._id);
      } else {
        await OrganizationModel.findByIdAndDelete(userDetails._id);
      }

      return sendSuccessFeedback(res, "Profile deleted successfully", {
        user: dbUserDetails,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateProfilePicture = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const profilePhoto: Express.Multer.File | undefined = req.file;

      if (!profilePhoto || profilePhoto.fieldname !== "profilePhoto")
        return sendErrorFeedback(res, 400, "Please upload a profile photo");

      const userDetails = await getUserDetails(req as any);

      if (userDetails.accountType === "user") {
        userDetails.profileImage = profilePhoto.path;
      }
      if (userDetails.accountType === "organization") {
        userDetails.businessLogoURL = profilePhoto.path;
      }

      await userDetails.save();

      return sendSuccessFeedback(res, "Profile image updated", {
        user: userDetails,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateCoverPhoto = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const coverImage: Express.Multer.File | undefined = req.file;

      if (!coverImage || coverImage.fieldname !== "coverImage")
        return sendErrorFeedback(res, 400, "Please upload a cover image");

      const userDetails = await getUserDetails(req as any);

      userDetails.coverImageURL = coverImage.path; // both users and organizations use the same cover image field

      await userDetails.save();

      return sendSuccessFeedback(res, "Cover image updated", {
        user: userDetails,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  // ⚠️ PUBLIC ENDPOINT
  const GetProfileByUsername = async (
    req: Request<
      never,
      never,
      never,
      {
        username: string;
      }
    >,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { username } = req.query;

      const userDetails =
        (await UserModel.findOne({
          username,
          active: true,
          isFlagged: false,
          profileVisibility: { $in: ["public", "private"] },
          // since this endpoint is public, only public and private profiles to be fetched
        })
          .select(
            "username firstName lastName profileImage coverImageURL accountType bio -_id",
          )
          .lean()) ||
        (await OrganizationModel.findOne({
          username,
          active: true,
          isFlagged: false,
          profileVisibility: { $in: ["public", "private"] },
          // since this endpoint is public, only public and private profiles to be fetched
        })
          .select(
            "username businessName businessAddress businessBio businessWebsite businessLogoURL coverImageURL accountType -_id",
          )
          .lean());

      if (!userDetails) return sendErrorFeedback(res, 400, "Profile not found");

      return sendSuccessFeedback(res, "Profile found", {
        user: userDetails,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetProfileById = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      // check if user is blocked
      const loggedInUser = await getUserDetails(req as any);

      const isBlocked = await UserBlockModel.findOne({
        userBlockingId: id,
        userToBlockId: loggedInUser._id,
      });

      if (isBlocked) {
        return sendErrorFeedback(
          res,
          403,
          "You are not allowed to view this profile",
        );
      }

      const isFollowing = await FollowRequestModel.findOne({
        leaderId: id,
        followerId: loggedInUser._id,
        status: "accepted",
      });

      const userDetails =
        (await UserModel.findOne({
          _id: id,
          active: true,
          isFlagged: false,
          ...(isFollowing
            ? { profileVisibility: { $in: ["public", "private"] } }
            : {
                profileVisibility: "public", // if user is not following, only public profiles to be fetched
              }),
        }).select(
          "-emailIsVerified -phoneNumberIsVerified -ntfToken -subscriptionType -kycCompleted -isFlagged -triedLogin -triedPasswordReset -lastLoginAttempt -lastSuccessfulLogin -triedSignup -active",
        )) ||
        (await OrganizationModel.findOne({
          _id: id,
          active: true,
          isFlagged: false,
          ...(isFollowing
            ? { profileVisibility: { $in: ["public", "private"] } }
            : {
                profileVisibility: "public", // if user is not following, only public profiles to be fetched
              }),
        }).select(
          "-emailIsVerified -phoneNumberIsVerified -ntfToken -kycCompleted -isFlagged -triedLogin -triedPasswordReset -lastLoginAttempt -lastSuccessfulLogin -triedSignup -active",
        ));

      if (!userDetails) return sendErrorFeedback(res, 400, "Profile not found");

      return sendSuccessFeedback(res, "Profile found", {
        user: userDetails,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const SearchUsers = async (
    req: Request<never, never, never, { name: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { name } = req.query;

      const safeName = escapeRegex(String(name || ""));

      const users = await UserModel.find({
        $or: [
          // Use mongo DB atlas when dataset is large
          { firstName: { $regex: `^${safeName}`, $options: "i" } },
          { lastName: { $regex: `^${safeName}`, $options: "i" } },
          { username: { $regex: `^${safeName}`, $options: "i" } },
        ],
        active: true,
        isFlagged: false,
        profileVisibility: { $in: ["public", "private"] },
      })
        .select(
          "username firstName lastName profileImage coverImageURL accountType bio -_id",
        )
        .limit(10)
        .lean();

      const organizations = await OrganizationModel.find({
        $or: [
          // Use mongo DB atlas when dataset is large
          { businessName: { $regex: `^${safeName}`, $options: "i" } },
          { username: { $regex: `^${safeName}`, $options: "i" } },
        ],
        active: true,
        isFlagged: false,
        profileVisibility: { $in: ["public", "private"] },
      })
        .select(
          "username businessName businessAddress businessBio businessWebsite businessLogoURL coverImageURL accountType -_id",
        )
        .limit(10)
        .lean();

      return sendSuccessFeedback(res, "Users found", {
        users,
        organizations,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const FollowUser = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const userDetails = await getUserDetails(req as any);

      // check if user is blocked
      const isBlocked = await UserBlockModel.findOne({
        userBlockingId: id,
        userToBlockId: userDetails._id,
      });

      if (isBlocked) {
        return sendErrorFeedback(
          res,
          403,
          "You are not allowed to follow this profile",
        );
      }

      const userToFollow =
        (await UserModel.findOne({
          _id: id,
          active: true,
          isFlagged: false,
          profileVisibility: { $in: ["public", "private"] },
        })) ||
        (await OrganizationModel.findOne({
          _id: id,
          active: true,
          isFlagged: false,
          profileVisibility: { $in: ["public", "private"] },
        }));

      if (!userToFollow) return sendErrorFeedback(res, 400, "User not found");

      const existingFollowRequest = await FollowRequestModel.findOne({
        leaderId: userToFollow._id,
        followerId: userDetails._id,
      });

      if (existingFollowRequest)
        return sendErrorFeedback(
          res,
          400,
          "You have already sent a follow request to this user",
        );

      const newFollowRequest = await FollowRequestModel.create({
        leaderId: userToFollow._id,
        followerId: userDetails._id,
        status:
          userToFollow.profileVisibility === "private" ? "pending" : "accepted",
        leaderType: userToFollow.accountType,
        followerType: userDetails.accountType,
      });

      return sendSuccessFeedback(
        res,
        "You have successfully initiated a follow request to this user",
        {
          followRequest: newFollowRequest,
        },
      );
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const ViewFollowRequests = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const paginationOptions = getPaginationOptions(req as any);

      const followRequests = await FollowRequestModel.paginate(
        {
          leaderId: userDetails._id,
          status: "pending",
        },
        {
          ...paginationOptions,
          populate: "followerDetails",
        },
      );

      return sendSuccessFeedback(res, "Follow requests retrieved", {
        followRequests,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const AcceptFollowRequest = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);
      const { id } = req.params;
      const userDetails = await getUserDetails(req as any);

      const followRequest = await FollowRequestModel.findOneAndUpdate(
        {
          _id: id,
          leaderId: userDetails._id,
          status: "pending",
        },
        {
          status: "accepted",
        },
        {
          new: true,
          populate: "followerDetails",
        },
      );

      if (!followRequest)
        return sendErrorFeedback(res, 400, "Follow request not found");

      return sendSuccessFeedback(
        res,
        "You have successfully accepted this follow request",
      );
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const RejectFollowRequest = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);
      const { id } = req.params;
      const userDetails = await getUserDetails(req as any);

      const followRequest = await FollowRequestModel.findOneAndDelete({
        _id: id,
        leaderId: userDetails._id,
        status: "pending",
      });

      if (!followRequest)
        return sendErrorFeedback(res, 400, "Follow request not found");

      return sendSuccessFeedback(
        res,
        "You have successfully declined this follow request",
      );
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const UnfollowUser = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const userDetails = await getUserDetails(req as any);

      const userToFollow =
        (await UserModel.findOne({
          _id: id,
          active: true,
          isFlagged: false,
          profileVisibility: { $in: ["public", "private"] },
        })) ||
        (await OrganizationModel.findOne({
          _id: id,
          active: true,
          isFlagged: false,
          profileVisibility: { $in: ["public", "private"] },
        }));

      if (!userToFollow) return sendErrorFeedback(res, 400, "User not found");

      const followRequest = await FollowRequestModel.findOneAndDelete({
        leaderId: userToFollow._id,
        followerId: userDetails._id,
      });

      if (!followRequest)
        return sendErrorFeedback(res, 400, "Follow request not found");

      return sendSuccessFeedback(
        res,
        "You have successfully unfollowed this user",
      );
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetFollowers = async (
    req: Request<{ id: string }, never, never, { followingUserId?: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { followingUserId } = req.query;

      // check if user is blocked
      const loggedInUser = await getUserDetails(req as any);

      const isBlocked = await UserBlockModel.findOne({
        userBlockingId: id,
        userToBlockId: loggedInUser._id,
      });

      if (isBlocked) {
        return sendErrorFeedback(
          res,
          403,
          "You are not allowed to view this profile followers",
        );
      }

      const followers = await FollowRequestModel.find({
        leaderId: id,
        status: "accepted",
        ...(followingUserId && { followerId: followingUserId }),
      }).populate("followerDetails");

      return sendSuccessFeedback(res, "Followers retrieved", { followers });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetFollowing = async (
    req: Request<{ id: string }, never, never, { leadingUserId?: string }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;
      const { leadingUserId } = req.query;

      // check if user is blocked
      const loggedInUser = await getUserDetails(req as any);

      const isBlocked = await UserBlockModel.findOne({
        userBlockingId: id,
        userToBlockId: loggedInUser._id,
      });

      if (isBlocked) {
        return sendErrorFeedback(
          res,
          403,
          "You are not allowed to view this profile's following",
        );
      }

      const following = await FollowRequestModel.find({
        followerId: id,
        status: "accepted",
        ...(leadingUserId && { leaderId: leadingUserId }),
      }).populate("leaderDetails");

      return sendSuccessFeedback(res, "Following retrieved", { following });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const BlockUser = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const userDetails = await getUserDetails(req as any);

      const userToBlock =
        (await UserModel.findById(id)) ||
        (await OrganizationModel.findById(id));

      if (!userToBlock) return sendErrorFeedback(res, 400, "User not found");

      const existingBlock = await UserBlockModel.findOne({
        userToBlockId: id,
        userBlockingId: userDetails._id,
      });

      if (existingBlock)
        return sendErrorFeedback(
          res,
          400,
          "You have already blocked this user",
        );

      const newBlock = await UserBlockModel.create({
        userToBlockId: id,
        userBlockingId: userDetails._id,
        userBlockingType: userDetails.accountType,
        userToBlockType: userToBlock.accountType,
      });

      return sendSuccessFeedback(
        res,
        "You have successfully blocked this user",
        {
          blockAction: newBlock,
        },
      );
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const UnblockUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { id } = req.params;

      const userDetails = await getUserDetails(req as any);

      const userToBlock =
        (await UserModel.findById(id)) ||
        (await OrganizationModel.findById(id));

      if (!userToBlock) return sendErrorFeedback(res, 400, "User not found");

      const existingBlock = await UserBlockModel.findOneAndDelete({
        userToBlockId: id,
        userBlockingId: userDetails._id,
      });

      if (!existingBlock)
        return sendErrorFeedback(res, 400, "You have not blocked this user");

      return sendSuccessFeedback(
        res,
        "You have successfully unblocked this user",
        {
          blockAction: existingBlock,
        },
      );
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetBlockedUsers = async (
    req: Request<
      never,
      never,
      never,
      {
        blockedUserId?: string;
      }
    >,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { blockedUserId } = req.query;

      const blockedUsers = await UserBlockModel.find({
        userBlockingId: userDetails._id,
        ...(blockedUserId && {
          userToBlockId: blockedUserId,
        }),
      }).populate("userToBlockDetails");

      return sendSuccessFeedback(res, "Blocked users retrieved", {
        blockedUsers,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetProfileShareUrl = async (req: Request, res: Response) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const profileURL = `${WEBSITE_URL}/${userDetails.username}`;

      return sendSuccessFeedback(res, "Profile URL retrieved successfully", {
        profileURL,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetProfileShareUrlByUsername = async (
    req: Request<{
      username: string;
    }>,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const { username } = req.params;

      const profileURL = `${WEBSITE_URL}/${username}`;

      return sendSuccessFeedback(res, "Profile URL retrieved successfully", {
        profileURL,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateProfileVisibility = async (
    req: Request<
      never,
      never,
      {
        profileVisibility: "private" | "public" | "secret";
      }
    >,
    res: Response,
  ) => {
    try {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const userDetails = await getUserDetails(req as any);

      const { profileVisibility } = req.body;

      userDetails.profileVisibility = profileVisibility;

      await userDetails.save();

      return sendSuccessFeedback(res, "Profile visibility updated", {
        user: userDetails,
      });
    } catch (error: any) {
      return sendCatchFeedback(res, error);
    }
  };

  // const GetKYCStatus = async (req: Request, res: Response) => {
  //   try {
  //     // check for validation errors
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);
  //   } catch (error: any) {
  //     return sendCatchFeedback(res, error);
  //   }
  // };

  // const UploadKYCDocuments = async (req: Request, res: Response) => {
  //   try {
  //     // check for validation errors
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);
  //   } catch (error: any) {
  //     return sendCatchFeedback(res, error);
  //   }
  // };

  // const SubmitKYCApplication = async (req: Request, res: Response) => {
  //   try {
  //     // check for validation errors
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);
  //   } catch (error: any) {
  //     return sendCatchFeedback(res, error);
  //   }
  // };

  // const GetKYCHistory = async (req: Request, res: Response) => {
  //   try {
  //     // check for validation errors
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);
  //   } catch (error: any) {
  //     return sendCatchFeedback(res, error);
  //   }
  // };

  // const GetKYCApplication = async (req: Request, res: Response) => {
  //   try {
  //     // check for validation errors
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);
  //   } catch (error: any) {
  //     return sendCatchFeedback(res, error);
  //   }
  // };

  // const DeleteKYCApplication = async (req: Request, res: Response) => {
  //   try {
  //     // check for validation errors
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);
  //   } catch (error: any) {
  //     return sendCatchFeedback(res, error);
  //   }
  // };

  return {
    GetProfile,
    UpdateProfile,
    DeleteProfile,
    UpdateProfilePicture,
    UpdateCoverPhoto,
    GetProfileByUsername,
    GetProfileById,
    SearchUsers,
    FollowUser,
    UnfollowUser,
    BlockUser,
    UnblockUser,
    GetFollowers,
    GetFollowing,
    GetBlockedUsers,
    GetProfileShareUrl,
    GetProfileShareUrlByUsername,
    // GetKYCStatus,
    // UploadKYCDocuments,
    // SubmitKYCApplication,
    // GetKYCHistory,
    // GetKYCApplication,
    // DeleteKYCApplication,
    UpdateOrganizationProfile,
    UpdatePassword,
    ResendUpdateEmailOTP,
    UpdateUserEmail,
    UpdateUserUsername,
    UpdateUserPhoneNumber,
    VerifyUpdateEmail,
    UpdateProfileVisibility,
    ViewFollowRequests,
    AcceptFollowRequest,
    RejectFollowRequest,
  };
};
