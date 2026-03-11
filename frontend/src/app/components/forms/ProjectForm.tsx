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
import { ProjectStatus } from "../../../types";

export interface ProjectFormData {
  customer_id: number;
  surveyor_id: number;
  project_name: string;
  location: string;
  status?: ProjectStatus;
}

interface ProjectFormProps {
  initialData?: ProjectFormData;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  customers?: Array<{ id: number; name: string }>;
  surveyors?: Array<{ id: number; name: string }>;
}

export function ProjectForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading,
  customers = [],
  surveyors = []
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>(
    initialData || {
      customer_id: 0,
      surveyor_id: 0,
      project_name: "",
      location: "",
      status: "pending",
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};

    if (!formData.project_name.trim()) {
      newErrors.project_name = "Project name is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.customer_id || formData.customer_id === 0) {
      newErrors.customer_id = "Customer is required";
    }

    if (!formData.surveyor_id || formData.surveyor_id === 0) {
      newErrors.surveyor_id = "Surveyor is required";
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

  const handleChange = (field: keyof ProjectFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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
        <Label htmlFor="surveyor_id">Surveyor *</Label>
        <Select
          value={formData.surveyor_id.toString()}
          onValueChange={(value) => handleChange("surveyor_id", parseInt(value))}
        >
          <SelectTrigger className={errors.surveyor_id ? "border-red-500" : ""}>
            <SelectValue placeholder="Select surveyor" />
          </SelectTrigger>
          <SelectContent>
            {surveyors.map((surveyor) => (
              <SelectItem key={surveyor.id} value={surveyor.id.toString()}>
                {surveyor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.surveyor_id && <p className="text-sm text-red-600">{errors.surveyor_id}</p>}
      </div>

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
          {isLoading ? "Saving..." : initialData ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
