import { useState } from "react";
import { Plus, Search, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
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
} from "../components/ui/dialog";
import { TransactionForm, TransactionFormData } from "../components/forms/TransactionForm";
import { transactionService } from "../../services";
import { toast } from "sonner";

export function Transactions() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for dropdowns - TODO: Fetch from API
  const mockProperties = [
    { id: 1, property_name: "Sunset Valley Estate" },
    { id: 2, property_name: "Oceanview Heights" },
    { id: 3, property_name: "Downtown Office Tower" },
    { id: 4, property_name: "Riverside Apartments" },
  ];

  const mockCustomers = [
    { id: 1, name: "John Anderson" },
    { id: 2, name: "Emily Chen" },
    { id: 3, name: "Robert Davis" },
  ];
  // Mock data - TODO: Replace with API call using transactionService.getAll()
  const transactions = [
    {
      id: 1,
      property: "Downtown Office Tower",
      customer: "John Anderson",
      transaction_type: "sale",
      amount: 2500000,
      transaction_date: "2026-02-28",
      status: "completed",
      statusColor: "bg-emerald-100 text-emerald-700",
    },
    {
      id: 2,
      property: "Riverside Apartments",
      customer: "Emily Chen",
      transaction_type: "rental",
      amount: 3500,
      transaction_date: "2026-03-01",
      status: "active",
      statusColor: "bg-blue-100 text-blue-700",
    },
    {
      id: 3,
      property: "Oceanview Heights",
      customer: "Robert Davis",
      transaction_type: "sale",
      amount: 1850000,
      transaction_date: "2026-03-05",
      status: "pending",
      statusColor: "bg-yellow-100 text-yellow-700",
    },
  ];

  const handleCreateTransaction = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      await transactionService.create(data);
      toast.success("Transaction created successfully!");
      setIsCreateOpen(false);
      // TODO: Refresh transaction list
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number, type: string) => {
    if (type === "rental") {
      return `$${amount.toLocaleString()}/mo`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
          <p className="text-gray-600">Track property sales and rental agreements</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Transaction
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Transaction</DialogTitle>
              <DialogDescription>
                Record a property sale or rental agreement
              </DialogDescription>
            </DialogHeader>
            <TransactionForm
              onSubmit={handleCreateTransaction}
              onCancel={() => setIsCreateOpen(false)}
              isLoading={isLoading}
              properties={mockProperties}
              customers={mockCustomers}
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
              placeholder="Search transactions by property, customer, or ID..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filter</Button>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$4,350,000</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5% from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">$4,350,000 value</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Rentals</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">$3,500/mo income</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">$1,850,000 value</p>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">TXN-{String(transaction.id).padStart(3, '0')}</TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">{transaction.property}</div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{transaction.customer}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      transaction.transaction_type === "sale"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }
                  >
                    {transaction.transaction_type}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {formatAmount(transaction.amount, transaction.transaction_type)}
                </TableCell>
                <TableCell className="text-sm text-gray-600">{transaction.transaction_date}</TableCell>
                <TableCell>
                  <Badge className={transaction.statusColor}>{transaction.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">
                  {transaction.transaction_type === "sale" ? "Property sold" : "Rental agreement signed"}
                </p>
                <p className="text-sm text-gray-600">
                  {transaction.property} - {transaction.customer}
                </p>
                <p className="text-sm text-gray-500 mt-1">{transaction.transaction_date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatAmount(transaction.amount, transaction.transaction_type)}
                </p>
                <Badge className={`${transaction.statusColor} mt-1`}>{transaction.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
