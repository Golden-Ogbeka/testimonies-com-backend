import express from 'express';
import { Result, ValidationError } from 'express-validator';

export const sendCatchFeedback = (res: express.Response, error: Error) => {
  return res
    .status(500)
    .json({ message: error?.message || 'Internal Server Error', error });
};

export const sendValidationErrorFeedback = (
  res: express.Response,
  errors: Result<ValidationError>
) => {
  const errorArray = errors.array();
  if (errorArray) {
    return res.status(422).json({ message: errorArray[0].msg });
  }
};

export const sendErrorFeedback = (
  res: express.Response,
  status: number,
  message: string,
  additionalObjects?: { [key: string]: any }
) => {
  return res.status(status).json({ message, ...additionalObjects });
};

export const sendSuccessFeedback = (
  res: express.Response,
  message: string,
  additionalObjects?: { [key: string]: any },
  status?: number
) => {
  return res.status(status || 200).json({ message, ...additionalObjects });
};
