import { useState } from "react";
import { Plus, Search, FileText, User } from "lucide-react";
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
import { ProjectForm, ProjectFormData } from "../components/forms/ProjectForm";
import { projectService } from "../../services";
import { toast } from "sonner";

export function SurveyProjects() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  // Mock data - TODO: Replace with API call using projectService.getAll()
  const projects = [
    {
      id: 1,
      project_name: "Downtown Plot Survey",
      customer: "John Anderson",
      surveyor: "Sarah Williams",
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
      surveyor: "Michael Brown",
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
      surveyor: "Sarah Williams",
      location: "789 Pine Rd, Chicago",
      status: "completed",
      statusColor: "bg-emerald-100 text-emerald-700",
      created_at: "2026-01-20",
      documents: 8,
    },
  ];

  const handleCreateProject = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      await projectService.create(data);
      toast.success("Project created successfully!");
      setIsCreateOpen(false);
      // TODO: Refresh project list
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
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
            />
          </div>
          <Button variant="outline">Filter</Button>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900 mb-1">3</div>
          <div className="text-sm text-gray-600">Total Projects</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600 mb-1">1</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600 mb-1">1</div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-emerald-600 mb-1">1</div>
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
            {projects.map((project) => (
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
                  <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
