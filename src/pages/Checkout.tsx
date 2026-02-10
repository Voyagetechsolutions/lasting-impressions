import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Truck, MapPin, Phone, Mail, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { useCustomer } from "@/contexts/CustomerAuthContext";
import { useToast } from "@/hooks/use-toast";

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user: customer, isAuthenticated: isCustomerLoggedIn, token: customerToken } = useCustomer();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [shippingMethod, setShippingMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  // Pre-fill from customer profile
  useEffect(() => {
    if (isCustomerLoggedIn && customer) {
      const nameParts = customer.name.split(" ");
      setShippingInfo(prev => ({
        ...prev,
        firstName: prev.firstName || nameParts[0] || "",
        lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
        email: prev.email || customer.email || "",
        phone: prev.phone || customer.phone || "",
      }));
    }
  }, [isCustomerLoggedIn, customer]);
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  // Shipping costs in ZAR
  const shippingCosts = {
    delivery: 150,
    pickup: 0,
  };

  const subtotal = totalPrice * 18.5; // Convert USD to ZAR (approximate rate)
  const shippingCost = shippingCosts[shippingMethod as keyof typeof shippingCosts];
  const total = subtotal + shippingCost;

  const handleShippingInfoChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentInfoChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const requiredShippingFields = shippingMethod === "delivery" 
      ? ["firstName", "lastName", "email", "phone", "address", "city", "province", "postalCode"]
      : ["firstName", "lastName", "email", "phone"];
    
    for (const field of requiredShippingFields) {
      if (!shippingInfo[field as keyof ShippingInfo]) {
        toast({
          title: "Missing Information",
          description: `Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`,
          variant: "destructive",
        });
        return false;
      }
    }

    if (paymentMethod === "card") {
      const requiredPaymentFields = ["cardNumber", "expiryDate", "cvv", "cardholderName"];
      for (const field of requiredPaymentFields) {
        if (!paymentInfo[field as keyof PaymentInfo]) {
          toast({
            title: "Missing Payment Information",
            description: `Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`,
            variant: "destructive",
          });
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order via API
      const orderPayload: any = {
        customer: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
        },
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant,
          image: item.image,
        })),
        total,
        shippingMethod,
        shippingAddress: shippingMethod === "delivery" ? {
          address: shippingInfo.address,
          city: shippingInfo.city,
          province: shippingInfo.province,
          postalCode: shippingInfo.postalCode,
        } : null,
        paymentMethod,
      };

      if (isCustomerLoggedIn && customer) {
        orderPayload.customerId = customer.id;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (isCustomerLoggedIn && customerToken) {
        headers["Authorization"] = `Bearer ${customerToken}`;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const newOrder = await response.json();

      clearCart();

      toast({
        title: "Order Successful!",
        description: "Your payment has been processed and order confirmed.",
      });

      navigate("/order-success", {
        state: {
          orderNumber: newOrder.id ? newOrder.id.slice(0, 8).toUpperCase() : `LI${Date.now()}`,
          total,
          shippingMethod,
          shippingInfo,
        }
      });

    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif mb-4">Your cart is empty</h1>
          <Button onClick={() => navigate("/shop/jewelry")}>
            Continue Shopping
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-8">
            Checkout
          </h1>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Guest sign-in prompt */}
                {!isCustomerLoggedIn && (
                  <div className="bg-secondary/30 rounded-xl p-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Have an account? Sign in to pre-fill your info and track this order.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </div>
                )}

                {/* Shipping Method */}
                <div className="bg-card rounded-xl p-6 shadow-elegant">
                  <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Method
                  </h2>
                  
                  <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Home Delivery</p>
                            <p className="text-sm text-muted-foreground">3-5 business days</p>
                          </div>
                          <span className="font-semibold">R{shippingCosts.delivery}</span>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Store Pickup</p>
                            <p className="text-sm text-muted-foreground">8 Simon Street, Rustivia, Germiston</p>
                          </div>
                          <span className="font-semibold">Free</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Shipping Information */}
                <div className="bg-card rounded-xl p-6 shadow-elegant">
                  <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {shippingMethod === "delivery" ? "Delivery" : "Contact"} Information
                  </h2>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) => handleShippingInfoChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) => handleShippingInfoChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleShippingInfoChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => handleShippingInfoChange("phone", e.target.value)}
                        placeholder="+27 76 852 0695"
                        required
                      />
                    </div>
                    
                    {shippingMethod === "delivery" && (
                      <>
                        <div className="sm:col-span-2">
                          <Label htmlFor="address">Street Address *</Label>
                          <Input
                            id="address"
                            value={shippingInfo.address}
                            onChange={(e) => handleShippingInfoChange("address", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={shippingInfo.city}
                            onChange={(e) => handleShippingInfoChange("city", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="province">Province *</Label>
                          <Input
                            id="province"
                            value={shippingInfo.province}
                            onChange={(e) => handleShippingInfoChange("province", e.target.value)}
                            placeholder="Gauteng"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="postalCode">Postal Code *</Label>
                          <Input
                            id="postalCode"
                            value={shippingInfo.postalCode}
                            onChange={(e) => handleShippingInfoChange("postalCode", e.target.value)}
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card rounded-xl p-6 shadow-elegant">
                  <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </h2>
                  
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Credit/Debit Card</span>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="eft" id="eft" />
                      <Label htmlFor="eft" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>EFT/Bank Transfer</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label htmlFor="cardholderName">Cardholder Name *</Label>
                        <Input
                          id="cardholderName"
                          value={paymentInfo.cardholderName}
                          onChange={(e) => handlePaymentInfoChange("cardholderName", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => handlePaymentInfoChange("cardNumber", e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            value={paymentInfo.expiryDate}
                            onChange={(e) => handlePaymentInfoChange("expiryDate", e.target.value)}
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            value={paymentInfo.cvv}
                            onChange={(e) => handlePaymentInfoChange("cvv", e.target.value)}
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "eft" && (
                    <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
                      <h3 className="font-semibold mb-2">Bank Transfer Details</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Please transfer the total amount to:
                      </p>
                      <div className="text-sm space-y-1">
                        <p><strong>Bank:</strong> Standard Bank</p>
                        <p><strong>Account Name:</strong> Lasting Impressions</p>
                        <p><strong>Account Number:</strong> 123456789</p>
                        <p><strong>Branch Code:</strong> 051001</p>
                        <p><strong>Reference:</strong> Your order number</p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>Processing Payment...</>
                  ) : (
                    <>Complete Order - R{total.toFixed(2)}</>
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-elegant sticky top-24">
                <h2 className="font-serif text-xl font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variant || ""}`} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">{item.variant}</p>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                          <span className="font-semibold text-sm">R{(item.price * item.quantity * 18.5).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? "Free" : `R${shippingCost.toFixed(2)}`}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>R{total.toFixed(2)}</span>
                </div>

                <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium">Contact Us:</p>
                      <p>lastingimpressions2005@gmail.com</p>
                      <p>+27 76 852 0695</p>
                      <p>8 Simon Street, Rustivia, Germiston</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
