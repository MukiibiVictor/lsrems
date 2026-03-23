import { useState, useEffect, useRef } from "react";
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
import { ProjectStatus } from "../../../types";
import { customerService } from "../../../services";

export interface ProjectFormData {
  customer_id: number;
  customer_name?: string;
  surveyor_id?: number;
  project_name: string;
  location: string;
  status?: ProjectStatus;
}

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  surveyors?: Array<{ id: number; name: string }>;
}

export function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  surveyors = [],
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    customer_id: initialData?.customer_id || 0,
    customer_name: initialData?.customer_name || "",
    surveyor_id: initialData?.surveyor_id || 0,
    project_name: initialData?.project_name || "",
    location: initialData?.location || "",
    status: initialData?.status || "pending",
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [customerQuery, setCustomerQuery] = useState(initialData?.customer_name || "");
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search customers as user types
  useEffect(() => {
    if (customerQuery.length < 1) {
      setCustomerSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await customerService.getAll();
        const all: any[] = (res as any).results ?? res ?? [];
        const filtered = (Array.isArray(all) ? all : []).filter((c: any) =>
          c.name?.toLowerCase().includes(customerQuery.toLowerCase())
        );
        setCustomerSuggestions(filtered.slice(0, 6));
        setShowSuggestions(true);
      } catch {
        setCustomerSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [customerQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectCustomer = (customer: any) => {
    setCustomerQuery(customer.name);
    setFormData((prev) => ({ ...prev, customer_id: customer.id, customer_name: customer.name }));
    setShowSuggestions(false);
    setErrors((prev) => ({ ...prev, customer_id: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.project_name.trim()) newErrors.project_name = "Project name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.customer_id || formData.customer_id === 0) {
      newErrors.customer_id = "Select a customer from the suggestions";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Strip fields the backend doesn't need / can't handle
      const { customer_name, ...rest } = formData;
      onSubmit({
        ...rest,
        surveyor_id: rest.surveyor_id && rest.surveyor_id !== 0 ? rest.surveyor_id : undefined,
      });
    }
  };

  const handleChange = (field: keyof ProjectFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="project_name">Project Name *</Label>
        <Input
          id="project_name"
          value={formData.project_name}
          onChange={(e) => handleChange("project_name", e.target.value)}
          placeholder="Enter project name"
          className={errors.project_name ? "border-red-500" : ""}
        />
        {errors.project_name && <p className="text-sm text-red-600">{errors.project_name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Textarea
          id="location"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="Enter project location"
          rows={2}
          className={errors.location ? "border-red-500" : ""}
        />
        {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
      </div>

      {/* Customer search */}
      <div className="space-y-2">
        <Label htmlFor="customer_search">Customer *</Label>
        <div className="relative" ref={suggestionsRef}>
          <Input
            id="customer_search"
            value={customerQuery}
            onChange={(e) => {
              setCustomerQuery(e.target.value);
              // Clear selection if user edits after picking
              if (formData.customer_id) {
                setFormData((prev) => ({ ...prev, customer_id: 0, customer_name: "" }));
              }
            }}
            onFocus={() => customerQuery.length > 0 && setShowSuggestions(true)}
            placeholder="Type customer name to search..."
            autoComplete="off"
            className={errors.customer_id ? "border-red-500" : ""}
          />
          {showSuggestions && customerSuggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {customerSuggestions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-gray-100 last:border-0"
                  onMouseDown={() => selectCustomer(c)}
                >
                  <span className="font-medium">{c.name}</span>
                  {c.phone && <span className="text-gray-400 ml-2 text-xs">{c.phone}</span>}
                </button>
              ))}
            </div>
          )}
          {showSuggestions && customerQuery.length > 0 && customerSuggestions.length === 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-500">
              No customers found. <a href="/dashboard/customers" className="text-emerald-600 underline">Add customer first</a>
            </div>
          )}
        </div>
        {formData.customer_id > 0 && (
          <p className="text-xs text-emerald-600">? Linked to customer ID {formData.customer_id}</p>
        )}
        {errors.customer_id && <p className="text-sm text-red-600">{errors.customer_id}</p>}
      </div>

      {/* Surveyor */}
      {surveyors.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="surveyor_id">Surveyor</Label>
          <Select
            value={formData.surveyor_id?.toString() || "0"}
            onValueChange={(value) => handleChange("surveyor_id", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select surveyor (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">� None �</SelectItem>
              {surveyors.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleChange("status", value as ProjectStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="survey_in_progress">Survey In Progress</SelectItem>
            <SelectItem value="submitted_to_land_office">Submitted to Land Office</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData?.project_name ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}