import { Link } from "react-router-dom";
import { ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  originalPrice?: number;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group bg-card rounded-2xl overflow-hidden shadow-elegant hover:shadow-elevated transition-all duration-500">
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300" />
        
        {/* Quick actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
      </Link>

      <div className="p-6">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif text-lg font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-foreground">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          
          <Button size="sm" variant="default" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}
