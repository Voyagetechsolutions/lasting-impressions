import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Users, MapPin, ArrowLeft, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import classImage from "@/assets/beading-class.jpg";

// Mock class data
const classesData: Record<string, {
  id: string;
  title: string;
  description: string;
  level: string;
  price: number;
  duration: string;
  instructor: string;
  type: "in-person" | "online";
  image: string;
  availableDates: { date: string; time: string; spotsLeft: number; totalSpots: number }[];
}> = {
  "c1": {
    id: "c1",
    title: "Beginner Beading Basics",
    description: "Learn the fundamentals of beading, including stringing techniques, basic patterns, and finishing methods. Perfect for absolute beginners.",
    level: "Beginner",
    price: 65,
    duration: "3 hours",
    instructor: "Sarah Mitchell",
    type: "in-person",
    image: classImage,
    availableDates: [
      { date: "2026-01-15", time: "10:00 AM - 1:00 PM", spotsLeft: 3, totalSpots: 8 },
      { date: "2026-01-22", time: "10:00 AM - 1:00 PM", spotsLeft: 5, totalSpots: 8 },
      { date: "2026-01-29", time: "2:00 PM - 5:00 PM", spotsLeft: 8, totalSpots: 8 },
      { date: "2026-02-05", time: "10:00 AM - 1:00 PM", spotsLeft: 6, totalSpots: 8 },
    ],
  },
  "c2": {
    id: "c2",
    title: "Jewelry Design Fundamentals",
    description: "Explore the principles of jewelry design, color theory, and how to create cohesive collections. Includes hands-on design exercises.",
    level: "Intermediate",
    price: 75,
    duration: "3 hours",
    instructor: "Emily Chen",
    type: "in-person",
    image: classImage,
    availableDates: [
      { date: "2026-01-18", time: "2:00 PM - 5:00 PM", spotsLeft: 4, totalSpots: 6 },
      { date: "2026-01-25", time: "2:00 PM - 5:00 PM", spotsLeft: 2, totalSpots: 6 },
      { date: "2026-02-01", time: "10:00 AM - 1:00 PM", spotsLeft: 6, totalSpots: 6 },
    ],
  },
  "c3": {
    id: "c3",
    title: "Wire Wrapping Mastery",
    description: "Master the art of wire wrapping to create stunning pendants and embellishments. Learn various gauge techniques and stone setting.",
    level: "Advanced",
    price: 95,
    duration: "4 hours",
    instructor: "Marcus Rodriguez",
    type: "in-person",
    image: classImage,
    availableDates: [
      { date: "2026-01-20", time: "11:00 AM - 3:00 PM", spotsLeft: 2, totalSpots: 5 },
      { date: "2026-02-10", time: "11:00 AM - 3:00 PM", spotsLeft: 5, totalSpots: 5 },
    ],
  },
  "c4": {
    id: "c4",
    title: "Online: Introduction to Seed Beading",
    description: "Join us virtually to learn seed bead techniques including peyote stitch and brick stitch. Kit shipped to your door.",
    level: "Beginner",
    price: 55,
    duration: "2 hours",
    instructor: "Sarah Mitchell",
    type: "online",
    image: classImage,
    availableDates: [
      { date: "2026-02-05", time: "7:00 PM - 9:00 PM", spotsLeft: 9, totalSpots: 15 },
      { date: "2026-02-12", time: "7:00 PM - 9:00 PM", spotsLeft: 12, totalSpots: 15 },
      { date: "2026-02-19", time: "7:00 PM - 9:00 PM", spotsLeft: 15, totalSpots: 15 },
    ],
  },
};

const levelColors: Record<string, string> = {
  Beginner: "bg-teal/10 text-teal",
  Intermediate: "bg-primary/10 text-primary",
  Advanced: "bg-accent/10 text-accent",
};

export default function ClassBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [attendees, setAttendees] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const classData = id ? classesData[id] : null;

  if (!classData) {
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

  // Get available dates for calendar
  const availableDatesSet = new Set(classData.availableDates.map(d => d.date));
  const availableDatesForSelection = classData.availableDates.map(d => new Date(d.date));

  // Get time slots for selected date
  const timeSlotsForDate = selectedDate
    ? classData.availableDates.filter(d => d.date === format(selectedDate, "yyyy-MM-dd"))
    : [];

  const selectedSlot = selectedTimeSlot
    ? classData.availableDates.find(
        d => d.date === format(selectedDate!, "yyyy-MM-dd") && d.time === selectedTimeSlot
      )
    : null;

  const totalPrice = classData.price * attendees;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTimeSlot) {
      toast({
        title: "Please select a date and time",
        description: "Choose an available date and time slot to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Please fill in required fields",
        description: "First name, last name, and email are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate booking submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setBookingComplete(true);
    setIsSubmitting(false);

    toast({
      title: "Booking confirmed!",
      description: `You're booked for ${classData.title} on ${format(selectedDate, "MMMM d, yyyy")}.`,
    });
  };

  if (bookingComplete) {
    return (
      <Layout>
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="w-20 h-20 rounded-full bg-accent/20 text-accent flex items-center justify-center mx-auto mb-8">
                <Check className="h-10 w-10" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
                Booking Confirmed!
              </h1>
              
              <p className="text-muted-foreground text-lg mb-8">
                Thank you for booking. A confirmation email has been sent to <span className="text-foreground font-medium">{formData.email}</span>
              </p>

              <div className="bg-card rounded-xl p-6 text-left shadow-elegant mb-8">
                <h2 className="font-serif text-xl font-semibold mb-4">Booking Details</h2>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Class</dt>
                    <dd className="font-medium">{classData.title}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Date</dt>
                    <dd className="font-medium">{format(selectedDate!, "MMMM d, yyyy")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Time</dt>
                    <dd className="font-medium">{selectedTimeSlot}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Attendees</dt>
                    <dd className="font-medium">{attendees}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3">
                    <dt className="text-muted-foreground">Total Paid</dt>
                    <dd className="font-semibold text-lg">${totalPrice}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="hero" size="lg">
                  <Link to="/classes">Book Another Class</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/">Return Home</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back Link */}
          <Link
            to="/classes"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Classes
          </Link>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-2">
                  Book Your Spot
                </h1>
                <p className="text-muted-foreground mb-8">
                  Reserve your place in <span className="text-foreground font-medium">{classData.title}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Step 1: Select Date */}
                  <div className="bg-card rounded-xl p-6 shadow-elegant">
                    <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">1</span>
                      Select Date & Time
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-3">Choose a Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-12",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                setSelectedDate(date);
                                setSelectedTimeSlot(null);
                              }}
                              disabled={(date) => {
                                const dateStr = format(date, "yyyy-MM-dd");
                                return !availableDatesSet.has(dateStr) || date < new Date();
                              }}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-3">Choose a Time</label>
                        {selectedDate ? (
                          timeSlotsForDate.length > 0 ? (
                            <div className="space-y-2">
                              {timeSlotsForDate.map((slot) => (
                                <button
                                  key={slot.time}
                                  type="button"
                                  onClick={() => setSelectedTimeSlot(slot.time)}
                                  disabled={slot.spotsLeft === 0}
                                  className={cn(
                                    "w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between",
                                    selectedTimeSlot === slot.time
                                      ? "border-primary bg-primary/5"
                                      : slot.spotsLeft === 0
                                      ? "border-border bg-muted opacity-50 cursor-not-allowed"
                                      : "border-border hover:border-primary"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{slot.time}</span>
                                  </div>
                                  <span className={cn(
                                    "text-sm",
                                    slot.spotsLeft <= 2 ? "text-destructive" : "text-muted-foreground"
                                  )}>
                                    {slot.spotsLeft === 0 ? "Full" : `${slot.spotsLeft} spots left`}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No available times for this date</p>
                          )
                        ) : (
                          <p className="text-muted-foreground p-3 border border-dashed border-border rounded-lg text-center">
                            Select a date first
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Attendees */}
                  <div className="bg-card rounded-xl p-6 shadow-elegant">
                    <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">2</span>
                      Number of Attendees
                    </h2>

                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setAttendees(Math.max(1, attendees - 1))}
                        disabled={attendees <= 1}
                      >
                        -
                      </Button>
                      <span className="text-2xl font-semibold w-12 text-center">{attendees}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setAttendees(Math.min(selectedSlot?.spotsLeft || 10, attendees + 1))}
                        disabled={attendees >= (selectedSlot?.spotsLeft || 10)}
                      >
                        +
                      </Button>
                      <span className="text-muted-foreground text-sm">
                        ${classData.price} per person
                      </span>
                    </div>

                    {selectedSlot && attendees > selectedSlot.spotsLeft && (
                      <p className="text-destructive text-sm mt-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Only {selectedSlot.spotsLeft} spots available
                      </p>
                    )}
                  </div>

                  {/* Step 3: Contact Info */}
                  <div className="bg-card rounded-xl p-6 shadow-elegant">
                    <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">3</span>
                      Your Information
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name *</label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="Jane"
                          required
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Doe"
                          required
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="jane@example.com"
                          required
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone (optional)</label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="xl"
                    className="w-full"
                    disabled={isSubmitting || !selectedDate || !selectedTimeSlot}
                  >
                    {isSubmitting ? "Processing..." : `Complete Booking - $${totalPrice}`}
                  </Button>
                </form>
              </motion.div>
            </div>

            {/* Class Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl overflow-hidden shadow-elegant sticky top-24">
                <img
                  src={classData.image}
                  alt={classData.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-6">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${levelColors[classData.level]}`}>
                    {classData.level}
                  </span>
                  <h3 className="font-serif text-xl font-semibold mb-2">{classData.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{classData.description}</p>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{classData.duration}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Instructor: {classData.instructor}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{classData.type === "online" ? "Online via Zoom" : "In-person at our studio"}</span>
                    </div>
                  </div>

                  <div className="border-t border-border mt-6 pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Price per person</span>
                      <span className="font-medium">${classData.price}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Attendees</span>
                      <span className="font-medium">{attendees}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t border-border">
                      <span>Total</span>
                      <span>${totalPrice}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-4">
                    All materials included. Free cancellation up to 48 hours before class.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
