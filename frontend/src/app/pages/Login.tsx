import { useState } from "react";
import { useNavigate } from "react-router";
import { Building2, Eye, EyeOff, ArrowLeft, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { WhatsAppContact } from "../components/WhatsAppContact";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login(email, password);
      toast.success("Welcome back!");
      if (response?.role === "customer") {
        navigate("/portal");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex overflow-hidden">

      {/* ── LEFT PANEL — branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* BG image */}
        <div
          className="absolute inset-0 bg-pan-zoom"
          style={{ filter: "brightness(0.3)" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/80 via-emerald-950/40 to-gray-950/90" />
        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />

        {/* Logo */}
        <div className="relative z-10">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Building2 className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-lg font-bold text-white">LSREMS</span>
              <p className="text-xs text-gray-400 leading-none">Land & Real Estate</p>
            </div>
          </button>
        </div>

        {/* Center copy */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 text-emerald-400 text-sm mb-6">
            <Star className="w-3.5 h-3.5 fill-emerald-400" />
            Uganda's Premier Land Platform
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Manage Your Land.<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Track Every Project.
            </span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
            Access your surveys, titles, properties and transactions — all from one secure portal.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex items-center gap-8">
          {[["500+", "Projects"], ["98%", "Satisfaction"], ["15 yrs", "Experience"]].map(([val, label]) => (
            <div key={label}>
              <div className="text-2xl font-black text-white">{val}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 relative">
        {/* Subtle bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />

        <div className="relative z-10 w-full max-w-md mx-auto">

          {/* Back link */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-10 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </button>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-white">LSREMS</span>
          </div>

          <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 mb-10">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <button
                onClick={() => window.open(`https://wa.me/256751768901?text=${encodeURIComponent("Hello! I need help accessing the LSREMS system. Can you create an account for me?")}`, "_blank")}
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Contact Administrator
              </button>
            </p>
            <div className="flex justify-center">
              <WhatsAppContact
                message="Hello! I need help accessing the LSREMS system. Can you help me create an account?"
                className="text-sm bg-green-600/80 hover:bg-green-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
