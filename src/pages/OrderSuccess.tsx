import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Download, Mail, Phone, MapPin, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Separator } from "@/components/ui/separator";

export default function OrderSuccess() {
  const location = useLocation();
  const { orderNumber, total, shippingMethod, shippingInfo, items, paymentMethod } = location.state || {};

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
                Order Confirmed!
              </h1>
              
              <p className="text-muted-foreground text-lg mb-6">
                Thank you for your purchase! Your order has been successfully processed.
              </p>

              <Button onClick={handlePrint} variant="outline" className="gap-2 print:hidden">
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
            </div>

            {/* Receipt */}
            <div className="bg-card rounded-xl p-8 shadow-elegant border-2 border-border">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-serif font-semibold mb-2">Lasting Impressions</h2>
                <p className="text-sm text-muted-foreground">8 Simon Street, Rustivia, Germiston</p>
                <p className="text-sm text-muted-foreground">+27 76 852 0695</p>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number</span>
                  <span className="font-mono font-semibold">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{shippingInfo?.firstName} {shippingInfo?.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{shippingInfo?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{shippingInfo?.phone}</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="mb-6">
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {item.variant && <p className="text-sm text-muted-foreground">{item.variant}</p>}
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">R{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R{(total - (shippingMethod === 'delivery' ? 150 : 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping ({shippingMethod === 'delivery' ? 'Home Delivery' : 'Store Pickup'})</span>
                  <span>{shippingMethod === 'delivery' ? 'R150.00' : 'Free'}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Paid</span>
                  <span>R{total?.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'}</span>
                </div>
                {paymentMethod === 'eft' && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="font-semibold text-amber-900 mb-2">⚠️ Payment Pending</p>
                    <p className="text-sm text-amber-800 mb-3">
                      Contact us on <strong>+27 76 852 0695</strong> for banking details to complete your payment.
                    </p>
                    <p className="text-xs text-amber-700">
                      Your order will be processed once payment is confirmed.
                    </p>
                  </div>
                )}
              </div>

              {shippingMethod === 'delivery' && shippingInfo && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="font-semibold mb-2">Delivery Address</h3>
                    <p className="text-sm text-muted-foreground">
                      {shippingInfo.address}<br />
                      {shippingInfo.city}, {shippingInfo.province}<br />
                      {shippingInfo.postalCode}
                    </p>
                  </div>
                </>
              )}

              <div className="mt-8 pt-6 border-t border-dashed text-center text-xs text-muted-foreground">
                <p>This serves as proof of your order with Lasting Impressions</p>
                <p className="mt-1">For queries: lastingimpressions2005@gmail.com | +27 76 852 0695</p>
              </div>
            </div>

            <div className="mt-8 bg-secondary/20 rounded-xl p-6 print:hidden">
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

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 print:hidden">
              <Button asChild variant="hero" size="lg">
                <Link to="/shop/jewelry">Continue Shopping</Link>
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
