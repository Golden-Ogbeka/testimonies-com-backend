import axios from "axios";
import twilio from "twilio";

import {
  OTP_EXPIRY,
  PRODUCT_NAME,
  SMS_API_KEY,
  SMS_BASE_URL,
  SMS_SENDER_ID,
  TWILIO_SMS_API_KEY,
  TWILIO_SMS_PHONE_NUMBER,
  TWILIO_SMS_SENDER_ID,
} from "./env";

const client = twilio(TWILIO_SMS_SENDER_ID, TWILIO_SMS_API_KEY);

export const sendMessageFromTwilio = async (
  to: string,
  message: string,
  from = TWILIO_SMS_PHONE_NUMBER,
) => {
  try {
    const messageSent = await client.messages.create({
      body: message,
      from,
      to,
    });

    return messageSent;
  } catch (error: any) {
    console.log({ error });
    throw new Error(
      "Twilio SMS error: " +
        (error?.response?.data?.message || "Could not send sms from Twilio"),
    );
  }
};

export const sendTextMessage = async (
  to: string,
  message: string,
  channel = "generic",
  from = SMS_SENDER_ID,
) => {
  try {
    const data = {
      to,
      from,
      sms: message,
      type: "plain",
      api_key: SMS_API_KEY,
      channel,
    };
    const options = {
      method: "POST",
      url: "https://v3.api.termii.com/api/sms/send",
      headers: {
        "Content-Type": ["application/json"],
      },
      data: JSON.stringify(data),
    };

    return await axios(options);
  } catch (error) {
    return console.log(error);
  }
};

export const sendTokenFromTermii = async (to: string) => {
  try {
    const data = {
      api_key: SMS_API_KEY,
      message_type: "ALPHANUMERIC",
      to,
      from: SMS_SENDER_ID,
      channel: "generic",
      pin_attempts: 3,
      pin_time_to_live: 10,
      pin_length: 6,
      pin_placeholder: "< 123456 >",
      message_text: `Your ${PRODUCT_NAME} OTP is: < 123456 >. Expires ${OTP_EXPIRY}`,
      pin_type: "NUMERIC",
    };
    const options = {
      method: "POST",
      url: `${SMS_BASE_URL}/api/sms/otp/send`,
      headers: {
        "Content-Type": ["application/json"],
      },
      data: JSON.stringify(data),
    };

    const res = await axios(options);

    return res.data.pinId;
  } catch (error: any) {
    throw new Error(
      "SMS OTP error: " +
        (error?.response?.data?.message || "Could not send sms otp"),
    );
  }
};

export const verifySMSTokenWithTermii = async (pinId: string, code: string) => {
  try {
    const data = {
      api_key: SMS_API_KEY,
      pin_id: pinId,
      pin: code,
    };
    const options = {
      method: "POST",
      url: `${SMS_BASE_URL}/api/sms/otp/verify`,
      headers: {
        "Content-Type": ["application/json"],
      },
      data: JSON.stringify(data),
    };

    const res = await axios(options);

    return res.data;
  } catch (error: any) {
    throw new Error(
      "SMS OTP Verification error: " +
        (error?.response?.data?.message || "Could not verify sms otp"),
    );
  }
};

export const checkForTwilioAllowedCountry = (phoneNumber: string): boolean => {
  const notAllowedCountry = ["+234"];

  // Check if the phone number starts with any of the disallowed prefixes
  return !notAllowedCountry.some((code) => phoneNumber.startsWith(code));
};

export const checkForLocalCountry = (phoneNumber: string): boolean => {
  const localCountry = ["+234"];

  // Check if the phone number starts with any of the allowed prefixes
  return localCountry.some((code) => phoneNumber.startsWith(code));
};
