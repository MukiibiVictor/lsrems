import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Building2, MapPin, FileText, TrendingUp, CheckCircle,
  ArrowRight, Phone, Mail, Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";
import { WhatsAppContact } from "../components/WhatsAppContact";

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

export function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"for-sale" | "for-rent">("for-sale");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => { loadProperties(); }, []);

  const loadProperties = async () => {
    try {
      setLoadingProps(true);
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000/api";
      const res = await fetch(`${apiBase}/properties/`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      const list = (json.results || json || []) as any[];
      setProperties(list.filter((p: any) => !p.hidden_from_display));
    } catch {
      setProperties([]);
    } finally {
      setLoadingProps(false);
    }
  };

  const availableProperties = properties.filter((p) => p.status === "available");
  const rentProperties = properties.filter((p) => p.status === "reserved" || p.status === "rented" || p.status === "available");
  const displayProperties = activeTab === "for-sale" ? availableProperties : rentProperties;
  const total = displayProperties.length;

  // Auto-advance carousel every 3.5s
  const advance = useCallback(() => {
    if (!isPausedRef.current && total > 1) {
      setCarouselIndex((i) => (i + 1) % total);
    }
  }, [total]);

  useEffect(() => {
    setCarouselIndex(0);
  }, [activeTab]);

  useEffect(() => {
    if (total <= 1) return;
    autoPlayRef.current = setInterval(advance, 3500);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [advance, total]);

  const goTo = (idx: number) => {
    setCarouselIndex(idx);
    // Pause briefly on manual nav then resume
    isPausedRef.current = true;
    setTimeout(() => { isPausedRef.current = false; }, 5000);
  };

  const prev = () => goTo((carouselIndex - 1 + total) % total);
  const next = () => goTo((carouselIndex + 1) % total);

  // Show 3 cards: current, next, next+1 (wrapping)
  const visibleCards = total === 0 ? [] : [0, 1, 2].map((offset) => displayProperties[(carouselIndex + offset) % total]);

  const services = [
    { icon: MapPin, title: "Land Surveying", description: "Professional land surveying services with accurate measurements and detailed reports." },
    { icon: FileText, title: "Title Documentation", description: "Complete land title processing and documentation services for secure property ownership." },
    { icon: Building2, title: "Real Estate Management", description: "Comprehensive property management services for residential and commercial properties." },
    { icon: TrendingUp, title: "Property Sales", description: "Expert assistance in buying and selling properties with competitive market rates." },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) { toast.error("Please enter a search term"); return; }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/projects/?search=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      const results = json.results || json || [];
      setSearchResults(results);
      setIsSearchOpen(true);
      if (results.length === 0) toast.info("No projects found matching your search");
    } catch {
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
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
              <Button variant="ghost" onClick={() => navigate("/login")} className="text-gray-600 hover:text-gray-900">
                Client Login
              </Button>
              <Button onClick={() => navigate("/login")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Staff Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-50 via-emerald-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Your Trusted Partner in Land & Real Estate
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Professional land surveying services and premium real estate solutions for your property needs
            </p>
            <Card className="p-6 mb-8 bg-white shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Track Your Project</h3>
              <p className="text-sm text-gray-600 mb-4">Search by Project ID, Customer Name, Email, or Location</p>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Enter Project ID, Customer Name, Email, or Location..."
                    className="pl-10 h-12 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8" onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">Example: Try searching by project name or customer name</p>
            </Card>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8"
                onClick={() => document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" })}>
                View Properties <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8"
                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
                Our Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-gradient-to-b from-white via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive land surveying and real estate services tailored to meet your needs</p>
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

      {/* Properties — auto-swipe carousel */}
      <section id="properties" className="py-20 bg-gradient-to-b from-gray-50 via-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Properties</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Browse our selection of premium properties and estates</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              variant={activeTab === "for-sale" ? "default" : "outline"}
              onClick={() => { setActiveTab("for-sale"); setCarouselIndex(0); }}
              className={activeTab === "for-sale" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              For Sale ({availableProperties.length})
            </Button>
            <Button
              variant={activeTab === "for-rent" ? "default" : "outline"}
              onClick={() => { setActiveTab("for-rent"); setCarouselIndex(0); }}
              className={activeTab === "for-rent" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              For Rent ({rentProperties.length})
            </Button>
          </div>

          {loadingProps ? (
            <div className="text-center py-12 text-gray-400">Loading properties...</div>
          ) : total === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No {activeTab === "for-sale" ? "available" : "rental"} properties at the moment.</p>
            </div>
          ) : (
            <>
              {/* Carousel */}
              <div className="relative">
                {/* Prev */}
                <button
                  onClick={prev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Cards — always show 3, smooth crossfade */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {visibleCards.map((property: any, slot) => (
                    <div
                      key={`${activeTab}-${carouselIndex}-${slot}`}
                      style={{ animation: "fadeSlideIn 0.6s cubic-bezier(0.4,0,0.2,1) both", animationDelay: `${slot * 80}ms` }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center relative overflow-hidden">
                          {property.primary_image_url ? (
                            <img src={property.primary_image_url} alt={property.property_name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-16 h-16 text-white opacity-50" />
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge className={STATUS_COLORS[property.status] || "bg-gray-100 text-gray-700"}>
                              {property.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">{property.property_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{property.location}</span>
                          </div>
                          {property.description && (
                            <p className="text-xs text-gray-400 line-clamp-2 mb-3">{property.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
                            <span className="capitalize">{property.property_type}</span>
                            <span>•</span>
                            <span>{property.size}</span>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            {property.price ? (
                              <span className="text-2xl font-bold text-emerald-600">{formatPrice(property.price)}</span>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Price on request</span>
                            )}
                            {(property.status === "available" || property.status === "reserved") && (
                              <Button size="sm" variant="outline"
                                onClick={() => window.open(
                                  `https://wa.me/256751768901?text=${encodeURIComponent(`Hello! I'm interested in: ${property.property_name} (${property.location}). Can you provide more details?`)}`,
                                  "_blank"
                                )}>
                                Inquire
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>

                {/* Next */}
                <button
                  onClick={next}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Dots + View All */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <div className="flex gap-2">
                  {displayProperties.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === carouselIndex ? "bg-emerald-600 w-6" : "bg-gray-300 w-2"}`}
                    />
                  ))}
                </div>
                {total > 3 && (
                  <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    onClick={() => navigate("/login")}>
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-b from-white via-emerald-50/30 to-emerald-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We provide exceptional service and expertise in land surveying and real estate</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Professional Team", desc: "Experienced surveyors and real estate professionals dedicated to your success" },
              { title: "Accurate Results", desc: "Precise measurements and detailed documentation for all surveying projects" },
              { title: "Client Portal", desc: "Track your projects online with real-time updates and document access" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your land surveying or real estate needs
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 h-12 px-8" onClick={() => navigate("/login")}>
              Client Portal Login
            </Button>
          </div>
        </div>
      </section>

      {/* Footer — original gradient */}
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
              <p className="text-gray-400 text-sm">Professional land surveying and real estate management services</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>+256751768901</span></div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>info@lsrems.com</span></div>
                <div className="mt-3">
                  <WhatsAppContact
                    message="Hello! I'm interested in your land surveying and real estate services. Can you help me?"
                    className="text-sm bg-green-600 hover:bg-green-700"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div><button onClick={() => navigate("/login")} className="hover:text-white">Client Login</button></div>
                <div><button onClick={() => navigate("/login")} className="hover:text-white">Staff Login</button></div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} LSREMS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Search Results Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Search Results</DialogTitle>
            <DialogDescription>Found {searchResults.length} project(s) matching "{searchQuery}"</DialogDescription>
          </DialogHeader>
          {searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No projects found matching your search.</p>
              <p className="text-sm text-gray-500">Try searching with a different Project ID, Customer Name, Email, or Location.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((project: any) => (
                <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{project.project_name}</h3>
                        <Badge className={PROJECT_STATUS_COLORS[project.status] || "bg-gray-100 text-gray-600"}>
                          {formatStatus(project.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">Project ID: {project.id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Customer</label>
                      <p className="text-sm text-gray-900 mt-1">{project.customer?.name || "—"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Surveyor</label>
                      <p className="text-sm text-gray-900 mt-1">{project.surveyor?.username || "Unassigned"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Location</label>
                      <p className="text-sm text-gray-900 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{project.location}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Created</label>
                      <p className="text-sm text-gray-900 mt-1">{project.created_at ? project.created_at.slice(0, 10) : "—"}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">To view full project details, documents, and timeline, please login to the customer portal.</p>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => { setIsSearchOpen(false); navigate("/login"); }}>
                      Login to View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsSearchOpen(false)}>Close</Button>
            <Button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}>New Search</Button>
          </div>
        </DialogContent>
      </Dialog>

      <WhatsAppContact
        variant="floating"
        message="Hello! I'm interested in your land surveying and real estate services. Can you help me?"
      />
    </div>
  );
}
