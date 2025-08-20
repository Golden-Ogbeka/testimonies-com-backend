export const DEFAULT_PAGE_LIMIT = 20;

export const paginate = ({
  page,
  limit = DEFAULT_PAGE_LIMIT,
}: {
  page: number;
  limit: number;
}) => {
  if (!page) {
    throw Error('Please select a page');
  }

  // in case page is less than or equal to zero, change to 1
  if (page <= 0) {
    page = 1;
  }
  const offset = (page - 1) * limit;

  return {
    offset,
    limit: Number(limit), // it's coming in as a string,
  };
};
