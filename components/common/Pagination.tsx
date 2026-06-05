import Link from "next/link";

type PaginationProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  query?: string;
  field?: string;
  status?: string;
};

function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisible = 9;

  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  let start = currentPage - 4;
  let end = currentPage + 4;

  if (start < 1) {
    start = 1;
    end = maxVisible;
  }

  if (end > totalPages) {
    end = totalPages;
    start = totalPages - maxVisible + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function makeHref({
  basePath,
  page,
  query,
  field,
  status,
}: {
  basePath: string;
  page: number;
  query?: string;
  field?: string;
  status?: string;
}) {
  const params = new URLSearchParams();

  params.set("page", String(page));

  if (query) params.set("q", query);
  if (field) params.set("field", field);
  if (status) params.set("status", status);

  return `${basePath}?${params.toString()}`;
}

export function Pagination({
  basePath,
  currentPage,
  totalPages,
  query = "",
  field = "",
  status = "",
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safeCurrentPage = Math.min(
    Math.max(1, currentPage || 1),
    safeTotalPages
  );

  const pageNumbers = getPageNumbers(safeCurrentPage, safeTotalPages);

  const hasPrev = safeCurrentPage > 1;
  const hasNext = safeCurrentPage < safeTotalPages;

  if (safeTotalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {hasPrev ? (
        <Link
          className="btn btn-secondary"
          href={makeHref({
            basePath,
            page: safeCurrentPage - 1,
            query,
            field,
            status,
          })}
        >
          이전
        </Link>
      ) : (
        <button className="btn btn-secondary opacity-40" disabled>
          이전
        </button>
      )}

      {pageNumbers[0] > 1 ? (
        <>
          <Link
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
            href={makeHref({
              basePath,
              page: 1,
              query,
              field,
              status,
            })}
          >
            1
          </Link>

          <span className="px-2 text-slate-500">...</span>
        </>
      ) : null}

      {pageNumbers.map((page) =>
        page === safeCurrentPage ? (
          <span
            key={page}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
            href={makeHref({
              basePath,
              page,
              query,
              field,
              status,
            })}
          >
            {page}
          </Link>
        )
      )}

      {pageNumbers[pageNumbers.length - 1] < safeTotalPages ? (
        <>
          <span className="px-2 text-slate-500">...</span>

          <Link
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
            href={makeHref({
              basePath,
              page: safeTotalPages,
              query,
              field,
              status,
            })}
          >
            {safeTotalPages}
          </Link>
        </>
      ) : null}

      {hasNext ? (
        <Link
          className="btn btn-secondary"
          href={makeHref({
            basePath,
            page: safeCurrentPage + 1,
            query,
            field,
            status,
          })}
        >
          다음
        </Link>
      ) : (
        <button className="btn btn-secondary opacity-40" disabled>
          다음
        </button>
      )}
    </div>
  );
}
