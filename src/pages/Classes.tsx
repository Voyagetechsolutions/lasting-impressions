import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, MapPin, Video, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import classImage from "@/assets/beading-class.jpg";

const classes = [
  {
    id: "c1",
    title: "Beginner Beading Basics",
    description: "Learn the fundamentals of beading, including stringing techniques, basic patterns, and finishing methods. Perfect for absolute beginners.",
    level: "Beginner",
    date: "January 15, 2026",
    time: "10:00 AM - 1:00 PM",
    duration: "3 hours",
    price: 65,
    instructor: "Sarah Mitchell",
    spots: 8,
    spotsLeft: 3,
    type: "in-person",
    image: classImage,
  },
  {
    id: "c2",
    title: "Jewelry Design Fundamentals",
    description: "Explore the principles of jewelry design, color theory, and how to create cohesive collections. Includes hands-on design exercises.",
    level: "Intermediate",
    date: "January 22, 2026",
    time: "2:00 PM - 5:00 PM",
    duration: "3 hours",
    price: 75,
    instructor: "Emily Chen",
    spots: 6,
    spotsLeft: 4,
    type: "in-person",
    image: classImage,
  },
  {
    id: "c3",
    title: "Wire Wrapping Mastery",
    description: "Master the art of wire wrapping to create stunning pendants and embellishments. Learn various gauge techniques and stone setting.",
    level: "Advanced",
    date: "January 29, 2026",
    time: "11:00 AM - 3:00 PM",
    duration: "4 hours",
    price: 95,
    instructor: "Marcus Rodriguez",
    spots: 5,
    spotsLeft: 2,
    type: "in-person",
    image: classImage,
  },
  {
    id: "c4",
    title: "Online: Introduction to Seed Beading",
    description: "Join us virtually to learn seed bead techniques including peyote stitch and brick stitch. Kit shipped to your door.",
    level: "Beginner",
    date: "February 5, 2026",
    time: "7:00 PM - 9:00 PM",
    duration: "2 hours",
    price: 55,
    instructor: "Sarah Mitchell",
    spots: 15,
    spotsLeft: 9,
    type: "online",
    image: classImage,
  },
];

const levelColors: Record<string, string> = {
  Beginner: "bg-teal/10 text-teal",
  Intermediate: "bg-primary/10 text-primary",
  Advanced: "bg-accent/10 text-accent",
};

export default function Classes() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={classImage}
            alt="Beading workshop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-charcoal/50" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-cream mb-6">
              Classes & Workshops
            </h1>
            <p className="text-cream/80 text-lg md:text-xl leading-relaxed mb-8">
              Discover the joy of jewelry-making with our expert-led classes. From beginner basics to advanced techniques, there's something for every skill level.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-cream/70">
                <MapPin className="h-5 w-5" />
                <span>In-Person Classes</span>
              </div>
              <div className="flex items-center gap-2 text-cream/70">
                <Video className="h-5 w-5" />
                <span>Online Workshops</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Classes List */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              Upcoming Classes
            </h2>
            <p className="text-muted-foreground text-lg">
              All materials are included in the class fee. Sign up early as spots fill quickly!
            </p>
          </motion.div>

          <div className="space-y-8">
            {classes.map((classItem, index) => (
              <motion.article
                key={classItem.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden shadow-elegant hover:shadow-elevated transition-all duration-500"
              >
                <div className="grid md:grid-cols-3 gap-0">
                  <div className="relative aspect-video md:aspect-auto">
                    <img
                      src={classItem.image}
                      alt={classItem.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelColors[classItem.level]}`}>
                        {classItem.level}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        classItem.type === "online" 
                          ? "bg-accent/20 text-accent" 
                          : "bg-secondary text-secondary-foreground"
                      }`}>
                        {classItem.type === "online" ? "Online" : "In-Person"}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2 p-6 md:p-8 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-semibold text-foreground mb-3">
                        {classItem.title}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {classItem.description}
                      </p>

                      <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{classItem.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{classItem.time} ({classItem.duration})</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Users className="h-4 w-4 text-primary" />
                          <span>{classItem.spotsLeft} spots left of {classItem.spots}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="text-foreground font-medium">Instructor:</span> {classItem.instructor}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <span className="text-2xl font-semibold text-foreground">${classItem.price}</span>
                        <span className="text-muted-foreground text-sm ml-2">per person</span>
                      </div>
                      <Button variant="teal" className="gap-2">
                        Book Now
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Private Lessons CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-2xl p-8 md:p-12 text-center"
          >
            <h3 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-4">
              Looking for Private Lessons?
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              We offer one-on-one instruction tailored to your specific interests and skill level. Perfect for special occasions or focused learning.
            </p>
            <Button asChild variant="hero" size="lg">
              <Link to="/contact">
                Inquire About Private Lessons
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
