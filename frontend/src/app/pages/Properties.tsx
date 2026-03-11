import { useState } from "react";
import { Building2, Plus, Image as ImageIcon } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

export function Properties() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const properties = [
    {
      name: "Sunset Valley Estate",
      location: "Arizona, Phoenix",
      type: "Land",
      size: "5,000 sqft",
      status: "available",
      statusColor: "bg-emerald-100 text-emerald-700",
      images: 0,
    },
    {
      name: "Oceanview Heights",
      location: "California, Malibu",
      type: "House",
      size: "3,500 sqft",
      bedrooms: "4 bed",
      status: "available",
      statusColor: "bg-emerald-100 text-emerald-700",
      images: 0,
    },
    {
      name: "Downtown Office Tower",
      location: "New York, Manhattan",
      type: "Commercial",
      size: "15,000 sqft",
      status: "sold",
      statusColor: "bg-gray-100 text-gray-700",
      images: 0,
    },
    {
      name: "Riverside Apartments",
      location: "Texas, Austin",
      type: "Apartment",
      size: "2,200 sqft",
      bedrooms: "3 bed",
      status: "rented",
      statusColor: "bg-purple-100 text-purple-700",
      images: 0,
    },
  ];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Properties</h1>
          <p className="text-gray-600">Manage properties, listings, and real estate assets</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
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
        {properties.map((property, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Property Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-white opacity-50" />
            </div>

            {/* Property Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-900">{property.name}</h3>
                <Badge className={property.statusColor}>{property.status}</Badge>
              </div>

              <p className="text-sm text-gray-600 mb-4">{property.location}</p>

              <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
                <span>{property.type}</span>
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
                  <span>{property.images} images</span>
                </div>
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
