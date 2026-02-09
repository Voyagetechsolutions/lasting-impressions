import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid3X3, LayoutList, ShoppingBag, SlidersHorizontal, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { ProductSearch, FilterOptions } from "@/components/shop/ProductSearch";
import { useCart } from "@/contexts/CartContext";
import beadsCollection from "@/assets/beads-collection.jpg";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  image?: string;
  category: string;
  material?: string;
  color?: string;
  size?: string;
  quantity?: string;
  inStock: boolean;
  stock: number;
  description?: string;
}

const availableCategories = ["Glass Beads", "Crystal Beads", "Seed Beads", "Wood Beads", "Metal Beads", "Gemstones", "Kits"];
const availableMaterials = ["Glass", "Crystal", "Wood", "Metal", "Stone", "Polymer Clay", "Mixed"];
const availableColors = ["Turquoise", "Brown", "Pink", "Gold", "Multi", "Clear", "Purple", "Silver", "Blue", "Red", "Green"];

export default function ShopBeads() {
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
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          setProducts(data.map((p: any) => ({
            ...p,
            price: parseFloat(p.price),
            image: p.images?.[0] || beadsCollection,
            inStock: p.in_stock ?? p.inStock ?? true,
          })));
        }
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
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        product.category && filters.categories.includes(product.category)
      );
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
          return (a.category || "").localeCompare(b.category || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, filters, sortBy]);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || beadsCollection,
      category: product.category,
    });
  };

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
              Shop Beads
            </h1>
            <p className="text-muted-foreground text-lg">
              Explore our curated collection of high-quality beads for your jewelry projects.
              From sparkling crystals to natural gemstones.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-72 shrink-0">
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
            </aside>

            {/* Main Products Area */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <p className="text-muted-foreground">
                  {isLoading ? "Loading..." : `${filteredProducts.length} products found`}
                </p>
                <div className="flex items-center gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex border border-border rounded-lg">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <LayoutList className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredProducts.length === 0 ? (
                /* Empty State */
                <div className="text-center py-16">
                  <div className="bg-secondary/50 rounded-2xl p-8 max-w-md mx-auto">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
                    <p className="text-muted-foreground">
                      {products.length === 0
                        ? "Check back soon for new products!"
                        : "Try adjusting your filters or search term."}
                    </p>
                  </div>
                </div>
              ) : (
                /* Products Grid/List */
                <div className={viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6"
                  : "space-y-4"
                }>
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className={viewMode === "list"
                        ? "flex gap-6 bg-card border border-border rounded-xl p-4"
                        : "bg-card border border-border rounded-xl overflow-hidden group"
                      }
                    >
                      {/* Product Image */}
                      <div className={viewMode === "list"
                        ? "w-32 h-32 rounded-lg overflow-hidden shrink-0"
                        : "relative aspect-square overflow-hidden"
                      }>
                        <img
                          src={product.image || beadsCollection}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
                            <span className="bg-charcoal/90 text-cream px-3 py-1 rounded-full text-sm font-medium">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className={viewMode === "list" ? "flex-1 flex flex-col justify-between" : "p-4"}>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                          <h3 className="font-medium text-foreground mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          {viewMode === "list" && product.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {product.material && (
                              <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                                {product.material}
                              </span>
                            )}
                            {product.color && (
                              <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                                {product.color}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-serif font-semibold text-foreground">
                            R{product.price.toFixed(2)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.inStock}
                            className="gap-1"
                          >
                            <ShoppingBag className="h-4 w-4" />
                            {viewMode === "list" && "Add to Cart"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
