import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, MapPin, ArrowLeft, Check, AlertCircle, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import classImage from "@/assets/beading-class.jpg";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "27768520695";
const LOCATION = "8 Simon Street, Rustivia, Germiston";

interface ClassData {
  id: string;
  title: string;
  description: string;
  level: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  max_participants: number;
  spots_left: number;
  image_url?: string;
  category?: string;
}

interface BookingResult {
  bookingReference: string;
  className: string;
  classLevel: string;
  date: string;
  time: string;
  duration: string;
  quantity: number;
  pricePerPerson: number;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  notes: string;
}

function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const seq = Date.now().toString().slice(-6);
  return `CLS-${year}-${seq}`;
}

function buildWhatsAppMessage(booking: BookingResult): string {
  const lines = [
    `Hello, I want to book this class.`,
    ``,
    `Ref: ${booking.bookingReference}`,
    `Class: ${booking.className}${booking.classLevel ? ` (${booking.classLevel})` : ""}`,
    `Date: ${booking.date}`,
    `Time: ${booking.time}`,
    `Duration: ${booking.duration}`,
    `People: ${booking.quantity}`,
    `Price: R${booking.pricePerPerson} pp`,
    `Total: R${booking.totalPrice}`,
    `Location: ${LOCATION}`,
    ``,
    `Name: ${booking.customerName}`,
    `Phone: ${booking.customerPhone}`,
    `Notes: ${booking.notes || "None"}`,
    ``,
    `Please confirm availability and send payment details.`,
  ];
  return lines.join("\n");
}

function openWhatsApp(booking: BookingResult) {
  const message = buildWhatsAppMessage(booking);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

const levelColors: Record<string, string> = {
  Beginner: "bg-teal/10 text-teal",
  Intermediate: "bg-primary/10 text-primary",
  Advanced: "bg-accent/10 text-accent",
};

export default function ClassBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Fetch class data from Supabase
  useEffect(() => {
    const fetchClass = async () => {
      try {
        const { data, error } = await supabase
          .from("classes")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setClassData({
          ...data,
          price: parseFloat(data.price) || 0,
          spots_left: data.spots_left ?? data.max_participants ?? 10,
          max_participants: data.max_participants ?? 10,
        });
      } catch (error) {
        console.error("Failed to fetch class:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchClass();
  }, [id]);

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

  const totalPrice = classData ? classData.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!classData) return;

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({
        title: "Please fill in required fields",
        description: "First name, last name, email, and phone number are required.",
        variant: "destructive",
      });
      return;
    }

    if (quantity > classData.spots_left) {
      toast({
        title: "Not enough spots",
        description: `Only ${classData.spots_left} spots available.`,
        variant: "destructive",
      });
      return;
    }

    if (classData.spots_left === 0) {
      toast({
        title: "Class is full",
        description: "This class has no available spots.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingRef = generateBookingReference();

      // Insert booking record
      const { error: bookingError } = await supabase.from("bookings").insert({
        class_id: classData.id,
        class_name: classData.title,
        booking_reference: bookingRef,
        customer_first_name: formData.firstName.trim(),
        customer_last_name: formData.lastName.trim(),
        customer_email: formData.email.trim(),
        customer_phone: formData.phone.trim(),
        date: classData.date,
        time: classData.time,
        attendees: quantity,
        total_price: totalPrice,
        notes: formData.notes.trim() || null,
        status: "PENDING_WHATSAPP_CONFIRMATION",
      });

      if (bookingError) throw bookingError;

      // Decrement spots_left
      const newSpotsLeft = Math.max(0, classData.spots_left - quantity);
      const { error: updateError } = await supabase
        .from("classes")
        .update({ spots_left: newSpotsLeft })
        .eq("id", classData.id);

      if (updateError) {
        console.error("Failed to update spots:", updateError);
        // Non-blocking — booking was saved
      }

      const result: BookingResult = {
        bookingReference: bookingRef,
        className: classData.title,
        classLevel: classData.level || "",
        date: formatDate(classData.date),
        time: classData.time || "TBA",
        duration: classData.duration || "TBA",
        quantity,
        pricePerPerson: classData.price,
        totalPrice,
        customerName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        customerPhone: formData.phone.trim(),
        notes: formData.notes.trim(),
      };

      setBookingResult(result);
      setBookingComplete(true);

      // Open WhatsApp
      openWhatsApp(result);

      toast({
        title: "Booking submitted!",
        description: `Reference: ${bookingRef}. WhatsApp should open now.`,
      });
    } catch (error) {
      console.error("Booking failed:", error);
      toast({
        title: "Booking failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Class not found
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

  // Booking complete — success screen
  if (bookingComplete && bookingResult) {
    return (
      <Layout>
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-8">
                <Check className="h-10 w-10" />
              </div>

              <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
                Booking Submitted!
              </h1>

              <p className="text-muted-foreground text-lg mb-2">
                Your booking reference is:
              </p>
              <p className="text-2xl font-bold text-primary mb-6">
                {bookingResult.bookingReference}
              </p>
              <p className="text-muted-foreground mb-8">
                WhatsApp should have opened with your booking details. Please send the message to confirm your booking.
              </p>

              <div className="bg-card rounded-xl p-6 text-left shadow-elegant mb-8">
                <h2 className="font-serif text-xl font-semibold mb-4">Booking Details</h2>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Class</dt>
                    <dd className="font-medium">{bookingResult.className}</dd>
                  </div>
                  {bookingResult.classLevel && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Level</dt>
                      <dd className="font-medium">{bookingResult.classLevel}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Date</dt>
                    <dd className="font-medium">{bookingResult.date}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Time</dt>
                    <dd className="font-medium">{bookingResult.time}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd className="font-medium">{bookingResult.duration}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">People</dt>
                    <dd className="font-medium">{bookingResult.quantity}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="font-medium">{LOCATION}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3">
                    <dt className="text-muted-foreground">Total</dt>
                    <dd className="font-semibold text-lg">R{bookingResult.totalPrice.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="hero"
                  size="lg"
                  className="gap-2"
                  onClick={() => openWhatsApp(bookingResult)}
                >
                  <MessageCircle className="h-5 w-5" />
                  Open WhatsApp Again
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/classes">Browse More Classes</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  // Main booking form
  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back Link */}
          <Link
            to={`/classes/${id}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Class Details
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
                  Book This Class
                </h1>
                <p className="text-muted-foreground mb-8">
                  Reserve your place in{" "}
                  <span className="text-foreground font-medium">
                    {classData.title}
                  </span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Customer Details */}
                  <div className="bg-card rounded-xl p-6 shadow-elegant">
                    <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                        1
                      </span>
                      Your Details
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          First Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                          placeholder="John"
                          required
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Last Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                          }
                          placeholder="Doe"
                          required
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="john@example.com"
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                          Phone Number <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="+27 76 852 0695"
                          required
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Number of People */}
                  <div className="bg-card rounded-xl p-6 shadow-elegant">
                    <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                        2
                      </span>
                      Number of People
                    </h2>

                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="text-2xl font-semibold w-12 text-center">
                        {quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setQuantity(Math.min(classData.spots_left, quantity + 1))
                        }
                        disabled={quantity >= classData.spots_left}
                      >
                        +
                      </Button>
                      <span className="text-muted-foreground text-sm">
                        R{classData.price.toFixed(2)} per person
                      </span>
                    </div>

                    {quantity >= classData.spots_left && (
                      <p className="text-amber-600 text-sm mt-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Maximum spots reached ({classData.spots_left} available)
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="bg-card rounded-xl p-6 shadow-elegant">
                    <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                        3
                      </span>
                      Additional Notes
                      <span className="text-muted-foreground text-sm font-normal ml-1">
                        (optional)
                      </span>
                    </h2>

                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Any special requests or notes..."
                      className="w-full min-h-[100px] rounded-lg border border-border bg-background px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full gap-2 text-lg py-6"
                    disabled={isSubmitting || classData.spots_left === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creating Booking...
                      </>
                    ) : classData.spots_left === 0 ? (
                      "Class is Full"
                    ) : (
                      <>
                        <MessageCircle className="h-5 w-5" />
                        Book & Confirm via WhatsApp — R{totalPrice.toFixed(2)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    After submitting, WhatsApp will open with your booking details pre-filled.
                    Send the message to confirm your booking.
                  </p>
                </form>
              </motion.div>
            </div>

            {/* Class Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl overflow-hidden shadow-elegant sticky top-24">
                <img
                  src={classData.image_url || classImage}
                  alt={classData.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-6">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${levelColors[classData.level] || levelColors.Beginner
                      }`}
                  >
                    {classData.level || "All Levels"}
                  </span>
                  <h3 className="font-serif text-xl font-semibold mb-2">
                    {classData.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {classData.description}
                  </p>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(classData.date)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{classData.time || "TBA"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>Duration: {classData.duration || "TBA"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {classData.spots_left} of {classData.max_participants} spots left
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{LOCATION}</span>
                    </div>
                  </div>

                  <div className="border-t border-border mt-6 pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Price per person</span>
                      <span className="font-medium">R{classData.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">People</span>
                      <span className="font-medium">{quantity}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t border-border">
                      <span>Total</span>
                      <span>R{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-4">
                    All materials included. Payment details will be shared via WhatsApp after booking.
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
