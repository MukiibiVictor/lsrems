import { useState, useEffect } from "react";
import { Plus, Search, User, Eye, Edit, Trash2, FolderKanban, AlertTriangle, Clock, Inbox, CheckCircle, UserCheck, ClipboardCheck } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { ProjectForm, ProjectFormData } from "../components/forms/ProjectForm";
import { projectService } from "../../services";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { toast } from "sonner";

const statusColor = (status: string) => {
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "survey_in_progress") return "bg-blue-100 text-blue-700";
  if (status === "submitted_to_land_office") return "bg-orange-100 text-orange-700";
  return "bg-yellow-100 text-yellow-700";
};

const formatStatus = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const customerName = (p: any) => p.customer?.name || p.customer_name || "—";
const surveyorName = (p: any) =>
  p.surveyor
    ? `${p.surveyor.first_name || ""} ${p.surveyor.last_name || ""}`.trim() || p.surveyor.username
    : "Unassigned";

export function SurveyProjects() {
  const { user } = useAuth();
  const perms = usePermissions();

  const [projects, setProjects] = useState<any[]>([]);
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [assignUserId, setAssignUserId] = useState("");

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [projRes, unassignedRes, myJobsRes] = await Promise.all([
        projectService.getAll(),
        projectService.getUnassigned(),
        projectService.getMyJobs(),
      ]);
      setProjects(Array.isArray((projRes as any).results ?? projRes) ? ((projRes as any).results ?? projRes) : []);
      setUnassigned(Array.isArray(unassignedRes) ? unassignedRes : []);
      setMyJobs(Array.isArray(myJobsRes) ? myJobsRes : []);
    } catch {
      toast.error("Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await import("../../services").then(m => m.apiClient.get<any>("/users/"));
      const list = (data as any).results ?? data;
      setUsers(Array.isArray(list) ? list.filter((u: any) => ["surveyor", "worker", "admin"].includes(u.role)) : []);
    } catch {
      setUsers([]);
    }
  };

  const sanitize = (data: ProjectFormData) => ({
    ...data,
    surveyor_id: data.surveyor_id && data.surveyor_id !== 0 ? data.surveyor_id : null,
  });

  const handleCreate = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      await projectService.create(sanitize(data) as any);
      toast.success("Project created!");
      setIsCreateOpen(false);
      loadAll();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create project");
    } finally { setIsLoading(false); }
  };

  const handleEdit = async (data: ProjectFormData) => {
    if (!selectedProject) return;
    setIsLoading(true);
    try {
      await projectService.update(selectedProject.id, sanitize(data) as any);
      toast.success("Project updated!");
      setIsEditOpen(false);
      setSelectedProject(null);
      loadAll();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update project");
    } finally { setIsLoading(false); }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    setIsLoading(true);
    try {
      await projectService.delete(selectedProject.id);
      toast.success("Project deleted!");
      setIsDeleteOpen(false);
      setSelectedProject(null);
      loadAll();
    } catch { toast.error("Failed to delete project"); }
    finally { setIsLoading(false); }
  };

  const handleAssignSelf = async (project: any) => {
    try {
      await projectService.assignSelf(project.id);
      toast.success("You have been assigned to this project!");
      loadAll();
    } catch (e: any) {
      toast.error(e?.message || "Failed to assign");
    }
  };

  const handleAssign = async () => {
    if (!selectedProject || !assignUserId) return;
    try {
      await projectService.assignTo(selectedProject.id, parseInt(assignUserId));
      toast.success("Project assigned successfully!");
      setIsAssignOpen(false);
      setAssignUserId("");
      setSelectedProject(null);
      loadAll();
    } catch (e: any) {
      toast.error(e?.message || "Failed to assign");
    }
  };

  const handleComplete = async () => {
    if (!selectedProject) return;
    try {
      await projectService.complete(selectedProject.id, completionNotes);
      toast.success("Project marked as completed!");
      setIsCompleteOpen(false);
      setCompletionNotes("");
      setSelectedProject(null);
      loadAll();
    } catch (e: any) {
      toast.error(e?.message || "Failed to complete project");
    }
  };

  const filtered = projects.filter((p: any) =>
    p.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customerName(p).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ProjectRow = ({ project, showComplete = false }: { project: any; showComplete?: boolean }) => (
    <TableRow key={project.id}>
      <TableCell className="font-medium text-gray-500 dark:text-gray-400">
        PRJ-{String(project.id).padStart(3, "0")}
      </TableCell>
      <TableCell className="font-medium text-gray-900 dark:text-white">{project.project_name}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <span className="text-sm">{customerName(project)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${project.surveyor ? "bg-emerald-50 dark:bg-emerald-900/30" : "bg-yellow-50 dark:bg-yellow-900/20"}`}>
            <User className={`w-3.5 h-3.5 ${project.surveyor ? "text-emerald-600" : "text-yellow-500"}`} />
          </div>
          <span className="text-sm">{surveyorName(project)}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-gray-600 dark:text-gray-400 max-w-[140px] truncate">{project.location}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Badge className={statusColor(project.status)}>{formatStatus(project.status)}</Badge>
          {project.is_overdue && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
          {project.needs_reminder && !project.is_overdue && <Clock className="w-3.5 h-3.5 text-orange-400" />}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50"
            onClick={() => { setSelectedProject(project); setIsViewOpen(true); }}>
            <Eye className="w-4 h-4" />
          </Button>
          {perms.isAdmin && (
            <>
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50"
                onClick={() => { setSelectedProject(project); setIsEditOpen(true); }}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50"
                title="Assign to user"
                onClick={() => { setSelectedProject(project); loadUsers(); setIsAssignOpen(true); }}>
                <UserCheck className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50"
                onClick={() => { setSelectedProject(project); setIsDeleteOpen(true); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          {showComplete && project.status !== "completed" && (
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50"
              title="Mark as complete"
              onClick={() => { setSelectedProject(project); setIsCompleteOpen(true); }}>
              <ClipboardCheck className="w-4 h-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Survey Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage land surveying operations</p>
        </div>
        {perms.isAdmin && (
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />New Project
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: projects.length, color: "text-gray-900 dark:text-white" },
          { label: "In Progress", value: projects.filter(p => p.status === "survey_in_progress").length, color: "text-blue-600" },
          { label: "Pending / Unassigned", value: unassigned.length, color: "text-yellow-600" },
          { label: "Completed", value: projects.filter(p => p.status === "completed").length, color: "text-emerald-600" },
        ].map((s) => (
          <Card key={s.label} className="p-4 shadow-sm">
            <div className={`text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-2">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending Jobs
            {unassigned.length > 0 && (
              <span className="ml-1.5 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {unassigned.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="myjobs" className="relative">
            My Jobs
            {myJobs.length > 0 && (
              <span className="ml-1.5 bg-emerald-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {myJobs.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ALL PROJECTS */}
        <TabsContent value="all">
          <Card className="shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search by name, location, or customer..." className="pl-10"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{searchQuery ? "No projects match your search." : "No projects yet."}</p>
                {!searchQuery && perms.isAdmin && (
                  <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />Create First Project
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Surveyor</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => <ProjectRow key={p.id} project={p} />)}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* PENDING / UNASSIGNED JOBS */}
        <TabsContent value="pending">
          <Card className="shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Unassigned projects — pick one up or admin can assign it to you
              </span>
            </div>
            {unassigned.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-gray-500">No pending unassigned jobs. All projects are assigned.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassigned.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-gray-500 dark:text-gray-400 font-medium">PRJ-{String(p.id).padStart(3, "0")}</TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-white">{p.project_name}</TableCell>
                      <TableCell>{customerName(p)}</TableCell>
                      <TableCell className="text-sm text-gray-500 max-w-[140px] truncate">{p.location}</TableCell>
                      <TableCell>
                        <Badge className={
                          p.priority === "urgent" ? "bg-red-100 text-red-700" :
                          p.priority === "high" ? "bg-orange-100 text-orange-700" :
                          p.priority === "medium" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }>{p.priority || "medium"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50"
                            onClick={() => { setSelectedProject(p); setIsViewOpen(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2"
                            onClick={() => handleAssignSelf(p)}>
                            Take Job
                          </Button>
                          {perms.isAdmin && (
                            <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50 text-xs h-7 px-2"
                              onClick={() => { setSelectedProject(p); loadUsers(); setIsAssignOpen(true); }}>
                              Assign
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* MY JOBS */}
        <TabsContent value="myjobs">
          <Card className="shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Projects assigned to you — mark them complete when done
              </span>
            </div>
            {myJobs.length === 0 ? (
              <div className="text-center py-12">
                <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active jobs assigned to you.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myJobs.map((p) => <ProjectRow key={p.id} project={p} showComplete />)}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Create Dialog ── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Survey Project</DialogTitle>
            <DialogDescription>Create a new land surveying project</DialogDescription>
          </DialogHeader>
          <ProjectForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} isLoading={isLoading} />
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update survey project information</DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <ProjectForm
              initialData={{
                project_name: selectedProject.project_name,
                customer_id: selectedProject.customer?.id || selectedProject.customer_id,
                customer_name: customerName(selectedProject),
                surveyor_id: selectedProject.surveyor?.id,
                location: selectedProject.location,
                status: selectedProject.status,
              }}
              onSubmit={handleEdit}
              onCancel={() => { setIsEditOpen(false); setSelectedProject(null); }}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── View Dialog ── */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Project Name", value: selectedProject.project_name },
                  { label: "Status", value: formatStatus(selectedProject.status) },
                  { label: "Customer", value: customerName(selectedProject) },
                  { label: "Surveyor", value: surveyorName(selectedProject) },
                  { label: "Priority", value: selectedProject.priority || "medium" },
                  { label: "Created", value: selectedProject.created_at ? new Date(selectedProject.created_at).toLocaleDateString() : "—" },
                  { label: "Location", value: selectedProject.location, full: true },
                  ...(selectedProject.completion_notes ? [{ label: "Completion Notes", value: selectedProject.completion_notes, full: true }] : []),
                ].map((item: any) => (
                  <div key={item.label} className={item.full ? "col-span-2" : ""}>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
              {selectedProject.is_overdue && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                  <AlertTriangle className="w-4 h-4" />This project is overdue
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Admin Assign Dialog ── */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Project</DialogTitle>
            <DialogDescription>Assign "{selectedProject?.project_name}" to a team member</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={assignUserId} onValueChange={setAssignUserId}>
                <SelectTrigger><SelectValue placeholder="Choose a surveyor or worker" /></SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.username}
                      <span className="text-gray-400 ml-1 text-xs capitalize">({u.role})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsAssignOpen(false); setAssignUserId(""); }}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAssign} disabled={!assignUserId}>
              Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Complete Confirmation Dialog ── */}
      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Completion</DialogTitle>
            <DialogDescription>
              Confirm that you have completed "{selectedProject?.project_name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Completion Notes (optional)</Label>
              <Textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Describe what was done, any observations..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsCompleteOpen(false); setCompletionNotes(""); }}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleComplete}>
              <CheckCircle className="w-4 h-4 mr-2" />Mark Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProject?.project_name}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProject(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
