import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useCustomer } from "@/contexts/CustomerAuthContext";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Jewelry", path: "/shop/jewelry" },
  { name: "Custom Beads", path: "/custom-beads" },
  { name: "Classes", path: "/classes" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { user: customer, isAuthenticated: isCustomerLoggedIn, logout: customerLogout } = useCustomer();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="Lasting Impressions" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium tracking-wide transition-colors hover:text-primary ${
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {isCustomerLoggedIn ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/account")} className="text-sm">
                  <User className="h-4 w-4 mr-1" />
                  {customer?.name?.split(" ")[0]}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { customerLogout(); navigate("/"); }}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-sm">
                <User className="h-4 w-4 mr-1" />
                Sign In
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                {totalItems}
              </span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2 border-t border-border/50">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block py-3 px-4 rounded-lg text-base font-medium transition-colors ${
                      location.pathname === link.path
                        ? "bg-secondary text-primary"
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex items-center gap-4 pt-4 px-4">
                  {isCustomerLoggedIn ? (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setIsOpen(false); navigate("/account"); }}>
                      <User className="h-4 w-4 mr-2" />
                      Account
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setIsOpen(false); navigate("/login"); }}>
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setIsOpen(false);
                      setCartOpen(true);
                    }}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Cart ({totalItems})
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
