import { useState, useEffect } from "react";
import { Building2, Phone, Mail, MapPin, Globe, Pencil, Check, X } from "lucide-react";
import { usePermissions } from "../../hooks/usePermissions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const STORAGE_KEY = "lsrems_footer_config";

interface FooterConfig {
  companyName: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  services: string[];
  quickLinks: { label: string; href: string }[];
}

const DEFAULT_CONFIG: FooterConfig = {
  companyName: "LSREMS",
  tagline: "Management System",
  description: "Professional land surveying and real estate management services for all your property needs.",
  phone: "+256 751 768 901",
  email: "info@lsrems.com",
  address: "Kampala, Uganda",
  website: "www.lsrems.com",
  services: ["Land Surveying", "Title Documentation", "Property Management", "Real Estate Sales"],
  quickLinks: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Projects", href: "/dashboard/survey-projects" },
    { label: "Properties", href: "/dashboard/properties" },
    { label: "Customers", href: "/dashboard/customers" },
  ],
};

function loadConfig(): FooterConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_CONFIG;
}

interface EditableFieldProps {
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  className?: string;
  inputClassName?: string;
}

function EditableField({ value, editing, onChange, className = "", inputClassName = "" }: EditableFieldProps) {
  if (!editing) return <span className={className}>{value}</span>;
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-7 text-sm bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 ${inputClassName}`}
    />
  );
}

export function Footer({ hideQuickLinks = false }: { hideQuickLinks?: boolean }) {
  const { isAdmin } = usePermissions();
  const [config, setConfig] = useState<FooterConfig>(loadConfig);
  const [draft, setDraft] = useState<FooterConfig>(loadConfig);
  const [editing, setEditing] = useState(false);

  const startEdit = () => {
    setDraft({ ...config });
    setEditing(true);
  };

  const saveEdit = () => {
    setConfig(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft({ ...config });
    setEditing(false);
  };

  const d = editing ? draft : config;
  const set = (field: keyof FooterConfig) => (v: string) =>
    setDraft((prev) => ({ ...prev, [field]: v }));

  const setService = (i: number, v: string) =>
    setDraft((prev) => {
      const services = [...prev.services];
      services[i] = v;
      return { ...prev, services };
    });

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Admin edit controls */}
        {isAdmin && (
          <div className="flex justify-end mb-4 gap-2">
            {editing ? (
              <>
                <Button size="sm" onClick={saveEdit} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit} className="border-gray-600 text-gray-300 hover:bg-gray-700 gap-1.5">
                  <X className="w-3.5 h-3.5" /> Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={startEdit} className="border-gray-600 text-gray-300 hover:bg-gray-700 gap-1.5">
                <Pencil className="w-3.5 h-3.5" /> Edit Footer
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <EditableField
                  value={d.companyName}
                  editing={editing}
                  onChange={set("companyName")}
                  className="text-lg font-semibold block"
                  inputClassName="w-32"
                />
                <EditableField
                  value={d.tagline}
                  editing={editing}
                  onChange={set("tagline")}
                  className="text-xs text-gray-400 block"
                  inputClassName="w-36"
                />
              </div>
            </div>
            {editing ? (
              <textarea
                value={d.description}
                onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full text-sm bg-gray-700 border border-gray-600 text-gray-300 rounded-md px-3 py-2 resize-none"
              />
            ) : (
              <p className="text-gray-400 text-sm leading-relaxed">{d.description}</p>
            )}
          </div>

          {/* Quick Links */}
          {!hideQuickLinks && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              {d.quickLinks.map((link, i) => (
                <div key={i}>
                  {editing ? (
                    <Input
                      value={link.label}
                      onChange={(e) =>
                        setDraft((p) => {
                          const ql = [...p.quickLinks];
                          ql[i] = { ...ql[i], label: e.target.value };
                          return { ...p, quickLinks: ql };
                        })
                      }
                      className="h-7 text-sm bg-gray-700 border-gray-600 text-white mb-1"
                    />
                  ) : (
                    <a
                      href={link.href}
                      className="block text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200 hover:translate-x-1 transform"
                    >
                      {link.label}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Services</h3>
            <div className="space-y-2">
              {d.services.map((service, i) => (
                <div key={i}>
                  {editing ? (
                    <Input
                      value={service}
                      onChange={(e) => setService(i, e.target.value)}
                      className="h-7 text-sm bg-gray-700 border-gray-600 text-white"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm hover:text-emerald-400 transition-colors duration-200 cursor-default">
                      {service}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Contact Us</h3>
            <div className="space-y-3">
              {[
                { icon: Phone, field: "phone" as const },
                { icon: Mail, field: "email" as const },
                { icon: MapPin, field: "address" as const },
                { icon: Globe, field: "website" as const },
              ].map(({ icon: Icon, field }) => (
                <div key={field} className="flex items-center gap-3 text-gray-400 hover:text-emerald-400 transition-colors duration-200 group">
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                  <EditableField
                    value={d[field]}
                    editing={editing}
                    onChange={set(field)}
                    className="text-sm"
                    inputClassName="w-40"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; 2026 {d.companyName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
