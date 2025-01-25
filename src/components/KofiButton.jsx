import React, { useEffect } from 'react';
import { Coffee } from 'lucide-react';

const KofiButton = ({ username = "timschei" }) => {
  useEffect(() => {
    // Remove any existing Ko-fi elements
    const existingKofi = document.getElementById('kofi-widget-overlay');
    if (existingKofi) existingKofi.remove();

    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
    script.async = true;
    script.onload = () => {
      window.kofiWidgetOverlay?.draw(username, {
        'type': 'popup',  // Changed to popup type
        'trigger.type': 'manual'
      });
    };
    document.body.appendChild(script);

    return () => {
      const kofiElements = document.querySelectorAll('[id^="kofi"]');
      kofiElements.forEach(el => el.remove());
      document.body.removeChild(script);
    };
  }, [username]);

  const handleKofiClick = () => {
    window.kofiWidgetOverlay?.toggleFloatingChat();
  };

  return (
    <button
      onClick={handleKofiClick}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
    >
      <Coffee size={20} />
      <span>Support This Experiment ($25)</span>
    </button>
  );
};

export default KofiButton;