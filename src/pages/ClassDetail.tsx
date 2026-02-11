import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, MapPin, Video, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/lib/supabase";
import classImage from "@/assets/beading-class.jpg";

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classItem, setClassItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setClassItem(data);
      } catch (error) {
        console.error("Failed to fetch class:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchClass();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!classItem) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif mb-4">Class not found</h1>
          <Button asChild>
            <Link to="/classes">Back to Classes</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <Button variant="ghost" onClick={() => navigate("/classes")} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Classes
          </Button>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={classItem.image_url || classImage}
                alt={classItem.title}
                className="w-full rounded-2xl shadow-elegant"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {classItem.level || 'All Levels'}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
                {classItem.title}
              </h1>

              <p className="text-muted-foreground text-lg mb-8">
                {classItem.description || 'Join us for an exciting hands-on workshop where you\'ll learn jewelry-making techniques.'}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {classItem.date ? new Date(classItem.date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{classItem.time || 'TBA'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{classItem.duration || 'TBA'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Available Spots</p>
                    <p className="font-medium">{classItem.spots_left || classItem.max_participants || 'Limited'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-elegant mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Price per person</span>
                  <span className="text-3xl font-serif font-semibold text-foreground">
                    R{parseFloat(classItem.price).toFixed(2)}
                  </span>
                </div>
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={() => navigate(`/classes/${id}/book`)}
                >
                  Book This Class
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>8 Simon Street, Rustivia, Germiston</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
