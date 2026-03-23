import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, Trash2, DollarSign } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Input as PriceInput } from "../components/ui/input";
import { listingService, propertyService } from "../../services";
import { toast } from "sonner";

export function PropertyListings() {
  const [listingTypeFilter, setListingTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({ property_id: "", listing_type: "for_sale", price: "" });

  useEffect(() => {
    loadListings();
    loadProperties();
  }, []);

  const loadListings = async () => {
    try {
      setIsLoading(true);
      const res = await listingService.getAll();
      setListings(Array.isArray(res.results || res) ? (res.results || res) : []);
    } catch {
      toast.error("Failed to load listings.");
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const res = await propertyService.getAll();
      setProperties(Array.isArray(res.results || res) ? (res.results || res) : []);
    } catch {
      setProperties([]);
    }
  };

  const handleCreate = async () => {
    if (!form.property_id || !form.price) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsLoading(true);
    try {
      await listingService.create({
        property_id: parseInt(form.property_id),
        listing_type: form.listing_type as any,
        price: parseFloat(form.price),
      });
      toast.success("Listing created successfully!");
      setIsCreateOpen(false);
      setForm({ property_id: "", listing_type: "for_sale", price: "" });
      loadListings();
    } catch {
      toast.error("Failed to create listing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    try {
      await listingService.delete(selectedId);
      toast.success("Listing deleted.");
      setIsDeleteOpen(false);
      setSelectedId(null);
      loadListings();
    } catch {
      toast.error("Failed to delete listing.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, type: string) =>
    type === "for_rent" ? `${Number(price).toLocaleString()}/mo` : Number(price).toLocaleString();

  const statusColor = (status: string) => {
    if (status === "active") return "bg-emerald-100 text-emerald-700";
    if (status === "sold") return "bg-gray-100 text-gray-700";
    if (status === "rented") return "bg-purple-100 text-purple-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const filtered = listings.filter((l) => {
    const name = l.property?.property_name || l.property_name || "";
    const loc = l.property?.location || l.location || "";
    const matchSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = listingTypeFilter === "all" || l.listing_type === listingTypeFilter;
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const forSaleCount = listings.filter(l => l.listing_type === "for_sale").length;
  const forRentCount = listings.filter(l => l.listing_type === "for_rent").length;

  return (
    <div className="space-y-6 clean-bg min-h-screen p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Listings</h1>
          <p className="text-gray-600">Manage properties available for sale or rent</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Listing
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by property name or location..." className="pl-10"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
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
              <p className="text-2xl font-bold text-emerald-600">{forSaleCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">For Rent</p>
              <p className="text-2xl font-bold text-purple-600">{forRentCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                  {searchQuery || listingTypeFilter !== "all" || statusFilter !== "all"
                    ? "No listings match your filters."
                    : "No listings yet. Create your first listing."}
                </TableCell>
              </TableRow>
            ) : filtered.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">LST-{String(listing.id).padStart(3, "0")}</TableCell>
                <TableCell className="font-medium text-gray-900">
                  {listing.property?.property_name || listing.property_name || "—"}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {listing.property?.location || listing.location || "—"}
                </TableCell>
                <TableCell>
                  <Badge className={listing.listing_type === "for_sale" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}>
                    {listing.listing_type === "for_sale" ? "For Sale" : "For Rent"}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {formatPrice(listing.price, listing.listing_type)}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {listing.listed_date ? new Date(listing.listed_date).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <Badge className={statusColor(listing.status)}>{listing.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700"
                      onClick={() => { setSelectedId(listing.id); setIsDeleteOpen(true); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Property Listing</DialogTitle>
            <DialogDescription>List a property for sale or rent</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Property *</Label>
              <Select value={form.property_id} onValueChange={(v) => setForm(f => ({ ...f, property_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.property_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Listing Type *</Label>
              <Select value={form.listing_type} onValueChange={(v) => setForm(f => ({ ...f, listing_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="for_sale">For Sale</SelectItem>
                  <SelectItem value="for_rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price * {form.listing_type === "for_rent" && "(per month)"}</Label>
              <PriceInput type="number" placeholder="Enter price"
                value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreate} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
