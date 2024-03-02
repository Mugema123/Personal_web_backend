/**
 *
 * @param {number} count
 * @param {number} pageLimit
 * @param {number} currentPage
 * 
 */
export const paginate = (count, pageLimit, currentPage) => {
  let limit = pageLimit || 10;
  limit = Math.abs(limit);
  let page = currentPage || 1;
  page = Math.abs(page);
  const pages = Math.ceil(count / limit);
  return { page, pages, count };
};
