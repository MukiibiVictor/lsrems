import { useState } from "react";
import { useNavigate } from "react-router";
import { Building2, MapPin, FileText, TrendingUp, CheckCircle, ArrowRight, Phone, Mail, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";

export function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"for-sale" | "sold">("for-sale");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock properties data
  const propertiesForSale = [
    {
      id: 1,
      name: "Sunset Valley Estate",
      location: "Arizona, Phoenix",
      type: "Land",
      size: "5,000 sqft",
      price: "$450,000",
      image: "land",
      status: "Available",
    },
    {
      id: 2,
      name: "Oceanview Heights",
      location: "California, Malibu",
      type: "House",
      size: "3,500 sqft",
      bedrooms: "4 bed, 3 bath",
      price: "$1,850,000",
      image: "house",
      status: "Available",
    },
    {
      id: 3,
      name: "Mountain View Acres",
      location: "Colorado, Denver",
      type: "Land",
      size: "10,000 sqft",
      price: "$680,000",
      image: "land",
      status: "Available",
    },
  ];

  const propertiesSold = [
    {
      id: 4,
      name: "Downtown Office Tower",
      location: "New York, Manhattan",
      type: "Commercial",
      size: "15,000 sqft",
      price: "$2,500,000",
      image: "commercial",
      status: "Sold",
    },
    {
      id: 5,
      name: "Riverside Apartments",
      location: "Texas, Austin",
      type: "Apartment",
      size: "2,200 sqft",
      bedrooms: "3 bed, 2 bath",
      price: "$425,000",
      image: "apartment",
      status: "Sold",
    },
  ];

  const services = [
    {
      icon: MapPin,
      title: "Land Surveying",
      description: "Professional land surveying services with accurate measurements and detailed reports.",
    },
    {
      icon: FileText,
      title: "Title Documentation",
      description: "Complete land title processing and documentation services for secure property ownership.",
    },
    {
      icon: Building2,
      title: "Real Estate Management",
      description: "Comprehensive property management services for residential and commercial properties.",
    },
    {
      icon: TrendingUp,
      title: "Property Sales",
      description: "Expert assistance in buying and selling properties with competitive market rates.",
    },
  ];

  const displayProperties = activeTab === "for-sale" ? propertiesForSale : propertiesSold;

  // Mock project data for search
  const mockProjects = [
    {
      id: 1,
      project_id: "PRJ-001",
      project_name: "Downtown Plot Survey",
      customer_name: "John Anderson",
      customer_email: "john.anderson@email.com",
      location: "123 Main St, New York",
      status: "survey_in_progress",
      statusColor: "bg-blue-100 text-blue-700",
      created_at: "2026-02-15",
      surveyor: "Sarah Williams",
    },
    {
      id: 2,
      project_id: "PRJ-002",
      project_name: "Residential Property Survey",
      customer_name: "Emily Chen",
      customer_email: "emily.chen@email.com",
      location: "456 Oak Ave, Los Angeles",
      status: "completed",
      statusColor: "bg-emerald-100 text-emerald-700",
      created_at: "2026-01-10",
      surveyor: "Michael Brown",
    },
    {
      id: 3,
      project_id: "PRJ-003",
      project_name: "Subdivision Survey",
      customer_name: "Robert Davis",
      customer_email: "robert.davis@email.com",
      location: "789 Pine Rd, Chicago",
      status: "pending",
      statusColor: "bg-yellow-100 text-yellow-700",
      created_at: "2026-03-01",
      surveyor: "Sarah Williams",
    },
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setIsSearching(true);
    
    // Simulate API call - in production, this would call the backend
    setTimeout(() => {
      const results = mockProjects.filter(project =>
        project.project_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(results);
      setIsSearchOpen(true);
      setIsSearching(false);

      if (results.length === 0) {
        toast.info("No projects found matching your search");
      }
    }, 500);
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-b from-white via-white to-emerald-50/30 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-xl font-semibold text-gray-900">LSREMS</span>
                <p className="text-xs text-gray-600">Land Surveying & Real Estate</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                className="text-gray-600 hover:text-gray-900"
              >
                Client Login
              </Button>
              <Button
                onClick={() => navigate("/login")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Staff Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 via-emerald-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Your Trusted Partner in Land & Real Estate
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Professional land surveying services and premium real estate solutions for your property needs
            </p>

            {/* Project Search */}
            <Card className="p-6 mb-8 bg-white shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Track Your Project</h3>
              <p className="text-sm text-gray-600 mb-4">
                Search by Project ID, Customer Name, Email, or Location
              </p>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Enter Project ID, Customer Name, Email, or Location..."
                    className="pl-10 h-12 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Example: Try searching "PRJ-001", "John Anderson", or "New York"
              </p>
            </Card>

            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8"
                onClick={() => {
                  document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Properties
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8"
                onClick={() => {
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Our Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-b from-white via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive land surveying and real estate services tailored to meet your needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section id="properties" className="py-20 bg-gradient-to-b from-gray-50 via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Properties</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our selection of premium properties and estates
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              variant={activeTab === "for-sale" ? "default" : "outline"}
              onClick={() => setActiveTab("for-sale")}
              className={activeTab === "for-sale" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              For Sale ({propertiesForSale.length})
            </Button>
            <Button
              variant={activeTab === "sold" ? "default" : "outline"}
              onClick={() => setActiveTab("sold")}
              className={activeTab === "sold" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              Sold ({propertiesSold.length})
            </Button>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Property Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-white opacity-50" />
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">{property.name}</h3>
                    <Badge className={property.status === "Available" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}>
                      {property.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
                    <span>{property.type}</span>
                    <span>•</span>
                    <span>{property.size}</span>
                    {property.bedrooms && (
                      <>
                        <span>•</span>
                        <span>{property.bedrooms}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-2xl font-bold text-emerald-600">{property.price}</span>
                    {property.status === "Available" && (
                      <Button size="sm" variant="outline">
                        Inquire
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-b from-white via-emerald-50/30 to-emerald-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide exceptional service and expertise in land surveying and real estate
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Team</h3>
              <p className="text-gray-600">
                Experienced surveyors and real estate professionals dedicated to your success
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accurate Results</h3>
              <p className="text-gray-600">
                Precise measurements and detailed documentation for all surveying projects
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Client Portal</h3>
              <p className="text-gray-600">
                Track your projects online with real-time updates and document access
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your land surveying or real estate needs
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 h-12 px-8"
              onClick={() => navigate("/login")}
            >
              Client Portal Login
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-emerald-700 via-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-semibold">LSREMS</span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional land surveying and real estate management services
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@lsrems.com</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div>
                  <button onClick={() => navigate("/login")} className="hover:text-white">
                    Client Login
                  </button>
                </div>
                <div>
                  <button onClick={() => navigate("/login")} className="hover:text-white">
                    Staff Login
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 LSREMS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Search Results Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Search Results</DialogTitle>
            <DialogDescription>
              Found {searchResults.length} project(s) matching "{searchQuery}"
            </DialogDescription>
          </DialogHeader>
          
          {searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No projects found matching your search.</p>
              <p className="text-sm text-gray-500">
                Try searching with a different Project ID, Customer Name, Email, or Location.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((project) => (
                <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {project.project_name}
                        </h3>
                        <Badge className={project.statusColor}>
                          {formatStatus(project.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">Project ID: {project.project_id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Customer</label>
                      <p className="text-sm text-gray-900 mt-1">{project.customer_name}</p>
                      <p className="text-xs text-gray-500">{project.customer_email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Surveyor</label>
                      <p className="text-sm text-gray-900 mt-1">{project.surveyor}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Location</label>
                      <p className="text-sm text-gray-900 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {project.location}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Created</label>
                      <p className="text-sm text-gray-900 mt-1">{project.created_at}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">
                      To view full project details, documents, and timeline, please login to the customer portal.
                    </p>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate("/login");
                      }}
                    >
                      Login to View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsSearchOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              New Search
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
