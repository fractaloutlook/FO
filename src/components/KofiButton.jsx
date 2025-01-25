import React, { useEffect } from 'react';
import { Coffee } from 'lucide-react';

const KofiButton = ({ username = "timschei" }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
    script.async = true;
    
    script.onload = () => {
      window.kofiWidgetOverlay?.draw(username, {
        'type': 'popup',
        'trigger': 'manual',
        'button.text': 'Support This Experiment ($25)',
        'popup.title': 'Support This Experiment'
      });
    };
    
    document.body.appendChild(script);

    return () => {
      const elements = document.querySelectorAll('[id^="kofi"]');
      elements.forEach(el => el.remove());
      document.body.removeChild(script);
    };
  }, [username]);

  const handleClick = () => {
    window.kofiWidgetOverlay?.openPopup();  // Changed from toggleFloatingChat to openPopup
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
    >
      <Coffee size={20} />
      <span>Support This Experiment ($25)</span>
    </button>
  );
};

export default KofiButton;