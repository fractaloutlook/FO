import React, { useEffect, useRef } from 'react';
import { Coffee } from 'lucide-react';

const KofiButton = () => {
  const buttonContainerRef = useRef(null);

  useEffect(() => {
    // Only proceed if we have our container
    if (!buttonContainerRef.current) return;

    // Create and configure the Ko-fi button script
    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/widget/Widget_2.js';
    script.type = 'text/javascript';

    script.onload = () => {
      if (window.kofiwidget2) {
        window.kofiwidget2.init('Support This Experiment', '#3b82f6', 'timschei');
        window.kofiwidget2.draw(buttonContainerRef.current, {
          type: 'floating-chat',
          'floating-chat.donateButton.text': 'Support This Experiment ($25)',
          'floating-chat.donateButton.background-color': '#3b82f6',
          'floating-chat.donateButton.text-color': '#fff'
        });
      }
    };

    document.body.appendChild(script);

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="w-full" ref={buttonContainerRef}>
      {/* Fallback button that will be replaced by Ko-fi's button */}
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
        <Coffee size={20} />
        <span>Support This Experiment ($25)</span>
      </button>
    </div>
  );
};

export default KofiButton;