import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { globalDataset, type RetailRow } from '@/data/generator';

export type YearFilter = 2022 | 2023 | 2024 | 'All';
export type RegionFilter = 'All' | 'North America' | 'EMEA' | 'APAC' | 'LATAM';
export type CategoryFilter = 'All' | 'Electronics' | 'Clothing' | 'Home & Garden' | 'Furniture' | 'Sports' | 'Books';
export type SegmentFilter = 'All' | 'Consumer' | 'Business' | 'Enterprise';

export interface Filters {
  year: YearFilter;
  region: RegionFilter;
  category: CategoryFilter;
  segment: SegmentFilter;
}

interface FilterContextValue {
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  filteredData: RetailRow[];
  totalRows: number;
  resetFilters: () => void;
}

const defaultFilters: Filters = {
  year: 'All',
  region: 'All',
  category: 'All',
  segment: 'All',
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(defaultFilters);

  const filteredData = useMemo(() => {
    return globalDataset.filter(row => {
      if (filters.year !== 'All') {
        const year = new Date(row.orderDate).getFullYear();
        if (year !== filters.year) return false;
      }
      if (filters.region !== 'All' && row.region !== filters.region) return false;
      if (filters.category !== 'All' && row.productCategory !== filters.category) return false;
      if (filters.segment !== 'All' && row.customerSegment !== filters.segment) return false;
      return true;
    });
  }, [filters]);

  return (
    <FilterContext.Provider value={{ filters, setFilter, filteredData, totalRows: globalDataset.length, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}
