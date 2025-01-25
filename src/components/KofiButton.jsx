import React, { useEffect } from 'react';
import { Coffee } from 'lucide-react';

const KofiButton = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.kofiWidgetOverlay.draw('timschei', {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': 'Support This Experiment ($25)',
        'floating-chat.donateButton.background-color': '#3b82f6',
        'floating-chat.donateButton.text-color': '#fff'
      });
    };

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const handleClick = () => {
    window.kofiWidgetOverlay?.toggleFloatingChat();
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