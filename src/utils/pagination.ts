import { PaginateOptions } from "mongoose";
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

export interface CustomPaginateResult<T> {
  results: T[];
  totalResults: number;
  resultsPerPage: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  totalPages: number;
  pagination: {
    totalResults: number;
    resultsPerPage: number;
    currentPage: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

export const paginationCustomLabels: PaginationCustomLabels = {
  totalDocs: "totalResults",
  docs: "results",
  limit: "resultsPerPage",
  page: "currentPage",
  nextPage: "nextPage",
  prevPage: "prevPage",
  totalPages: "totalPages",
  meta: "pagination",
};

export const getPaginationOptions = (
  req: { query: { page?: any; limit?: any } },
  sortBy?: Record<string, number | string>,
  populate?: string | string[] | any[] | any,
): PaginateOptions => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit
    ? parseInt(req.query.limit as string, 10)
    : Number(PAGE_LIMIT);

  const pageOptions: PaginateOptions = {
    page,
    limit,
    customLabels: paginationCustomLabels as any,
    sort: sortBy ? sortBy : { createdAt: -1 },
  };

  if (populate) {
    pageOptions.populate = populate;
  }

  return pageOptions;
};
