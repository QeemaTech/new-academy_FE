import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { fetchPublicSettings } from '../../api/public';

const WhatsAppButton: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchPublicSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load public settings:', error);
      } finally {
        setLoading(false);
      }
    };
    void loadSettings();
  }, []);

  const whatsappNumber = settings.whatsapp_number;
  const whatsappMessage = settings.whatsapp_message || 'Hello! I would like to inquire about your programs.';

  if (loading || !whatsappNumber) return null;

  const handleClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-8 right-8 z-[9999] group flex items-center justify-center h-16 w-16 rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:shadow-[0_8px_30px_rgb(37,211,102,0.6)] transition-all duration-300 hover:scale-110 active:scale-95"
      aria-label="Contact us on WhatsApp"
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 group-hover:opacity-40" />
      
      {/* Icon */}
      <MessageCircle size={32} className="relative z-10 fill-current" />
      
      {/* Tooltip/Label */}
      <div className="absolute right-20 bg-white text-gray-800 px-4 py-2 rounded-2xl shadow-xl text-sm font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-gray-100">
        تواصل معنا عبر واتساب
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white rotate-45 border-t border-r border-gray-100" />
      </div>
    </button>
  );
};

export default WhatsAppButton;
