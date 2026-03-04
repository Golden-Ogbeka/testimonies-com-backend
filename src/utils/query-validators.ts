import { query } from 'express-validator';
import { FIELD_LENGTHS, LENGTH_MESSAGES } from './field-validators';

/** Max limit for list endpoints (must match pagination MAX_LIMIT). */
export const LIST_MAX_LIMIT = 100;

/** Convert camelCase param name to a friendly label (e.g. adminId -> "Admin ID"). */
function paramLabel(name: string): string {
  const withSpaces = name.replace(/([A-Z])/g, ' $1').trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).replace(/\bid\b/gi, 'ID');
}

/** Optional page: positive integer. */
export const optionalPage = () =>
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number.');

/** Optional limit: integer between 1 and max (default 100). */
export const optionalLimit = (max: number = LIST_MAX_LIMIT) =>
  query('limit')
    .optional()
    .isInt({ min: 1, max })
    .withMessage(`Limit must be between 1 and ${max}.`);

/** Optional dateFrom: valid ISO 8601 date string. */
export const optionalDateFrom = () =>
  query('dateFrom')
    .optional()
    .trim()
    .isISO8601({ strict: true })
    .withMessage('Start date must be a valid date.');

/** Optional dateTo: valid ISO 8601 date string. */
export const optionalDateTo = () =>
  query('dateTo')
    .optional()
    .trim()
    .isISO8601({ strict: true })
    .withMessage('End date must be a valid date.');

/** Optional active: literal "true" or "false". */
export const optionalActive = () =>
  query('active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Please use true or false for the active filter.');

/** Optional format: csv or pdf. */
export const optionalFormatCsvPdf = () =>
  query('format').optional().trim().isIn(['csv', 'pdf']).withMessage('Format must be CSV or PDF.');

/** Optional search: non-empty string up to SEARCH length. */
export const optionalSearch = () =>
  query('search')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Search query cannot be empty.')
    .isLength({ max: FIELD_LENGTHS.SEARCH })
    .withMessage(LENGTH_MESSAGES.SEARCH);

/** Optional status: single value from allowed list. */
export const optionalStatus = (allowedValues: string[]) =>
  query('status')
    .optional()
    .trim()
    .isIn(allowedValues)
    .withMessage(`Status must be one of: ${allowedValues.join(', ')}.`);

/** Optional sort: single sort field (e.g. "createdAt", "-createdAt" for desc). */
export const optionalSort = (allowedFields: string[]) =>
  query('sort')
    .optional()
    .trim()
    .custom((value) => {
      const field = value.startsWith('-') ? value.slice(1) : value;
      if (!allowedFields.includes(field)) {
        throw new Error(`Sort field must be one of: ${allowedFields.join(', ')}.`);
      }
      return true;
    });
