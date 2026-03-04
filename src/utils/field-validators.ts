/**
 * Standard max lengths for names, emails, and other text fields.
 * Use these with express-validator .isLength({ max }) for consistent validation.
 */
export const FIELD_LENGTHS = {
  /** Email (RFC 5321). */
  EMAIL: 254,
  /** First name, last name, single name. */
  NAME: 100,
  /** Full name or display name. */
  FULL_NAME: 200,
  /** Password max (min typically 6). */
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 128,
  /** Phone (E.164 + optional formatting). */
  PHONE: 20,
  /** Business name, account name, title. */
  TITLE_OR_NAME: 200,
  /** Terms/document content. */
  CONTENT: 50_000,
  /** Unit identifier, short code. */
  IDENTIFIER: 100,
  /** Address line or short address. */
  ADDRESS: 500,
  /** Long description. */
  DESCRIPTION: 2_000,
  /** Search query param. */
  SEARCH: 200,
  /** OTP / verification code. */
  OTP: 10,
  /** Bank code. */
  BANK_CODE: 10,
  /** Account number. */
  ACCOUNT_NUMBER: 10,
  /** Currency code. */
  CURRENCY: 10,
  /** Medium text. */
  MEDIUM_TEXT: 200,
} as const;

/**
 * Password strength: at least 6 characters with one uppercase, one number, and one special character.
 * Special characters: ! @ # $ % ^ & * ( ) - _ = + [ ] { } | ; : ' , . < > ? /
 */
export const PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+[\]{}|;:',.<>?/]).+$/;

export const PASSWORD_STRENGTH_MESSAGE =
  "Password must be at least 6 characters and include one uppercase letter, one number, and one special character (!@#$%^&*()-_=+[]{}|;':\",.<>?/).";

/** User-facing length error messages (sentence case). */
export const LENGTH_MESSAGES: Record<keyof typeof FIELD_LENGTHS, string> = {
  EMAIL: `Email must not exceed ${FIELD_LENGTHS.EMAIL} characters.`,
  NAME: `Name must not exceed ${FIELD_LENGTHS.NAME} characters.`,
  FULL_NAME: `Full name must not exceed ${FIELD_LENGTHS.FULL_NAME} characters.`,
  PASSWORD_MIN: `Password must be at least ${FIELD_LENGTHS.PASSWORD_MIN} characters.`,
  PASSWORD_MAX: `Password must not exceed ${FIELD_LENGTHS.PASSWORD_MAX} characters.`,
  PHONE: `Phone must not exceed ${FIELD_LENGTHS.PHONE} characters.`,
  TITLE_OR_NAME: `Title must not exceed ${FIELD_LENGTHS.TITLE_OR_NAME} characters.`,
  CONTENT: `Content must not exceed ${FIELD_LENGTHS.CONTENT} characters.`,
  IDENTIFIER: `Identifier must not exceed ${FIELD_LENGTHS.IDENTIFIER} characters.`,
  ADDRESS: `Address must not exceed ${FIELD_LENGTHS.ADDRESS} characters.`,
  DESCRIPTION: `Description must not exceed ${FIELD_LENGTHS.DESCRIPTION} characters.`,
  SEARCH: `Search query must not exceed ${FIELD_LENGTHS.SEARCH} characters.`,
  OTP: `OTP must not exceed ${FIELD_LENGTHS.OTP} characters.`,
  BANK_CODE: `Bank code must not exceed ${FIELD_LENGTHS.BANK_CODE} characters.`,
  ACCOUNT_NUMBER: `Account number must not exceed ${FIELD_LENGTHS.ACCOUNT_NUMBER} characters.`,
  CURRENCY: `Currency must not exceed ${FIELD_LENGTHS.CURRENCY} characters.`,
  MEDIUM_TEXT: `Text must not exceed ${FIELD_LENGTHS.MEDIUM_TEXT} characters.`,
};
