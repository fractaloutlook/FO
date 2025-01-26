import React, { useEffect } from 'react';
import { Coffee } from 'lucide-react';

const KofiButton = () => {
  useEffect(() => {
    if (!window.kofiWidgetOverlay) {
      const script = document.createElement('script');
      script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
      script.async = true;
      
      script.onload = () => {
        if (window.kofiWidgetOverlay) {
          window.kofiWidgetOverlay.draw('timschei', {
            'type': 'floating-chat',
            'floating-chat.donateButton.text': 'Support This Experiment ($25)',
            'floating-chat.donateButton.background-color': '#3b82f6',
            'floating-chat.donateButton.text-color': '#fff'
          });
        }
      };
      
      document.body.appendChild(script);
    }
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    if (window.kofiWidgetOverlay && window.kofiWidgetOverlay.toggleFloatingChat) {
      window.kofiWidgetOverlay.toggleFloatingChat();
    }
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