import { useState, useEffect } from "react";
import { Plus, Search, Mail, Phone, MapPin, User, Edit, Trash2, Users as UsersIcon, Activity } from "lucide-react";
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
      setIsLoading(true);
      const response = await customerService.getAll();
      const customersList = response.results || response;
      setCustomers(Array.isArray(customersList) ? customersList : []);
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast.error("Failed to load customers. Please check your connection and try again.");
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="space-y-4 p-4 sm:p-6">
      {/* Welcome Banner */}
      <div className="rounded-xl overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-lg">
        <div className="relative flex items-center py-3 overflow-hidden border-b border-white/10">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-white/80 text-xs font-medium">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Land Surveying &amp; Real Estate Management System
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                Manage Projects · Properties · Customers · Reports
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-lg sm:text-xl font-bold leading-tight">Customers</h1>
            <p className="text-white/75 text-xs sm:text-sm">Manage client information and relationships</p>
          </div>
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border border-white/20 flex-shrink-0"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4 border-0 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 border-0 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{customers.length}</div>
          <div className="text-sm text-gray-500">Total Customers</div>
        </Card>
        <Card className="p-4 border-0 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
          <div className="text-2xl font-bold text-emerald-600 mb-1">{filteredCustomers.length}</div>
          <div className="text-sm text-gray-500">Showing</div>
        </Card>
        <Card className="p-4 border-0 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
          <div className="text-2xl font-bold text-blue-600 mb-1">{customers.reduce((sum: number, c: any) => sum + (c.projects || 0), 0)}</div>
          <div className="text-sm text-gray-500">Linked Projects</div>
        </Card>
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? "No customers match your search criteria. Try adjusting your search terms."
              : "Get started by adding your first customer."}
          </p>
          {!searchQuery && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Customer
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer: any) => (
            <Card key={customer.id} className="p-5 border-0 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{customer.name}</h3>
                    <p className="text-xs text-gray-500">CUST-{String(customer.id).padStart(3, "0")}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 text-xs">{customer.status}</Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{customer.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs mb-3">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">{customer.projects || 0}</span>
                  <span className="text-gray-500 ml-1">Projects</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">{customer.properties || 0}</span>
                  <span className="text-gray-500 ml-1">Properties</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => openViewDialog(customer)}>
                  View Profile
                </Button>
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8 p-0" onClick={() => openEditDialog(customer)}>
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0" onClick={() => openDeleteDialog(customer)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Customer Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Create a new customer record in the system</DialogDescription>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleCreateCustomer}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>View customer information and activity</DialogDescription>
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
                  onClick={() => { setIsViewOpen(false); openEditDialog(selectedCustomer); }}
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
            <DialogDescription>Update customer information</DialogDescription>
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
              onCancel={() => { setIsEditOpen(false); setSelectedCustomer(null); }}
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
            <AlertDialogAction onClick={handleDeleteCustomer} className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
