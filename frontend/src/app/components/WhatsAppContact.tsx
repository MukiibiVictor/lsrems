import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

interface WhatsAppContactProps {
  phoneNumber?: string;
  message?: string;
  className?: string;
  variant?: "default" | "floating";
}

export function WhatsAppContact({ 
  phoneNumber = "+256751768901",
  message = "Hello! I need help with the LSREMS system.",
  className = "",
  variant = "default"
}: WhatsAppContactProps) {
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (variant === "floating") {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={handleWhatsAppClick}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          title="Contact Admin on WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleWhatsAppClick}
      className={`bg-green-500 hover:bg-green-600 text-white ${className}`}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Contact Admin
    </Button>
  );
}