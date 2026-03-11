import { useState } from "react";
import { Plus, Search, Mail, Phone, MapPin, User } from "lucide-react";
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
import { CustomerForm, CustomerFormData } from "../components/forms/CustomerForm";
import { customerService } from "../../services";
import { toast } from "sonner";

export function Customers() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Mock data - TODO: Replace with API call using customerService.getAll()
  const customers = [
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

  const handleCreateCustomer = async (data: CustomerFormData) => {
    setIsLoading(true);
    try {
      await customerService.create(data);
      toast.success("Customer created successfully!");
      setIsCreateOpen(false);
      // TODO: Refresh customer list
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
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
            />
          </div>
          <Button variant="outline">Filter</Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900 mb-1">3</div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-emerald-600 mb-1">3</div>
          <div className="text-sm text-gray-600">Active</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600 mb-1">4</div>
          <div className="text-sm text-gray-600">Linked Projects</div>
        </Card>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
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
                <span className="font-semibold text-gray-900">{customer.projects}</span>
                <span className="text-gray-600 ml-1">Projects</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{customer.properties}</span>
                <span className="text-gray-600 ml-1">Properties</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
                View Profile
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-emerald-600 hover:text-emerald-700">
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
