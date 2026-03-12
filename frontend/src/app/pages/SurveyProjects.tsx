import { useState, useEffect } from "react";
import { Plus, Search, FileText, User, Eye, Edit, Trash2 } from "lucide-react";
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
import { ProjectForm, ProjectFormData } from "../components/forms/ProjectForm";
import { projectService } from "../../services";
import { toast } from "sonner";

export function SurveyProjects() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for dropdowns - TODO: Fetch from API
  const mockCustomers = [
    { id: 1, name: "John Anderson" },
    { id: 2, name: "Emily Chen" },
    { id: 3, name: "Robert Davis" },
  ];

  const mockSurveyors = [
    { id: 4, name: "Sarah Williams" },
    { id: 5, name: "Michael Brown" },
  ];

  // Mock data
  const mockProjects = [
    {
      id: 1,
      project_name: "Downtown Plot Survey",
      customer: "John Anderson",
      customer_id: 1,
      surveyor: "Sarah Williams",
      surveyor_id: 4,
      location: "123 Main St, New York",
      status: "survey_in_progress",
      statusColor: "bg-blue-100 text-blue-700",
      created_at: "2026-02-15",
      documents: 3,
    },
    {
      id: 2,
      project_name: "Residential Property Survey",
      customer: "Emily Chen",
      customer_id: 2,
      surveyor: "Michael Brown",
      surveyor_id: 5,
      location: "456 Oak Ave, Los Angeles",
      status: "pending",
      statusColor: "bg-yellow-100 text-yellow-700",
      created_at: "2026-03-01",
      documents: 1,
    },
    {
      id: 3,
      project_name: "Subdivision Survey",
      customer: "Robert Davis",
      customer_id: 3,
      surveyor: "Sarah Williams",
      surveyor_id: 4,
      location: "789 Pine Rd, Chicago",
      status: "completed",
      statusColor: "bg-emerald-100 text-emerald-700",
      created_at: "2026-01-20",
      documents: 8,
    },
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll();
      const projectsList = response.results || response;
      setProjects(Array.isArray(projectsList) ? projectsList : mockProjects);
    } catch (error) {
      console.error("Failed to load projects:", error);
      setProjects(mockProjects);
    }
  };

  const displayProjects = projects.length > 0 ? projects : mockProjects;
  const filteredProjects = displayProjects.filter((project: any) =>
    project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      await projectService.create(data);
      toast.success("Project created successfully!");
      setIsCreateOpen(false);
      loadProjects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProject = async (data: ProjectFormData) => {
    if (!selectedProject) return;
    setIsLoading(true);
    try {
      await projectService.update(selectedProject.id, data);
      toast.success("Project updated successfully!");
      setIsEditOpen(false);
      setSelectedProject(null);
      loadProjects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    setIsLoading(true);
    try {
      await projectService.delete(selectedProject.id);
      toast.success("Project deleted successfully!");
      setIsDeleteOpen(false);
      setSelectedProject(null);
      loadProjects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete project");
    } finally {
      setIsLoading(false);
    }
  };

  const openViewDialog = (project: any) => {
    setSelectedProject(project);
    setIsViewOpen(true);
  };

  const openEditDialog = (project: any) => {
    setSelectedProject(project);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (project: any) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6 clean-bg min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Projects</h1>
          <p className="text-gray-600">Manage land surveying operations and project tracking</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Survey Project</DialogTitle>
              <DialogDescription>
                Create a new land surveying project
              </DialogDescription>
            </DialogHeader>
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => setIsCreateOpen(false)}
              isLoading={isLoading}
              customers={mockCustomers}
              surveyors={mockSurveyors}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search projects by name, location, or customer..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900 mb-1">{filteredProjects.length}</div>
          <div className="text-sm text-gray-600">Total Projects</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {filteredProjects.filter((p: any) => p.status === 'survey_in_progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {filteredProjects.filter((p: any) => p.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-emerald-600 mb-1">
            {filteredProjects.filter((p: any) => p.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project ID</TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Surveyor</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project: any) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">PRJ-{String(project.id).padStart(3, '0')}</TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">{project.project_name}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm">{project.customer}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm">{project.surveyor}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{project.location}</TableCell>
                <TableCell>
                  <Badge className={project.statusColor}>{formatStatus(project.status)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{project.documents}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{project.created_at}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => openViewDialog(project)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={() => openEditDialog(project)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => openDeleteDialog(project)}
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

      {/* View Project Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>
              View survey project information
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Project Name</label>
                  <p className="text-gray-900 mt-1">{selectedProject.project_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className={selectedProject.statusColor}>{formatStatus(selectedProject.status)}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-gray-900 mt-1">{selectedProject.customer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Surveyor</label>
                  <p className="text-gray-900 mt-1">{selectedProject.surveyor}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <p className="text-gray-900 mt-1">{selectedProject.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Documents</label>
                  <p className="text-gray-900 mt-1">{selectedProject.documents} files</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900 mt-1">{selectedProject.created_at}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setIsViewOpen(false);
                    openEditDialog(selectedProject);
                  }}
                >
                  Edit Project
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update survey project information
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <ProjectForm
              initialData={{
                project_name: selectedProject.project_name,
                customer_id: selectedProject.customer_id,
                surveyor_id: selectedProject.surveyor_id,
                location: selectedProject.location,
                status: selectedProject.status,
              }}
              onSubmit={handleEditProject}
              onCancel={() => {
                setIsEditOpen(false);
                setSelectedProject(null);
              }}
              isLoading={isLoading}
              customers={mockCustomers}
              surveyors={mockSurveyors}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProject?.project_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProject(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
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
