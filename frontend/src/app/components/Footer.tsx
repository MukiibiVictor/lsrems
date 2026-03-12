import { Building2, Phone, Mail, MapPin, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-semibold">LSREMS</span>
                <p className="text-xs text-gray-400">Management System</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Professional land surveying and real estate management services for all your property needs.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Projects", href: "/dashboard/survey-projects" },
                { label: "Properties", href: "/dashboard/properties" },
                { label: "Customers", href: "/dashboard/customers" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200 hover:translate-x-1 transform"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Services</h3>
            <div className="space-y-2">
              {[
                "Land Surveying",
                "Title Documentation",
                "Property Management",
                "Real Estate Sales",
              ].map((service) => (
                <div
                  key={service}
                  className="text-gray-400 text-sm hover:text-emerald-400 transition-colors duration-200 cursor-default"
                >
                  {service}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 hover:text-emerald-400 transition-colors duration-200 group">
                <Phone className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-emerald-400 transition-colors duration-200 group">
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm">info@lsrems.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-emerald-400 transition-colors duration-200 group">
                <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm">123 Business Ave, City</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-emerald-400 transition-colors duration-200 group">
                <Globe className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm">www.lsrems.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; 2026 LSREMS. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}