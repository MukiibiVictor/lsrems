import { useState, useEffect } from "react";
import { Plus, Search, User as UserIcon, Edit, Trash2, Eye } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
import { apiClient } from "../../services/api";
import { toast } from "sonner";
import type { User, PaginatedResponse } from "../../types";

interface UserFormData {
  username: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
}

export function Users() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "customer",
    phone: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      console.log('Loading users...');
      const token = localStorage.getItem('auth_token');
      console.log('Token available:', !!token);
      
      const response = await apiClient.get<PaginatedResponse<User>>("/users/");
      console.log('Users loaded successfully:', response);
      // Handle paginated response
      const usersList = response.results || response;
      setUsers(Array.isArray(usersList) ? usersList : []);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users. Please check if you're logged in.");
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('Creating user with data:', formData);
      const token = localStorage.getItem('auth_token');
      console.log('Token available for create:', !!token);
      
      await apiClient.post("/users/", formData);
      toast.success("User created successfully!");
      setIsCreateOpen(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error("Create user error:", error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      await apiClient.put(`/users/${selectedUser.id}/`, updateData);
      toast.success("User updated successfully!");
      setIsEditOpen(false);
      setSelectedUser(null);
      resetForm();
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/users/${selectedUser.id}/`);
      toast.success("User deleted successfully!");
      setIsDeleteOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  const openViewDialog = (user: User) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      phone: user.phone || "",
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "customer",
      phone: "",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-700";
      case "surveyor": return "bg-blue-100 text-blue-700";
      case "real_estate_manager": return "bg-emerald-100 text-emerald-700";
      case "worker": return "bg-orange-100 text-orange-700";
      case "customer": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-4 sm:space-y-6 clean-bg min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 bg-gradient-to-r from-white via-slate-800 to-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="space-y-2">
          <h1 className="welcome-text-gradient text-2xl sm:text-3xl font-bold">
            Users Management
          </h1>
          <p className="text-slate-600">Manage system users and access control</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button 
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add User
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="surveyor">Surveyor</SelectItem>
                      <SelectItem value="real_estate_manager">Real Estate Manager</SelectItem>
                      <SelectItem value="worker">Worker / Secretary</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                  {isLoading ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="p-4 shadow-sm hover:shadow-md transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors duration-200" />
            <Input
              placeholder="Search users by name, email, or username..."
              className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white group cursor-pointer">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 group-hover:scale-110 transition-transform duration-300">{users.length}</div>
          <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">Total Users</div>
        </Card>
        <Card className="p-4 shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50 hover:from-purple-50 hover:to-white group cursor-pointer">
          <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1 group-hover:scale-110 transition-transform duration-300">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-sm text-gray-600 group-hover:text-purple-700 transition-colors duration-200">Admins</div>
        </Card>
        <Card className="p-4 shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50 hover:from-blue-50 hover:to-white group cursor-pointer">
          <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-300">
            {users.filter(u => u.role === 'surveyor').length}
          </div>
          <div className="text-sm text-gray-600 group-hover:text-blue-700 transition-colors duration-200">Surveyors</div>
        </Card>
        <Card className="p-4 shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-emerald-50 hover:from-emerald-50 hover:to-white group cursor-pointer">
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 mb-1 group-hover:scale-110 transition-transform duration-300">
            {users.filter(u => u.role === 'customer').length}
          </div>
          <div className="text-sm text-gray-600 group-hover:text-emerald-700 transition-colors duration-200">Customers</div>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-emerald-50/50 hover:from-emerald-50/50 hover:to-gray-50 transition-all duration-300">
                <TableHead className="min-w-[200px] font-semibold text-gray-700">User</TableHead>
                <TableHead className="min-w-[200px] font-semibold text-gray-700">Email</TableHead>
                <TableHead className="min-w-[120px] font-semibold text-gray-700">Phone</TableHead>
                <TableHead className="min-w-[120px] font-semibold text-gray-700">Role</TableHead>
                <TableHead className="min-w-[120px] font-semibold text-gray-700">Joined</TableHead>
                <TableHead className="text-right min-w-[120px] font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-transparent transition-all duration-200 group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-all duration-200 group-hover:scale-110">
                        <UserIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate group-hover:text-emerald-700 transition-colors duration-200">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">@{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 truncate group-hover:text-gray-700 transition-colors duration-200">{user.email}</TableCell>
                  <TableCell className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">{user.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge className={`${getRoleBadgeColor(user.role)} hover:shadow-md transition-all duration-200 hover:scale-105`}>
                      {formatRole(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
                    {new Date(user.date_joined).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 hover:scale-110 hover:shadow-md"
                        onClick={() => openViewDialog(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 hover:scale-110 hover:shadow-md"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-110 hover:shadow-md"
                        onClick={() => openDeleteDialog(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View User Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <p className="text-gray-900 mt-1">{selectedUser.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <div className="mt-1">
                    <Badge className={getRoleBadgeColor(selectedUser.role)}>
                      {formatRole(selectedUser.role)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <p className="text-gray-900 mt-1">{selectedUser.first_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <p className="text-gray-900 mt-1">{selectedUser.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900 mt-1">{selectedUser.phone || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Joined</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedUser.date_joined).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setIsViewOpen(false);
                    openEditDialog(selectedUser);
                  }}
                >
                  Edit User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information (leave password empty to keep current)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_username">Username *</Label>
                <Input
                  id="edit_username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email *</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_first_name">First Name *</Label>
                <Input
                  id="edit_first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_last_name">Last Name *</Label>
                <Input
                  id="edit_last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_password">New Password (optional)</Label>
                <Input
                  id="edit_password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave empty to keep current"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_phone">Phone</Label>
                <Input
                  id="edit_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit_role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="surveyor">Surveyor</SelectItem>
                    <SelectItem value="real_estate_manager">Real Estate Manager</SelectItem>
                    <SelectItem value="worker">Worker / Secretary</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedUser(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
                {isLoading ? "Updating..." : "Update User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.first_name} {selectedUser?.last_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
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
