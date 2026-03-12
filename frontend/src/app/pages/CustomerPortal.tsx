import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Building2, FileText, MapPin, Calendar, Download, LogOut } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../../contexts/AuthContext";
import { projectService } from "../../services";
import { toast } from "sonner";

export function CustomerPortal() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomerProjects();
  }, []);

  const loadCustomerProjects = async () => {
    try {
      // Fetch projects for the logged-in customer
      const allProjects = await projectService.getAll();
      // Filter projects by customer email/name matching user credentials
      const customerProjects = allProjects.filter((project: any) => 
        project.customer_email === user?.email || 
        project.customer_name === user?.username
      );
      setProjects(customerProjects);
    } catch (error) {
      console.error("Failed to load projects:", error);
      // Use mock data for demo
      setProjects(mockProjects);
    } finally {
      setIsLoading(false);
    }
  };

  const mockProjects = [
    {
      id: 1,
      project_name: "Downtown Plot Survey",
      location: "123 Main St, New York",
      status: "survey_in_progress",
      statusColor: "bg-blue-100 text-blue-700",
      created_at: "2026-02-15",
      surveyor: "Sarah Williams",
      documents: [
        { name: "Survey Map.pdf", type: "Survey Map", date: "2026-02-20" },
        { name: "Boundary Report.pdf", type: "Boundary Report", date: "2026-02-22" },
      ],
      updates: [
        { date: "2026-02-22", status: "Survey In Progress", note: "Field survey completed, processing data" },
        { date: "2026-02-15", status: "Pending", note: "Project initiated, surveyor assigned" },
      ],
    },
    {
      id: 2,
      project_name: "Residential Property Survey",
      location: "456 Oak Ave, Los Angeles",
      status: "completed",
      statusColor: "bg-emerald-100 text-emerald-700",
      created_at: "2026-01-10",
      surveyor: "Michael Brown",
      documents: [
        { name: "Final Survey Map.pdf", type: "Survey Map", date: "2026-01-25" },
        { name: "Land Title.pdf", type: "Land Title", date: "2026-01-28" },
        { name: "Boundary Report.pdf", type: "Boundary Report", date: "2026-01-25" },
      ],
      updates: [
        { date: "2026-01-28", status: "Completed", note: "All documents submitted to land office" },
        { date: "2026-01-20", status: "Survey In Progress", note: "Survey completed, preparing documents" },
        { date: "2026-01-10", status: "Pending", note: "Project initiated" },
      ],
    },
  ];

  const displayProjects = projects.length > 0 ? projects : mockProjects;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-xl font-semibold text-gray-900">LSREMS</span>
                <p className="text-xs text-gray-600">Client Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-medium">
                    {user?.first_name?.[0] || user?.username?.[0] || 'C'}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.first_name && user?.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : user?.username || 'Customer'}
                  </div>
                  <div className="text-xs text-gray-500">Client</div>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name || user?.username || 'Customer'}!
          </h1>
          <p className="text-gray-600">
            Track your survey projects and access important documents
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-gray-900 mb-1">{displayProjects.length}</div>
            <div className="text-sm text-gray-600">Total Projects</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {displayProjects.filter((p: any) => p.status === 'survey_in_progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {displayProjects.filter((p: any) => p.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </Card>
        </div>

        {/* Projects */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
          
          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">Loading your projects...</p>
            </Card>
          ) : displayProjects.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No projects found</p>
            </Card>
          ) : (
            displayProjects.map((project: any) => (
              <Card key={project.id} className="p-6">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {project.project_name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Started: {project.created_at}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={project.statusColor}>
                    {formatStatus(project.status)}
                  </Badge>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Documents */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Documents ({project.documents?.length || 0})
                    </h4>
                    {project.documents && project.documents.length > 0 ? (
                      <div className="space-y-2">
                        {project.documents.map((doc: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">{doc.type} • {doc.date}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-emerald-600">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No documents available yet</p>
                    )}
                  </div>

                  {/* Project Updates */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Project Timeline</h4>
                    {project.updates && project.updates.length > 0 ? (
                      <div className="space-y-3">
                        {project.updates.map((update: any, index: number) => (
                          <div key={index} className="relative pl-6 pb-3 border-l-2 border-gray-200 last:border-0">
                            <div className="absolute left-0 top-0 w-3 h-3 bg-emerald-600 rounded-full -translate-x-[7px]"></div>
                            <div className="text-xs text-gray-500 mb-1">{update.date}</div>
                            <div className="text-sm font-medium text-gray-900">{update.status}</div>
                            <div className="text-sm text-gray-600">{update.note}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No updates available</p>
                    )}
                  </div>
                </div>

                {/* Surveyor Info */}
                {project.surveyor && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Assigned Surveyor: <span className="font-medium text-gray-900">{project.surveyor}</span>
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Help Section */}
        <Card className="p-6 mt-8 bg-emerald-50 border-emerald-200">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you have any questions about your projects or need assistance, please contact our support team.
          </p>
          <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white">
            Contact Support
          </Button>
        </Card>
      </main>
    </div>
  );
}
