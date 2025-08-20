import express from "express";
import { PAGE_LIMIT } from "../functions/env";

export interface PaginationCustomLabels {
  totalDocs: string;
  docs: string;
  limit: string;
  page: string;
  nextPage: string;
  prevPage: string;
  totalPages: string;
  meta: string;
}

export const paginationCustomLabels: PaginationCustomLabels = {
  totalDocs: "totalResults",
  docs: "results",
  limit: "resultsPerPage",
  page: "currentPage",
  nextPage: "nextPage",
  prevPage: "prevPage",
  totalPages: "totalPages",
  // pagingCounter: 'slNo',
  meta: "pagination",
};

export const getPaginationOptions = (
  req: express.Request<
    never,
    never,
    unknown,
    { page: number; limit?: number; from?: string; to?: string }
  >,
  sortBy?: {},
) => {
  const { page = 1, limit } = req.query;

  const defaultLimit: number = Number(PAGE_LIMIT);

  const pageOptions = {
    page,
    limit: limit ?? defaultLimit,
    customLabels: paginationCustomLabels,
    sort: sortBy ? sortBy : { createdAt: -1 },
  };

  return pageOptions;
};
