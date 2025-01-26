import React, { useEffect } from 'react';
import { Coffee } from 'lucide-react';

const KofiButton = () => {
  useEffect(() => {
    // Only load the script if it hasn't been loaded yet
    if (!window.kofiWidgetOverlay) {
      const script = document.createElement('script');
      script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
      script.async = true;
      
      script.onload = () => {
        // Initialize with popup mode instead of floating-chat
        window.kofiWidgetOverlay.draw('timschei', {
          'type': 'popup-modal',
          'modal.background-color': '#ffffff',
          'modal.text-color': '#323842'
        });
      };
      
      document.body.appendChild(script);
    }
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    // Use the showModal method for popup mode
    if (window.kofiWidgetOverlay && window.kofiWidgetOverlay.getOpenedModal) {
      const modal = window.kofiWidgetOverlay.getOpenedModal();
      if (modal) {
        modal.show();
      } else {
        window.kofiWidgetOverlay.showModal();
      }
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