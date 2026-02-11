import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, MapPin, Video, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import classImage from "@/assets/beading-class.jpg";
import { supabase } from "@/lib/supabase";

interface ClassItem {
  id: string;
  title: string;
  description: string;
  level: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  instructor: string;
  spots: number;
  spotsLeft: number;
  type: "in-person" | "online";
  image?: string;
}

const levelColors: Record<string, string> = {
  Beginner: "bg-teal/10 text-teal",
  Intermediate: "bg-primary/10 text-primary",
  Advanced: "bg-accent/10 text-accent",
};

export default function Classes() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setClasses(data.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description || '',
          level: c.level || 'Beginner',
          date: c.date || '',
          time: c.time || '',
          duration: c.duration || '',
          price: parseFloat(c.price) || 0,
          instructor: 'Lasting Impressions',
          spots: c.max_participants || 10,
          spotsLeft: c.spots_left || c.max_participants || 10,
          type: 'in-person' as const,
          image: c.image_url || classImage,
        })));
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "TBA";
    try {
      return new Date(dateString).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

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
            <p className="text-cream/80 text-lg mb-8">
              Join our hands-on classes and learn jewelry-making techniques from experienced artisans.
              From beginner basics to advanced wire wrapping, we have classes for every skill level.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Classes Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              Upcoming Classes
            </h2>
            <p className="text-muted-foreground">
              Browse our upcoming workshops and reserve your spot today.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-secondary/50 rounded-2xl p-8 max-w-md mx-auto">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Classes Scheduled</h3>
                <p className="text-muted-foreground mb-4">
                  Check back soon for upcoming workshops and classes!
                </p>
                <Link to="/contact">
                  <Button variant="outline">
                    Contact Us for Private Sessions
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {classes.map((classItem, index) => (
                <motion.div
                  key={classItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-elevated transition-shadow"
                >
                  <div className="relative h-48">
                    <img
                      src={classItem.image || classImage}
                      alt={classItem.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelColors[classItem.level] || levelColors.Beginner}`}>
                        {classItem.level}
                      </span>
                      {classItem.type === "online" && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-charcoal/80 text-cream flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          Online
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                      {classItem.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {classItem.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(classItem.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{classItem.time || "TBA"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{classItem.spotsLeft || 0} spots left</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {classItem.type === "online" ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        <span>{classItem.type === "online" ? "Online" : "In Studio"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <span className="text-2xl font-serif font-semibold text-foreground">
                          R{classItem.price}
                        </span>
                        <span className="text-muted-foreground text-sm ml-1">
                          / person
                        </span>
                      </div>
                      <Link to={`/classes/${classItem.id}/book`}>
                        <Button variant="teal" className="gap-2">
                          Book Now
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Private Sessions CTA */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-6">
              Private Sessions Available
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Looking for one-on-one instruction or want to host a private party?
              We offer customized sessions for individuals and groups.
            </p>
            <Link to="/contact">
              <Button variant="hero" size="lg">
                Inquire About Private Sessions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
