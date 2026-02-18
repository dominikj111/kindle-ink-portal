/**
 * Paginates an array of items.
 */
export function paginate<T>(
  items: T[],
  page: number,
  perPage: number,
): { items: T[]; totalPages: number; currentPage: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * perPage;
  const paginatedItems = items.slice(start, start + perPage);

  return {
    items: paginatedItems,
    totalPages,
    currentPage,
  };
}
