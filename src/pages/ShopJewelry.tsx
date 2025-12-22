import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Grid3X3, LayoutList, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductSearch, FilterOptions } from "@/components/shop/ProductSearch";
import productNecklace from "@/assets/product-necklace.jpg";
import productBracelet from "@/assets/product-bracelet.jpg";
import productEarrings from "@/assets/product-earrings.jpg";
import heroJewelry from "@/assets/hero-jewelry.jpg";

const products = [
  {
    id: "1",
    name: "Amber Gemstone Pendant Necklace",
    price: 89,
    image: productNecklace,
    category: "Necklaces",
    material: "Amber",
    color: "Bronze",
    inStock: true,
  },
  {
    id: "2",
    name: "Turquoise & Bronze Wrap Bracelet",
    price: 45,
    image: productBracelet,
    category: "Bracelets",
    material: "Turquoise",
    color: "Turquoise",
    inStock: true,
  },
  {
    id: "3",
    name: "Pearl & Garnet Drop Earrings",
    price: 38,
    image: productEarrings,
    category: "Earrings",
    material: "Pearl",
    color: "White",
    inStock: true,
  },
  {
    id: "4",
    name: "Teal Cascade Necklace Set",
    price: 125,
    originalPrice: 150,
    image: heroJewelry,
    category: "Sets",
    material: "Gemstone",
    color: "Teal",
    inStock: true,
  },
  {
    id: "5",
    name: "Bronze Beaded Cuff",
    price: 52,
    image: productBracelet,
    category: "Bracelets",
    material: "Bronze",
    color: "Bronze",
    inStock: false,
  },
  {
    id: "6",
    name: "Golden Hour Statement Earrings",
    price: 42,
    image: productEarrings,
    category: "Earrings",
    material: "Gold",
    color: "Gold",
    inStock: true,
  },
  {
    id: "7",
    name: "Silver Moon Phase Necklace",
    price: 78,
    image: productNecklace,
    category: "Necklaces",
    material: "Silver",
    color: "Silver",
    inStock: true,
  },
  {
    id: "8",
    name: "Rose Quartz Healing Bracelet",
    price: 35,
    image: productBracelet,
    category: "Bracelets",
    material: "Rose Quartz",
    color: "Pink",
    inStock: true,
  },
];

const availableCategories = ["Necklaces", "Bracelets", "Earrings", "Sets"];
const availableMaterials = ["Amber", "Turquoise", "Pearl", "Gemstone", "Bronze", "Gold", "Silver", "Rose Quartz"];
const availableColors = ["Bronze", "Turquoise", "White", "Teal", "Gold", "Silver", "Pink"];
const maxPrice = Math.max(...products.map(p => p.price));

export default function ShopJewelry() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    materials: [],
    colors: [],
    priceRange: [0, maxPrice],
    inStock: false,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("name");

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => filters.categories.includes(product.category));
    }

    // Material filter
    if (filters.materials.length > 0) {
      filtered = filtered.filter(product => 
        product.material && filters.materials.includes(product.material)
      );
    }

    // Color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter(product => 
        product.color && filters.colors.includes(product.color)
      );
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // In stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.inStock !== false);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, filters, sortBy]);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-foreground mb-4">
              Jewelry Collection
            </h1>
            <p className="text-muted-foreground text-lg">
              Each piece is handcrafted with love, featuring unique beads and gemstones. Find your perfect statement piece.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <ProductSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFiltersChange={setFilters}
            availableCategories={availableCategories}
            availableMaterials={availableMaterials}
            availableColors={availableColors}
            maxPrice={maxPrice}
          />

          {/* Sort and View Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-8 mb-8">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-secondary" : "bg-background"}`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-secondary" : "bg-background"}`}
                  aria-label="List view"
                >
                  <LayoutList className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className={`grid gap-8 ${
            viewMode === "grid" 
              ? "sm:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1 max-w-2xl"
          }`}>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <SlidersHorizontal className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground text-lg mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilters({
                    categories: [],
                    materials: [],
                    colors: [],
                    priceRange: [0, maxPrice],
                    inStock: false,
                  });
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
