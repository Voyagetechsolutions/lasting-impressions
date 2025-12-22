import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Minus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-2">
                Shopping Cart
              </h1>
              <p className="text-muted-foreground">
                {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            {items.length > 0 && (
              <Button variant="ghost" onClick={clearCart} className="text-destructive hover:text-destructive">
                Clear Cart
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <ShoppingBag className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any items yet.
              </p>
              <Button asChild variant="hero" size="lg">
                <Link to="/shop/jewelry">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {items.map((item, index) => (
                    <motion.div
                      key={`${item.id}-${item.variant || ""}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-6 p-6 bg-card rounded-xl shadow-elegant"
                    >
                      <Link
                        to={`/product/${item.id}`}
                        className="w-32 h-32 rounded-lg overflow-hidden bg-secondary flex-shrink-0"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              to={`/product/${item.id}`}
                              className="font-serif text-lg font-medium text-foreground hover:text-primary transition-colors"
                            >
                              {item.name}
                            </Link>
                            {item.variant && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Variant: {item.variant}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {item.category}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id, item.variant)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-border rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                              className="p-3 hover:bg-secondary transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                              className="p-3 hover:bg-secondary transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-foreground">
                              R{(item.price * item.quantity * 18.5).toFixed(2)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-muted-foreground">
                                R{(item.price * 18.5).toFixed(2)} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8">
                  <Button asChild variant="ghost">
                    <Link to="/shop/jewelry">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl p-8 shadow-elegant sticky top-24">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>R{(totalPrice * 18.5).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax</span>
                      <span>Included</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex justify-between text-lg font-semibold text-foreground">
                      <span>Total</span>
                      <span>R{(totalPrice * 18.5).toFixed(2)}</span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" variant="hero" asChild>
                    <Link to="/checkout">Proceed to Checkout</Link>
                  </Button>

                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Secure checkout powered by Stripe
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
