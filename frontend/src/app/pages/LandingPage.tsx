import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Building2, MapPin, FileText, TrendingUp, CheckCircle,
  ArrowRight, Phone, Mail, Search, ChevronLeft, ChevronRight,
  Star, Shield, Clock, Users, Award, Layers,
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

// Animated counter hook
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// Intersection observer hook
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
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
  const [scrolled, setScrolled] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);

  const statsRef = useInView();
  const c1 = useCounter(500, 2000, statsRef.inView);
  const c2 = useCounter(98, 2000, statsRef.inView);
  const c3 = useCounter(15, 2000, statsRef.inView);
  const c4 = useCounter(1200, 2000, statsRef.inView);

  useEffect(() => {
    loadProperties();
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const advance = useCallback(() => {
    if (!isPausedRef.current && total > 1) setCarouselIndex((i) => (i + 1) % total);
  }, [total]);

  useEffect(() => { setCarouselIndex(0); }, [activeTab]);

  useEffect(() => {
    if (total <= 1) return;
    autoPlayRef.current = setInterval(advance, 3500);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [advance, total]);

  const goTo = (idx: number) => {
    setCarouselIndex(idx);
    isPausedRef.current = true;
    setTimeout(() => { isPausedRef.current = false; }, 5000);
  };
  const prev = () => goTo((carouselIndex - 1 + total) % total);
  const next = () => goTo((carouselIndex + 1) % total);
  const visibleCards = total === 0 ? [] : [0, 1, 2].map((offset) => displayProperties[(carouselIndex + offset) % total]);

  const services = [
    { title: "Land Surveying", description: "Precise measurements and detailed boundary reports using modern equipment.", color: "from-emerald-500 to-teal-600" },
    { title: "Title Documentation", description: "End-to-end land title processing for secure, legally-sound ownership.", color: "from-blue-500 to-indigo-600" },
    { title: "Real Estate Management", description: "Full-service property management for residential and commercial assets.", color: "from-purple-500 to-violet-600" },
    { title: "Property Sales", description: "Expert buy/sell guidance with competitive market valuations.", color: "from-orange-500 to-rose-600" },
    { title: "Legal Compliance", description: "Ensuring all transactions meet regulatory and legal requirements.", color: "from-cyan-500 to-blue-600" },
    { title: "Land Subdivision", description: "Professional subdivision planning and approval processing.", color: "from-pink-500 to-rose-600" },
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
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-gray-950/95 backdrop-blur-xl shadow-2xl shadow-black/40 py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Building2 className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-wide">LSREMS</span>
              <p className="text-xs text-gray-400 leading-none">Land & Real Estate</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
            <button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-emerald-400 transition-colors">Services</button>
            <button onClick={() => document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-emerald-400 transition-colors">Properties</button>
            <button onClick={() => document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-emerald-400 transition-colors">About</button>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/login")} className="text-gray-300 hover:text-white hover:bg-white/10 text-sm">
              Client Login
            </Button>
            <Button onClick={() => navigate("/login")} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 text-sm px-5">
              Staff Portal
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* BG image with parallax zoom */}
        <div
          className="absolute inset-0 bg-pan-zoom"
          style={{ filter: "brightness(0.35)" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-transparent to-gray-950" />
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 text-emerald-400 text-sm mb-8 backdrop-blur-sm"
            style={{ animation: "fadeSlideIn 0.8s ease both" }}>
            <Star className="w-4 h-4 fill-emerald-400" />
            Uganda's Premier Land & Real Estate Platform
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight"
            style={{ animation: "fadeSlideIn 0.8s ease 0.1s both" }}>
            Your Land.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Your Future.
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ animation: "fadeSlideIn 0.8s ease 0.2s both" }}>
            Professional land surveying, title documentation, and premium real estate services — all in one place.
          </p>

          {/* Search bar */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 mb-8 shadow-2xl"
            style={{ animation: "fadeSlideIn 0.8s ease 0.3s both" }}>
            <p className="text-gray-300 text-sm mb-3 flex items-center justify-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              Track your project by ID, name, email or location
            </p>
            <div className="flex gap-3">
              <Input
                placeholder="Project ID, Customer Name, Email, or Location..."
                className="flex-1 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-emerald-400 focus:ring-emerald-400/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 h-12 px-8 shadow-lg shadow-emerald-500/30 font-semibold" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap"
            style={{ animation: "fadeSlideIn 0.8s ease 0.4s both" }}>
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 h-13 px-8 text-base font-semibold shadow-xl shadow-emerald-500/30"
              onClick={() => document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" })}>
              Explore Properties <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-13 px-8 text-base border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
              Our Services
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 text-xs animate-bounce">
          <span>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-400 to-transparent" />
        </div>
      </section>

      {/* ── STATS MARQUEE BANNER ── */}
      <section id="stats" ref={statsRef.ref} className="relative overflow-hidden bg-gray-950 py-5">
        {/* Fade in from hero above */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-950 to-transparent z-10 pointer-events-none" />
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />
        {/* Fade out to services below */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-950 to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex items-center gap-0 whitespace-nowrap">
          {/* Duplicate the list twice for seamless loop */}
          {[...Array(2)].map((_, pass) => (
            <div key={pass} className="flex items-center gap-0">
              {[
                { value: c1, suffix: "+", label: "Projects Completed" },
                { value: c2, suffix: "%", label: "Client Satisfaction" },
                { value: c3, suffix: " yrs", label: "Years Experience" },
                { value: c4, suffix: "+", label: "Acres Surveyed" },
                { value: 50, suffix: "+", label: "Licensed Surveyors" },
                { value: 30, suffix: "+", label: "Districts Covered" },
              ].map(({ value, suffix, label }, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex items-center gap-3 px-10">
                    <span className="text-3xl font-black text-white">{value}{suffix}</span>
                    <span className="text-sm text-emerald-400 font-medium uppercase tracking-wider">{label}</span>
                  </div>
                  {/* Divider dot */}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 flex-shrink-0" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="relative py-24 overflow-hidden" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1c1c1e 8%, #2a2a2c 20%, #2a2a2c 80%, #1c1c1e 92%, #0a0a0a 100%)" }}>
        {/* BG image very subtly through the smoke */}
        <div className="absolute inset-0 bg-pan-zoom" style={{ filter: "brightness(0.18) saturate(0.3)", opacity: 0.6 }} />
        {/* Smoky gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0d0d0d 0%, rgba(30,30,32,0.92) 15%, rgba(38,38,40,0.88) 50%, rgba(30,30,32,0.92) 85%, #0d0d0d 100%)" }} />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-3 block">What We Do</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Our Services</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Comprehensive land and real estate solutions built for Uganda's growing property market</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div
                key={i}
                className="group relative backdrop-blur-sm rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 cursor-default"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              >
                <div className={`h-1 w-12 bg-gradient-to-r ${service.color} rounded-full mb-5 group-hover:w-20 transition-all duration-300`} />
                <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
                <div className="mt-5 flex items-center gap-1 text-emerald-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROPERTIES ── */}
      <section id="properties" className="relative py-24 overflow-hidden bg-gray-950">
        <div className="absolute inset-0 bg-pan-zoom" style={{ filter: "brightness(0.25)", opacity: 0.5 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900/90 to-gray-950" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-3 block">Listings</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Available Properties</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Browse premium properties across Uganda</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {(["for-sale", "for-rent"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCarouselIndex(0); }}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === tab
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"}`}
              >
                {tab === "for-sale" ? `For Sale (${availableProperties.length})` : `For Rent (${rentProperties.length})`}
              </button>
            ))}
          </div>

          {loadingProps ? (
            <div className="text-center py-16 text-gray-500">Loading properties...</div>
          ) : total === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">No {activeTab === "for-sale" ? "available" : "rental"} properties at the moment.</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all text-white">
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {visibleCards.map((property: any, slot) => (
                    <div key={`${activeTab}-${carouselIndex}-${slot}`}
                      style={{ animation: "fadeSlideIn 0.6s cubic-bezier(0.4,0,0.2,1) both", animationDelay: `${slot * 80}ms` }}>
                      <div className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10">
                        <div className="h-52 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 flex items-center justify-center relative overflow-hidden">
                          {property.primary_image_url ? (
                            <img src={property.primary_image_url} alt={property.property_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <Building2 className="w-16 h-16 text-emerald-700" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-3 right-3">
                            <Badge className={`${STATUS_COLORS[property.status] || "bg-gray-100 text-gray-700"} text-xs font-semibold`}>
                              {property.status}
                            </Badge>
                          </div>
                          {property.price && (
                            <div className="absolute bottom-3 left-3">
                              <span className="text-white font-bold text-lg drop-shadow">{formatPrice(property.price)}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-white mb-1 truncate">{property.property_name}</h3>
                          <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="truncate">{property.location}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                            <span className="capitalize bg-white/5 px-2 py-1 rounded-md">{property.property_type}</span>
                            {property.size && <span className="bg-white/5 px-2 py-1 rounded-md">{property.size}</span>}
                          </div>
                          {(property.status === "available" || property.status === "reserved") && (
                            <Button size="sm" className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all"
                              onClick={() => window.open(`https://wa.me/256751768901?text=${encodeURIComponent(`Hello! I'm interested in: ${property.property_name} (${property.location}). Can you provide more details?`)}`, "_blank")}>
                              Inquire via WhatsApp
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all text-white">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 mt-10">
                <div className="flex gap-2">
                  {displayProperties.map((_, i) => (
                    <button key={i} onClick={() => goTo(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === carouselIndex ? "bg-emerald-400 w-8" : "bg-white/20 w-2 hover:bg-white/40"}`} />
                  ))}
                </div>
                {total > 3 && (
                  <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 ml-4"
                    onClick={() => navigate("/login")}>
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="relative py-24 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-pan-zoom opacity-10" style={{ filter: "brightness(0.3)" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-3 block">Why Us</span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Built on Trust,<br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Driven by Results</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                We combine decades of local expertise with modern technology to deliver land and real estate services you can count on.
              </p>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/25 px-8"
                onClick={() => navigate("/login")}>
                Get Started Today <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: Award, title: "Licensed Professionals", desc: "All surveyors are fully licensed and certified by Uganda's land authorities.", color: "text-emerald-400" },
                { icon: Clock, title: "Fast Turnaround", desc: "We deliver survey reports and title documents faster than industry standard.", color: "text-teal-400" },
                { icon: Shield, title: "Legally Secure", desc: "Every transaction is processed in full compliance with Ugandan land law.", color: "text-cyan-400" },
                { icon: Users, title: "Client-First Approach", desc: "Real-time project tracking and dedicated support from start to finish.", color: "text-blue-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 hover:border-emerald-500/20 transition-all duration-300"
                  style={{ animation: `fadeSlideIn 0.6s ease ${i * 0.1}s both` }}>
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-pan-zoom" style={{ filter: "brightness(0.3)" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-gray-950/80 to-teal-950/90" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 text-emerald-400 text-sm mb-8">
            <CheckCircle className="w-4 h-4" /> Ready to work with us?
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Let's Build Your<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Property Future</span>
          </h2>
          <p className="text-gray-300 text-lg mb-10 leading-relaxed">
            Whether you need a land survey, title processing, or a property to buy — we've got you covered.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 h-13 px-10 text-base font-bold shadow-2xl shadow-emerald-500/30"
              onClick={() => navigate("/login")}>
              Access Client Portal <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-13 px-8 border-white/20 text-white hover:bg-white/10 text-base"
              onClick={() => window.open("https://wa.me/256751768901", "_blank")}>
              <Phone className="w-4 h-4 mr-2" /> WhatsApp Us
            </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 border-t border-white/5 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-bold text-white">LSREMS</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                Uganda's trusted platform for professional land surveying, title documentation, and real estate management.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h3>
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                  <Phone className="w-4 h-4 text-emerald-500" /><span>+256751768901</span>
                </div>
                <div className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                  <Mail className="w-4 h-4 text-emerald-500" /><span>info@lsrems.com</span>
                </div>
                <div className="mt-4">
                  <WhatsAppContact
                    message="Hello! I'm interested in your land surveying and real estate services. Can you help me?"
                    className="text-sm bg-green-600 hover:bg-green-700"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
              <div className="space-y-2 text-sm text-gray-500">
                <div><button onClick={() => navigate("/login")} className="hover:text-emerald-400 transition-colors">Client Login</button></div>
                <div><button onClick={() => navigate("/login")} className="hover:text-emerald-400 transition-colors">Staff Portal</button></div>
                <div><button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-emerald-400 transition-colors">Services</button></div>
                <div><button onClick={() => document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-emerald-400 transition-colors">Properties</button></div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} LSREMS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ── SEARCH DIALOG ── */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Project Search Results</DialogTitle>
            <DialogDescription className="text-gray-400">Found {searchResults.length} project(s) matching "{searchQuery}"</DialogDescription>
          </DialogHeader>
          {searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2">No projects found matching your search.</p>
              <p className="text-sm text-gray-500">Try a different Project ID, Customer Name, Email, or Location.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((project: any) => (
                <Card key={project.id} className="p-6 bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{project.project_name}</h3>
                        <Badge className={PROJECT_STATUS_COLORS[project.status] || "bg-gray-700 text-gray-300"}>
                          {formatStatus(project.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">Project ID: {project.id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[
                      { label: "Customer", value: project.customer?.name || "—" },
                      { label: "Surveyor", value: project.surveyor?.username || "Unassigned" },
                      { label: "Location", value: project.location },
                      { label: "Created", value: project.created_at ? project.created_at.slice(0, 10) : "—" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <label className="text-xs font-medium text-gray-500 uppercase">{label}</label>
                        <p className="text-sm text-gray-200 mt-1">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-500 mb-3">Login to view full project details, documents, and timeline.</p>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => { setIsSearchOpen(false); navigate("/login"); }}>
                      Login to View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <Button variant="outline" className="border-white/20 text-gray-300" onClick={() => setIsSearchOpen(false)}>Close</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setIsSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}>New Search</Button>
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
