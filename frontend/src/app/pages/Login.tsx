import { useState } from "react";
import { useNavigate } from "react-router";
import { Building2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await login(email, password);
      toast.success("Login successful!");
      
      // Redirect based on user role
      if (response?.role === 'customer') {
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
    <div className="min-h-screen clean-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="pricing-card hover-lift">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 gradient-emerald rounded-2xl flex items-center justify-center mb-4 shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:scale-105">
              <Building2 className="w-9 h-9 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent mb-2">LSREMS</h1>
            <p className="text-gray-600 text-center">
              Land Surveying & Real Estate Management
            </p>
          </div>

          {/* Welcome Text */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Welcome Back
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 glass-effect border-gray-200 focus:border-emerald-300 focus:ring-emerald-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 glass-effect border-gray-200 focus:border-emerald-300 focus:ring-emerald-200"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 gradient-emerald text-white btn-glow hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200">
              Contact Administrator
            </a>
          </p>
          
          {/* WhatsApp Contact */}
          <div className="flex justify-center mt-4">
            <WhatsAppContact 
              message="Hello! I need help accessing the LSREMS system. Can you help me create an account?"
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
