import { useState, useEffect } from "react";
import { Building2, Plus, Image as ImageIcon, Eye, Edit, Trash2 } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { PropertyForm, PropertyFormData } from "../components/forms/PropertyForm";
import { propertyService } from "../../services";
import { toast } from "sonner";

export function Properties() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const mockProperties = [
    {
      id: 1,
      property_name: "Sunset Valley Estate",
      location: "Arizona, Phoenix",
      property_type: "land",
      size: "5,000 sqft",
      status: "available",
      statusColor: "bg-emerald-100 text-emerald-700",
      images: 0,
    },
    {
      id: 2,
      property_name: "Oceanview Heights",
      location: "California, Malibu",
      property_type: "house",
      size: "3,500 sqft",
      bedrooms: "4 bed",
      status: "available",
      statusColor: "bg-emerald-100 text-emerald-700",
      images: 0,
    },
    {
      id: 3,
      property_name: "Downtown Office Tower",
      location: "New York, Manhattan",
      property_type: "commercial",
      size: "15,000 sqft",
      status: "sold",
      statusColor: "bg-gray-100 text-gray-700",
      images: 0,
    },
    {
      id: 4,
      property_name: "Riverside Apartments",
      location: "Texas, Austin",
      property_type: "apartment",
      size: "2,200 sqft",
      bedrooms: "3 bed",
      status: "rented",
      statusColor: "bg-purple-100 text-purple-700",
      images: 0,
    },
  ];

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await propertyService.getAll();
      const propertiesList = response.results || response;
      setProperties(Array.isArray(propertiesList) ? propertiesList : mockProperties);
    } catch (error) {
      console.error("Failed to load properties:", error);
      setProperties(mockProperties);
    }
  };

  const displayProperties = properties.length > 0 ? properties : mockProperties;

  const filteredProperties = displayProperties.filter((property: any) => {
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    const matchesType = typeFilter === "all" || property.property_type?.toLowerCase() === typeFilter;
    return matchesStatus && matchesType;
  });

  const handleCreateProperty = async (data: PropertyFormData) => {
    setIsLoading(true);
    try {
      await propertyService.create(data);
      toast.success("Property created successfully!");
      setIsCreateOpen(false);
      loadProperties();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create property");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProperty = async (data: PropertyFormData) => {
    if (!selectedProperty) return;
    setIsLoading(true);
    try {
      await propertyService.update(selectedProperty.id, data);
      toast.success("Property updated successfully!");
      setIsEditOpen(false);
      setSelectedProperty(null);
      loadProperties();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update property");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!selectedProperty) return;
    setIsLoading(true);
    try {
      await propertyService.delete(selectedProperty.id);
      toast.success("Property deleted successfully!");
      setIsDeleteOpen(false);
      setSelectedProperty(null);
      loadProperties();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete property");
    } finally {
      setIsLoading(false);
    }
  };

  const openViewDialog = (property: any) => {
    setSelectedProperty(property);
    setIsViewOpen(true);
  };

  const openEditDialog = (property: any) => {
    setSelectedProperty(property);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (property: any) => {
    setSelectedProperty(property);
    setIsDeleteOpen(true);
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "available", label: "Available" },
    { value: "sold", label: "Sold" },
    { value: "rented", label: "Rented" },
    { value: "reserved", label: "Reserved" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "land", label: "Land" },
    { value: "house", label: "House" },
    { value: "commercial", label: "Commercial" },
    { value: "apartment", label: "Apartment" },
  ];

  return (
    <div className="space-y-6 clean-bg min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Properties</h1>
          <p className="text-gray-600">Manage properties, listings, and real estate assets</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
              <DialogDescription>
                Create a new property record in the system
              </DialogDescription>
            </DialogHeader>
            <PropertyForm
              onSubmit={handleCreateProperty}
              onCancel={() => setIsCreateOpen(false)}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                {statusOptions.map((option) => (
                  <TabsTrigger key={option.value} value={option.value}>
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <Tabs value={typeFilter} onValueChange={setTypeFilter}>
              <TabsList>
                {typeOptions.map((option) => (
                  <TabsTrigger key={option.value} value={option.value}>
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property: any) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Property Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-white opacity-50" />
            </div>

            {/* Property Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-900">{property.property_name}</h3>
                <Badge className={property.statusColor}>{property.status}</Badge>
              </div>

              <p className="text-sm text-gray-600 mb-4">{property.location}</p>

              <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
                <span className="capitalize">{property.property_type}</span>
                <span>•</span>
                <span>{property.size}</span>
                {property.bedrooms && (
                  <>
                    <span>•</span>
                    <span>{property.bedrooms}</span>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <ImageIcon className="w-4 h-4" />
                  <span>{property.images || 0} images</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => openViewDialog(property)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => openEditDialog(property)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => openDeleteDialog(property)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View Property Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
            <DialogDescription>
              View property information
            </DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Property Name</label>
                  <p className="text-gray-900 mt-1">{selectedProperty.property_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className={selectedProperty.statusColor}>{selectedProperty.status}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <p className="text-gray-900 mt-1 capitalize">{selectedProperty.property_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Size</label>
                  <p className="text-gray-900 mt-1">{selectedProperty.size}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <p className="text-gray-900 mt-1">{selectedProperty.location}</p>
                </div>
                {selectedProperty.bedrooms && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bedrooms</label>
                    <p className="text-gray-900 mt-1">{selectedProperty.bedrooms}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setIsViewOpen(false);
                    openEditDialog(selectedProperty);
                  }}
                >
                  Edit Property
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Property Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update property information
            </DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <PropertyForm
              initialData={{
                property_name: selectedProperty.property_name,
                location: selectedProperty.location,
                size: selectedProperty.size,
                property_type: selectedProperty.property_type,
                status: selectedProperty.status,
                land_title_id: selectedProperty.land_title_id,
              }}
              onSubmit={handleEditProperty}
              onCancel={() => {
                setIsEditOpen(false);
                setSelectedProperty(null);
              }}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProperty?.property_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProperty(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProperty}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
