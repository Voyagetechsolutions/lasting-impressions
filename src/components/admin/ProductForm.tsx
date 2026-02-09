import { useState, useEffect, useRef } from "react";
import { X, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdmin, Product, Category } from "@/contexts/AdminContext";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export default function ProductForm({ isOpen, onClose, product }: ProductFormProps) {
  const { addProduct, updateProduct, categories } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    stock: "",
    material: "",
    color: "",
    inStock: true,
    description: "",
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        price: product.price?.toString() || "",
        originalPrice: product.originalPrice?.toString() || "",
        category: product.category || "",
        stock: product.stock?.toString() || "",
        material: product.material || "",
        color: product.color || "",
        inStock: product.inStock ?? true,
        description: product.description || "",
      });
      setExistingImages(product.images || []);
      setImagePreviews([]);
      setImageFiles([]);
    } else {
      setFormData({
        name: "",
        price: "",
        originalPrice: "",
        category: "",
        stock: "",
        material: "",
        color: "",
        inStock: true,
        description: "",
      });
      setExistingImages([]);
      setImagePreviews([]);
      setImageFiles([]);
    }
  }, [product, isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalImages = existingImages.length + imageFiles.length + files.length;
    if (totalImages > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setImageFiles(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      alert("Name and price are required");
      return;
    }

    if (existingImages.length === 0 && imageFiles.length === 0) {
      alert("At least one image is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append("name", formData.name);
      submitFormData.append("price", formData.price);
      submitFormData.append("description", formData.description);
      submitFormData.append("category", formData.category);
      submitFormData.append("material", formData.material);
      submitFormData.append("color", formData.color);
      submitFormData.append("stock", formData.stock || "0");
      submitFormData.append("inStock", String(formData.inStock));

      if (formData.originalPrice) {
        submitFormData.append("originalPrice", formData.originalPrice);
      }

      // Add existing images if editing
      if (existingImages.length > 0) {
        submitFormData.append("existingImages", JSON.stringify(existingImages));
      }

      // Add new image files
      imageFiles.forEach(file => {
        submitFormData.append("images", file);
      });

      if (product) {
        await updateProduct(product.id, submitFormData);
      } else {
        await addProduct(submitFormData);
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const materials = [
    "Glass",
    "Crystal",
    "Wood",
    "Metal",
    "Ceramic",
    "Stone",
    "Polymer Clay",
    "Other",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update the product details below." : "Fill in the details for the new product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div>
            <Label className="mb-2 block">Product Images *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Current Images:</p>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((img, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <img
                          src={img}
                          alt={`Product ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">New Images:</p>
                  <div className="flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={`preview-${index}`} className="relative group">
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2"
                disabled={existingImages.length + imageFiles.length >= 5}
              >
                <Upload className="h-4 w-4" />
                Upload Images ({existingImages.length + imageFiles.length}/5)
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                JPG, PNG, GIF, or WebP. Max 5MB per image.
              </p>
            </div>
          </div>

          {/* Name and Price Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price (R) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Category and Material Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Glass Beads">Glass Beads</SelectItem>
                  <SelectItem value="Crystal Beads">Crystal Beads</SelectItem>
                  <SelectItem value="Seed Beads">Seed Beads</SelectItem>
                  <SelectItem value="Wood Beads">Wood Beads</SelectItem>
                  <SelectItem value="Metal Beads">Metal Beads</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="material">Material</Label>
              <Select
                value={formData.material}
                onValueChange={(value) => setFormData({ ...formData, material: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((mat) => (
                    <SelectItem key={mat} value={mat}>
                      {mat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stock and Color Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g., Turquoise, Red, Mixed"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          {/* In Stock Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={formData.inStock}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, inStock: checked as boolean })
              }
            />
            <Label htmlFor="inStock" className="cursor-pointer">
              Product is in stock
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : product ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
