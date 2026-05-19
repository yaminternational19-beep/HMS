import React from 'react';

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemName = 'items',
  className = ''
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalItems === 0) return null;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <div className={`table-pagination ${className}`}>
      <div className="pagination-text">
        Showing <span>{indexOfFirstItem + 1}</span> to <span>{Math.min(indexOfLastItem, totalItems)}</span> of <span>{totalItems}</span> {itemName}
      </div>
      <div className="pagination-btn-group">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="pg-btn"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`pg-btn ${currentPage === page ? 'pg-active' : ''}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="pg-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
