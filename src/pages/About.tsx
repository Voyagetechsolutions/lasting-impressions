import { motion } from "framer-motion";
import { Heart, Gem, Users, Award } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import heroJewelry from "@/assets/hero-jewelry.jpg";
import classImage from "@/assets/beading-class.jpg";

const values = [
  {
    icon: Heart,
    title: "Passion for Craft",
    description: "Every piece we create comes from a place of genuine love for the art of jewelry-making.",
  },
  {
    icon: Gem,
    title: "Quality Materials",
    description: "We source only the finest beads, gemstones, and materials from trusted suppliers worldwide.",
  },
  {
    icon: Users,
    title: "Community Focus",
    description: "We believe in building a supportive community of creators who inspire each other.",
  },
  {
    icon: Award,
    title: "Excellence in Teaching",
    description: "Our instructors are experienced artisans dedicated to helping you succeed.",
  },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroJewelry}
            alt="Handcrafted jewelry"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-charcoal/40" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-cream mb-6">
              Our Story
            </h1>
            <p className="text-cream/80 text-lg md:text-xl leading-relaxed">
              Lasting Impressions was born from a simple belief: that handcrafted jewelry carries a special kind of magic that mass-produced pieces simply cannot replicate.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-6">
                Where Beauty Meets Craftsmanship
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2015, Lasting Impressions began as a small studio in the heart of the arts district. What started as one artisan's passion for beading has grown into a beloved destination for jewelry lovers and aspiring creators alike.
                </p>
                <p>
                  Our founder, Sarah Mitchell, discovered the art of beading during a transformative trip to Morocco, where she was captivated by the intricate patterns and vibrant colors of traditional jewelry. She returned home with a suitcase full of beads and a dream to share this beautiful craft with others.
                </p>
                <p>
                  Today, Lasting Impressions is more than a shop—it's a creative sanctuary where people come to find unique jewelry pieces, discover new skills, and connect with a community of like-minded artists.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={classImage}
                  alt="Artisan at work"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground rounded-2xl p-6 shadow-elevated">
                <p className="font-serif text-3xl font-semibold">10+</p>
                <p className="text-sm opacity-80">Years of Creativity</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              What We Stand For
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our values guide everything we do, from the materials we select to the way we teach our classes.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-8 text-center shadow-elegant"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-6">
                  <value.icon className="h-7 w-7" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-8">
              Our Mission
            </h2>
            <blockquote className="text-xl md:text-2xl text-muted-foreground leading-relaxed italic">
              "To inspire creativity and self-expression through the timeless art of jewelry-making, while providing our community with exceptional handcrafted pieces and the knowledge to create their own."
            </blockquote>
            <p className="mt-6 text-primary font-medium">— Sarah Mitchell, Founder</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
