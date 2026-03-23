import { useState, useEffect } from "react";
import { Search, FileText, Download, Upload, Trash2, Eye } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "../components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { landTitleService, projectService } from "../../services";
import { toast } from "sonner";

const DOC_COLORS: Record<string, string> = {
  survey_map: "bg-blue-100 text-blue-700",
  land_title: "bg-emerald-100 text-emerald-700",
  boundary_report: "bg-purple-100 text-purple-700",
};

const DOC_LABELS: Record<string, string> = {
  survey_map: "Survey Map",
  land_title: "Land Title",
  boundary_report: "Boundary Report",
};

export function LandTitles() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [uploadProjectId, setUploadProjectId] = useState("");
  const [uploadDocType, setUploadDocType] = useState<"survey_map" | "land_title" | "boundary_report">("survey_map");

  useEffect(() => {
    loadDocuments();
    loadProjects();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await landTitleService.getAll();
      setDocuments(Array.isArray(res.results || res) ? (res.results || res) : []);
    } catch {
      toast.error("Failed to load documents.");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await projectService.getAll();
      setProjects(Array.isArray(res.results || res) ? (res.results || res) : []);
    } catch {
      setProjects([]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadProjectId) return;
    setIsLoading(true);
    try {
      await landTitleService.upload(selectedFile, {
        project_id: parseInt(uploadProjectId),
        document_type: uploadDocType,
      });
      toast.success("Document uploaded successfully!");
      setIsUploadOpen(false);
      setSelectedFile(null);
      setUploadProjectId("");
      loadDocuments();
    } catch {
      toast.error("Failed to upload document.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      const blob = await landTitleService.download(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.document_file?.split("/").pop() || `document-${doc.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download document.");
    }
  };

  const handleDelete = async () => {
    if (!selectedDocId) return;
    setIsLoading(true);
    try {
      await landTitleService.delete(selectedDocId);
      toast.success("Document deleted.");
      setIsDeleteOpen(false);
      setSelectedDocId(null);
      loadDocuments();
    } catch {
      toast.error("Failed to delete document.");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = documents.filter((doc) => {
    const projectName = doc.project?.project_name || "";
    const matchesSearch =
      projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      DOC_LABELS[doc.document_type]?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || doc.document_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 clean-bg min-h-screen p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Land Title Documents</h1>
          <p className="text-gray-600">Manage survey documents, land titles, and boundary reports</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Land Title Document</DialogTitle>
              <DialogDescription>Upload survey maps, land titles, or boundary reports</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Survey Project</Label>
                <Select value={uploadProjectId} onValueChange={setUploadProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.project_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={uploadDocType} onValueChange={(v) => setUploadDocType(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="survey_map">Survey Map</SelectItem>
                    <SelectItem value="land_title">Land Title</SelectItem>
                    <SelectItem value="boundary_report">Boundary Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Document File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                  <input type="file" id="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} />
                  <label htmlFor="file" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    {selectedFile
                      ? <p className="text-sm text-gray-700 font-medium">{selectedFile.name}</p>
                      : <><p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (max 10MB)</p></>
                    }
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleUpload}
                disabled={!selectedFile || !uploadProjectId || isLoading}>
                {isLoading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by project name or document type..." className="pl-10"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Document Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="survey_map">Survey Map</SelectItem>
              <SelectItem value="land_title">Land Title</SelectItem>
              <SelectItem value="boundary_report">Boundary Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900 mb-1">{documents.length}</div>
          <div className="text-sm text-gray-600">Total Documents</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600 mb-1">{documents.filter(d => d.document_type === "survey_map").length}</div>
          <div className="text-sm text-gray-600">Survey Maps</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-emerald-600 mb-1">{documents.filter(d => d.document_type === "land_title").length}</div>
          <div className="text-sm text-gray-600">Land Titles</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600 mb-1">{documents.filter(d => d.document_type === "boundary_report").length}</div>
          <div className="text-sm text-gray-600">Boundary Reports</div>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document ID</TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Uploaded Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  {searchQuery || typeFilter !== "all"
                    ? "No documents match your search."
                    : "No documents uploaded yet. Upload your first document."}
                </TableCell>
              </TableRow>
            ) : filtered.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">DOC-{String(doc.id).padStart(3, "0")}</TableCell>
                <TableCell className="font-medium text-gray-900">{doc.project?.project_name || "—"}</TableCell>
                <TableCell>
                  <Badge className={DOC_COLORS[doc.document_type]}>{DOC_LABELS[doc.document_type]}</Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700"
                      onClick={() => handleDownload(doc)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700"
                      onClick={() => { setSelectedDocId(doc.id); setIsDeleteOpen(true); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedDocId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
