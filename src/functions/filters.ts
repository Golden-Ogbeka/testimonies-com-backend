import express from "express";

export const getDateFilters = (
  req: express.Request<
    never,
    never,
    never,
    { page: number; limit?: number; from?: string; to?: string }
  >,
  additionalFilters?: { [key: string]: any },
  dateField?: string,
) => {
  const { from, to } = req.query;
  let filters = {};

  if (from) {
    filters = {
      [dateField || "createdAt"]: {
        $gte: new Date(from),
        ...(to && {
          $lte: new Date(to),
        }),
      },
      ...(additionalFilters || {}),
    };
  } else {
    filters = {
      ...(additionalFilters || {}),
    };
  }

  return filters;
};
