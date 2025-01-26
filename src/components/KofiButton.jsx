import React, { useEffect } from 'react';
import { Coffee } from 'lucide-react';

const KofiButton = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://ko-fi.com/widgets/widget_2.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const handleClick = () => {
    window.open('https://ko-fi.com/timschei/checkout?custom_description=Support This Experiment ($25)&amount=25', '_blank');
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