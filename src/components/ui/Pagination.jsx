export default function Pagination({ currentPage, totalPages, onPageChange, totalItems = 0, itemsPerPage = 8 }) {
  const pages = [];
  const maxPagesToShow = 4;

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col items-center gap-4 my-8">
      {totalItems > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Showing <span className="text-pink-600 font-bold">{startIdx}</span> - <span className="text-pink-600 font-bold">{endIdx}</span> of <span className="text-gray-900 dark:text-white font-bold">{totalItems}</span> celebrities
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 sm:px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:border-pink-300 dark:hover:border-pink-900 transition-all disabled:opacity-30 disabled:hover:border-gray-200 text-sm font-semibold shadow-sm"
        >
          ← Previous
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => goToPage(1)}
              className="hidden sm:block px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-pink-300 transition-all text-sm font-semibold"
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-gray-400">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl border transition-all text-sm font-bold shadow-sm ${page === currentPage
              ? 'bg-pink-600 text-white border-pink-600 hover:bg-pink-700'
              : 'border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-900 hover:bg-white dark:hover:bg-gray-800'
              }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-gray-400">...</span>}
            <button
              onClick={() => goToPage(totalPages)}
              className="hidden sm:block px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-pink-300 transition-all text-sm font-semibold"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 sm:px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:border-pink-300 dark:hover:border-pink-900 transition-all disabled:opacity-30 disabled:hover:border-gray-200 text-sm font-semibold shadow-sm"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
