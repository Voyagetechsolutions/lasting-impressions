import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid3X3, LayoutList, SlidersHorizontal, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductSearch, FilterOptions } from "@/components/shop/ProductSearch";
import { supabase } from "@/lib/supabase";
import heroJewelry from "@/assets/hero-jewelry.jpg";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  image?: string;
  category: string;
  material?: string;
  color?: string;
  inStock: boolean;
  stock: number;
  description?: string;
}

const availableCategories = ["Necklaces", "Bracelets", "Earrings", "Sets"];
const availableMaterials = ["Amber", "Turquoise", "Pearl", "Gemstone", "Bronze", "Gold", "Silver", "Rose Quartz"];
const availableColors = ["Bronze", "Turquoise", "White", "Teal", "Gold", "Silver", "Pink"];

export default function ShopJewelry() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    materials: [],
    colors: [],
    priceRange: [0, 1000],
    inStock: false,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setProducts(data.map((p: any) => ({
          ...p,
          price: parseFloat(p.price),
          originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
          image: p.images?.[0] || heroJewelry,
          inStock: p.in_stock,
        })));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1000;
    return Math.max(...products.map(p => p.price), 1000);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

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
  }, [products, searchTerm, filters, sortBy]);

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
                {isLoading ? "Loading..." : `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"} found`}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-secondary/50 rounded-2xl p-8 max-w-md mx-auto">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                  {products.length === 0 ? "No Products Yet" : "No products found"}
                </h3>
                <p className="text-muted-foreground text-lg mb-6">
                  {products.length === 0
                    ? "Check back soon for new jewelry!"
                    : "Try adjusting your search or filters to find what you're looking for."}
                </p>
                {products.length > 0 && (
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
                )}
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </section>
    </Layout>
  );
}
