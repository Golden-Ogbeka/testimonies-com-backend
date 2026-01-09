import { OAuth2Client } from "google-auth-library";
import {
  GOOGLE_AUTH_REDIRECT,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_OATH_API_KEY,
} from "../../functions/env";
import {
  GoogleOAuthUserDetails,
  RawGoogleOAuthUserDetails,
} from "../../types/data";

const googleConfig = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: GOOGLE_AUTH_REDIRECT,
  apiKey: GOOGLE_OATH_API_KEY,
});

const scopes = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/user.phonenumbers.read",
];

export const getGoogleAuthURL = () => {
  return googleConfig.generateAuthUrl({
    access_type: "online",
    prompt: "consent",
    scope: scopes,
  });
};

export const getGoogleUser = async (code: string) => {
  const { tokens } = await googleConfig.getToken(code);

  // This is what authenticates the api call
  googleConfig.setCredentials(tokens);

  try {
    // This specifies the profile details to retrieve for the user
    const url =
      "https://people.googleapis.com/v1/people/me?personFields=names,phoneNumbers,photos,genders,emailAddresses";

    // This makes the api call with the authenticated headers
    const response = await googleConfig.request({ url });
    const rawUserData = response.data as RawGoogleOAuthUserDetails;

    if (rawUserData) {
      const computedUserDetails: GoogleOAuthUserDetails = {
        email: rawUserData.emailAddresses
          ? rawUserData.emailAddresses[0]?.value
          : "",
        emailIsVerified: rawUserData.emailAddresses
          ? rawUserData.emailAddresses[0]?.metadata?.verified
          : false,
        firstName: rawUserData.names ? rawUserData.names[0]?.givenName : "",
        lastName: rawUserData.names ? rawUserData.names[0]?.familyName : "",
        fullName: rawUserData.names ? rawUserData.names[0]?.displayName : "",
        phoneNumber: rawUserData.phoneNumbers
          ? rawUserData.phoneNumbers[0]?.value
          : "",
        picture: rawUserData.photos ? rawUserData.photos[0]?.url : "",
      };

      return computedUserDetails;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};
