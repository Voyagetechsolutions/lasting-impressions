import { Link } from "react-router-dom";
import { ShoppingBag, Heart, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  originalPrice?: number;
  material?: string;
  color?: string;
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [showLightbox, setShowLightbox] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLightbox(true);
  };

  return (
    <>
      <article className="group bg-card rounded-2xl overflow-hidden shadow-elegant hover:shadow-elevated transition-all duration-500">
        <div className="block relative aspect-square overflow-hidden">
          <Link to={`/product/${product.id}`}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </Link>
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300" />
          
          {/* Quick actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleImageClick}
              className="p-2 bg-background rounded-full shadow-md hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="View image"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              className="p-2 bg-background rounded-full shadow-md hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>
        
          {/* Category badge */}
          <span className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1 rounded-full">
            {product.category}
          </span>

          {/* Sale badge */}
          {product.originalPrice && (
            <span className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded-full">
              Sale
            </span>
          )}
        </div>

        <div className="p-6">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-serif text-lg font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-foreground">
                R{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  R{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            <Button 
              size="sm" 
              variant="default" 
              className="gap-2"
              onClick={handleAddToCart}
              disabled={product.inStock === false}
            >
              <ShoppingBag className="h-4 w-4" />
              {product.inStock === false ? "Out of Stock" : "Add"}
            </Button>
          </div>
        </div>
      </article>

      {/* Lightbox */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
