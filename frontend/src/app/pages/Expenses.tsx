import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit, Receipt, TrendingDown } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "../components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { expenseService, CreateExpenseData } from "../../services";
import { Expense, ExpenseCategory } from "../../types";
import { usePermissions } from "../../hooks/usePermissions";
import { toast } from "sonner";

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "equipment", label: "Equipment" },
  { value: "transport", label: "Transport" },
  { value: "office", label: "Office Supplies" },
  { value: "salaries", label: "Salaries" },
  { value: "utilities", label: "Utilities" },
  { value: "marketing", label: "Marketing" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
];

const catColor = (cat: string) => {
  const map: Record<string, string> = {
    equipment: "bg-blue-100 text-blue-700",
    transport: "bg-orange-100 text-orange-700",
    office: "bg-purple-100 text-purple-700",
    salaries: "bg-emerald-100 text-emerald-700",
    utilities: "bg-yellow-100 text-yellow-700",
    marketing: "bg-pink-100 text-pink-700",
    maintenance: "bg-red-100 text-red-700",
    other: "bg-gray-100 text-gray-700",
  };
  return map[cat] || "bg-gray-100 text-gray-700";
};

const emptyForm = (): CreateExpenseData => ({
  title: "",
  amount: 0,
  category: "other",
  description: "",
  expense_date: new Date().toISOString().split("T")[0],
});

export function Expenses() {
  const perms = usePermissions();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Expense | null>(null);
  const [form, setForm] = useState<CreateExpenseData>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await expenseService.getAll();
      const list = (res as any).results ?? res ?? [];
      setExpenses(Array.isArray(list) ? list : []);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm());
    setErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (e: Expense) => {
    setSelected(e);
    setForm({
      title: e.title,
      amount: e.amount,
      category: e.category,
      description: e.description || "",
      expense_date: e.expense_date,
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.amount || form.amount <= 0) errs.amount = "Amount must be greater than 0";
    if (!form.expense_date) errs.expense_date = "Date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      if (selected) {
        await expenseService.update(selected.id, form);
        toast.success("Expense updated");
      } else {
        await expenseService.create(form);
        toast.success("Expense recorded");
      }
      setIsFormOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save expense");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setIsLoading(true);
    try {
      await expenseService.delete(selected.id);
      toast.success("Expense deleted");
      setIsDeleteOpen(false);
      setSelected(null);
      load();
    } catch {
      toast.error("Failed to delete expense");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = expenses.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = filtered.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-6 clean-bg min-h-screen p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Expenses</h1>
          <p className="text-gray-600">Track and manage company expenditures</p>
        </div>
        {perms.canManageExpenses && (
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Expenses", value: `${totalAmount.toLocaleString()}`, color: "text-red-600", icon: TrendingDown },
          { label: "This Month", value: filtered.filter(e => e.expense_date?.startsWith(new Date().toISOString().slice(0,7))).reduce((s,e)=>s+Number(e.amount),0).toLocaleString(), color: "text-orange-600", icon: Receipt },
          { label: "Records", value: filtered.length, color: "text-gray-900", icon: Receipt },
          { label: "Categories", value: new Set(filtered.map(e=>e.category)).size, color: "text-blue-600", icon: Receipt },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className={`text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-600">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search expenses..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </Card>

      {/* Table */}
      <Card>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Expenses Found</h3>
            <p className="text-gray-500 mb-4">{search ? "No expenses match your search." : "Start recording company expenses."}</p>
            {!search && perms.canManageExpenses && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" /> Add First Expense
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Recorded By</TableHead>
                {perms.canManageExpenses && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="font-medium text-gray-900">{exp.title}</TableCell>
                  <TableCell>
                    <Badge className={catColor(exp.category)}>
                      {CATEGORIES.find(c => c.value === exp.category)?.label || exp.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-red-600">{Number(exp.amount).toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-gray-600">{exp.expense_date}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {exp.recorded_by ? `${exp.recorded_by.first_name || ""} ${exp.recorded_by.last_name || ""}`.trim() || exp.recorded_by.username : "—"}
                  </TableCell>
                  {perms.canManageExpenses && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50" onClick={() => openEdit(exp)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => { setSelected(exp); setIsDeleteOpen(true); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected ? "Edit Expense" : "Add Expense"}</DialogTitle>
            <DialogDescription>Record a company expenditure</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Fuel for survey vehicle" className={errors.title ? "border-red-500" : ""} />
              {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input type="number" value={form.amount || ""} onChange={e => setForm(p => ({...p, amount: parseFloat(e.target.value)}))} placeholder="0" className={errors.amount ? "border-red-500" : ""} />
                {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={form.expense_date} onChange={e => setForm(p => ({...p, expense_date: e.target.value}))} className={errors.expense_date ? "border-red-500" : ""} />
                {errors.expense_date && <p className="text-sm text-red-600">{errors.expense_date}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({...p, category: v as ExpenseCategory}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Optional notes..." rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isLoading}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : selected ? "Update" : "Save Expense"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>Delete "{selected?.title}"? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelected(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
