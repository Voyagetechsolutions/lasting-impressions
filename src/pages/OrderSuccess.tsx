import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Download, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

export default function OrderSuccess() {
  const location = useLocation();
  const { orderNumber, total, shippingMethod, shippingInfo } = location.state || {};

  if (!orderNumber) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif mb-4">Order not found</h1>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

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
              Order Confirmed!
            </h1>
            
            <p className="text-muted-foreground text-lg mb-8">
              Thank you for your purchase! Your order has been successfully processed.
            </p>

            <div className="bg-card rounded-xl p-6 text-left shadow-elegant mb-8">
              <h2 className="font-serif text-xl font-semibold mb-4">Order Details</h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Order Number</dt>
                  <dd className="font-medium">{orderNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total Paid</dt>
                  <dd className="font-semibold text-lg">R{total?.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery Method</dt>
                  <dd className="font-medium">
                    {shippingMethod === "delivery" ? "Home Delivery" : "Store Pickup"}
                  </dd>
                </div>
                {shippingInfo && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Customer</dt>
                    <dd className="font-medium">
                      {shippingInfo.firstName} {shippingInfo.lastName}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-secondary/20 rounded-xl p-6 mb-8">
              <h3 className="font-semibold mb-4">What happens next?</h3>
              <div className="text-left space-y-3 text-sm">
                {shippingMethod === "delivery" ? (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">1</div>
                      <div>
                        <p className="font-medium">Order Processing</p>
                        <p className="text-muted-foreground">We'll prepare your items for shipping within 1-2 business days.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">2</div>
                      <div>
                        <p className="font-medium">Shipping</p>
                        <p className="text-muted-foreground">Your order will be delivered within 3-5 business days.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">3</div>
                      <div>
                        <p className="font-medium">Delivery</p>
                        <p className="text-muted-foreground">You'll receive tracking information via email.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">1</div>
                      <div>
                        <p className="font-medium">Order Processing</p>
                        <p className="text-muted-foreground">We'll prepare your items for pickup within 1-2 business days.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">2</div>
                      <div>
                        <p className="font-medium">Pickup Notification</p>
                        <p className="text-muted-foreground">We'll contact you when your order is ready for collection.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">3</div>
                      <div>
                        <p className="font-medium">Collection</p>
                        <p className="text-muted-foreground">Visit our store at 8 Simon Street, Rustivia, Germiston.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 mb-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="text-left space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>lastingimpressions2005@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+27 76 852 0695</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>8 Simon Street, Rustivia, Germiston</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero" size="lg">
                <Link to="/shop/jewelry">Continue Shopping</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/">Return Home</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-8">
              A confirmation email has been sent to {shippingInfo?.email}
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
