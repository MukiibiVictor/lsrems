import { useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, DollarSign } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";

export function PropertyListings() {
  const [listingTypeFilter, setListingTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Mock data - will be replaced with API calls
  const listings = [
    {
      id: 1,
      property_id: 1,
      property_name: "Sunset Valley Estate",
      location: "Arizona, Phoenix",
      listing_type: "for_sale",
      price: 2500000,
      listed_date: "2026-02-15",
      status: "active",
      statusColor: "bg-emerald-100 text-emerald-700",
      views: 245,
    },
    {
      id: 2,
      property_id: 2,
      property_name: "Oceanview Heights",
      location: "California, Malibu",
      listing_type: "for_sale",
      price: 3800000,
      listed_date: "2026-02-20",
      status: "active",
      statusColor: "bg-emerald-100 text-emerald-700",
      views: 189,
    },
    {
      id: 3,
      property_id: 4,
      property_name: "Riverside Apartments",
      location: "Texas, Austin",
      listing_type: "for_rent",
      price: 3500,
      listed_date: "2026-03-01",
      status: "rented",
      statusColor: "bg-purple-100 text-purple-700",
      views: 156,
    },
    {
      id: 4,
      property_id: 3,
      property_name: "Downtown Office Tower",
      location: "New York, Manhattan",
      listing_type: "for_sale",
      price: 5200000,
      listed_date: "2026-01-10",
      status: "sold",
      statusColor: "bg-gray-100 text-gray-700",
      views: 412,
    },
  ];

  const formatPrice = (price: number, type: string) => {
    if (type === "for_rent") {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  const handleCreateListing = () => {
    // TODO: Implement with listingService
    console.log("Creating listing");
    setIsCreateOpen(false);
  };

  const handleDelete = (listingId: number) => {
    // TODO: Implement with listingService
    console.log("Deleting listing:", listingId);
  };

  const filteredListings = listings.filter((listing) => {
    if (listingTypeFilter !== "all" && listing.listing_type !== listingTypeFilter) {
      return false;
    }
    if (statusFilter !== "all" && listing.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Listings</h1>
          <p className="text-gray-600">Manage properties available for sale or rent</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Listing
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Property Listing</DialogTitle>
              <DialogDescription>
                List a property for sale or rent
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="property">Property</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sunset Valley Estate</SelectItem>
                    <SelectItem value="2">Oceanview Heights</SelectItem>
                    <SelectItem value="4">Riverside Apartments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="listing_type">Listing Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="for_sale">For Sale</SelectItem>
                    <SelectItem value="for_rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700" 
                onClick={handleCreateListing}
              >
                Create Listing
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 relative min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search listings by property name or location..."
              className="pl-10"
            />
          </div>

          {/* Listing Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <Tabs value={listingTypeFilter} onValueChange={setListingTypeFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="for_sale">For Sale</TabsTrigger>
                <TabsTrigger value="for_rent">For Rent</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="sold">Sold</TabsTrigger>
                <TabsTrigger value="rented">Rented</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">For Sale</p>
              <p className="text-2xl font-bold text-emerald-600">3</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">$11.5M total value</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">For Rent</p>
              <p className="text-2xl font-bold text-purple-600">1</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">$3,500/mo income</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Views</p>
              <p className="text-2xl font-bold text-blue-600">1,002</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Listings Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Listing ID</TableHead>
              <TableHead>Property Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Listed Date</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredListings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">LST-{String(listing.id).padStart(3, '0')}</TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">{listing.property_name}</div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{listing.location}</TableCell>
                <TableCell>
                  <Badge className={listing.listing_type === "for_sale" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}>
                    {listing.listing_type === "for_sale" ? "For Sale" : "For Rent"}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {formatPrice(listing.price, listing.listing_type)}
                </TableCell>
                <TableCell className="text-sm text-gray-600">{listing.listed_date}</TableCell>
                <TableCell className="text-sm text-gray-600">{listing.views}</TableCell>
                <TableCell>
                  <Badge className={listing.statusColor}>{listing.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(listing.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
