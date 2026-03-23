import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Building2, FileText, MapPin, Calendar, Download, LogOut, Phone, ChevronRight, Activity,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from "../../contexts/AuthContext";
import { projectService } from "../../services";
import { toast } from "sonner";
import { Footer } from "../components/Footer";

const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  sold: "bg-gray-100 text-gray-700",
  rented: "bg-blue-100 text-blue-700",
  reserved: "bg-yellow-100 text-yellow-700",
};

const PROJECT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  survey_in_progress: "bg-blue-100 text-blue-700",
  submitted_to_land_office: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
};

function formatPrice(price: number | string | null | undefined) {
  if (!price) return null;
  const n = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(n);
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function CustomerPortal() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-projects");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Load customer's own projects
      const allProjects = await projectService.getAll();
      const customerProjects = (Array.isArray(allProjects) ? allProjects : (allProjects as any).results || [])
        .filter((p: any) =>
          p.customer?.email === user?.email ||
          p.customer?.name === user?.username ||
          p.customer?.name === `${user?.first_name} ${user?.last_name}`.trim()
        );
      setProjects(customerProjects);

      // Load public properties (no auth needed)
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000/api";
      const res = await fetch(`${apiBase}/properties/`);
      if (res.ok) {
        const json = await res.json();
        const list = (json.results || json || []) as any[];
        setProperties(list.filter((p: any) => !p.hidden_from_display));
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  const availableProperties = properties.filter((p) => p.status === "available" || p.status === "reserved");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
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
                    {user?.first_name?.[0] || user?.username?.[0] || "C"}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.username || "Customer"}
                  </div>
                  <div className="text-xs text-gray-500">Client</div>
                </div>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="rounded-xl overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-lg mb-8">
          <div className="relative flex items-center py-3 overflow-hidden border-b border-white/10">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-white/80 text-xs font-medium">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Land Surveying &amp; Real Estate Management System
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                  Manage Projects · Properties · Customers · Reports
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white text-lg sm:text-xl font-bold leading-tight">
                Welcome back, {user?.first_name || user?.username || "Customer"}!
              </h1>
              <p className="text-white/75 text-xs sm:text-sm">Manage your projects and explore available properties</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
            <div className="text-sm text-gray-500">My Projects</div>
          </Card>
          <Card className="p-5">
            <div className="text-2xl font-bold text-blue-600">
              {projects.filter((p) => p.status === "survey_in_progress").length}
            </div>
            <div className="text-sm text-gray-500">In Progress</div>
          </Card>
          <Card className="p-5">
            <div className="text-2xl font-bold text-emerald-600">
              {projects.filter((p) => p.status === "completed").length}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </Card>
          <Card className="p-5">
            <div className="text-2xl font-bold text-purple-600">{availableProperties.length}</div>
            <div className="text-sm text-gray-500">Properties Available</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="my-projects">My Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="properties">Available Properties ({availableProperties.length})</TabsTrigger>
            <TabsTrigger value="services">Our Services</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* My Projects Tab */}
        {activeTab === "my-projects" && (
          <div className="space-y-6">
            {isLoading ? (
              <Card className="p-8 text-center text-gray-400">Loading your projects...</Card>
            ) : projects.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No projects found</p>
                <p className="text-sm text-gray-400">Contact us to start a new survey project</p>
                <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => window.open("https://wa.me/256751768901?text=Hello! I'd like to start a new survey project.", "_blank")}>
                  <Phone className="w-4 h-4 mr-2" />Contact Us
                </Button>
              </Card>
            ) : (
              projects.map((project: any) => (
                <Card key={project.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{project.project_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                          {project.created_at ? project.created_at.slice(0, 10) : "—"}
                        </span>
                      </div>
                    </div>
                    <Badge className={PROJECT_STATUS_COLORS[project.status] || "bg-gray-100 text-gray-600"}>
                      {formatStatus(project.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Documents */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Documents ({project.documents?.length || 0})
                      </h4>
                      {project.documents?.length > 0 ? (
                        <div className="space-y-2">
                          {project.documents.map((doc: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{doc.name || doc.document_file}</p>
                                <p className="text-xs text-gray-500">{doc.uploaded_at ? doc.uploaded_at.slice(0, 10) : ""}</p>
                              </div>
                              {doc.document_file && (
                                <a href={doc.document_file} target="_blank" rel="noreferrer">
                                  <Button size="sm" variant="ghost" className="text-emerald-600">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No documents available yet</p>
                      )}
                    </div>

                    {/* Surveyor */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Assigned Surveyor</h4>
                      {project.surveyor ? (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-emerald-700 font-medium text-sm">
                              {project.surveyor.username?.[0]?.toUpperCase() || "S"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{project.surveyor.username}</p>
                            <p className="text-xs text-gray-500">Surveyor</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Not yet assigned</p>
                      )}

                      {project.completion_notes && (
                        <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                          <p className="text-xs font-medium text-emerald-700 mb-1">Completion Notes</p>
                          <p className="text-sm text-gray-700">{project.completion_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div>
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">Loading properties...</div>
            ) : availableProperties.length === 0 ? (
              <Card className="p-8 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No properties available at the moment.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableProperties.map((property: any) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-44 bg-gradient-to-br from-emerald-400 to-teal-500 relative overflow-hidden">
                      {property.primary_image_url ? (
                        <img src={property.primary_image_url} alt={property.property_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-14 h-14 text-white opacity-40" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge className={STATUS_COLORS[property.status] || "bg-gray-100 text-gray-700"}>
                          {property.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 truncate mb-1">{property.property_name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                        <MapPin className="w-3.5 h-3.5" /><span className="truncate">{property.location}</span>
                      </div>
                      {property.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 mb-2">{property.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <span className="capitalize">{property.property_type}</span>
                        <span>•</span>
                        <span>{property.size}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        {property.price ? (
                          <span className="font-bold text-emerald-600">{formatPrice(property.price)}</span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Price on request</span>
                        )}
                        <Button size="sm" variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => window.open(
                            `https://wa.me/256751768901?text=${encodeURIComponent(`Hello! I'm interested in: ${property.property_name} (${property.location}). Can you provide more details?`)}`,
                            "_blank"
                          )}>
                          Inquire <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: MapPin, title: "Land Surveying", desc: "Professional land surveying with accurate measurements and detailed reports.", color: "bg-emerald-100 text-emerald-600" },
              { icon: FileText, title: "Title Documentation", desc: "Complete land title processing and documentation for secure property ownership.", color: "bg-blue-100 text-blue-600" },
              { icon: Building2, title: "Real Estate Management", desc: "Comprehensive property management for residential and commercial properties.", color: "bg-purple-100 text-purple-600" },
              { icon: Building2, title: "Property Sales", desc: "Expert assistance in buying and selling properties at competitive market rates.", color: "bg-orange-100 text-orange-600" },
            ].map((s, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{s.desc}</p>
                <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  onClick={() => window.open(`https://wa.me/256751768901?text=${encodeURIComponent(`Hello! I'm interested in your ${s.title} service. Can you tell me more?`)}`, "_blank")}>
                  Inquire via WhatsApp
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Help */}
        <Card className="p-6 mt-8 bg-emerald-50 border-emerald-200">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you have any questions about your projects or need assistance, contact our support team.
          </p>
          <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
            onClick={() => window.open("https://wa.me/256751768901?text=Hello! I need help with my account.", "_blank")}>
            Contact Support
          </Button>
        </Card>
      </main>
      <Footer hideQuickLinks />
    </div>
  );
}
