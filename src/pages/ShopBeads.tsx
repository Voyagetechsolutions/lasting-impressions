import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, Grid3X3, LayoutList, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import beadsCollection from "@/assets/beads-collection.jpg";

const beadProducts = [
  {
    id: "b1",
    name: "Turquoise Glass Beads",
    price: 12,
    image: beadsCollection,
    category: "Glass Beads",
    size: "8mm",
    quantity: "50 pcs",
  },
  {
    id: "b2",
    name: "Wooden Bead Mix - Earth Tones",
    price: 8,
    image: beadsCollection,
    category: "Wooden Beads",
    size: "6mm-10mm",
    quantity: "100 pcs",
  },
  {
    id: "b3",
    name: "Rose Quartz Gemstone Beads",
    price: 24,
    image: beadsCollection,
    category: "Gemstones",
    size: "6mm",
    quantity: "30 pcs",
  },
  {
    id: "b4",
    name: "Seed Beads - Gold Metallic",
    price: 6,
    image: beadsCollection,
    category: "Seed Beads",
    size: "2mm",
    quantity: "500 pcs",
  },
  {
    id: "b5",
    name: "Beginner Bracelet Kit",
    price: 35,
    image: beadsCollection,
    category: "Kits",
    size: "Various",
    quantity: "Complete kit",
  },
  {
    id: "b6",
    name: "Czech Fire Polish Beads",
    price: 15,
    image: beadsCollection,
    category: "Glass Beads",
    size: "4mm",
    quantity: "100 pcs",
  },
];

const categories = ["All", "Glass Beads", "Wooden Beads", "Gemstones", "Seed Beads", "Kits"];

export default function ShopBeads() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProducts = activeCategory === "All"
    ? beadProducts
    : beadProducts.filter(p => p.category === activeCategory);

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
                      ? "bg-accent text-accent-foreground"
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
                      ${product.price}
                    </span>
                    <Button size="sm" variant="teal" className="gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
