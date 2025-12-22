import { useState } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface FilterOptions {
  categories: string[];
  materials: string[];
  colors: string[];
  priceRange: [number, number];
  inStock: boolean;
}

interface ProductSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableCategories: string[];
  availableMaterials: string[];
  availableColors: string[];
  maxPrice: number;
}

export function ProductSearch({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  availableCategories,
  availableMaterials,
  availableColors,
  maxPrice,
}: ProductSearchProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFiltersCount = 
    filters.categories.length + 
    filters.materials.length + 
    filters.colors.length + 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      materials: [],
      colors: [],
      priceRange: [0, maxPrice],
      inStock: false,
    });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const toggleMaterial = (material: string) => {
    const newMaterials = filters.materials.includes(material)
      ? filters.materials.filter(m => m !== material)
      : [...filters.materials, material];
    onFiltersChange({ ...filters, materials: newMaterials });
  };

  const toggleColor = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    onFiltersChange({ ...filters, colors: newColors });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-6" align="start">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={filters.categories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => 
                        onFiltersChange({ ...filters, priceRange: value as [number, number] })
                      }
                      max={maxPrice}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>${filters.priceRange[0]}</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Materials */}
                {availableMaterials.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Materials</h4>
                    <div className="space-y-2">
                      {availableMaterials.map((material) => (
                        <div key={material} className="flex items-center space-x-2">
                          <Checkbox
                            id={`material-${material}`}
                            checked={filters.materials.includes(material)}
                            onCheckedChange={() => toggleMaterial(material)}
                          />
                          <label
                            htmlFor={`material-${material}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {material}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {availableColors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Colors</h4>
                    <div className="space-y-2">
                      {availableColors.map((color) => (
                        <div key={color} className="flex items-center space-x-2">
                          <Checkbox
                            id={`color-${color}`}
                            checked={filters.colors.includes(color)}
                            onCheckedChange={() => toggleColor(color)}
                          />
                          <label
                            htmlFor={`color-${color}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {color}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* In Stock */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in-stock"
                    checked={filters.inStock}
                    onCheckedChange={(checked) => 
                      onFiltersChange({ ...filters, inStock: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="in-stock"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    In stock only
                  </label>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters.categories.map((category) => (
              <Badge key={category} variant="secondary" className="gap-1">
                {category}
                <button
                  onClick={() => toggleCategory(category)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filters.materials.map((material) => (
              <Badge key={material} variant="secondary" className="gap-1">
                {material}
                <button
                  onClick={() => toggleMaterial(material)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filters.colors.map((color) => (
              <Badge key={color} variant="secondary" className="gap-1">
                {color}
                <button
                  onClick={() => toggleColor(color)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) && (
              <Badge variant="secondary" className="gap-1">
                ${filters.priceRange[0]} - ${filters.priceRange[1]}
                <button
                  onClick={() => onFiltersChange({ ...filters, priceRange: [0, maxPrice] })}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.inStock && (
              <Badge variant="secondary" className="gap-1">
                In stock
                <button
                  onClick={() => onFiltersChange({ ...filters, inStock: false })}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
