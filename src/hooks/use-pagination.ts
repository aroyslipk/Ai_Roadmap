'use client';

import { useState, useMemo } from 'react';

type FilterFn<T> = (item: T, searchTerm: string) => boolean;

export function usePagination<T>(
  data: T[],
  itemsPerPage: number,
  filterFn?: FilterFn<T>
) {
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (search && filterFn) {
      return data.filter(item => filterFn(item, search));
    }
    return data;
  }, [data, search, filterFn]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    return filteredData.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage
    );
  }, [filteredData, currentPage, itemsPerPage]);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleSetPage = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleSetSearch = (term: string) => {
    setSearch(term);
    setCurrentPage(0);
  }

  return {
    paginatedData,
    currentPage,
    totalPages,
    handleNextPage,
    handlePrevPage,
    handleSetPage,
    setSearch: handleSetSearch,
  };
}
