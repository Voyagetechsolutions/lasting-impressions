import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Send, Palette, Ruler, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";

export default function CustomBeadsRequest() {
  const { addCustomRequest } = useAdmin();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    description: "",
    material: "",
    color: "",
    size: "",
    quantity: "",
    budget: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing

      addCustomRequest({
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        description: formData.description,
        specifications: {
          material: formData.material || undefined,
          color: formData.color || undefined,
          size: formData.size || undefined,
          quantity: formData.quantity || undefined,
          budget: formData.budget || undefined,
        },
        status: "pending",
      });

      toast({
        title: "Request Submitted!",
        description: "We'll review your custom bead request and get back to you within 24-48 hours.",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        description: "",
        material: "",
        color: "",
        size: "",
        quantity: "",
        budget: 0,
      });

    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const materials = [
    "Glass",
    "Crystal",
    "Gemstone",
    "Wood",
    "Metal",
    "Ceramic",
    "Polymer Clay",
    "Natural Stone",
    "Pearl",
    "Bone",
    "Shell",
    "Other"
  ];

  const sizes = [
    "2mm (Seed beads)",
    "4mm (Small)",
    "6mm (Medium)",
    "8mm (Large)",
    "10mm (Extra Large)",
    "12mm+",
    "Mixed sizes",
    "Custom size"
  ];

  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
                Custom Beads Request
              </h1>
              <p className="text-muted-foreground text-lg">
                Can't find exactly what you're looking for? Let us create custom beads just for you!
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader className="text-center">
                  <Palette className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Custom Colors</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Match your exact color requirements with our custom color mixing service
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Ruler className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Custom Sizes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Get beads in the exact dimensions you need for your specific project
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Package className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Bulk Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Special pricing available for large quantity orders and commercial projects
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
                <CardDescription>
                  Fill out the form below with as much detail as possible about your custom bead requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+27 76 852 0695"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Project Description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Project Description</h3>
                    <div>
                      <Label htmlFor="description">Describe your custom bead requirements *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        placeholder="Please describe what you're looking for in detail. Include information about your project, intended use, style preferences, and any specific requirements..."
                        required
                      />
                    </div>
                  </div>

                  {/* Specifications */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Specifications (Optional)</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="material">Preferred Material</Label>
                        <Select value={formData.material} onValueChange={(value) => setFormData({ ...formData, material: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.map((material) => (
                              <SelectItem key={material} value={material}>
                                {material}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="color">Color Preference</Label>
                        <Input
                          id="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          placeholder="e.g., Deep blue, Rose gold, etc."
                        />
                      </div>

                      <div>
                        <Label htmlFor="size">Size Requirements</Label>
                        <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {sizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="quantity">Quantity Needed</Label>
                        <Input
                          id="quantity"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          placeholder="e.g., 100 pieces, 1 strand, etc."
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="budget">Budget Range (ZAR)</Label>
                        <Input
                          id="budget"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                          placeholder="Optional - helps us provide appropriate options"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Placeholder */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Reference Images (Optional)</h3>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">
                        Upload reference images or inspiration photos
                      </p>
                      <p className="text-sm text-muted-foreground">
                        For now, please email images to: lastingimpressions2005@gmail.com
                      </p>
                    </div>
                  </div>

                  <div className="bg-secondary/20 rounded-lg p-6">
                    <h4 className="font-semibold mb-2">What happens next?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• We'll review your request within 24-48 hours</li>
                      <li>• Our team will contact you to discuss details and feasibility</li>
                      <li>• We'll provide a custom quote with pricing and timeline</li>
                      <li>• Upon approval, we'll begin creating your custom beads</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="xl"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Processing Request...</>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Submit Custom Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
