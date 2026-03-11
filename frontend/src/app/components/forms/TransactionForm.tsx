import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TransactionType } from "../../../types";

export interface TransactionFormData {
  property_id: number;
  customer_id: number;
  transaction_type: TransactionType;
  price: number;
  transaction_date?: string;
}

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  properties?: Array<{ id: number; property_name: string }>;
  customers?: Array<{ id: number; name: string }>;
}

export function TransactionForm({ 
  onSubmit, 
  onCancel, 
  isLoading,
  properties = [],
  customers = []
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    property_id: 0,
    customer_id: 0,
    transaction_type: "sale",
    price: 0,
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TransactionFormData, string>> = {};

    if (!formData.property_id || formData.property_id === 0) {
      newErrors.property_id = "Property is required";
    }

    if (!formData.customer_id || formData.customer_id === 0) {
      newErrors.customer_id = "Customer is required";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
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

  const handleChange = (field: keyof TransactionFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="property_id">Property *</Label>
        <Select
          value={formData.property_id.toString()}
          onValueChange={(value) => handleChange("property_id", parseInt(value))}
        >
          <SelectTrigger className={errors.property_id ? "border-red-500" : ""}>
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id.toString()}>
                {property.property_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.property_id && <p className="text-sm text-red-600">{errors.property_id}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_id">Customer *</Label>
        <Select
          value={formData.customer_id.toString()}
          onValueChange={(value) => handleChange("customer_id", parseInt(value))}
        >
          <SelectTrigger className={errors.customer_id ? "border-red-500" : ""}>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id.toString()}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customer_id && <p className="text-sm text-red-600">{errors.customer_id}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="transaction_type">Transaction Type *</Label>
        <Select
          value={formData.transaction_type}
          onValueChange={(value) => handleChange("transaction_type", value as TransactionType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sale">Sale</SelectItem>
            <SelectItem value="rental">Rental</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">
          Price * {formData.transaction_type === "rental" && "(per month)"}
        </Label>
        <Input
          id="price"
          type="number"
          value={formData.price || ""}
          onChange={(e) => handleChange("price", parseFloat(e.target.value))}
          placeholder="Enter price"
          className={errors.price ? "border-red-500" : ""}
        />
        {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="transaction_date">Transaction Date</Label>
        <Input
          id="transaction_date"
          type="date"
          value={formData.transaction_date}
          onChange={(e) => handleChange("transaction_date", e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Transaction"}
        </Button>
      </div>
    </form>
  );
}
