import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Grid3X3, LayoutList, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { ProductSearch, FilterOptions } from "@/components/shop/ProductSearch";
import { useCart } from "@/contexts/CartContext";
import beadsCollection from "@/assets/beads-collection.jpg";

const beadProducts = [
  {
    id: "b1",
    name: "Turquoise Glass Beads",
    price: 12,
    image: beadsCollection,
    category: "Glass Beads",
    material: "Glass",
    color: "Turquoise",
    size: "8mm",
    quantity: "50 pcs",
    inStock: true,
  },
  {
    id: "b2",
    name: "Wooden Bead Mix - Earth Tones",
    price: 8,
    image: beadsCollection,
    category: "Wooden Beads",
    material: "Wood",
    color: "Brown",
    size: "6mm-10mm",
    quantity: "100 pcs",
    inStock: true,
  },
  {
    id: "b3",
    name: "Rose Quartz Gemstone Beads",
    price: 24,
    image: beadsCollection,
    category: "Gemstones",
    material: "Rose Quartz",
    color: "Pink",
    size: "6mm",
    quantity: "30 pcs",
    inStock: true,
  },
  {
    id: "b4",
    name: "Seed Beads - Gold Metallic",
    price: 6,
    image: beadsCollection,
    category: "Seed Beads",
    material: "Glass",
    color: "Gold",
    size: "2mm",
    quantity: "500 pcs",
    inStock: false,
  },
  {
    id: "b5",
    name: "Beginner Bracelet Kit",
    price: 35,
    image: beadsCollection,
    category: "Kits",
    material: "Mixed",
    color: "Multi",
    size: "Various",
    quantity: "Complete kit",
    inStock: true,
  },
  {
    id: "b6",
    name: "Czech Fire Polish Beads",
    price: 15,
    image: beadsCollection,
    category: "Glass Beads",
    material: "Glass",
    color: "Clear",
    size: "4mm",
    quantity: "100 pcs",
    inStock: true,
  },
  {
    id: "b7",
    name: "Amethyst Chip Beads",
    price: 18,
    image: beadsCollection,
    category: "Gemstones",
    material: "Amethyst",
    color: "Purple",
    size: "5-8mm",
    quantity: "40 pcs",
    inStock: true,
  },
  {
    id: "b8",
    name: "Silver Spacer Beads",
    price: 9,
    image: beadsCollection,
    category: "Metal Beads",
    material: "Silver",
    color: "Silver",
    size: "3mm",
    quantity: "200 pcs",
    inStock: true,
  },
];

const availableCategories = ["Glass Beads", "Wooden Beads", "Gemstones", "Seed Beads", "Kits", "Metal Beads"];
const availableMaterials = ["Glass", "Wood", "Rose Quartz", "Amethyst", "Silver", "Mixed"];
const availableColors = ["Turquoise", "Brown", "Pink", "Gold", "Multi", "Clear", "Purple", "Silver"];
const maxPrice = Math.max(...beadProducts.map(p => p.price));

export default function ShopBeads() {
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
  const { addItem } = useCart();

  const filteredProducts = useMemo(() => {
    let filtered = beadProducts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.size.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleAddToCart = (product: typeof beadProducts[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
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
              Beads & Supplies
            </h1>
            <p className="text-muted-foreground text-lg">
              Premium quality beads, findings, and complete kits for your jewelry-making projects. From beginner essentials to rare gemstones.
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
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1 max-w-2xl"
          }`}>
            {filteredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-elevated transition-all duration-500"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                  {!product.inStock && (
                    <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-serif text-base font-medium text-foreground mb-1 group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <span>{product.size}</span>
                    <span>•</span>
                    <span>{product.quantity}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-foreground">
                      R{(product.price * 18.5).toFixed(2)}
                    </span>
                    <Button 
                      size="sm" 
                      variant="teal" 
                      className="gap-2"
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {product.inStock ? "Add" : "Out of Stock"}
                    </Button>
                  </div>
                </div>
              </motion.article>
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
