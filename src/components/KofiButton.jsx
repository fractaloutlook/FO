import React, { useEffect, useState } from 'react';
import { Coffee } from 'lucide-react';

const KofiButton = () => {
  // Track whether the widget is ready
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Store the widget configuration so it's accessible in the global scope
    window.kofiConfig = {
      'type': 'popup-modal',
      'modal.text': 'Support This Experiment ($25)',
      'modal.background-color': '#ffffff',
      'modal.text-color': '#323842'
    };

    // Only load if we haven't already
    if (!document.querySelector('script[src*="overlay-widget.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
      script.async = true;
      
      script.onload = () => {
        // Wait a brief moment for the widget to be ready
        setTimeout(() => {
          if (window.kofiWidgetOverlay) {
            // Initialize without any floating button
            window.kofiWidgetOverlay.draw('timschei', {
              ...window.kofiConfig,
              'floating-chat.visible': false
            });
            setIsInitialized(true);
          }
        }, 100);
      };
      
      document.body.appendChild(script);
    }

    // Cleanup
    return () => {
      delete window.kofiConfig;
      setIsInitialized(false);
    };
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    
    // If not initialized, try to initialize now
    if (!isInitialized && window.kofiWidgetOverlay) {
      window.kofiWidgetOverlay.draw('timschei', window.kofiConfig);
      setIsInitialized(true);
    }
    
    // Show the donation interface
    if (window.kofiWidgetOverlay) {
      // Delay slightly to ensure modal is ready
      setTimeout(() => {
        try {
          window.kofiWidgetOverlay.showModal();
        } catch (error) {
          // If showModal fails, try to reinitialize and show
          window.kofiWidgetOverlay.draw('timschei', window.kofiConfig);
          setTimeout(() => window.kofiWidgetOverlay.showModal(), 50);
        }
      }, 50);
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