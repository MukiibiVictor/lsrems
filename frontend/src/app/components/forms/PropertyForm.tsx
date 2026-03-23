import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { PropertyStatus } from "../../../types";

export interface PropertyFormData {
  property_name: string;
  location: string;
  size: string;
  description?: string;
  price?: number | null;
  land_title_id?: number;
  property_type: 'land' | 'house' | 'commercial' | 'apartment';
  status?: PropertyStatus;
}

interface PropertyFormProps {
  initialData?: PropertyFormData;
  onSubmit: (data: PropertyFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  landTitles?: Array<{ id: number; project_name: string }>;
}

export function PropertyForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading,
  landTitles = []
}: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>(
    initialData || {
      property_name: "",
      location: "",
      size: "",
      description: "",
      price: null,
      property_type: "land",
      status: "available",
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof PropertyFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PropertyFormData, string>> = {};

    if (!formData.property_name.trim()) {
      newErrors.property_name = "Property name is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.size.trim()) {
      newErrors.size = "Size is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof PropertyFormData, value: string | number | null | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="property_name">Property Name *</Label>
        <Input
          id="property_name"
          value={formData.property_name}
          onChange={(e) => handleChange("property_name", e.target.value)}
          placeholder="Enter property name"
          className={errors.property_name ? "border-red-500" : ""}
        />
        {errors.property_name && <p className="text-sm text-red-600">{errors.property_name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="City, State"
          className={errors.location ? "border-red-500" : ""}
        />
        {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="property_type">Property Type *</Label>
          <Select
            value={formData.property_type}
            onValueChange={(value) => handleChange("property_type", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Size *</Label>
          <Input
            id="size"
            value={formData.size}
            onChange={(e) => handleChange("size", e.target.value)}
            placeholder="e.g., 5,000 sqft"
            className={errors.size ? "border-red-500" : ""}
          />
          {errors.size && <p className="text-sm text-red-600">{errors.size}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (UGX, Optional)</Label>
        <Input
          id="price"
          type="number"
          min="0"
          value={formData.price ?? ""}
          onChange={(e) => handleChange("price", e.target.value === "" ? null : parseFloat(e.target.value))}
          placeholder="e.g., 50000000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe the property..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="land_title_id">Land Title (Optional)</Label>        <Select
          value={formData.land_title_id?.toString() || "none"}
          onValueChange={(value) => handleChange("land_title_id", value === "none" ? undefined : parseInt(value))}        >
          <SelectTrigger>
            <SelectValue placeholder="Select land title" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No land title</SelectItem>
            {landTitles.map((title) => (
              <SelectItem key={title.id} value={title.id.toString()}>
                {title.project_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleChange("status", value as PropertyStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="rented">Rented</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Property" : "Create Property"}
        </Button>
      </div>
    </form>
  );
}
