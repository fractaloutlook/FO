import React, { useEffect } from 'react';
import { Coffee } from 'lucide-react';

const KofiButton = ({ username = "timschei" }) => {
  useEffect(() => {
    // Load the Ko-fi widget script
    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
    script.async = true;
    script.onload = () => {
      // Initialize the widget once the script is loaded, but hide the default button
      window.kofiWidgetOverlay.draw(username, {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': 'Support This Experiment ($25)',
        'floating-chat.donateButton.background-color': '#3b82f6',
        'floating-chat.donateButton.text-color': '#ffffff',
        'floating-chat.core.button.position.mobile': 'hidden',
        'floating-chat.core.button.position.desktop': 'hidden'
      });
    };
    document.body.appendChild(script);

    // Cleanup on component unmount
    return () => {
      document.body.removeChild(script);
      const kofiIframe = document.getElementById('kofi-widget-overlay');
      if (kofiIframe) {
        kofiIframe.remove();
      }
    };
  }, [username]);

  const handleKofiClick = () => {
    // Manually trigger the Ko-fi overlay
    if (window.kofiWidgetOverlay) {
      window.kofiWidgetOverlay.toggleFloatingChat();
    }
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