import React, { useEffect, useState } from 'react';
import { Coffee } from 'lucide-react';

const KofiButton = () => {
  const [isWidgetReady, setWidgetReady] = useState(false);

  useEffect(() => {
    // Helper function to initialize the widget
    const initializeWidget = () => {
      if (window.kofiWidgetOverlay) {
        console.log('Initializing Ko-fi widget...');
        try {
          window.kofiWidgetOverlay.draw('timschei', {
            'type': 'floating-chat',
            'floating-chat.donateButton.text': 'Support This Experiment ($25)',
            'floating-chat.donateButton.background-color': '#3b82f6',
            'floating-chat.donateButton.text-color': '#fff',
            'floating-chat.core.button.text': 'Support This Experiment ($25)',
            'floating-chat.core.position.right': '50%',
            'floating-chat.core.position.bottom': '50%'
          });
          setWidgetReady(true);
          console.log('Widget initialized successfully');
        } catch (error) {
          console.error('Error initializing widget:', error);
        }
      } else {
        console.log('Widget not available yet');
      }
    };

    // Only load the script if it hasn't been loaded
    if (!document.querySelector('script[src*="ko-fi.com"]')) {
      console.log('Loading Ko-fi script...');
      const script = document.createElement('script');
      script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Script loaded, waiting for widget...');
        // Give a small delay for the widget to initialize
        setTimeout(initializeWidget, 500);
      };
      
      document.body.appendChild(script);
    } else {
      // Script already exists, try to initialize
      console.log('Script already exists, trying to initialize...');
      initializeWidget();
    }

    return () => {
      setWidgetReady(false);
    };
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    console.log('Button clicked');
    console.log('Widget ready:', isWidgetReady);
    console.log('Widget object:', window.kofiWidgetOverlay);
    
    if (window.kofiWidgetOverlay && window.kofiWidgetOverlay.toggleFloatingChat) {
      console.log('Attempting to toggle chat...');
      try {
        window.kofiWidgetOverlay.toggleFloatingChat();
      } catch (error) {
        console.error('Error toggling chat:', error);
      }
    } else {
      console.log('Widget or toggle method not available');
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