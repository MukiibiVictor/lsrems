import { useState, useEffect, useRef } from "react";
import { Building2, Plus, Image as ImageIcon, Eye, Edit, Trash2, Upload, X, Star } from "lucide-react";
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

const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  sold: "bg-red-100 text-red-700",
  rented: "bg-blue-100 text-blue-700",
  reserved: "bg-yellow-100 text-yellow-700",
};

function formatPrice(price: number | null | undefined) {
  if (!price) return null;
  return new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(price);
}

export function Properties() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tab, setTab] = useState("active"); // active | archived
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCardId, setUploadingCardId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadProperties(); }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const response = await propertyService.getAll();
      const list = response.results || response;
      setProperties(Array.isArray(list) ? list : []);
    } catch {
      toast.error("Failed to load properties.");
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const activeProperties = properties.filter((p) => !p.hidden_from_display);
  const archivedProperties = properties.filter((p) => p.hidden_from_display);

  const displayList = tab === "archived" ? archivedProperties : activeProperties;

  const filteredProperties = displayList.filter((p: any) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesType = typeFilter === "all" || p.property_type?.toLowerCase() === typeFilter;
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

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, propertyId: number) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploadingCardId(propertyId);
    try {
      await propertyService.uploadImage(propertyId, file, "", true);
      toast.success("Photo uploaded!");
      loadProperties();
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploadingCardId(null);
      if (cardFileInputRef.current) cardFileInputRef.current.value = "";
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {    if (!selectedProperty || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    try {
      const isPrimary = (selectedProperty.images || []).length === 0;
      await propertyService.uploadImage(selectedProperty.id, file, "", isPrimary);
      toast.success("Image uploaded!");
      // Refresh selected property
      const updated = await propertyService.getById(selectedProperty.id);
      setSelectedProperty(updated);
      loadProperties();
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!selectedProperty) return;
    try {
      await propertyService.deleteImage(selectedProperty.id, imageId);
      toast.success("Image removed");
      const updated = await propertyService.getById(selectedProperty.id);
      setSelectedProperty(updated);
      loadProperties();
    } catch {
      toast.error("Failed to delete image");
    }
  };

  const openViewDialog = async (property: any) => {
    try {
      const full = await propertyService.getById(property.id);
      setSelectedProperty(full);
    } catch {
      setSelectedProperty(property);
    }
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
    { value: "all", label: "All" },
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
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Properties</h1>
          <p className="text-gray-500 text-sm">Manage properties, listings, and real estate assets</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Tabs: Active / Archived */}
      <div className="flex items-center gap-4 flex-wrap">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="active">Active ({activeProperties.length})</TabsTrigger>
            <TabsTrigger value="archived">Archived ({archivedProperties.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              {statusOptions.map((o) => (
                <TabsTrigger key={o.value} value={o.value}>{o.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList>
              {typeOptions.map((o) => (
                <TabsTrigger key={o.value} value={o.value}>{o.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading properties...</div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
          <p className="text-gray-500 mb-6">
            {tab === "archived"
              ? "No archived properties yet."
              : statusFilter !== "all" || typeFilter !== "all"
              ? "No properties match your filters."
              : "Get started by adding your first property."}
          </p>
          {tab === "active" && statusFilter === "all" && typeFilter === "all" && (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />Add First Property
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property: any) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="h-44 relative overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 group">
                {property.primary_image_url ? (
                  <>
                    <img
                      src={property.primary_image_url}
                      alt={property.property_name}
                      className="w-full h-full object-cover"
                    />
                    {/* Hover overlay to change photo */}
                    <label
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                      title="Change photo"
                    >
                      <Upload className="w-6 h-6 text-white mb-1" />
                      <span className="text-white text-xs font-medium">Change Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleCardImageUpload(e, property.id)}
                      />
                    </label>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer group/upload">
                    {uploadingCardId === property.id ? (
                      <span className="text-white text-sm">Uploading...</span>
                    ) : (
                      <>
                        <Building2 className="w-14 h-14 text-white opacity-40 group-hover/upload:opacity-0 transition-opacity absolute" />
                        <div className="flex flex-col items-center opacity-0 group-hover/upload:opacity-100 transition-opacity">
                          <Upload className="w-8 h-8 text-white mb-2" />
                          <span className="text-white text-sm font-medium">Upload Photo</span>
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleCardImageUpload(e, property.id)}
                    />
                  </label>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className={STATUS_COLORS[property.status] || "bg-gray-100 text-gray-700"}>
                    {property.status}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{property.property_name}</h3>
                <p className="text-sm text-gray-500 truncate mb-1">{property.location}</p>

                {property.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">{property.description}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span className="capitalize">{property.property_type}</span>
                  <span>•</span>
                  <span>{property.size}</span>
                </div>

                {property.price && (
                  <p className="text-sm font-semibold text-emerald-700 mb-3">{formatPrice(property.price)}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <ImageIcon className="w-3 h-3" />
                    <span>{(property.images || []).length} photo{(property.images || []).length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 h-7 w-7 p-0" onClick={() => openViewDialog(property)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50 h-7 w-7 p-0" onClick={() => openEditDialog(property)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 h-7 w-7 p-0" onClick={() => openDeleteDialog(property)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>Create a new property record</DialogDescription>
          </DialogHeader>
          <PropertyForm onSubmit={handleCreateProperty} onCancel={() => setIsCreateOpen(false)} isLoading={isLoading} />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
            <DialogDescription>View and manage property images</DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium text-gray-600">Name</span><p className="mt-0.5">{selectedProperty.property_name}</p></div>
                <div><span className="font-medium text-gray-600">Status</span><div className="mt-0.5"><Badge className={STATUS_COLORS[selectedProperty.status]}>{selectedProperty.status}</Badge></div></div>
                <div><span className="font-medium text-gray-600">Type</span><p className="mt-0.5 capitalize">{selectedProperty.property_type}</p></div>
                <div><span className="font-medium text-gray-600">Size</span><p className="mt-0.5">{selectedProperty.size}</p></div>
                <div className="col-span-2"><span className="font-medium text-gray-600">Location</span><p className="mt-0.5">{selectedProperty.location}</p></div>
                {selectedProperty.price && (
                  <div><span className="font-medium text-gray-600">Price</span><p className="mt-0.5 text-emerald-700 font-semibold">{formatPrice(selectedProperty.price)}</p></div>
                )}
                {selectedProperty.description && (
                  <div className="col-span-2"><span className="font-medium text-gray-600">Description</span><p className="mt-0.5 text-gray-700">{selectedProperty.description}</p></div>
                )}
              </div>

              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Photos</span>
                  <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
                    <Upload className="w-3 h-3 mr-1" />
                    {uploadingImage ? "Uploading..." : "Upload Photo"}
                  </Button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
                {(selectedProperty.images || []).length === 0 ? (
                  <p className="text-sm text-gray-400">No photos yet. Upload one above.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProperty.images.map((img: any) => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden h-28 bg-gray-100">
                        <img src={img.image_url || img.image} alt={img.caption || "property"} className="w-full h-full object-cover" />
                        {img.is_primary && (
                          <div className="absolute top-1 left-1 bg-yellow-400 rounded-full p-0.5">
                            <Star className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setIsViewOpen(false); openEditDialog(selectedProperty); }}>
                  Edit Property
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>Update property information</DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <PropertyForm
              initialData={{
                property_name: selectedProperty.property_name,
                location: selectedProperty.location,
                size: selectedProperty.size,
                description: selectedProperty.description || "",
                price: selectedProperty.price ? parseFloat(selectedProperty.price) : null,
                property_type: selectedProperty.property_type,
                status: selectedProperty.status,
                land_title_id: selectedProperty.land_title_id,
              }}
              onSubmit={handleEditProperty}
              onCancel={() => { setIsEditOpen(false); setSelectedProperty(null); }}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProperty?.property_name}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProperty(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProperty} className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
