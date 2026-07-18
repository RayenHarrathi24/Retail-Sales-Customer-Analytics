import { useFilters, type YearFilter, type RegionFilter, type CategoryFilter, type SegmentFilter } from '@/context/FilterContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function FilterBar() {
  const { filters, setFilter, resetFilters, totalRows, filteredData } = useFilters();

  const activeCount = Object.values(filters).filter(v => v !== 'All').length;

  return (
    <div className="h-16 flex items-center px-6 border-b border-border bg-card/80 backdrop-blur-xl justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-muted-foreground mr-2">
          <Filter size={16} />
          <span className="text-sm font-medium">Filters</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] flex items-center justify-center rounded-sm text-[10px]">
              {activeCount}
            </Badge>
          )}
        </div>

        <Select value={String(filters.year)} onValueChange={(v) => setFilter('year', v === 'All' ? 'All' : Number(v) as YearFilter)}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Years</SelectItem>
            <SelectItem value="2022">2022</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.region} onValueChange={(v) => setFilter('region', v as RegionFilter)}>
          <SelectTrigger className="w-[150px] h-9 text-sm">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Regions</SelectItem>
            <SelectItem value="North America">North America</SelectItem>
            <SelectItem value="EMEA">EMEA</SelectItem>
            <SelectItem value="APAC">APAC</SelectItem>
            <SelectItem value="LATAM">LATAM</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.category} onValueChange={(v) => setFilter('category', v as CategoryFilter)}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Clothing">Clothing</SelectItem>
            <SelectItem value="Home & Garden">Home & Garden</SelectItem>
            <SelectItem value="Furniture">Furniture</SelectItem>
            <SelectItem value="Sports">Sports</SelectItem>
            <SelectItem value="Books">Books</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.segment} onValueChange={(v) => setFilter('segment', v as SegmentFilter)}>
          <SelectTrigger className="w-[150px] h-9 text-sm">
            <SelectValue placeholder="Segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Segments</SelectItem>
            <SelectItem value="Consumer">Consumer</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
            <SelectItem value="Enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>

        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 px-3 text-muted-foreground hover:text-foreground">
            <RotateCcw size={14} className="mr-2" />
            Reset
          </Button>
        )}
      </div>

      <div className="hidden md:flex items-center text-sm text-muted-foreground font-mono">
        <span className="text-foreground font-medium">{filteredData.length.toLocaleString()}</span>
        <span className="mx-1">/</span>
        <span>{totalRows.toLocaleString()} rows</span>
      </div>
    </div>
  );
}
