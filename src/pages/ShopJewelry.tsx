import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, Grid3X3, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/shop/ProductCard";
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
  },
  {
    id: "2",
    name: "Turquoise & Bronze Wrap Bracelet",
    price: 45,
    image: productBracelet,
    category: "Bracelets",
  },
  {
    id: "3",
    name: "Pearl & Garnet Drop Earrings",
    price: 38,
    image: productEarrings,
    category: "Earrings",
  },
  {
    id: "4",
    name: "Teal Cascade Necklace Set",
    price: 125,
    originalPrice: 150,
    image: heroJewelry,
    category: "Sets",
  },
  {
    id: "5",
    name: "Bronze Beaded Cuff",
    price: 52,
    image: productBracelet,
    category: "Bracelets",
  },
  {
    id: "6",
    name: "Golden Hour Statement Earrings",
    price: 42,
    image: productEarrings,
    category: "Earrings",
  },
];

const categories = ["All", "Necklaces", "Bracelets", "Earrings", "Sets"];

export default function ShopJewelry() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter(p => p.category === activeCategory);

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

      {/* Filters & Products */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
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
              <p className="text-muted-foreground text-lg">
                No products found in this category.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
