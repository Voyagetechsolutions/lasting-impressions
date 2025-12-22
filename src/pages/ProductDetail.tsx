import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Heart, Minus, Plus, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import productNecklace from "@/assets/product-necklace.jpg";
import productBracelet from "@/assets/product-bracelet.jpg";
import productEarrings from "@/assets/product-earrings.jpg";
import heroJewelry from "@/assets/hero-jewelry.jpg";
import beadsCollection from "@/assets/beads-collection.jpg";

// Mock product data - in a real app this would come from an API
const products: Record<string, {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  description: string;
  details: string[];
  materials: string;
  dimensions: string;
  variants?: { name: string; options: string[] }[];
  reviews: { name: string; rating: number; date: string; comment: string }[];
  inStock: boolean;
}> = {
  "1": {
    id: "1",
    name: "Amber Gemstone Pendant Necklace",
    price: 89,
    images: [productNecklace, heroJewelry, beadsCollection],
    category: "Necklaces",
    description: "This stunning amber gemstone necklace is a true statement piece. Handcrafted with genuine bronze beads and a faceted amber pendant, it catches the light beautifully and adds warmth to any outfit.",
    details: [
      "Handcrafted with care and attention to detail",
      "Genuine amber gemstone pendant",
      "Bronze-finish metal beads",
      "Adjustable lobster clasp closure",
      "Comes in a gift-ready jewelry box"
    ],
    materials: "Amber gemstone, bronze-plated brass beads, silk cord",
    dimensions: "Chain length: 18-20 inches (adjustable), Pendant: 1.2 inches",
    variants: [
      { name: "Chain Length", options: ["16 inch", "18 inch", "20 inch"] }
    ],
    reviews: [
      { name: "Sarah M.", rating: 5, date: "2025-12-01", comment: "Absolutely gorgeous! The amber catches the light so beautifully. I've received so many compliments." },
      { name: "Jennifer L.", rating: 5, date: "2025-11-28", comment: "The craftsmanship is exceptional. You can tell it's made with love and care." },
      { name: "Amanda K.", rating: 4, date: "2025-11-15", comment: "Beautiful necklace, though I wish the chain was a bit longer. Still love it!" },
    ],
    inStock: true,
  },
  "2": {
    id: "2",
    name: "Turquoise & Bronze Wrap Bracelet",
    price: 45,
    images: [productBracelet, beadsCollection, heroJewelry],
    category: "Bracelets",
    description: "A beautiful double-wrap bracelet featuring genuine turquoise beads paired with warm bronze accents. The perfect accessory for adding a pop of color to your everyday look.",
    details: [
      "Double-wrap design for a layered look",
      "Genuine turquoise stone beads",
      "Bronze-finish accent beads and clasp",
      "Adjustable toggle closure",
      "Fits wrists 6-7.5 inches"
    ],
    materials: "Turquoise stones, bronze-plated brass, leather cord",
    dimensions: "Total length: 14 inches, Bead size: 6mm-8mm",
    variants: [
      { name: "Size", options: ["Small (6-6.5\")", "Medium (6.5-7\")", "Large (7-7.5\")"] }
    ],
    reviews: [
      { name: "Emily R.", rating: 5, date: "2025-12-10", comment: "The colors are even more beautiful in person! I wear it every day." },
      { name: "Rachel T.", rating: 5, date: "2025-12-05", comment: "Such a unique piece. I love how it looks stacked with my other bracelets." },
    ],
    inStock: true,
  },
  "3": {
    id: "3",
    name: "Pearl & Garnet Drop Earrings",
    price: 38,
    images: [productEarrings, heroJewelry, beadsCollection],
    category: "Earrings",
    description: "Elegant drop earrings featuring freshwater pearls and deep garnet beads. These versatile earrings transition seamlessly from day to evening wear.",
    details: [
      "Freshwater pearl accents",
      "Genuine garnet gemstone beads",
      "14k gold-filled ear wires",
      "Hypoallergenic for sensitive ears",
      "Lightweight and comfortable"
    ],
    materials: "Freshwater pearls, garnet gemstones, 14k gold-filled wire",
    dimensions: "Total drop length: 2 inches",
    reviews: [
      { name: "Michelle W.", rating: 5, date: "2025-12-08", comment: "These earrings are simply stunning. The quality is amazing for the price." },
      { name: "Karen B.", rating: 5, date: "2025-11-20", comment: "Perfect for both casual and dressy occasions. I'm in love!" },
      { name: "Lisa M.", rating: 4, date: "2025-11-10", comment: "Beautiful earrings. The only reason for 4 stars is I wish they were slightly longer." },
    ],
    inStock: true,
  },
  "4": {
    id: "4",
    name: "Teal Cascade Necklace Set",
    price: 125,
    originalPrice: 150,
    images: [heroJewelry, productNecklace, beadsCollection],
    category: "Sets",
    description: "A stunning matching set featuring our signature teal gemstone necklace with complementary earrings. This elegant set makes a perfect gift or a special treat for yourself.",
    details: [
      "Matching necklace and earring set",
      "Genuine teal gemstones",
      "Bronze and gold-tone accents",
      "Adjustable necklace length",
      "Gift box included"
    ],
    materials: "Teal gemstones, bronze-plated brass, 14k gold-filled ear wires",
    dimensions: "Necklace: 16-18 inches, Earring drop: 1.5 inches",
    reviews: [
      { name: "Christina H.", rating: 5, date: "2025-12-12", comment: "Bought this as a gift and my sister absolutely loved it! The quality is outstanding." },
    ],
    inStock: true,
  },
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const product = id ? products[id] : null;

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif mb-4">Product not found</h1>
          <Button asChild>
            <Link to="/shop/jewelry">Back to Shop</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    const variantString = Object.entries(selectedVariants)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      category: product.category,
      variant: variantString || undefined,
    }, quantity);
  };

  const averageRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop/jewelry" className="hover:text-primary transition-colors">Jewelry</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary mb-4">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  className="absolute top-4 right-4 p-3 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>
              
              {/* Thumbnails */}
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="text-sm font-medium text-accent uppercase tracking-wider">
                {product.category}
              </span>
              
              <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mt-2 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(averageRating)
                          ? "fill-gold text-gold"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">
                  ({product.reviews.length} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-semibold text-foreground">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Variants */}
              {product.variants?.map((variant) => (
                <div key={variant.name} className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    {variant.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedVariants({ ...selectedVariants, [variant.name]: option })}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedVariants[variant.name] === option
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-secondary transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-6 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-secondary transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-4 mb-8">
                <Button
                  variant="hero"
                  size="xl"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  Add to Cart
                </Button>
                <Button variant="outline" size="xl">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-border">
                <div className="text-center">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <p className="text-xs text-muted-foreground">Free Shipping</p>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <p className="text-xs text-muted-foreground">1 Year Warranty</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <p className="text-xs text-muted-foreground">30-Day Returns</p>
                </div>
              </div>

              {/* Details */}
              <div className="mt-8">
                <h3 className="font-serif text-lg font-medium mb-4">Product Details</h3>
                <ul className="space-y-2">
                  {product.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 space-y-2 text-sm">
                  <p><span className="font-medium text-foreground">Materials:</span> <span className="text-muted-foreground">{product.materials}</span></p>
                  <p><span className="font-medium text-foreground">Dimensions:</span> <span className="text-muted-foreground">{product.dimensions}</span></p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Reviews Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-8">
              Customer Reviews
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {product.reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl p-6 shadow-elegant"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-foreground">{review.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-gold text-gold"
                              : "text-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </section>
    </Layout>
  );
}
