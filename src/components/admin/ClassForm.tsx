import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ClassFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClassForm({ isOpen, onClose, onSuccess }: ClassFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    level: "",
    date: "",
    time: "",
    max_participants: "",
    spots_left: "",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      toast({ title: "Error", description: "Title and price are required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = "";
      
      // Upload image if provided
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('class-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('class-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Insert class
      const { error } = await supabase.from('classes').insert({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: formData.duration,
        level: formData.level,
        date: formData.date,
        time: formData.time,
        max_participants: parseInt(formData.max_participants) || null,
        spots_left: parseInt(formData.spots_left) || null,
        image_url: imageUrl || null,
      });

      if (error) throw error;

      toast({ title: "Class Added", description: "Class has been created successfully." });
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        duration: "",
        level: "",
        date: "",
        time: "",
        max_participants: "",
        spots_left: "",
      });
      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      console.error("Failed to add class:", error);
      toast({ title: "Error", description: "Failed to add class", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <Label>Class Image</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              {imagePreview && (
                <div className="mb-4 relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(""); }}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="price">Price (R) *</Label>
              <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" placeholder="e.g., 2 hours" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="level">Level</Label>
              <Input id="level" placeholder="e.g., Beginner" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_participants">Max Participants</Label>
              <Input id="max_participants" type="number" value={formData.max_participants} onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="spots_left">Spots Left</Label>
              <Input id="spots_left" type="number" value={formData.spots_left} onChange={(e) => setFormData({ ...formData, spots_left: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Add Class"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
