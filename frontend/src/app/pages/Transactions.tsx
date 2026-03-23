import { useState, useEffect } from "react";
import { Plus, Search, TrendingUp, DollarSign, Calendar, Eye, Edit, Trash2 } from "lucide-react";
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
import { TransactionForm, TransactionFormData } from "../components/forms/TransactionForm";
import { transactionService, propertyService, customerService } from "../../services";
import { toast } from "sonner";

export function Transactions() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    loadTransactions();
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [propsRes, custsRes] = await Promise.all([
        propertyService.getAll(),
        customerService.getAll(),
      ]);
      setProperties(Array.isArray(propsRes.results || propsRes) ? (propsRes.results || propsRes) : []);
      setCustomers(Array.isArray(custsRes.results || custsRes) ? (custsRes.results || custsRes) : []);
    } catch (error) {
      console.error("Failed to load dropdown data:", error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await transactionService.getAll();
      const transactionsList = response.results || response;
      setTransactions(Array.isArray(transactionsList) ? transactionsList : []);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      toast.error("Failed to load transactions.");
      setTransactions([]);
    }
  };

  const filteredTransactions = transactions.filter((transaction: any) => {
    const propertyName = transaction.property_name || transaction.property || "";
    const customerName = transaction.customer_name || transaction.customer || "";
    return (
      propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `TXN-${String(transaction.id).padStart(3, '0')}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCreateTransaction = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      await transactionService.create(data);
      toast.success("Transaction created successfully!");
      setIsCreateOpen(false);
      loadTransactions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTransaction = async (data: TransactionFormData) => {
    if (!selectedTransaction) return;
    setIsLoading(true);
    try {
      await transactionService.update(selectedTransaction.id, data);
      toast.success("Transaction updated successfully!");
      setIsEditOpen(false);
      setSelectedTransaction(null);
      loadTransactions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    setIsLoading(true);
    try {
      await transactionService.delete(selectedTransaction.id);
      toast.success("Transaction deleted successfully!");
      setIsDeleteOpen(false);
      setSelectedTransaction(null);
      loadTransactions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const openViewDialog = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsViewOpen(true);
  };

  const openEditDialog = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsDeleteOpen(true);
  };

  const formatAmount = (amount: number, type: string) => {
    if (type === "rental") {
      return `$${amount.toLocaleString()}/mo`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const totalRevenue = filteredTransactions.reduce((sum: number, t: any) => sum + t.price, 0);
  const totalSales = filteredTransactions.filter((t: any) => t.transaction_type === 'sale').length;
  const activeRentals = filteredTransactions.filter((t: any) => t.transaction_type === 'rental' && t.status === 'active').length;
  const pendingCount = filteredTransactions.filter((t: any) => t.status === 'pending').length;

  return (
    <div className="space-y-6 clean-bg min-h-screen p-6">
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
              properties={properties}
              customers={customers}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">${filteredTransactions.filter((t: any) => t.transaction_type === 'sale').reduce((sum: number, t: any) => sum + t.price, 0).toLocaleString()} value</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Rentals</p>
              <p className="text-2xl font-bold text-gray-900">{activeRentals}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">${filteredTransactions.filter((t: any) => t.transaction_type === 'rental' && t.status === 'active').reduce((sum: number, t: any) => sum + t.price, 0).toLocaleString()}/mo income</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">${filteredTransactions.filter((t: any) => t.status === 'pending').reduce((sum: number, t: any) => sum + t.price, 0).toLocaleString()} value</p>
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
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                  {searchQuery ? "No transactions match your search." : "No transactions yet. Create your first one."}
                </TableCell>
              </TableRow>
            ) : filteredTransactions.map((transaction: any) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">TXN-{String(transaction.id).padStart(3, '0')}</TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">{transaction.property_name || transaction.property}</div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{transaction.customer_name || transaction.customer}</TableCell>
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
                  {formatAmount(transaction.price, transaction.transaction_type)}
                </TableCell>
                <TableCell className="text-sm text-gray-600">{transaction.transaction_date}</TableCell>
                <TableCell>
                  <Badge className={
                    transaction.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                    transaction.status === 'active' ? "bg-blue-100 text-blue-700" :
                    transaction.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  }>{transaction.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => openViewDialog(transaction)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={() => openEditDialog(transaction)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => openDeleteDialog(transaction)}
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

      {/* View Transaction Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              View transaction information
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="text-gray-900 mt-1">TXN-{String(selectedTransaction.id).padStart(3, '0')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className={
                      selectedTransaction.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                      selectedTransaction.status === 'active' ? "bg-blue-100 text-blue-700" :
                      selectedTransaction.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    }>{selectedTransaction.status}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Property</label>
                  <p className="text-gray-900 mt-1">{selectedTransaction.property_name || selectedTransaction.property}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-gray-900 mt-1">{selectedTransaction.customer_name || selectedTransaction.customer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <div className="mt-1">
                    <Badge className={selectedTransaction.transaction_type === "sale" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}>
                      {selectedTransaction.transaction_type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <p className="text-gray-900 mt-1 font-semibold">{formatAmount(selectedTransaction.price, selectedTransaction.transaction_type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Transaction Date</label>
                  <p className="text-gray-900 mt-1">{selectedTransaction.transaction_date}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setIsViewOpen(false);
                    openEditDialog(selectedTransaction);
                  }}
                >
                  Edit Transaction
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update transaction information
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <TransactionForm
              initialData={{
                property_id: selectedTransaction.property_id,
                customer_id: selectedTransaction.customer_id,
                transaction_type: selectedTransaction.transaction_type,
                price: selectedTransaction.price,
                transaction_date: selectedTransaction.transaction_date,
              }}
              onSubmit={handleEditTransaction}
              onCancel={() => {
                setIsEditOpen(false);
                setSelectedTransaction(null);
              }}
              isLoading={isLoading}
              properties={properties}
              customers={customers}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedTransaction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
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
