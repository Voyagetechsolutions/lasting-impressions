import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, Sparkles, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/shop/ProductCard";
import heroImage from "@/assets/hero-jewelry.jpg";
import beadsImage from "@/assets/beads-collection.jpg";
import classImage from "@/assets/beading-class.jpg";
import productNecklace from "@/assets/product-necklace.jpg";
import productBracelet from "@/assets/product-bracelet.jpg";
import productEarrings from "@/assets/product-earrings.jpg";

const featuredProducts = [
  {
    id: "1",
    name: "Teal Gemstone Necklace",
    price: 89,
    image: productNecklace,
    category: "Necklaces",
  },
  {
    id: "2",
    name: "Bronze & Teal Bracelet",
    price: 45,
    image: productBracelet,
    category: "Bracelets",
  },
  {
    id: "3",
    name: "Pearl Drop Earrings",
    price: 38,
    image: productEarrings,
    category: "Earrings",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    text: "The jewelry is absolutely stunning! Each piece feels so unique and special. I've received so many compliments.",
    rating: 5,
  },
  {
    name: "Emily R.",
    text: "Taking the beginner beading class was such a joy. The instructor was patient and I left with a beautiful bracelet I made myself!",
    rating: 5,
  },
  {
    name: "Jennifer L.",
    text: "Best quality beads I've found anywhere. The selection is incredible and the service is always wonderful.",
    rating: 5,
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Handcrafted jewelry collection on cream linen"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/40 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 text-gold text-sm font-medium tracking-widest uppercase mb-6"
            >
              <Sparkles className="h-4 w-4" />
              Artisan Craftsmanship
            </motion.span>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-cream leading-tight mb-6">
              Handcrafted Beauty.
              <br />
              <span className="text-gold">Timeless Skills.</span>
            </h1>
            
            <p className="text-cream/80 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
              Discover unique handmade jewelry, premium beading supplies, and learn the art of jewelry-making from expert artisans.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/shop/jewelry">
                  Shop Jewelry
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="hero-outline" size="xl" className="border-cream text-cream hover:bg-cream hover:text-charcoal">
                <Link to="/classes">
                  Join a Class
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-4">
              Explore Our Collections
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From ready-to-wear jewelry to premium supplies for your own creations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Jewelry Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Link to="/shop/jewelry" className="group block relative overflow-hidden rounded-2xl aspect-[4/3]">
                <img
                  src={heroImage}
                  alt="Jewelry collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-3xl font-serif font-semibold text-cream mb-2">
                    Shop Jewelry
                  </h3>
                  <p className="text-cream/70 mb-4">
                    Necklaces, bracelets, earrings & more
                  </p>
                  <span className="inline-flex items-center gap-2 text-gold font-medium group-hover:gap-3 transition-all">
                    Explore Collection <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Beads Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link to="/shop/beads" className="group block relative overflow-hidden rounded-2xl aspect-[4/3]">
                <img
                  src={beadsImage}
                  alt="Beads collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-3xl font-serif font-semibold text-cream mb-2">
                    Shop Beads & Supplies
                  </h3>
                  <p className="text-cream/70 mb-4">
                    Glass, gemstone, wooden beads & kits
                  </p>
                  <span className="inline-flex items-center gap-2 text-gold font-medium group-hover:gap-3 transition-all">
                    Explore Collection <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-4">
                Featured Pieces
              </h2>
              <p className="text-muted-foreground text-lg">
                Our most loved handcrafted creations
              </p>
            </div>
            <Button asChild variant="outline" className="mt-6 md:mt-0">
              <Link to="/shop/jewelry">
                View All Jewelry
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Classes Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={classImage}
                  alt="Beading workshop in progress"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-accent text-accent-foreground rounded-2xl p-6 shadow-elevated">
                <Calendar className="h-8 w-8 mb-2" />
                <p className="font-serif text-2xl font-semibold">12+</p>
                <p className="text-sm opacity-80">Classes Monthly</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 text-accent text-sm font-medium tracking-widest uppercase mb-4">
                <BookOpen className="h-4 w-4" />
                Learn With Us
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-6">
                Beading Classes & Workshops
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Whether you're a complete beginner or an experienced jewelry maker, our classes offer something for everyone. Learn techniques, discover your creativity, and take home your own handmade pieces.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  Beginner to advanced skill levels
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  In-person and online options available
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  All materials included in class fee
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  Small group sizes for personal attention
                </li>
              </ul>
              <Button asChild variant="teal" size="lg">
                <Link to="/classes">
                  Browse Classes
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-charcoal text-cream">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-4">
              What Our Community Says
            </h2>
            <p className="text-cream/60 text-lg">
              Stories from our wonderful customers and students
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-cream/5 rounded-2xl p-8 border border-cream/10"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-cream/80 leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <p className="font-medium text-gold">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-6">
              Start Your Creative Journey
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Whether you're looking for the perfect piece of jewelry or ready to create your own, we're here to inspire and support your creative journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/shop/jewelry">
                  Shop Now
                </Link>
              </Button>
              <Button asChild variant="teal-outline" size="xl">
                <Link to="/contact">
                  Get in Touch
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
