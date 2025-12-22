import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-semibold text-gold">
              Lasting Impressions
            </h3>
            <p className="text-cream/70 text-sm leading-relaxed">
              Handcrafted beauty, timeless skills. Discover unique jewelry and learn the art of beading with us.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="#"
                className="p-2 rounded-full bg-cream/10 hover:bg-cream/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-cream/10 hover:bg-cream/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="mailto:hello@lastingimpressions.com"
                className="p-2 rounded-full bg-cream/10 hover:bg-cream/20 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shop/jewelry" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Jewelry Collection
                </Link>
              </li>
              <li>
                <Link to="/shop/beads" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Beads & Supplies
                </Link>
              </li>
              <li>
                <Link to="/shop/beads" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Beading Kits
                </Link>
              </li>
              <li>
                <Link to="/shop/jewelry" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Gift Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium">Learn</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/classes" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Beading Classes
                </Link>
              </li>
              <li>
                <Link to="/classes" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Workshops
                </Link>
              </li>
              <li>
                <Link to="/classes" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Private Lessons
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-cream/70 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>8 Simon Street<br />Rustivia, Germiston</span>
              </li>
              <li className="flex items-center gap-3 text-cream/70 text-sm">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+27 76 852 0695</span>
              </li>
              <li className="flex items-center gap-3 text-cream/70 text-sm">
                <Mail className="h-4 w-4 shrink-0" />
                <span>lastingimpressions2005@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-cream/50 text-sm">
            © {new Date().getFullYear()} Lasting Impressions. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="#" className="text-cream/50 hover:text-cream transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-cream/50 hover:text-cream transition-colors">
              Terms of Service
            </Link>
            <Link to="#" className="text-cream/50 hover:text-cream transition-colors">
              Shipping Info
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
