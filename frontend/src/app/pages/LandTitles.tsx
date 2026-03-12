import { useState } from "react";
import { Plus, Search, FileText, Download, Upload, Trash2, Eye } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";

export function LandTitles() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mock data - will be replaced with API calls
  const documents = [
    {
      id: 1,
      project_id: 1,
      project_name: "Downtown Plot Survey",
      document_type: "survey_map",
      document_file: "survey_map_001.pdf",
      uploaded_at: "2026-02-20",
      file_size: "2.4 MB",
    },
    {
      id: 2,
      project_id: 1,
      project_name: "Downtown Plot Survey",
      document_type: "land_title",
      document_file: "land_title_001.pdf",
      uploaded_at: "2026-02-25",
      file_size: "1.8 MB",
    },
    {
      id: 3,
      project_id: 2,
      project_name: "Residential Property Survey",
      document_type: "boundary_report",
      document_file: "boundary_report_002.pdf",
      uploaded_at: "2026-03-05",
      file_size: "3.2 MB",
    },
    {
      id: 4,
      project_id: 3,
      project_name: "Subdivision Survey",
      document_type: "survey_map",
      document_file: "survey_map_003.pdf",
      uploaded_at: "2026-01-28",
      file_size: "4.1 MB",
    },
  ];

  const documentTypeColors: Record<string, string> = {
    survey_map: "bg-blue-100 text-blue-700",
    land_title: "bg-emerald-100 text-emerald-700",
    boundary_report: "bg-purple-100 text-purple-700",
  };

  const documentTypeLabels: Record<string, string> = {
    survey_map: "Survey Map",
    land_title: "Land Title",
    boundary_report: "Boundary Report",
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    // TODO: Implement upload with landTitleService
    console.log("Uploading file:", selectedFile);
    setIsUploadOpen(false);
    setSelectedFile(null);
  };

  const handleDownload = (documentId: number) => {
    // TODO: Implement download with landTitleService
    console.log("Downloading document:", documentId);
  };

  const handleDelete = (documentId: number) => {
    // TODO: Implement delete with landTitleService
    console.log("Deleting document:", documentId);
  };

  return (
    <div className="space-y-6 clean-bg min-h-screen p-6">
      {/* Header */}
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
              <DialogDescription>
                Upload survey maps, land titles, or boundary reports
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project">Survey Project</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Downtown Plot Survey</SelectItem>
                    <SelectItem value="2">Residential Property Survey</SelectItem>
                    <SelectItem value="3">Subdivision Survey</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_type">Document Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="survey_map">Survey Map</SelectItem>
                    <SelectItem value="land_title">Land Title</SelectItem>
                    <SelectItem value="boundary_report">Boundary Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Document File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                  <input
                    type="file"
                    id="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    {selectedFile ? (
                      <p className="text-sm text-gray-700 font-medium">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (max 10MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700" 
                onClick={handleUpload}
                disabled={!selectedFile}
              >
                Upload
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search documents by project name or type..."
              className="pl-10"
            />
          </div>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="survey_map">Survey Map</SelectItem>
              <SelectItem value="land_title">Land Title</SelectItem>
              <SelectItem value="boundary_report">Boundary Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900 mb-1">4</div>
          <div className="text-sm text-gray-600">Total Documents</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600 mb-1">2</div>
          <div className="text-sm text-gray-600">Survey Maps</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-emerald-600 mb-1">1</div>
          <div className="text-sm text-gray-600">Land Titles</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600 mb-1">1</div>
          <div className="text-sm text-gray-600">Boundary Reports</div>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document ID</TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead>Uploaded Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">DOC-{String(doc.id).padStart(3, '0')}</TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">{doc.project_name}</div>
                </TableCell>
                <TableCell>
                  <Badge className={documentTypeColors[doc.document_type]}>
                    {documentTypeLabels[doc.document_type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{doc.document_file}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{doc.file_size}</TableCell>
                <TableCell className="text-sm text-gray-600">{doc.uploaded_at}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownload(doc.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-emerald-600 hover:text-emerald-700"
                      onClick={() => handleDownload(doc.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(doc.id)}
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

      {/* Documents by Project */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents by Project</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900">Downtown Plot Survey</h3>
              <Badge className="bg-blue-100 text-blue-700">2 documents</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Survey Map</span>
              <span>•</span>
              <span>Land Title</span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900">Residential Property Survey</h3>
              <Badge className="bg-blue-100 text-blue-700">1 document</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Boundary Report</span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900">Subdivision Survey</h3>
              <Badge className="bg-blue-100 text-blue-700">1 document</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Survey Map</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
