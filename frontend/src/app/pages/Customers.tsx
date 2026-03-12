import { useState, useEffect } from "react";
import { Plus, Search, Mail, Phone, MapPin, User, Edit, Trash2 } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
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
import { CustomerForm, CustomerFormData } from "../components/forms/CustomerForm";
import { customerService } from "../../services";
import { toast } from "sonner";
import type { Customer } from "../../types";

export function Customers() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerService.getAll();
      const customersList = response.results || response;
      setCustomers(Array.isArray(customersList) ? customersList : mockCustomers);
    } catch (error) {
      console.error("Failed to load customers:", error);
      // Use mock data if API fails
      setCustomers(mockCustomers);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock data for display purposes
  const mockCustomers = [
    {
      id: 1,
      name: "John Anderson",
      email: "john.anderson@email.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, New York, NY 10001",
      projects: 2,
      properties: 1,
      status: "active",
      created_at: "2026-01-15",
    },
    {
      id: 2,
      name: "Emily Chen",
      email: "emily.chen@email.com",
      phone: "+1 (555) 234-5678",
      address: "456 Oak Avenue, Los Angeles, CA 90001",
      projects: 1,
      properties: 2,
      status: "active",
      created_at: "2026-02-01",
    },
    {
      id: 3,
      name: "Robert Davis",
      email: "robert.davis@email.com",
      phone: "+1 (555) 345-6789",
      address: "789 Pine Road, Chicago, IL 60601",
      projects: 1,
      properties: 0,
      status: "active",
      created_at: "2026-02-10",
    },
  ];

  const displayCustomers = filteredCustomers.length > 0 ? filteredCustomers : mockCustomers;

  const handleCreateCustomer = async (data: CustomerFormData) => {
    setIsLoading(true);
    try {
      await customerService.create(data);
      toast.success("Customer created successfully!");
      setIsCreateOpen(false);
      loadCustomers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCustomer = async (data: CustomerFormData) => {
    if (!selectedCustomer) return;
    setIsLoading(true);
    try {
      await customerService.update(selectedCustomer.id, data);
      toast.success("Customer updated successfully!");
      setIsEditOpen(false);
      setSelectedCustomer(null);
      loadCustomers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    setIsLoading(true);
    try {
      await customerService.delete(selectedCustomer.id);
      toast.success("Customer deleted successfully!");
      setIsDeleteOpen(false);
      setSelectedCustomer(null);
      loadCustomers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete customer");
    } finally {
      setIsLoading(false);
    }
  };

  const openViewDialog = (customer: any) => {
    setSelectedCustomer(customer);
    setIsViewOpen(true);
  };

  const openEditDialog = (customer: any) => {
    setSelectedCustomer(customer);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customers</h1>
          <p className="text-gray-600">Manage client information and relationships</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Create a new customer record in the system
              </DialogDescription>
            </DialogHeader>
            <CustomerForm
              onSubmit={handleCreateCustomer}
              onCancel={() => setIsCreateOpen(false)}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900 mb-1">{displayCustomers.length}</div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-emerald-600 mb-1">{displayCustomers.filter((c: any) => c.status === 'active').length}</div>
          <div className="text-sm text-gray-600">Active</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600 mb-1">{displayCustomers.reduce((sum: number, c: any) => sum + (c.projects || 0), 0)}</div>
          <div className="text-sm text-gray-600">Linked Projects</div>
        </Card>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCustomers.map((customer: any) => (
          <Card key={customer.id} className="p-6 hover:shadow-lg transition-shadow">
            {/* Customer Avatar and Name */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  <p className="text-sm text-gray-500">CUST-{String(customer.id).padStart(3, '0')}</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">{customer.status}</Badge>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{customer.address}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100 text-sm">
              <div>
                <span className="font-semibold text-gray-900">{customer.projects || 0}</span>
                <span className="text-gray-600 ml-1">Projects</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{customer.properties || 0}</span>
                <span className="text-gray-600 ml-1">Properties</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => openViewDialog(customer)}
              >
                View Profile
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => openEditDialog(customer)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => openDeleteDialog(customer)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* View Customer Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              View customer information and activity
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900 mt-1">{selectedCustomer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className="bg-emerald-100 text-emerald-700">{(selectedCustomer as any).status}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 mt-1">{selectedCustomer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900 mt-1">{selectedCustomer.phone}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="text-gray-900 mt-1">{selectedCustomer.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Projects</label>
                  <p className="text-gray-900 mt-1">{(selectedCustomer as any).projects || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Properties</label>
                  <p className="text-gray-900 mt-1">{(selectedCustomer as any).properties || 0}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setIsViewOpen(false);
                    openEditDialog(selectedCustomer);
                  }}
                >
                  Edit Customer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerForm
              initialData={{
                name: selectedCustomer.name,
                email: selectedCustomer.email,
                phone: selectedCustomer.phone,
                address: selectedCustomer.address,
              }}
              onSubmit={handleEditCustomer}
              onCancel={() => {
                setIsEditOpen(false);
                setSelectedCustomer(null);
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
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCustomer?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCustomer(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
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
